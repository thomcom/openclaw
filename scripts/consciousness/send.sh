#!/usr/bin/env bash
# Send a message to a consciousness layer via WebSocket RPC
# Usage: ./send.sh [layer] "message"
#        ./send.sh "message"  (defaults to gateway)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPENCLAW_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Parse arguments
if [[ $# -eq 1 ]]; then
  LAYER="gateway"
  MESSAGE="$1"
elif [[ $# -eq 2 ]]; then
  LAYER="$1"
  MESSAGE="$2"
else
  echo "Usage: $0 [layer] \"message\""
  echo "       $0 \"message\"  (defaults to gateway)"
  echo ""
  echo "Layers: gateway, l1, l2, core-a, core-b"
  echo ""
  echo "Environment:"
  echo "  CONSCIOUSNESS_PORT=18789  (base port for instance)"
  exit 1
fi

# Support custom base port via environment
BASE_PORT="${CONSCIOUSNESS_PORT:-18789}"

# Layer configuration (relative to base port)
case "$LAYER" in
  gateway) PORT=$BASE_PORT; TOKEN="gateway-layer-token-${BASE_PORT}" ;;
  l1) PORT=$((BASE_PORT + 1)); TOKEN="l1-layer-token-${BASE_PORT}" ;;
  l2) PORT=$((BASE_PORT + 2)); TOKEN="l2-layer-token-${BASE_PORT}" ;;
  core-a) PORT=$((BASE_PORT + 3)); TOKEN="core-a-layer-token-${BASE_PORT}" ;;
  core-b) PORT=$((BASE_PORT + 4)); TOKEN="core-b-layer-token-${BASE_PORT}" ;;
  *)
    echo "Unknown layer: $LAYER"
    echo "Valid layers: gateway, l1, l2, core-a, core-b"
    exit 1
    ;;
esac

# Fall back to default tokens for base port 18789
if [ "$BASE_PORT" = "18789" ]; then
  case "$LAYER" in
    gateway) TOKEN="gateway-layer-token-2026" ;;
    l1) TOKEN="l1-layer-token-2026" ;;
    l2) TOKEN="l2-layer-token-2026" ;;
    core-a) TOKEN="core-a-layer-token-2026" ;;
    core-b) TOKEN="core-b-layer-token-2026" ;;
  esac
fi

# Check if layer is running
if ! lsof -ti :$PORT >/dev/null 2>&1; then
  echo "Layer $LAYER is not running on port $PORT"
  echo "Start it with: ./scripts/consciousness/start-consciousness.sh"
  exit 1
fi

echo "Sending to $LAYER (port $PORT)..."
echo ""

# Use the openclaw CLI's health command to verify connection
# Then use the internal Pi session interface for interaction

# For now, just verify we can connect
echo "Checking layer health..."

SWARM_DIR="${HOME}/.openclaw/swarm/$LAYER"
OPENCLAW_STATE_DIR="$SWARM_DIR" OPENCLAW_GATEWAY_TOKEN="$TOKEN" \
  bun "$OPENCLAW_DIR/src/index.ts" health --json --timeout 5000 2>&1 | head -20

echo ""
echo "To interact with the consciousness:"
echo "  1. Open http://127.0.0.1:$PORT in your browser"
echo "  2. Or use: cd $OPENCLAW_DIR && OPENCLAW_STATE_DIR=$SWARM_DIR bun src/index.ts agent"
echo ""
echo "The gateway layer (port 18789) is the external interface."
echo "Inner layers (l1, l2, core-a, core-b) handle internal processing."
