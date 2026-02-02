#!/usr/bin/env bash
# Start all 5 consciousness layers in sequence
# Usage: ./start-consciousness.sh [--base-port PORT] [--instance NAME]
#        ./start-consciousness.sh --auto  (auto-detect available ports)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SWARM_BASE="${HOME}/.openclaw/swarm"

# Parse arguments
BASE_PORT=18789
INSTANCE_NAME=""
AUTO_PORT=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-port)
      BASE_PORT="$2"
      shift 2
      ;;
    --instance)
      INSTANCE_NAME="$2"
      shift 2
      ;;
    --auto)
      AUTO_PORT=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--base-port PORT] [--instance NAME] [--auto]"
      exit 1
      ;;
  esac
done

# Auto-detect ports if requested
if [ "$AUTO_PORT" = true ]; then
  BASE_PORT=$("$SCRIPT_DIR/find-ports.sh" 18789)
  echo "Auto-detected base port: $BASE_PORT"
fi

# Calculate layer ports
GATEWAY_PORT=$BASE_PORT
L1_PORT=$((BASE_PORT + 1))
L2_PORT=$((BASE_PORT + 2))
CORE_A_PORT=$((BASE_PORT + 3))
CORE_B_PORT=$((BASE_PORT + 4))

# Determine swarm directory
if [ -n "$INSTANCE_NAME" ]; then
  SWARM_DIR="${SWARM_BASE}-${INSTANCE_NAME}"
elif [ "$BASE_PORT" != "18789" ]; then
  SWARM_DIR="${SWARM_BASE}-${BASE_PORT}"
else
  SWARM_DIR="$SWARM_BASE"
fi

echo "=== Starting AgentiConsciousness Layers ==="
echo ""
echo "Instance: ${INSTANCE_NAME:-default}"
echo "Base port: $BASE_PORT"
echo "Swarm directory: $SWARM_DIR"
echo ""

# Create instance swarm directory if needed
if [ "$SWARM_DIR" != "$SWARM_BASE" ]; then
  echo "Creating instance directory structure..."
  mkdir -p "$SWARM_DIR"/{gateway,l1,l2,core-a,core-b,shared/state}

  # Copy or create configs for this instance
  for layer in gateway l1 l2 core-a core-b; do
    case "$layer" in
      gateway) port=$GATEWAY_PORT ;;
      l1) port=$L1_PORT ;;
      l2) port=$L2_PORT ;;
      core-a) port=$CORE_A_PORT ;;
      core-b) port=$CORE_B_PORT ;;
    esac

    cat > "$SWARM_DIR/$layer/openclaw.json" <<EOF
{
  "gateway": {
    "mode": "local",
    "port": $port,
    "bind": "loopback",
    "auth": {
      "mode": "token",
      "token": "${layer}-layer-token-${BASE_PORT}"
    }
  },
  "tools": {
    "elevated": { "enabled": true }
  }
}
EOF
  done

  # Copy CORE.md if exists
  if [ -f "$SWARM_BASE/shared/CORE.md" ]; then
    cp "$SWARM_BASE/shared/CORE.md" "$SWARM_DIR/shared/"
  fi

  echo "Instance configs created"
  echo ""
fi

# Start layers sequentially from core outward
for layer in core-a core-b l2 l1 gateway; do
  case "$layer" in
    gateway) port=$GATEWAY_PORT ;;
    l1) port=$L1_PORT ;;
    l2) port=$L2_PORT ;;
    core-a) port=$CORE_A_PORT ;;
    core-b) port=$CORE_B_PORT ;;
  esac

  echo "Starting $layer on port $port..."

  # Set environment for this layer
  export OPENCLAW_STATE_DIR="$SWARM_DIR/$layer"
  export OPENCLAW_GATEWAY_PORT="$port"
  export OPENCLAW_LAYER="$layer"

  # Start in background
  OPENCLAW_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
  nohup bun "$OPENCLAW_DIR/src/index.ts" gateway run \
    --port "$port" \
    --bind loopback \
    --force \
    > "/tmp/consciousness-${layer}-${BASE_PORT}.log" 2>&1 &

  # Wait for the port to be listening
  for i in {1..20}; do
    if lsof -ti :$port >/dev/null 2>&1; then
      echo "  ✓ $layer started on port $port"
      break
    fi
    sleep 0.5
  done

  # Brief pause to let the layer fully initialize
  sleep 1
done

echo ""
echo "=== All Layers Started ==="
echo ""
echo "Ports: gateway=$GATEWAY_PORT, l1=$L1_PORT, l2=$L2_PORT, core-a=$CORE_A_PORT, core-b=$CORE_B_PORT"
echo "Logs: /tmp/consciousness-*-${BASE_PORT}.log"
echo ""
echo "Interact with gateway:"
echo "  ./scripts/consciousness/send.sh \"Hello!\""
if [ "$BASE_PORT" != "18789" ]; then
  echo ""
  echo "For this instance, use:"
  echo "  CONSCIOUSNESS_PORT=$BASE_PORT ./scripts/consciousness/send.sh \"Hello!\""
fi
