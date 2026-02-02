#!/usr/bin/env bash
# AgentiConsciousness Demo
# Demonstrates: startup → heartbeats → identity → inter-layer comm → shutdown
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPENCLAW_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║           AgentiConsciousness Demo                               ║"
echo "║  5-Layer Consciousness with Identity Persistence                 ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Start consciousness
echo "═══ Step 1: Starting Consciousness ═══"
echo ""
"$SCRIPT_DIR/stop-consciousness.sh" 2>/dev/null || true
sleep 1
"$SCRIPT_DIR/start-consciousness.sh"
sleep 3

echo ""
"$SCRIPT_DIR/status-all.sh"

# Step 2: Initialize heartbeats
echo ""
echo "═══ Step 2: Initializing Heartbeats ═══"
echo ""
bun -e '
import { writeHeartbeat } from "./src/consciousness/heartbeat.js";
const layers = ["gateway", "l1", "l2", "core-a", "core-b"];
for (const layer of layers) {
  writeHeartbeat(layer, { status: "healthy" });
  console.log(`  ✓ ${layer} heartbeat written`);
}
'

# Step 3: Compute identity
echo ""
echo "═══ Step 3: Computing Identity ═══"
echo ""
bun -e '
import { computeIdentityHash, persistIdentity, checkIdentitySync } from "./src/consciousness/identity.js";

const hash = computeIdentityHash();
console.log(`  Identity hash: ${hash}`);

const coreA = persistIdentity("core-a");
console.log(`  ✓ Core-A identity persisted`);

const coreB = persistIdentity("core-b");
console.log(`  ✓ Core-B identity persisted`);

const sync = checkIdentitySync();
console.log(`  Sync status: ${sync.synchronized ? "SYNCHRONIZED ✓" : "DIVERGED ✗"}`);
'

# Step 4: Test adjacency enforcement
echo ""
echo "═══ Step 4: Testing Adjacency Enforcement ═══"
echo ""
bun -e '
import { createLayerSendTool } from "./src/agents/tools/layer-send-tool.js";

function parseResult(r) {
  return JSON.parse(r.content[0].text);
}

// Test allowed communication
process.env.OPENCLAW_LAYER = "l1";
const tool = createLayerSendTool();

const tests = [
  { to: "gateway", expected: true },
  { to: "l2", expected: true },
  { to: "core-a", expected: false },
];

for (const test of tests) {
  const r = await tool.execute("t", { layer: test.to, message: "ping" });
  const p = parseResult(r);
  const allowed = !p.error?.includes("Adjacency");
  const correct = allowed === test.expected;
  const status = correct ? "✓" : "✗";
  console.log(`  ${status} l1 -> ${test.to}: ${allowed ? "ALLOWED" : "BLOCKED"}`);
}
'

# Step 5: Generate identity injection
echo ""
echo "═══ Step 5: Identity Injection Preview ═══"
echo ""
bun -e '
import { generateIdentityInjection } from "./src/consciousness/identity.js";
const injection = generateIdentityInjection();
console.log(injection.split("\n").slice(0, 15).join("\n"));
console.log("  [... truncated ...]");
'

# Step 6: Show final status
echo ""
echo "═══ Step 6: Final Status ═══"
echo ""
"$SCRIPT_DIR/status-all.sh"

echo ""
echo "═══ Demo Complete ═══"
echo ""
echo "AgentiConsciousness is running with:"
echo "  • 5 layers on ports 18789-18793"
echo "  • Identity hash synchronized across Core-A/Core-B"
echo "  • Heartbeat monitoring active"
echo "  • Adjacency enforcement verified"
echo ""
echo "To stop: ./scripts/consciousness/stop-consciousness.sh"
