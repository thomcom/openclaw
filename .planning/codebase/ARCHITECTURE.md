# Architecture

**Analysis Date:** 2026-02-01

## Pattern Overview

**Overall:** Plugin-based multi-channel messaging gateway with embedded AI agent runtime

**Key Characteristics:**
- CLI-first design with Commander.js command registration system
- Channel abstraction layer supporting multiple messaging platforms via plugins
- Embedded Pi agent runtime for AI-powered conversation handling
- WebSocket gateway server for real-time client communication
- Message routing system with agent/session key resolution

## Layers

**CLI Layer:**
- Purpose: User-facing command interface and program entry point
- Location: `src/cli/`
- Contains: Command registration, argument parsing, help formatting, progress indicators
- Depends on: Commands layer, Config layer, Gateway layer
- Used by: End users via `openclaw` binary

**Commands Layer:**
- Purpose: Implementation of CLI subcommands and business logic
- Location: `src/commands/`
- Contains: Status, health, agents, sessions, onboarding, models commands
- Depends on: Config, Agents, Channels, Gateway layers
- Used by: CLI layer, Gateway RPC handlers

**Gateway Layer:**
- Purpose: WebSocket/HTTP server handling client connections, chat, and node coordination
- Location: `src/gateway/`
- Contains: Server implementation, protocol handlers, session management, chat handlers
- Depends on: Agents, Channels, Config, Plugins, Routing layers
- Used by: macOS/iOS/Android apps, web UI, CLI commands

**Agents Layer:**
- Purpose: AI agent runtime, model management, tool definitions, session handling
- Location: `src/agents/`
- Contains: Pi embedded runner, auth profiles, model selection, bash tools, system prompts
- Depends on: Config, Process, Media layers
- Used by: Gateway (chat), Auto-reply flow

**Channels Layer:**
- Purpose: Messaging platform abstraction and plugin system
- Location: `src/channels/`
- Contains: Channel plugins registry, allowlists, command gating, conversation labeling
- Depends on: Config, Routing layers
- Used by: Gateway, Auto-reply, Outbound messaging

**Routing Layer:**
- Purpose: Agent and session key resolution based on channel/peer bindings
- Location: `src/routing/`
- Contains: Route resolution, session key building, binding matching
- Depends on: Config layer
- Used by: Channels, Gateway, Auto-reply layers

**Auto-Reply Layer:**
- Purpose: Orchestrates inbound message processing and AI response generation
- Location: `src/auto-reply/`
- Contains: Reply flow, directives, templating, command auth, typing indicators
- Depends on: Agents, Config, Media Understanding layers
- Used by: Channel monitors, Gateway chat handlers

**Plugin System:**
- Purpose: Runtime extensibility for channels, tools, hooks, and services
- Location: `src/plugins/`
- Contains: Plugin loader, registry, discovery, hook runner, tool injection
- Depends on: Config layer
- Used by: All layers requiring extensibility

**Config Layer:**
- Purpose: Configuration loading, validation, and runtime overrides
- Location: `src/config/`
- Contains: Config types, Zod schemas, session store, legacy migration
- Depends on: None (foundational)
- Used by: All other layers

**Infrastructure Layer:**
- Purpose: Cross-cutting concerns and system utilities
- Location: `src/infra/`
- Contains: Ports, networking, device pairing, Bonjour discovery, exec approvals, updates
- Depends on: Config layer
- Used by: Gateway, CLI, Agents layers

## Data Flow

**Inbound Message Flow:**

1. Channel monitor receives message (e.g., `src/telegram/`, `src/discord/`)
2. Routing layer resolves agent and session key (`src/routing/resolve-route.ts`)
3. Auto-reply flow processes message (`src/auto-reply/reply/get-reply.ts`)
4. Media/link understanding applied (`src/media-understanding/`, `src/link-understanding/`)
5. Pi embedded agent runs with tools (`src/agents/pi-embedded-runner/run.ts`)
6. Response streamed back via channel adapter

**Gateway Client Flow:**

1. Client connects via WebSocket (`src/gateway/server.impl.ts`)
2. Auth validated (`src/gateway/auth.ts`)
3. Method handlers process requests (`src/gateway/server-methods/`)
4. Chat requests routed to agent runtime
5. Events broadcast to subscribed clients

**State Management:**
- Config: JSON5 file at `~/.openclaw/config.json5` loaded via `src/config/io.ts`
- Sessions: JSONL files in `~/.openclaw/agents/` managed by agent scope
- Auth profiles: Stored in `~/.openclaw/auth/profiles.json`
- Plugin state: Per-plugin in `~/.openclaw/plugins/`

## Key Abstractions

**ChannelPlugin:**
- Purpose: Represents a messaging platform integration
- Examples: `extensions/telegram/`, `extensions/discord/`, `extensions/whatsapp/`
- Pattern: Adapter interface with lifecycle hooks (setup, auth, messaging, status)

**OpenClawConfig:**
- Purpose: Typed configuration object for entire system
- Examples: `src/config/types.ts`, `src/config/zod-schema.ts`
- Pattern: Zod schema with TypeScript inference

**ReplyPayload:**
- Purpose: Standardized response from AI agent
- Examples: `src/auto-reply/types.ts`
- Pattern: Contains text, attachments, metadata for channel delivery

**GatewayServer:**
- Purpose: WebSocket server instance managing connections and events
- Examples: `src/gateway/server.impl.ts`
- Pattern: Event-driven with typed method handlers

## Entry Points

**CLI Entry:**
- Location: `src/index.ts`
- Triggers: `openclaw` command execution
- Responsibilities: Load dotenv, build Commander program, parse args

**Gateway Entry:**
- Location: `src/gateway/server.impl.ts::startGatewayServer()`
- Triggers: `openclaw gateway run` command
- Responsibilities: Start HTTP/WS server, load plugins, start channel monitors

**Agent Entry:**
- Location: `src/agents/pi-embedded-runner/run.ts::runEmbeddedPiAgent()`
- Triggers: Inbound message requiring AI response
- Responsibilities: Resolve model, run Pi agent, handle failover

## Error Handling

**Strategy:** Typed error classification with retry and failover

**Patterns:**
- Auth errors trigger profile rotation (`src/agents/auth-health.ts`)
- Context overflow triggers compaction (`src/agents/compaction.ts`)
- Rate limits use exponential backoff (`src/infra/retry-policy.ts`)
- Model failover on provider errors (`src/agents/model-fallback.ts`)

## Cross-Cutting Concerns

**Logging:** Subsystem loggers via `src/logging/subsystem.ts`, structured logs captured

**Validation:** Zod schemas for config (`src/config/zod-schema.ts`), TypeBox for tool schemas

**Authentication:** Multi-provider auth profiles (`src/agents/auth-profiles/`), OAuth flows

---

*Architecture analysis: 2026-02-01*
