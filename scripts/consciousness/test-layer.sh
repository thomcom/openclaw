#!/usr/bin/env bash
# AgentiConsciousness - Test a single layer starts correctly
# Usage: ./test-layer.sh <layer-name>

set -euo pipefail

LAYER="${1:-gateway}"
SWARM_DIR="${HOME}/.openclaw/swarm"
LAYER_DIR="${SWARM_DIR}/${LAYER}"

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

echo "Testing layer: $LAYER on port $PORT"

# Check if port is already in use
if ss -ltnp 2>/dev/null | grep -q ":${PORT} "; then
    echo "Warning: Port $PORT already in use"
    ss -ltnp 2>/dev/null | grep ":${PORT} " || true
fi

# Start the layer in background
echo "Starting $LAYER in background..."
export OPENCLAW_STATE_DIR="$LAYER_DIR"
export OPENCLAW_GATEWAY_PORT="$PORT"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPENCLAW_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

nohup bun "$OPENCLAW_DIR/src/index.ts" gateway run --port "$PORT" --bind loopback --force > "/tmp/consciousness-${LAYER}.log" 2>&1 &
PID=$!
echo "Started with PID: $PID"

# Wait for startup
echo "Waiting for gateway to start..."
sleep 3

# Check if it's running
if ! kill -0 "$PID" 2>/dev/null; then
    echo "Error: Layer failed to start"
    echo "Log tail:"
    tail -20 "/tmp/consciousness-${LAYER}.log" || true
    exit 1
fi

# Try to connect
echo "Testing health endpoint..."
if curl -s "http://127.0.0.1:${PORT}/health" | head -c 100; then
    echo ""
    echo "Layer $LAYER is running!"
else
    echo "Warning: Health check failed, but process is running"
fi

echo ""
echo "Layer $LAYER started successfully (PID: $PID)"
echo "Log: /tmp/consciousness-${LAYER}.log"
echo "Stop with: kill $PID"
