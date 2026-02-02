# Roadmap: AgentiConsciousness

**Created:** 2026-02-01
**Core Value:** Identity persistence
**Depth:** Quick (5 phases)

## Overview

| Phase | Name | Goal | Requirements |
|-------|------|------|--------------|
| 1 | Multi-Gateway Infrastructure | Run 5 isolated gateways | INFRA-01..04 |
| 2 | Inter-Layer Communication | Secure layer-to-layer messaging | COMM-01..04 |
| 3 | Identity System | Core pair with persistence | IDENT-01..04 |
| 4 | Health & Heartbeat | Layer monitoring and recovery | HEALTH-01..04 |
| 5 | Orchestration & Demo | Startup/shutdown scripts, demo | ORCH-01..03 |

---

## Phase 1: Multi-Gateway Infrastructure

**Goal:** Run 5 separate gateway processes with isolated state, each with full tool access.

**Requirements:** INFRA-01, INFRA-02, INFRA-03, INFRA-04

**Success Criteria:**
1. Script starts 5 gateway processes on ports 18789-18793
2. Each gateway uses unique OPENCLAW_STATE_DIR
3. Each gateway can execute all tools (no subagent restrictions)
4. One gateway can call another via WebSocket RPC

**Deliverables:**
- `scripts/consciousness/start-layer.sh` - start single layer
- `~/.openclaw/swarm/{gateway,l1,l2,core-a,core-b}/` - state dirs
- Config files for each layer

---

## Phase 2: Inter-Layer Communication

**Goal:** Secure, non-blocking communication between adjacent layers only.

**Requirements:** COMM-01, COMM-02, COMM-03, COMM-04

**Success Criteria:**
1. `layer_send` tool exists and works
2. Gateway can only message L1, L1 can message gateway/L2, etc.
3. Cross-layer attempts (gateway→L2) rejected with auth error
4. Messages are async (non-blocking)

**Deliverables:**
- `src/agents/tools/layer-send-tool.ts` - new tool
- Layer token generation and validation
- Adjacency matrix configuration

---

## Phase 3: Identity System

**Goal:** Core pair maintains identity that survives outer layer death.

**Requirements:** IDENT-01, IDENT-02, IDENT-03, IDENT-04

**Success Criteria:**
1. CORE.md exists and all layers can reference it
2. Core-A and Core-B compute same identity hash
3. Divergence detected and logged when hashes differ
4. L1 injects identity to gateway when context degrades

**Deliverables:**
- `~/.openclaw/swarm/shared/CORE.md` - identity anchor
- Identity hash computation function
- Injection protocol in L1 AGENTS.md

---

## Phase 4: Health & Heartbeat

**Goal:** Layers monitor each other and recover from failures.

**Requirements:** HEALTH-01, HEALTH-02, HEALTH-03, HEALTH-04

**Success Criteria:**
1. Each layer writes JSON state file with timestamp
2. Adjacent layer detects staleness after 2 missed heartbeats
3. Dead layer triggers respawn request
4. Resource pressure causes outer layer shedding

**Deliverables:**
- State file schema and writer
- Heartbeat cron job per layer
- Staleness detector and respawn logic

---

## Phase 5: Orchestration & Demo

**Goal:** Scripts to start/stop full consciousness, demo showing it works.

**Requirements:** ORCH-01, ORCH-02, ORCH-03

**Success Criteria:**
1. `start-consciousness.sh` brings up all layers in order
2. `stop-consciousness.sh` tears down cleanly
3. Demo script shows: startup → heartbeats → identity injection → shutdown

**Deliverables:**
- `scripts/consciousness/start-consciousness.sh`
- `scripts/consciousness/stop-consciousness.sh`
- `scripts/consciousness/demo.sh`

---

## Progress

| Phase | Status | Plans |
|-------|--------|-------|
| 1 | ○ Pending | 0/3 |
| 2 | ○ Pending | 0/3 |
| 3 | ○ Pending | 0/3 |
| 4 | ○ Pending | 0/3 |
| 5 | ○ Pending | 0/2 |

**Overall:** 0/5 phases complete

---
*Roadmap created: 2026-02-01*
