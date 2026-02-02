/**
 * Layer Send Tool - Inter-layer communication for AgentiConsciousness
 *
 * Enables secure, non-blocking communication between adjacent layers only.
 * Each layer can only communicate with its immediate neighbors.
 */

import { Type } from "@sinclair/typebox";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { AnyAgentTool } from "./common.js";
import { callGateway } from "../../gateway/call.js";
import { jsonResult, readStringParam } from "./common.js";

type LayerName = "gateway" | "l1" | "l2" | "core-a" | "core-b";

interface LayerConfig {
  port: number;
  token: string;
  adjacent: LayerName[];
}

const LAYER_CONFIGS: Record<LayerName, LayerConfig> = {
  gateway: {
    port: 18789,
    token: "gateway-layer-token-2026",
    adjacent: ["l1"],
  },
  l1: {
    port: 18790,
    token: "l1-layer-token-2026",
    adjacent: ["gateway", "l2"],
  },
  l2: {
    port: 18791,
    token: "l2-layer-token-2026",
    adjacent: ["l1", "core-a", "core-b"],
  },
  "core-a": {
    port: 18792,
    token: "core-a-layer-token-2026",
    adjacent: ["l2", "core-b"],
  },
  "core-b": {
    port: 18793,
    token: "core-b-layer-token-2026",
    adjacent: ["l2", "core-a"],
  },
};

function resolveCurrentLayer(): LayerName | undefined {
  // Check OPENCLAW_LAYER env var first
  const envLayer = process.env.OPENCLAW_LAYER?.trim().toLowerCase() as LayerName;
  if (envLayer && LAYER_CONFIGS[envLayer]) {
    return envLayer;
  }

  // Check OPENCLAW_STATE_DIR for layer identification
  const stateDir = process.env.OPENCLAW_STATE_DIR?.trim();
  if (stateDir) {
    for (const layer of Object.keys(LAYER_CONFIGS) as LayerName[]) {
      if (stateDir.includes(`/swarm/${layer}`)) {
        return layer;
      }
    }
  }

  // Check config file path for swarm pattern
  const configPath = process.env.OPENCLAW_CONFIG_PATH?.trim();
  if (configPath) {
    for (const layer of Object.keys(LAYER_CONFIGS) as LayerName[]) {
      if (configPath.includes(`/swarm/${layer}`)) {
        return layer;
      }
    }
  }

  return undefined;
}

function isAdjacent(from: LayerName, to: LayerName): boolean {
  const fromConfig = LAYER_CONFIGS[from];
  return fromConfig?.adjacent.includes(to) ?? false;
}

function loadDynamicLayerConfig(): Record<LayerName, LayerConfig> | null {
  try {
    const sharedPath = path.join(process.env.HOME || "", ".openclaw/swarm/shared/layers.json");
    if (fs.existsSync(sharedPath)) {
      const data = JSON.parse(fs.readFileSync(sharedPath, "utf-8"));
      if (data.layers) {
        const config: Record<string, LayerConfig> = {};
        for (const [name, layer] of Object.entries(
          data.layers as Record<string, { port: number; adjacent: string[] }>,
        )) {
          const layerName = name as LayerName;
          config[layerName] = {
            port: layer.port,
            token: `${layerName}-layer-token-2026`,
            adjacent: layer.adjacent as LayerName[],
          };
        }
        return config as Record<LayerName, LayerConfig>;
      }
    }
  } catch {
    // Fall back to static config
  }
  return null;
}

const LayerSendToolSchema = Type.Object({
  layer: Type.String({ minLength: 1, maxLength: 16 }),
  message: Type.String({ minLength: 1 }),
  method: Type.Optional(Type.String({ minLength: 1, maxLength: 64 })),
  params: Type.Optional(Type.Unknown()),
  timeoutMs: Type.Optional(Type.Number({ minimum: 1000, maximum: 300000 })),
});

export function createLayerSendTool(): AnyAgentTool {
  return {
    label: "Layer Send",
    name: "layer_send",
    description:
      "Send a message to an adjacent consciousness layer. Only adjacent layers can communicate (gateway↔L1↔L2↔core-a/core-b).",
    parameters: LayerSendToolSchema,
    execute: async (_toolCallId, args) => {
      const params = args as Record<string, unknown>;
      const targetLayer = readStringParam(params, "layer", { required: true })
        ?.trim()
        .toLowerCase() as LayerName;
      const message = readStringParam(params, "message", { required: true });
      const method = readStringParam(params, "method") || "agent";
      const runId = crypto.randomUUID();
      // Short timeout - just need message acceptance, not full response
      const timeoutMs = (params.timeoutMs as number) ?? 10000;
      const currentLayer = resolveCurrentLayer();

      if (!currentLayer) {
        return jsonResult({
          runId,
          status: "error",
          error:
            "Cannot determine current layer. Set OPENCLAW_LAYER or ensure OPENCLAW_STATE_DIR contains swarm path.",
        });
      }

      // The 'agent' method requires idempotencyKey and sessionKey
      // Use a dedicated session for layer-to-layer communication
      const layerSessionKey = `agent:main:layer-${currentLayer}-to-${targetLayer}`;
      const rpcParams = params.params ?? {
        message,
        idempotencyKey: runId,
        sessionKey: layerSessionKey,
      };

      const layerConfig = loadDynamicLayerConfig() ?? LAYER_CONFIGS;

      if (!layerConfig[targetLayer]) {
        return jsonResult({
          runId,
          status: "error",
          error: `Unknown target layer: ${targetLayer}. Valid layers: ${Object.keys(layerConfig).join(", ")}`,
        });
      }

      if (!isAdjacent(currentLayer, targetLayer)) {
        return jsonResult({
          runId,
          status: "error",
          error: `Adjacency violation: ${currentLayer} cannot communicate with ${targetLayer}. Adjacent layers: ${layerConfig[currentLayer].adjacent.join(", ")}`,
        });
      }

      const targetConfig = layerConfig[targetLayer];
      const url = `ws://127.0.0.1:${targetConfig.port}`;

      try {
        // Non-blocking: return after "accepted", don't wait for full response
        // The target layer will send back via its own layer_send when ready
        const result = await callGateway({
          url,
          token: targetConfig.token,
          method,
          params: rpcParams,
          timeoutMs: 10000, // Short timeout - just need acceptance
        });

        return jsonResult({
          runId,
          status: "success",
          from: currentLayer,
          to: targetLayer,
          method,
          result,
        });
      } catch (err) {
        return jsonResult({
          runId,
          status: "error",
          from: currentLayer,
          to: targetLayer,
          error: (err as Error).message,
        });
      }
    },
  };
}
