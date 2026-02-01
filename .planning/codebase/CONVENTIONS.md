# Coding Conventions

**Analysis Date:** 2026-02-01

## Naming Patterns

**Files:**
- Source files: `kebab-case.ts` (e.g., `agent-paths.ts`, `session-key.ts`)
- Test files: colocated with source as `*.test.ts` (e.g., `agent-scope.test.ts`)
- Live tests: `*.live.test.ts` for tests requiring real credentials
- E2E tests: `*.e2e.test.ts` for end-to-end scenarios
- Type definition files: `types.ts` or `types.<domain>.ts` (e.g., `types.tts.ts`, `types.agents.ts`)

**Functions:**
- camelCase for all functions: `resolveAgentConfig`, `normalizeE164`, `buildAgentMainSessionKey`
- Prefix patterns:
  - `resolve*` - derive computed values: `resolveOpenClawAgentDir()`, `resolveAgentIdFromSessionKey()`
  - `normalize*` - sanitize/standardize input: `normalizeAgentId()`, `normalizeE164()`
  - `build*` - construct composed values: `buildAgentPeerSessionKey()`
  - `create*` - factory functions: `createTestRegistry()`, `createSessionsSendTool()`
  - `ensure*` - idempotent setup: `ensureDir()`, `ensureOpenClawAgentEnv()`
  - `is*`/`has*` - boolean checks: `isSelfChatMode()`, `isAcpSessionKey()`

**Variables:**
- camelCase for all variables
- Constants: UPPER_SNAKE_CASE for module-level constants: `DEFAULT_AGENT_ID`, `DEFAULT_MAIN_KEY`
- Pre-compiled regex: `const VALID_ID_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/i`

**Types:**
- PascalCase for all types/interfaces
- Suffix patterns:
  - `*Config` for configuration objects: `OpenClawConfig`, `AgentConfig`, `TtsConfig`
  - `*Adapter` for plugin interfaces: `ChannelOutboundAdapter`, `ChannelConfigAdapter`
  - `*Context` for runtime context: `ChannelMessageActionContext`, `ChannelPollContext`
  - `*Result` for function return types: `ChannelPollResult`, `SafeOpenResult`
  - `*Options` for function parameters: `GatewayCallOptions`, `CronToolOptions`

## Code Style

**Formatting:**
- Tool: `oxfmt` (Oxlint formatter)
- Check: `pnpm format` (runs `oxfmt --check`)
- Fix: `pnpm format:fix` (runs `oxfmt --write`)

**Linting:**
- Tool: `oxlint` with type-aware rules
- Config: `tsconfig.oxlint.json` for type checking
- Command: `pnpm lint`
- Fix: `pnpm lint:fix`

**TypeScript:**
- Strict mode enabled in `tsconfig.json`
- Target: ES2023
- Module: NodeNext (ESM)
- No `any` types - prefer strict typing
- `skipLibCheck: true` for faster builds

## Import Organization

**Order:**
1. Node.js built-ins: `import fs from "node:fs"`
2. External packages: `import { Type } from "@sinclair/typebox"`
3. Internal absolute paths with `.js` extension: `import { loadConfig } from "../../config/config.js"`

**Path Aliases:**
- Plugin SDK alias in vitest: `"openclaw/plugin-sdk"` -> `src/plugin-sdk/index.ts`
- No barrel file re-exports for most modules - import from specific files

**Extension Requirements:**
- All relative imports must include `.js` extension (ESM requirement)
- Example: `import { resolveStateDir } from "../config/paths.js"`

## Error Handling

**Patterns:**
- Return typed result objects over throwing: `type SafeOpenResult = { ok: true; ... } | { ok: false; code: SafeOpenErrorCode }`
- Use try/catch with empty catch for optional operations:
```typescript
try {
  fs.rmSync(tempHome, { recursive: true, force: true });
} catch {
  // ignore cleanup errors
}
```
- Async error handling: `mockRejectedValue` for testing error paths
- Propagate errors with context when re-throwing

**Assertions:**
- Use `asserts` type guards for runtime validation:
```typescript
export function assertWebChannel(input: string): asserts input is WebChannel {
  if (input !== "web") {
    throw new Error("Web channel must be 'web'");
  }
}
```

## Logging

**Framework:** `tslog` (via `src/logger.ts` wrapper)

**Patterns:**
- Module-level logger setup with `resetLogger()`, `setLoggerOverride()`
- Verbose logging gated by `shouldLogVerbose()` / `logVerbose()`
- Test cleanup resets logger state in `afterEach`

## Comments

**When to Comment:**
- Complex normalization logic
- Regex patterns with multiple capturing groups
- Workarounds for external library bugs
- Pre-compiled regex explanations

**JSDoc/TSDoc:**
- Minimal usage - prefer self-documenting code
- Used for exported utility functions with non-obvious behavior:
```typescript
/**
 * Allocate a deterministic per-worker port block.
 * Motivation: many tests spin up gateway + related services...
 */
export async function getDeterministicFreePortBlock(...)
```

## Function Design

**Size:** Target ~500 LOC per file (guideline, not hard limit)

**Parameters:**
- Use parameter objects for functions with 3+ parameters:
```typescript
export function buildAgentPeerSessionKey(params: {
  agentId: string;
  mainKey?: string | undefined;
  channel: string;
  accountId?: string | null;
  // ...
}): string
```

**Return Values:**
- Explicit return types on exported functions
- Use `| undefined` over `| null` for optional returns
- Return discriminated unions for multi-state results

## Module Design

**Exports:**
- Named exports preferred over default exports
- Re-export patterns in barrel files (e.g., `src/config/config.ts`):
```typescript
export { createConfigIO, loadConfig, ... } from "./io.js";
export { migrateLegacyConfig } from "./legacy-migrate.js";
export * from "./paths.js";
export * from "./types.js";
```

**Barrel Files:**
- Used sparingly for public API surfaces
- Avoid deep barrel nesting

**Testing Exports:**
- Expose internal functions for testing via `__testing` namespace:
```typescript
export const __testing = {
  decodeDataUrl,
  coerceImageAssistantText,
};
```

## Type Patterns

**Configuration Types:**
- Located in `src/config/types.*.ts` files
- Composed in `src/config/types.ts` barrel

**Plugin Types:**
- Adapter interfaces in `src/channels/plugins/types.*.ts`
- Re-exported via `src/channels/plugins/types.ts`

**Discriminated Unions:**
```typescript
export type SessionReferenceResolution =
  | { kind: "not-found" }
  | { kind: "found"; sessionKey: string }
  | { kind: "ambiguous"; matches: string[] };
```

---

*Convention analysis: 2026-02-01*
