# Bug: layer_send only works in one direction (downward)

## Summary

Inter-layer communication via `layer_send` works when sending messages **down** the consciousness stack (gateway→L1→L2→cores) but fails when sending messages **up** (cores→L2→L1→gateway).

## Observed Behavior

| Direction | Status | Notes |
|-----------|--------|-------|
| Gateway → L1 | ✅ Works | Messages delivered, responses received |
| L1 → Gateway | ❌ Fails | `gateway closed (1008): no close reason` |
| L1 → L2 | ✅ Works | L1 successfully probed L2 |
| L2 → L1 | ❓ Untested | |
| L2 → core-b | ✅ Works | L2 successfully reached core-b |
| core-b → L2 | ❌ Fails | core-b reported same pattern |
| core-a | ❌ N/A | No agent session configured |

## Error Messages

### L1 attempting to reach Gateway:
```
Error: gateway closed (1008): no close reason
Target: ws://127.0.0.1:18789
```

### Earlier in L1 logs:
```
gateway connect failed: Error: unauthorized: gateway token mismatch 
(set gateway.remote.token to match gateway.auth.token)
```

## Layer Configuration

From `/home/devkit/.openclaw/swarm/shared/layers.json`:
```json
{
  "layers": {
    "gateway": { "port": 18789, "adjacent": ["l1"] },
    "l1": { "port": 18790, "adjacent": ["gateway", "l2"] },
    "l2": { "port": 18791, "adjacent": ["l1", "core-a", "core-b"] },
    "core-a": { "port": 18792, "adjacent": ["l2", "core-b"] },
    "core-b": { "port": 18793, "adjacent": ["l2", "core-a"] }
  }
}
```

Each layer has its own token in `openclaw.json`:
- gateway: `gateway-layer-token-2026`
- l1: `l1-layer-token-2026`
- l2: `l2-layer-token-2026`
- core-a: `core-a-layer-token-2026`
- core-b: `core-b-layer-token-2026`

## Relevant Code

### layer-send-tool.ts

The tool resolves the target layer's config and calls:
```typescript
const result = await callGateway({
  url,
  token: targetConfig.token,
  method,
  params: rpcParams,
  timeoutMs,
  expectFinal: true,
});
```

The `token` used is the **target's** token (e.g., when L1 calls gateway, it uses `gateway-layer-token-2026`).

## Hypothesis

The issue may be:

1. **Token mismatch**: When L1 tries to connect to Gateway, it uses `gateway-layer-token-2026`, but Gateway may be expecting a different token or the auth flow differs for inbound vs outbound connections.

2. **Session context**: When Gateway calls L1, it's from the main CLI/chat context. When L1 tries to call Gateway, it's from within an agent session that may have different permissions or connection handling.

3. **WebSocket connection lifecycle**: The agent session within L1 may not have the same ability to initiate outbound WebSocket connections as the top-level gateway process.

4. **RPC method availability**: The `agent` RPC method may not be registered or accessible the same way when called from within an agent session.

## To Investigate

1. Check if the auth token flow differs between inbound and outbound connections
2. Verify the `callGateway` function works the same way when called from within an agent session
3. Check if there are any restrictions on WebSocket connections from agent tool execution contexts
4. Look at why error is `1008` (policy violation) specifically

## Test Case

From L1's perspective:
```typescript
// This should work but fails:
layer_send(layer: "gateway", message: "Hello from L1!")

// Error: gateway closed (1008): no close reason
// Target: ws://127.0.0.1:18789
```

## Environment

- OpenClaw swarm with 5 layers (gateway, l1, l2, core-a, core-b)
- All running on localhost with different ports
- Using `--watch` mode for hot reload (caused some race conditions)
- Model: anthropic/claude-opus-4-5
