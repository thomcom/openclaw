#!/usr/bin/env bash
# AgentiConsciousness - Start a single layer gateway
# Usage: ./start-layer.sh <layer-name>
# Layers: gateway, l1, l2, core-a, core-b

set -euo pipefail

LAYER="${1:-}"
SWARM_DIR="${HOME}/.openclaw/swarm"

if [[ -z "$LAYER" ]]; then
    echo "Usage: $0 <layer-name>"
    echo "Layers: gateway, l1, l2, core-a, core-b"
    exit 1
fi

LAYER_DIR="${SWARM_DIR}/${LAYER}"
if [[ ! -d "$LAYER_DIR" ]]; then
    echo "Error: Layer directory not found: $LAYER_DIR"
    exit 1
fi

# Port mapping
case "$LAYER" in
    gateway) PORT=18789 ;;
    l1)      PORT=18790 ;;
    l2)      PORT=18791 ;;
    core-a)  PORT=18792 ;;
    core-b)  PORT=18793 ;;
    *)
        echo "Error: Unknown layer: $LAYER"
        exit 1
        ;;
esac

echo "Starting AgentiConsciousness layer: $LAYER on port $PORT"
echo "State directory: $LAYER_DIR"

# Export environment for this layer
export OPENCLAW_STATE_DIR="$LAYER_DIR"
export OPENCLAW_GATEWAY_PORT="$PORT"
export OPENCLAW_GATEWAY_TOKEN="${LAYER}-layer-token-2026"
export OPENCLAW_LAYER="$LAYER"

# Run the gateway using bun (dev mode)
# Use --force to avoid lock conflicts during development
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPENCLAW_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

exec bun "$OPENCLAW_DIR/src/index.ts" gateway run --port "$PORT" --bind loopback --force
