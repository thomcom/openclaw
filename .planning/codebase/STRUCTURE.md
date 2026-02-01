# Codebase Structure

**Analysis Date:** 2026-02-01

## Directory Layout

```
/home/devkit/vibecode/openclaw/
├── src/                    # TypeScript source code
│   ├── cli/                # CLI command wiring and utilities
│   ├── commands/           # Command implementations
│   ├── gateway/            # WebSocket/HTTP server
│   ├── agents/             # AI agent runtime and tools
│   ├── channels/           # Channel plugin system
│   ├── routing/            # Agent/session routing
│   ├── auto-reply/         # Reply orchestration
│   ├── config/             # Configuration loading/types
│   ├── plugins/            # Plugin loader and registry
│   ├── infra/              # Infrastructure utilities
│   ├── hooks/              # Hook system
│   ├── media/              # Media processing
│   ├── media-understanding/ # Media transcription/analysis
│   ├── link-understanding/ # URL content extraction
│   ├── logging/            # Structured logging
│   ├── telegram/           # Telegram channel core
│   ├── discord/            # Discord channel core
│   ├── slack/              # Slack channel core
│   ├── signal/             # Signal channel core
│   ├── imessage/           # iMessage channel core
│   ├── web/                # WhatsApp web channel
│   ├── line/               # LINE channel
│   ├── tts/                # Text-to-speech
│   ├── tui/                # Terminal UI
│   ├── memory/             # Vector memory system
│   ├── cron/               # Scheduled tasks
│   ├── browser/            # Browser automation
│   ├── acp/                # Agent Client Protocol
│   ├── canvas-host/        # A2UI canvas hosting
│   ├── plugin-sdk/         # Plugin SDK exports
│   ├── process/            # Process management
│   ├── security/           # Security utilities
│   ├── terminal/           # Terminal formatting
│   ├── utils/              # Shared utilities
│   └── types/              # Shared type definitions
├── extensions/             # Plugin packages (channels, auth, memory)
├── apps/                   # Native applications
│   ├── macos/              # macOS SwiftUI app
│   ├── ios/                # iOS SwiftUI app
│   ├── android/            # Android Kotlin app
│   └── shared/             # Shared OpenClawKit
├── docs/                   # Documentation (Mintlify)
├── scripts/                # Build/dev scripts
├── packages/               # Internal workspace packages
├── dist/                   # Compiled output
├── skills/                 # Bundled agent skills
├── patches/                # pnpm patches
├── git-hooks/              # Git hooks
└── ui/                     # Web control UI
```

## Directory Purposes

**src/cli/:**
- Purpose: CLI entry point and command registration
- Contains: Commander.js program builder, argument parsing, progress UI
- Key files: `program/build-program.ts`, `program/command-registry.ts`, `deps.ts`

**src/commands/:**
- Purpose: Business logic for CLI commands
- Contains: Status, health, sessions, agents, onboarding, models commands
- Key files: `status.ts`, `health.ts`, `sessions.ts`, `onboarding/`

**src/gateway/:**
- Purpose: WebSocket/HTTP gateway server
- Contains: Server implementation, protocol handlers, chat handling
- Key files: `server.impl.ts`, `server-chat.ts`, `server-methods.ts`, `protocol/`

**src/agents/:**
- Purpose: AI agent runtime, model management, tools
- Contains: Pi embedded runner, auth profiles, tool definitions, system prompts
- Key files: `pi-embedded-runner/run.ts`, `model-auth.ts`, `auth-profiles/`, `bash-tools.exec.ts`

**src/channels/:**
- Purpose: Channel plugin abstraction layer
- Contains: Plugin registry, allowlist resolution, dock interface
- Key files: `plugins/index.ts`, `plugins/types.ts`, `dock.ts`, `registry.ts`

**src/routing/:**
- Purpose: Agent and session key resolution
- Contains: Route resolution, session key building
- Key files: `resolve-route.ts`, `session-key.ts`, `bindings.ts`

**src/auto-reply/:**
- Purpose: Reply orchestration and AI invocation
- Contains: Reply flow, directives, templating, history
- Key files: `reply/get-reply.ts`, `reply/get-reply-run.ts`, `templating.ts`

**src/config/:**
- Purpose: Configuration management
- Contains: Config loading, Zod schemas, type definitions
- Key files: `io.ts`, `types.ts`, `zod-schema.ts`, `paths.ts`

**src/plugins/:**
- Purpose: Plugin system runtime
- Contains: Loader, registry, discovery, tool injection
- Key files: `loader.ts`, `registry.ts`, `discovery.ts`, `types.ts`

**src/infra/:**
- Purpose: Infrastructure and system utilities
- Contains: Networking, device pairing, updates, exec approvals
- Key files: `ports.ts`, `bonjour-discovery.ts`, `exec-approvals.ts`, `update-runner.ts`

**extensions/:**
- Purpose: Plugin packages extending core functionality
- Contains: Channel plugins (telegram, discord, slack, etc.), auth plugins, memory plugins
- Key files: Each has `src/index.ts` as entry point

**apps/:**
- Purpose: Native application frontends
- Contains: SwiftUI (macOS/iOS), Kotlin (Android) apps
- Key files: `macos/Sources/`, `ios/Sources/`, `android/app/src/`

## Key File Locations

**Entry Points:**
- `src/index.ts`: CLI entry, program bootstrap
- `src/gateway/server.impl.ts`: Gateway server entry
- `openclaw.mjs`: NPM binary entry wrapper

**Configuration:**
- `src/config/io.ts`: Config file read/write
- `src/config/types.ts`: Config type definitions
- `src/config/zod-schema.ts`: Config validation schemas
- `src/config/paths.ts`: Config path resolution

**Core Logic:**
- `src/agents/pi-embedded-runner/run.ts`: Agent execution
- `src/auto-reply/reply/get-reply.ts`: Reply orchestration
- `src/routing/resolve-route.ts`: Agent routing
- `src/channels/plugins/index.ts`: Channel plugin registry

**Testing:**
- Colocated `*.test.ts` files alongside source
- `*.e2e.test.ts` for end-to-end tests
- `*.live.test.ts` for live integration tests

## Naming Conventions

**Files:**
- kebab-case: `resolve-route.ts`, `get-reply.ts`
- Test suffix: `resolve-route.test.ts`
- E2E suffix: `gateway.e2e.test.ts`
- Live suffix: `models.live.test.ts`

**Directories:**
- lowercase-kebab: `pi-embedded-runner/`, `auth-profiles/`
- Channel names: `telegram/`, `discord/`, `slack/`

**Exports:**
- barrel files: `index.ts` re-exports public API
- type-only modules: `types.ts` for interfaces/types

## Where to Add New Code

**New CLI Command:**
- Primary code: `src/cli/program/register.{name}.ts` (registration)
- Implementation: `src/commands/{name}.ts` or `src/commands/{name}/`
- Tests: Colocated `*.test.ts`

**New Channel Plugin:**
- Implementation: `extensions/{channel-name}/src/index.ts`
- Tests: `extensions/{channel-name}/src/*.test.ts`
- Register: Plugin auto-discovered via `extensions/` or config

**New Agent Tool:**
- Implementation: `src/agents/tools/{tool-name}.ts`
- Schema: Use TypeBox in same file
- Register: Add to tool factory in `src/agents/pi-tools.ts`

**New Gateway Method:**
- Handler: `src/gateway/server-methods/{method}.ts`
- Register: Add to `src/gateway/server-methods.ts`
- Protocol: Update `src/gateway/protocol/`

**New Hook:**
- Bundled: `src/hooks/bundled/{hook-name}/`
- Plugin: Use hook registration in plugin `index.ts`

**Utilities:**
- Shared helpers: `src/utils/` or `src/utils.ts`
- Infra utilities: `src/infra/`
- Terminal formatting: `src/terminal/`

## Special Directories

**dist/:**
- Purpose: Compiled JavaScript output
- Generated: Yes (by `pnpm build`)
- Committed: No

**node_modules/:**
- Purpose: NPM dependencies
- Generated: Yes (by `pnpm install`)
- Committed: No

**ui/:**
- Purpose: Web control UI (Lit components)
- Generated: Built output bundled
- Committed: Source yes, build no

**skills/:**
- Purpose: Bundled agent skills (markdown)
- Generated: No
- Committed: Yes

**.planning/:**
- Purpose: Planning and analysis documents
- Generated: By planning tools
- Committed: Optional

---

*Structure analysis: 2026-02-01*
