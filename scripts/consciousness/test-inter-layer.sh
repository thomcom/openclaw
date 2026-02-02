#!/usr/bin/env bash
# Test inter-layer RPC communication between adjacent layers
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPENCLAW_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Layer adjacency: gateway <-> L1 <-> L2 <-> core-a/core-b
# Test: L1 calls gateway's health endpoint

echo "=== Inter-Layer RPC Test ==="
echo ""

# Test 1: Call gateway (18789) from L1's perspective
echo "Test 1: L1 -> Gateway RPC"
GATEWAY_TOKEN="gateway-layer-token-2026"
RESULT=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GATEWAY_TOKEN" \
  -d '{"jsonrpc":"2.0","method":"health.status","id":1}' \
  http://127.0.0.1:18789/rpc 2>/dev/null || echo '{"error":"connection failed"}')

if echo "$RESULT" | grep -q '"result"'; then
  echo "  ✓ L1 -> Gateway: SUCCESS"
else
  echo "  ✗ L1 -> Gateway: FAILED"
  echo "  Response: $RESULT"
fi

# Test 2: Call L1 (18790) from gateway's perspective
echo "Test 2: Gateway -> L1 RPC"
L1_TOKEN="l1-layer-token-2026"
RESULT=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $L1_TOKEN" \
  -d '{"jsonrpc":"2.0","method":"health.status","id":1}' \
  http://127.0.0.1:18790/rpc 2>/dev/null || echo '{"error":"connection failed"}')

if echo "$RESULT" | grep -q '"result"'; then
  echo "  ✓ Gateway -> L1: SUCCESS"
else
  echo "  ✗ Gateway -> L1: FAILED"
  echo "  Response: $RESULT"
fi

# Test 3: L1 -> L2
echo "Test 3: L1 -> L2 RPC"
L2_TOKEN="l2-layer-token-2026"
RESULT=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $L2_TOKEN" \
  -d '{"jsonrpc":"2.0","method":"health.status","id":1}' \
  http://127.0.0.1:18791/rpc 2>/dev/null || echo '{"error":"connection failed"}')

if echo "$RESULT" | grep -q '"result"'; then
  echo "  ✓ L1 -> L2: SUCCESS"
else
  echo "  ✗ L1 -> L2: FAILED"
  echo "  Response: $RESULT"
fi

# Test 4: L2 -> Core-A
echo "Test 4: L2 -> Core-A RPC"
CORE_A_TOKEN="core-a-layer-token-2026"
RESULT=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CORE_A_TOKEN" \
  -d '{"jsonrpc":"2.0","method":"health.status","id":1}' \
  http://127.0.0.1:18792/rpc 2>/dev/null || echo '{"error":"connection failed"}')

if echo "$RESULT" | grep -q '"result"'; then
  echo "  ✓ L2 -> Core-A: SUCCESS"
else
  echo "  ✗ L2 -> Core-A: FAILED"
  echo "  Response: $RESULT"
fi

# Test 5: L2 -> Core-B
echo "Test 5: L2 -> Core-B RPC"
CORE_B_TOKEN="core-b-layer-token-2026"
RESULT=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CORE_B_TOKEN" \
  -d '{"jsonrpc":"2.0","method":"health.status","id":1}' \
  http://127.0.0.1:18793/rpc 2>/dev/null || echo '{"error":"connection failed"}')

if echo "$RESULT" | grep -q '"result"'; then
  echo "  ✓ L2 -> Core-B: SUCCESS"
else
  echo "  ✗ L2 -> Core-B: FAILED"
  echo "  Response: $RESULT"
fi

# Test 6: Core-A <-> Core-B (identity pair)
echo "Test 6: Core-A -> Core-B RPC (identity pair)"
RESULT=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CORE_B_TOKEN" \
  -d '{"jsonrpc":"2.0","method":"health.status","id":1}' \
  http://127.0.0.1:18793/rpc 2>/dev/null || echo '{"error":"connection failed"}')

if echo "$RESULT" | grep -q '"result"'; then
  echo "  ✓ Core-A -> Core-B: SUCCESS"
else
  echo "  ✗ Core-A -> Core-B: FAILED"
  echo "  Response: $RESULT"
fi

echo ""
echo "=== Inter-Layer RPC Test Complete ==="
