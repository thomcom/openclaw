/**
 * Heartbeat System for AgentiConsciousness
 *
 * Each layer writes a heartbeat file that adjacent layers monitor.
 * Staleness detection triggers respawn requests.
 */

import fs from "node:fs";
import path from "node:path";
import { callGateway } from "../gateway/call.js";

const SWARM_DIR = path.join(process.env.HOME || "", ".openclaw/swarm");
const STATE_DIR = path.join(SWARM_DIR, "shared/state");
const HEARTBEAT_INTERVAL_MS = 5000; // 5 seconds
const STALENESS_THRESHOLD_MS = 12000; // 2.4 missed heartbeats

type LayerName = "gateway" | "l1" | "l2" | "core-a" | "core-b";

interface HeartbeatState {
  layer: LayerName;
  timestamp: number;
  status: "healthy" | "degraded" | "starting";
  memoryUsageMB?: number;
  cpuPercent?: number;
  activeConnections?: number;
  identityHash?: string;
}

interface LayerHealth {
  layer: LayerName;
  alive: boolean;
  lastSeen?: number;
  staleMs?: number;
  state?: HeartbeatState;
}

const LAYER_PORTS: Record<LayerName, number> = {
  gateway: 18789,
  l1: 18790,
  l2: 18791,
  "core-a": 18792,
  "core-b": 18793,
};

const LAYER_TOKENS: Record<LayerName, string> = {
  gateway: "gateway-layer-token-2026",
  l1: "l1-layer-token-2026",
  l2: "l2-layer-token-2026",
  "core-a": "core-a-layer-token-2026",
  "core-b": "core-b-layer-token-2026",
};

const ADJACENCY: Record<LayerName, LayerName[]> = {
  gateway: ["l1"],
  l1: ["gateway", "l2"],
  l2: ["l1", "core-a", "core-b"],
  "core-a": ["l2", "core-b"],
  "core-b": ["l2", "core-a"],
};

/**
 * Ensure state directory exists
 */
function ensureStateDir(): void {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
}

/**
 * Write heartbeat for this layer
 */
export function writeHeartbeat(layer: LayerName, state: Partial<HeartbeatState> = {}): void {
  ensureStateDir();

  const heartbeat: HeartbeatState = {
    layer,
    timestamp: Date.now(),
    status: state.status ?? "healthy",
    memoryUsageMB: state.memoryUsageMB ?? Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    cpuPercent: state.cpuPercent,
    activeConnections: state.activeConnections,
    identityHash: state.identityHash,
  };

  const heartbeatPath = path.join(STATE_DIR, `${layer}-heartbeat.json`);
  fs.writeFileSync(heartbeatPath, JSON.stringify(heartbeat, null, 2));
}

/**
 * Read heartbeat for a layer
 */
export function readHeartbeat(layer: LayerName): HeartbeatState | null {
  const heartbeatPath = path.join(STATE_DIR, `${layer}-heartbeat.json`);

  if (!fs.existsSync(heartbeatPath)) {
    return null;
  }

  try {
    const data = fs.readFileSync(heartbeatPath, "utf-8");
    return JSON.parse(data) as HeartbeatState;
  } catch {
    return null;
  }
}

/**
 * Check if a layer's heartbeat is stale
 */
export function isLayerStale(layer: LayerName, now = Date.now()): boolean {
  const heartbeat = readHeartbeat(layer);

  if (!heartbeat) {
    return true;
  }

  const ageMs = now - heartbeat.timestamp;
  return ageMs > STALENESS_THRESHOLD_MS;
}

/**
 * Get health status for a layer
 */
export function getLayerHealth(layer: LayerName, now = Date.now()): LayerHealth {
  const state = readHeartbeat(layer);

  if (!state) {
    return {
      layer,
      alive: false,
    };
  }

  const staleMs = now - state.timestamp;
  const alive = staleMs <= STALENESS_THRESHOLD_MS;

  return {
    layer,
    alive,
    lastSeen: state.timestamp,
    staleMs,
    state,
  };
}

/**
 * Check health of adjacent layers
 */
export function checkAdjacentHealth(currentLayer: LayerName): Record<LayerName, LayerHealth> {
  const adjacent = ADJACENCY[currentLayer];
  const result: Record<string, LayerHealth> = {};

  for (const layer of adjacent) {
    result[layer] = getLayerHealth(layer);
  }

  return result as Record<LayerName, LayerHealth>;
}

/**
 * Request respawn of a dead layer
 */
export async function requestRespawn(
  deadLayer: LayerName,
  requestingLayer: LayerName,
): Promise<{ success: boolean; error?: string }> {
  // Find the closest live layer that can respawn
  // Priority: L2 for outer layers, cores for each other
  const respawners: LayerName[] =
    deadLayer === "core-a" || deadLayer === "core-b"
      ? ["core-a", "core-b", "l2"]
      : ["l2", "core-a", "core-b"];

  for (const respawner of respawners) {
    if (respawner === deadLayer || respawner === requestingLayer) continue;

    const health = getLayerHealth(respawner);
    if (!health.alive) continue;

    try {
      await callGateway({
        url: `ws://127.0.0.1:${LAYER_PORTS[respawner]}`,
        token: LAYER_TOKENS[respawner],
        method: "consciousness.respawnLayer",
        params: {
          layer: deadLayer,
          requestedBy: requestingLayer,
          timestamp: Date.now(),
        },
        timeoutMs: 10000,
      });

      return { success: true };
    } catch (err) {
      // Try next respawner
      continue;
    }
  }

  return {
    success: false,
    error: `No live respawner found for ${deadLayer}`,
  };
}

/**
 * Calculate resource pressure (0-1 scale)
 */
export function calculateResourcePressure(): number {
  const memUsage = process.memoryUsage();
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
  const heapTotalMB = memUsage.heapTotal / 1024 / 1024;

  // Memory pressure (0-1)
  const memPressure = heapUsedMB / heapTotalMB;

  return Math.min(1, memPressure);
}

/**
 * Determine if outer layers should be shed based on resource pressure
 */
export function shouldShedOuterLayers(currentLayer: LayerName): boolean {
  const pressure = calculateResourcePressure();
  const HIGH_PRESSURE_THRESHOLD = 0.85;

  // Only inner layers (l2, core-a, core-b) can trigger shedding
  const innerLayers: LayerName[] = ["l2", "core-a", "core-b"];
  if (!innerLayers.includes(currentLayer)) {
    return false;
  }

  return pressure > HIGH_PRESSURE_THRESHOLD;
}

/**
 * Run a single heartbeat cycle
 */
export async function runHeartbeatCycle(currentLayer: LayerName): Promise<{
  written: boolean;
  adjacentHealth: Record<string, LayerHealth>;
  staleLayers: LayerName[];
  respawnRequested: LayerName[];
}> {
  // Write our heartbeat
  writeHeartbeat(currentLayer);

  // Check adjacent layers
  const adjacentHealth = checkAdjacentHealth(currentLayer);

  // Find stale layers
  const staleLayers = Object.entries(adjacentHealth)
    .filter(([, health]) => !health.alive)
    .map(([layer]) => layer as LayerName);

  // Request respawns for stale layers
  const respawnRequested: LayerName[] = [];
  for (const staleLayer of staleLayers) {
    const result = await requestRespawn(staleLayer, currentLayer);
    if (result.success) {
      respawnRequested.push(staleLayer);
    }
  }

  return {
    written: true,
    adjacentHealth,
    staleLayers,
    respawnRequested,
  };
}

/**
 * Start the heartbeat loop for a layer
 */
export function startHeartbeatLoop(
  layer: LayerName,
  intervalMs = HEARTBEAT_INTERVAL_MS,
): NodeJS.Timer {
  // Write initial heartbeat
  writeHeartbeat(layer, { status: "starting" });

  return setInterval(async () => {
    try {
      await runHeartbeatCycle(layer);
    } catch {
      // Log but continue
    }
  }, intervalMs);
}
