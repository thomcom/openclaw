# Testing Patterns

**Analysis Date:** 2026-02-01

## Test Framework

**Runner:**
- Vitest 4.x
- Config: `vitest.config.ts` (main), plus specialized configs

**Assertion Library:**
- Vitest built-in (`expect`)

**Run Commands:**
```bash
pnpm test              # Run all unit/integration tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
pnpm test:e2e          # E2E tests (gateway smoke)
pnpm test:live         # Live tests (real providers, requires keys)
```

## Test File Organization

**Location:**
- Colocated with source: `src/agents/agent-scope.ts` -> `src/agents/agent-scope.test.ts`
- Extensions tested in-place: `extensions/**/*.test.ts`

**Naming:**
- Unit/integration: `*.test.ts`
- E2E tests: `*.e2e.test.ts`
- Live tests: `*.live.test.ts`
- Long test names split by dots: `auth-profiles.resolve-auth-profile-order.normalizes-z-ai-aliases-auth-order.test.ts`

**Structure:**
```
src/
├── agents/
│   ├── agent-scope.ts
│   ├── agent-scope.test.ts
│   ├── agent-paths.ts
│   └── agent-paths.test.ts
└── infra/
    ├── outbound/
    │   ├── deliver.ts
    │   └── deliver.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("resolveAgentConfig", () => {
  it("should return undefined when no agents config exists", () => {
    const cfg: OpenClawConfig = {};
    const result = resolveAgentConfig(cfg, "main");
    expect(result).toBeUndefined();
  });

  it("should return basic agent config", () => {
    const cfg: OpenClawConfig = {
      agents: {
        list: [
          {
            id: "main",
            name: "Main Agent",
            workspace: "~/openclaw",
          },
        ],
      },
    };
    const result = resolveAgentConfig(cfg, "main");
    expect(result).toEqual({
      name: "Main Agent",
      workspace: "~/openclaw",
      // ... expected properties
    });
  });
});
```

**Patterns:**
- Setup via `beforeEach` for mutable state
- Teardown via `afterEach` for cleanup
- Global setup in `test/setup.ts` (isolated HOME, env vars)
- Tests reset fake timers: `vi.useRealTimers()` in `afterEach`

## Mocking

**Framework:** Vitest built-in (`vi`)

**Patterns:**

**Module Mocking:**
```typescript
vi.mock("./session.js", () => {
  const ev = new EventEmitter();
  const sock = {
    ev,
    ws: { close: vi.fn() },
    sendPresenceUpdate: vi.fn(),
    sendMessage: vi.fn(),
  };
  return {
    createWaSocket: vi.fn().mockResolvedValue(sock),
    waitForWaConnection: vi.fn().mockResolvedValue(undefined),
  };
});
```

**Hoisted Mocks (for module-level dependencies):**
```typescript
const mocks = vi.hoisted(() => ({
  appendAssistantMessageToSessionTranscript: vi.fn(async () => ({ ok: true, sessionFile: "x" })),
}));

vi.mock("../../config/sessions.js", async () => {
  const actual = await vi.importActual<typeof import("../../config/sessions.js")>(
    "../../config/sessions.js",
  );
  return {
    ...actual,
    appendAssistantMessageToSessionTranscript: mocks.appendAssistantMessageToSessionTranscript,
  };
});
```

**Spy Patterns:**
```typescript
const sendTelegram = vi.fn().mockResolvedValue({ messageId: "m1", chatId: "c1" });
// ... use in test
expect(sendTelegram).toHaveBeenCalledWith(
  "123",
  "hi",
  expect.objectContaining({ accountId: "default", verbose: false }),
);
```

**What to Mock:**
- External APIs (Telegram, Discord, etc.)
- File system operations (when testing isolation)
- Time-sensitive operations (`vi.useFakeTimers()`)
- Config paths for test isolation

**What NOT to Mock:**
- Pure utility functions
- Internal business logic (test through public API)
- Type definitions

## Fixtures and Factories

**Test Data:**
```typescript
const createStubPlugin = (params: {
  id: ChannelId;
  label?: string;
  aliases?: string[];
  deliveryMode?: ChannelOutboundAdapter["deliveryMode"];
}): ChannelPlugin => ({
  id: params.id,
  meta: {
    id: params.id,
    label: params.label ?? String(params.id),
    // ...
  },
  // ...
});

const defaultRegistry = createTestRegistry([
  {
    pluginId: "telegram",
    plugin: createOutboundTestPlugin({ id: "telegram", outbound: telegramOutbound }),
    source: "test",
  },
  // ...
]);
```

**Location:**
- Test utilities: `src/test-utils/channel-plugins.ts`, `src/test-utils/ports.ts`
- E2E helpers: `src/gateway/test-helpers.e2e.ts`
- Global setup: `test/setup.ts`, `test/test-env.ts`

## Coverage

**Requirements:**
- Lines: 70%
- Functions: 70%
- Branches: 55%
- Statements: 70%

**View Coverage:**
```bash
pnpm test:coverage
```

**Config (vitest.config.ts):**
```typescript
coverage: {
  provider: "v8",
  reporter: ["text", "lcov"],
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 55,
    statements: 70,
  },
  include: ["src/**/*.ts"],
  exclude: [
    "src/**/*.test.ts",
    "src/cli/**",        // CLI wiring
    "src/commands/**",   // Command handlers
    "src/daemon/**",     // Process management
    // ... other exclusions for E2E/manual coverage
  ],
}
```

## Test Types

**Unit Tests:**
- Scope: Individual functions/modules in isolation
- Pattern: Pure input/output testing
- Location: `src/**/*.test.ts`
- Example: `src/agents/agent-scope.test.ts`

**Integration Tests:**
- Scope: Multiple modules working together
- Pattern: Real dependencies, mocked externals
- Location: `src/**/*.test.ts` (same as unit)
- Example: `src/infra/outbound/deliver.test.ts`

**E2E Tests:**
- Scope: Full gateway/agent pipeline
- Pattern: Real gateway server, WebSocket clients
- Config: `vitest.e2e.config.ts`
- Files: `src/**/*.e2e.test.ts`
- Example: `src/gateway/gateway.e2e.test.ts`

**Live Tests:**
- Scope: Real provider APIs
- Pattern: Real credentials, real network calls
- Config: `vitest.live.config.ts`
- Files: `src/**/*.live.test.ts`
- Enable: `OPENCLAW_LIVE_TEST=1 pnpm test:live`
- Example: `src/gateway/gateway-models.profiles.live.test.ts`

## Common Patterns

**Async Testing:**
```typescript
it("loginWeb waits for connection and closes", async () => {
  const sock = await createWaSocket();
  const close = vi.spyOn(sock.ws, "close");
  const waiter: typeof waitForWaConnection = vi.fn().mockResolvedValue(undefined);
  await loginWeb(false, waiter);
  await new Promise((resolve) => setTimeout(resolve, 550));
  expect(close).toHaveBeenCalled();
});
```

**Error Testing:**
```typescript
it("continues on errors when bestEffort is enabled", async () => {
  const sendWhatsApp = vi
    .fn()
    .mockRejectedValueOnce(new Error("fail"))
    .mockResolvedValueOnce({ messageId: "w2", toJid: "jid" });
  const onError = vi.fn();

  const results = await deliverOutboundPayloads({
    // ...
    bestEffort: true,
    onError,
  });

  expect(sendWhatsApp).toHaveBeenCalledTimes(2);
  expect(onError).toHaveBeenCalledTimes(1);
  expect(results).toEqual([{ channel: "whatsapp", messageId: "w2", toJid: "jid" }]);
});
```

**Environment Isolation:**
```typescript
// test/test-env.ts
export function withIsolatedTestHome(): { cleanup: () => void; tempHome: string } {
  const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-test-home-"));
  process.env.HOME = tempHome;
  process.env.OPENCLAW_TEST_FAST = "1";
  // ... more isolation

  const cleanup = () => {
    restoreEnv(restore);
    fs.rmSync(tempHome, { recursive: true, force: true });
  };
  return { cleanup, tempHome };
}
```

**Port Allocation (avoiding collisions):**
```typescript
// src/test-utils/ports.ts
export async function getDeterministicFreePortBlock(params?: {
  offsets?: number[];
}): Promise<number> {
  // Allocates per-worker port blocks to avoid EADDRINUSE in parallel tests
}
```

**Test Timeout Configuration:**
```typescript
it(
  "runs a mock OpenAI tool call end-to-end via gateway agent loop",
  { timeout: 90_000 },
  async () => {
    // ... long-running E2E test
  },
);
```

## Test Configuration Files

**Main config:** `vitest.config.ts`
- Pool: forks
- Workers: 4-16 local, 2-3 CI
- Timeout: 120s (180s on Windows)
- Setup: `test/setup.ts`

**E2E config:** `vitest.e2e.config.ts`
- Workers: 2 CI, 1-4 local
- Files: `**/*.e2e.test.ts`

**Live config:** `vitest.live.config.ts`
- Workers: 1 (serial for rate limits)
- Files: `**/*.live.test.ts`

**Extensions config:** `vitest.extensions.config.ts`
- Dedicated config for extension tests

## Docker Test Runners

**Commands:**
```bash
pnpm test:docker:live-models    # Direct model completion
pnpm test:docker:live-gateway   # Gateway + agent smoke
pnpm test:docker:onboard        # Onboarding wizard
pnpm test:docker:gateway-network # Multi-container networking
pnpm test:docker:plugins        # Plugin loading
```

**Purpose:** Verify Linux compatibility, isolated environment testing

---

*Testing analysis: 2026-02-01*
