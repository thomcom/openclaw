#!/usr/bin/env bun
/**
 * Test inter-layer RPC communication between adjacent consciousness layers.
 * Uses WebSocket RPC to verify layers can communicate.
 */

import { callGateway } from "../../src/gateway/call.js";

const LAYERS = {
  gateway: { port: 18789, token: "gateway-layer-token-2026" },
  l1: { port: 18790, token: "l1-layer-token-2026" },
  l2: { port: 18791, token: "l2-layer-token-2026" },
  "core-a": { port: 18792, token: "core-a-layer-token-2026" },
  "core-b": { port: 18793, token: "core-b-layer-token-2026" },
} as const;

type LayerName = keyof typeof LAYERS;

async function testLayerRPC(
  from: LayerName,
  to: LayerName
): Promise<{ success: boolean; error?: string }> {
  const target = LAYERS[to];
  const url = `ws://127.0.0.1:${target.port}`;

  try {
    const result = await callGateway({
      url,
      token: target.token,
      method: "health",
      timeoutMs: 5000,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

async function main() {
  console.log("=== Inter-Layer RPC Test (WebSocket) ===\n");

  // Define adjacency tests based on the consciousness architecture
  const tests: Array<{ from: LayerName; to: LayerName; description: string }> = [
    { from: "l1", to: "gateway", description: "L1 -> Gateway" },
    { from: "gateway", to: "l1", description: "Gateway -> L1" },
    { from: "l1", to: "l2", description: "L1 -> L2" },
    { from: "l2", to: "l1", description: "L2 -> L1" },
    { from: "l2", to: "core-a", description: "L2 -> Core-A" },
    { from: "l2", to: "core-b", description: "L2 -> Core-B" },
    { from: "core-a", to: "core-b", description: "Core-A -> Core-B (identity pair)" },
    { from: "core-b", to: "core-a", description: "Core-B -> Core-A (identity pair)" },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await testLayerRPC(test.from, test.to);
    if (result.success) {
      console.log(`  ✓ ${test.description}: SUCCESS`);
      passed++;
    } else {
      console.log(`  ✗ ${test.description}: FAILED`);
      console.log(`    Error: ${result.error}`);
      failed++;
    }
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
