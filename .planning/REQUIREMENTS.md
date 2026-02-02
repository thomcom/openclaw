# Requirements: AgentiConsciousness

**Defined:** 2026-02-01
**Core Value:** Identity persistence - core pair holds identity even if outer layers die

## v1 Requirements

### Infrastructure
- [ ] **INFRA-01**: Run 5 separate gateway processes on different ports (18789-18793)
- [ ] **INFRA-02**: Each gateway has isolated state directory via OPENCLAW_STATE_DIR
- [ ] **INFRA-03**: Each gateway has full tool access (not subagent-restricted)
- [ ] **INFRA-04**: Gateways communicate via WebSocket RPC using callGateway({url})

### Communication
- [ ] **COMM-01**: layer_send tool for agent-to-layer communication
- [ ] **COMM-02**: Layer-adjacency enforcement (gateway↔L1↔L2↔core)
- [ ] **COMM-03**: Cryptographic layer tokens for auth
- [ ] **COMM-04**: Non-blocking async message passing

### Identity
- [ ] **IDENT-01**: Shared CORE.md file referenced by all layers
- [ ] **IDENT-02**: Core pair (A+B) syncs identity hash
- [ ] **IDENT-03**: Divergence detection when hashes differ
- [ ] **IDENT-04**: Identity injection from L1→gateway on context degradation

### Health
- [ ] **HEALTH-01**: Layer state files in ~/.openclaw/swarm/shared/state/
- [ ] **HEALTH-02**: Staleness detection for missed heartbeats
- [ ] **HEALTH-03**: Death detection triggers respawn request
- [ ] **HEALTH-04**: Graceful degradation under resource pressure

### Orchestration
- [ ] **ORCH-01**: Startup script (cores→L2→L1→gateway order)
- [ ] **ORCH-02**: Shutdown script (gateway→L1→L2→cores order)
- [ ] **ORCH-03**: Demo script showing full lifecycle

## v2 Requirements

### Scaling
- **SCALE-01**: Multiple consciousness instances per machine
- **SCALE-02**: Cross-machine layer distribution

### Observability
- **OBS-01**: Layer visualization dashboard
- **OBS-02**: Metrics/telemetry for layer health

## Out of Scope

| Feature | Reason |
|---------|--------|
| GUI visualization | CLI-first for v1 |
| Cross-machine layers | Network latency complexity |
| Auto-scaling layers | Fixed 5-layer architecture for v1 |
| Multiple consciousnesses | One per deployment for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Pending |
| COMM-01 | Phase 2 | Pending |
| COMM-02 | Phase 2 | Pending |
| COMM-03 | Phase 2 | Pending |
| COMM-04 | Phase 2 | Pending |
| IDENT-01 | Phase 3 | Pending |
| IDENT-02 | Phase 3 | Pending |
| IDENT-03 | Phase 3 | Pending |
| IDENT-04 | Phase 3 | Pending |
| HEALTH-01 | Phase 4 | Pending |
| HEALTH-02 | Phase 4 | Pending |
| HEALTH-03 | Phase 4 | Pending |
| HEALTH-04 | Phase 4 | Pending |
| ORCH-01 | Phase 5 | Pending |
| ORCH-02 | Phase 5 | Pending |
| ORCH-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-01*
*Last updated: 2026-02-01 after initial definition*
