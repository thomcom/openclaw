# Quick Task 001: Consciousness Interaction Mode - Summary

## Completed

### Task 1: CLI Interaction ✓

Created `scripts/consciousness/send.sh` that:
- Verifies layer is running
- Checks health via WebSocket RPC
- Shows instructions for full interaction (web UI or agent CLI)
- Supports `CONSCIOUSNESS_PORT` env var for multiple instances

**Usage:**
```bash
./scripts/consciousness/send.sh "message"           # Gateway (default)
./scripts/consciousness/send.sh l1 "message"       # Specific layer
CONSCIOUSNESS_PORT=18794 ./send.sh "message"       # Different instance
```

### Task 2: Status with Instructions ✓

Updated `scripts/consciousness/status-all.sh` to show:
- Layer status table
- Interaction instructions
- Web UI URL for gateway

### Task 3: Multi-Instance Support ✓

Updated `scripts/consciousness/start-consciousness.sh` with:
- `--base-port PORT` - Use specific base port
- `--instance NAME` - Named instance with separate state dir
- `--auto` - Auto-detect available ports

Created `scripts/consciousness/find-ports.sh` to find 5 consecutive free ports.

**Usage:**
```bash
# Default instance (ports 18789-18793)
./scripts/consciousness/start-consciousness.sh

# Named instance with auto ports
./scripts/consciousness/start-consciousness.sh --auto --instance second

# Specific base port
./scripts/consciousness/start-consciousness.sh --base-port 19000
```

## Interaction Methods

1. **Web UI**: `http://127.0.0.1:18789` (gateway port)
   - Shows OpenClaw control interface
   - Chat interface for agent interaction

2. **Agent CLI**:
   ```bash
   OPENCLAW_STATE_DIR=~/.openclaw/swarm/gateway bun src/index.ts agent
   ```

3. **Health check**:
   ```bash
   ./scripts/consciousness/send.sh "ping"
   ```

## Architecture Clarification

- **Port 18789 (gateway)**: External interface - use this for interaction
- **Port 18790 (l1)**: Context buffer layer
- **Port 18791 (l2)**: Pattern matching layer
- **Ports 18792-18793 (core-a/core-b)**: Identity anchors - internal only

The canvas UI at `/__openclaw__/canvas/` requires browser extension relay which doesn't work with multi-gateway setup. Use the main web UI at the root path instead.

## Files Changed

- `scripts/consciousness/send.sh` (new)
- `scripts/consciousness/find-ports.sh` (new)
- `scripts/consciousness/start-consciousness.sh` (updated)
- `scripts/consciousness/status-all.sh` (updated)
