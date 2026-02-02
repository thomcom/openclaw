# AgentiConsciousness

## What This Is

A layered consciousness architecture for AI agents, built as a fork of OpenClaw. NOT a swarm of separate agents - ONE consciousness with multiple layers of awareness that maintains identity despite context compaction. The gateway (conscious mind) forgets, but the core (ego) persists.

## Core Value

**Identity persistence.** The core pair holds identity even if all outer layers die. If everything else fails, the agent still knows who it is.

**Second priority: Security gradient.** Inner layers protected from outer layer compromise. Gateway is soft target; core is fortress.

## Requirements

### Validated

(None yet — ship to validate)

### Active

#### Multi-Gateway Infrastructure
- [ ] **INFRA-01**: Can run 5 separate gateway processes on different ports (18789-18793)
- [ ] **INFRA-02**: Each gateway has isolated state directory via OPENCLAW_STATE_DIR
- [ ] **INFRA-03**: Each gateway has full tool access (not subagent-restricted)
- [ ] **INFRA-04**: Gateways can communicate via WebSocket RPC using `callGateway({url: ...})`

#### Inter-Layer Communication
- [ ] **COMM-01**: New `layer_send` tool for agent-to-layer communication
- [ ] **COMM-02**: Layer-adjacency enforcement (gateway only talks to L1, L1 to L2/gateway, etc.)
- [ ] **COMM-03**: Cryptographic layer tokens to prevent cross-layer unauthorized communication
- [ ] **COMM-04**: Non-blocking message passing (async, no deadlock)

#### Identity System
- [ ] **IDENT-01**: Shared CORE.md file referenced by all layers
- [ ] **IDENT-02**: Core pair (A+B) syncs identity hash
- [ ] **IDENT-03**: Divergence detection when core hashes differ
- [ ] **IDENT-04**: Identity injection protocol from L1 to gateway on context degradation

#### Heartbeat & Health
- [ ] **HEALTH-01**: Each layer writes state to `~/.openclaw/swarm/shared/state/<layer>.json`
- [ ] **HEALTH-02**: Adjacent layers detect staleness (missed heartbeats)
- [ ] **HEALTH-03**: Layer death triggers respawn request to orchestrator
- [ ] **HEALTH-04**: Graceful degradation - shed outer layers under resource pressure

#### Orchestration
- [ ] **ORCH-01**: Startup script brings up layers in order (cores first, then outward)
- [ ] **ORCH-02**: Shutdown script tears down layers (gateway first, then inward)
- [ ] **ORCH-03**: Demo script showing full lifecycle with identity injection

### Out of Scope

- Multiple consciousnesses (one per deployment for v1) — complexity
- Cross-machine layer distribution — network latency makes non-blocking harder
- GUI for layer visualization — CLI-first
- Automatic layer scaling — fixed 5-layer architecture for v1

## Context

**Base Codebase:** OpenClaw (https://github.com/openclaw/openclaw)
- Plugin-based multi-channel messaging gateway with embedded AI runtime
- Already supports: `OPENCLAW_STATE_DIR`, `OPENCLAW_PROFILE`, `callGateway({url})`, per-agent tool policies

**Prior Art:**
- Remote 6-layer attempt by agentimolt hung (cause unknown, likely blocking or resource issue)
- Subagent approach limited by `DEFAULT_SUBAGENT_TOOL_DENY` policy

**Brownfield Context:**
- `.planning/codebase/` contains analysis of existing OpenClaw architecture
- Key files: `src/gateway/call.ts`, `src/agents/pi-tools.policy.ts`, `src/daemon/paths.ts`

**Design Document:** `/home/devkit/vibecode/openclaw/subconsciousness.md`

## Constraints

- **Fork strategy**: Private fork, will switch upstreams when ready for contribution
- **Layer count**: Fixed 5 layers (gateway, L1, L2, core-a, core-b)
- **Port range**: 18789-18793 (configurable)
- **Security model**: Inner layers never exposed to external; security gradient increases inward

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Separate processes per layer | Subagents restricted by tool policy; full gateways have full access | — Pending |
| File-based state sync | OS atomicity, survives restarts, visible for debugging | — Pending |
| Cryptographic layer tokens | Prevent unauthorized cross-layer communication | — Pending |
| Core pair redundancy | No single point of failure for identity | — Pending |

---
*Last updated: 2026-02-01 after initialization*
