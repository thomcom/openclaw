# Technology Stack

**Analysis Date:** 2026-02-01

## Languages

**Primary:**
- TypeScript 5.9+ - Core CLI and gateway (`src/**/*.ts`)
- Swift 6.0/6.2 - macOS menubar app (`apps/macos/`) and iOS app (`apps/ios/`)
- Kotlin 1.x (JVM 17) - Android app (`apps/android/`)

**Secondary:**
- JavaScript - Build scripts, postinstall hooks (`scripts/*.js`, `scripts/*.mjs`)
- HTML/CSS - Control UI web interface (`ui/`)

## Runtime

**Environment:**
- Node.js 22.12.0+ (required, see `engines` in `package.json`)
- Bun supported for TypeScript execution (dev, tests)

**Package Manager:**
- pnpm 10.23.0 (specified in `packageManager` field)
- Lockfile: `pnpm-lock.yaml` present

**Build Output:**
- ESM modules (`"type": "module"`)
- Target: ES2023
- Output: `dist/`

## Frameworks

**Core:**
- Commander 14.x - CLI framework (`src/cli/`)
- Express 5.x - HTTP server for browser control and gateway endpoints (`src/browser/server.ts`, `src/media/server.ts`)
- Playwright-core 1.58.x - Browser automation (`src/browser/pw-*.ts`)
- ws 8.x - WebSocket server for gateway (`src/gateway/`)

**Agent Runtime:**
- @mariozechner/pi-ai 0.50.x - LLM provider abstraction
- @mariozechner/pi-agent-core 0.50.x - Agent tool execution
- @mariozechner/pi-coding-agent 0.50.x - Session management, coding agent features
- @agentclientprotocol/sdk 0.13.x - Agent Client Protocol implementation (`src/acp/`)

**Messaging SDKs:**
- grammy 1.39.x - Telegram bot (`src/telegram/`)
- @whiskeysockets/baileys 7.x - WhatsApp web client (`src/whatsapp/`)
- @buape/carbon 0.14.x - Discord bot framework (`src/discord/`)
- @slack/bolt 4.x - Slack app (`src/slack/`)
- @line/bot-sdk 10.x - LINE messaging (`src/line/`)

**Testing:**
- Vitest 4.x - Test runner with V8 coverage
- Playwright 1.58.x - E2E and browser tests (devDependency for UI tests)

**Build/Dev:**
- tsc (TypeScript 5.9.x) - Type checking and compilation
- tsx 4.x - TypeScript execution for scripts
- Vite 7.x - UI build tool (`ui/`)
- rolldown 1.0.0-rc.2 - Canvas A2UI bundling
- oxlint 1.42.x - Fast linting
- oxfmt 0.27.x - Formatting

## Key Dependencies

**Critical:**
- sharp 0.34.x - Image processing (resize, format conversion)
- pdfjs-dist 5.x - PDF parsing for media understanding
- sqlite-vec 0.1.7-alpha.2 - Vector embeddings for memory search
- node:sqlite - Built-in SQLite for memory storage

**Infrastructure:**
- @homebridge/ciao 1.3.x - mDNS/Bonjour service discovery
- dotenv 17.x - Environment configuration
- chokidar 5.x - File watching
- croner 9.x - Cron scheduling
- proper-lockfile 4.x - File locking

**Validation/Schema:**
- @sinclair/typebox 0.34.x - JSON schema validation
- zod 4.x - Runtime validation
- ajv 8.x - JSON schema validation

**UI (Control Panel):**
- Lit 3.x - Web components (`ui/src/`)
- marked 17.x - Markdown rendering
- dompurify 3.x - HTML sanitization

## Platform Apps

**macOS (`apps/macos/`):**
- Swift Package Manager
- macOS 15+ deployment target
- Dependencies: MenuBarExtraAccess, swift-subprocess, swift-log, Sparkle (updates), Peekaboo

**iOS (`apps/ios/`):**
- XcodeGen project generation (`project.yml`)
- iOS 18.0+ deployment target
- Swift 6.0 with strict concurrency

**Android (`apps/android/`):**
- Gradle/Kotlin DSL
- compileSdk 36, minSdk 31, targetSdk 36
- Jetpack Compose UI
- CameraX for media capture
- dnsjava for Wide-Area Bonjour discovery

## Configuration

**Environment:**
- Config file: `~/.openclaw/config.yaml` (YAML format)
- Environment variables: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, `PERPLEXITY_API_KEY`, `OLLAMA_API_KEY`, etc.
- Profiles: `~/.openclaw/profiles/<name>/` for multi-instance

**Build:**
- `tsconfig.json` - TypeScript compiler config
- `vitest.config.ts` - Test runner config
- `vitest.e2e.config.ts`, `vitest.live.config.ts` - Specialized test configs
- `.swiftlint.yml`, `.swiftformat` - Swift linting/formatting
- `eslint.config.js` via oxlint

## Platform Requirements

**Development:**
- Node.js 22.12.0+
- pnpm 10.x
- macOS: Xcode 16+, SwiftLint, SwiftFormat for native apps
- Android: JDK 17+, Android SDK 36

**Production:**
- Node.js 22+ for CLI/gateway
- npm global install: `npm i -g openclaw`
- macOS app distributed via Sparkle updates
- iOS/Android apps distributed separately

---

*Stack analysis: 2026-02-01*
