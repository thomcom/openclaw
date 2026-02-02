# Quick Task 001: Consciousness Interaction Mode

## Problem Analysis

1. **Port assignment**: The gateway layer should be at 18789 (external interface), not 18792 (core-a). User accessed 18792's canvas which showed "bridge missing" because it's an inner layer not configured for direct interaction.

2. **Interaction method**: The canvas UI (`/__openclaw__/canvas/`) requires browser extension relay which conflicts across multiple gateways. Need a CLI-based or dedicated web interface.

3. **Multi-instance support**: Running multiple consciousness instances on same machine needs:
   - Auto-port selection (find 5 consecutive available ports)
   - Isolated state directories
   - Instance naming/identification

## Tasks

### Task 1: Fix interaction via CLI message command

**Goal**: Enable interaction with gateway layer via `openclaw message send`

**Implementation**:
- The gateway layer (port 18789) accepts WebSocket connections
- Use existing `openclaw message send` with `--url` parameter to target specific layer
- Create wrapper script `scripts/consciousness/send.sh` for easy messaging

**Files**:
- `scripts/consciousness/send.sh` (new)

### Task 2: Create status with interaction instructions

**Goal**: Update status-all.sh to show how to interact with each layer

**Implementation**:
- Add interaction instructions to status output
- Show which layer to use for external interaction (gateway)

**Files**:
- `scripts/consciousness/status-all.sh` (modify)

### Task 3: Auto-port selection for multiple instances

**Goal**: Allow running multiple consciousness instances with auto-selected ports

**Implementation**:
- Create `find-available-ports.sh` that finds 5 consecutive free ports
- Update `start-consciousness.sh` to accept `--base-port` or auto-detect
- Each instance gets unique swarm directory based on port range

**Files**:
- `scripts/consciousness/find-ports.sh` (new)
- `scripts/consciousness/start-consciousness.sh` (modify)

## Success Criteria

- [ ] Can send message to gateway layer via CLI
- [ ] Status shows interaction instructions
- [ ] Can start second instance on different ports
