# External Integrations

**Analysis Date:** 2026-02-01

## LLM Providers

**Anthropic:**
- Default provider (`src/agents/defaults.ts`)
- SDK: @mariozechner/pi-ai (Anthropic Messages API)
- Auth: `ANTHROPIC_API_KEY` env var
- Config: `models.providers.anthropic` in config.yaml

**OpenAI:**
- SDK: @mariozechner/pi-ai (OpenAI Responses API)
- Auth: `OPENAI_API_KEY` env var
- Config: `models.providers.openai`

**OpenRouter:**
- Base URL: `https://openrouter.ai/api/v1`
- Auth: `OPENROUTER_API_KEY` env var (prefixed `sk-or-`)
- Used for Perplexity web search fallback

**Amazon Bedrock:**
- SDK: @aws-sdk/client-bedrock 3.980.x
- Auth: AWS SDK credentials (`AWS_PROFILE`, `AWS_ACCESS_KEY_ID`, etc.)
- Discovery: `src/agents/bedrock-discovery.ts`

**Ollama (Local):**
- Base URL: `http://127.0.0.1:11434/v1`
- Auto-discovery: queries `/api/tags` for local models
- Config: `OLLAMA_API_KEY` or explicit profile

**GitHub Copilot:**
- Token resolution: `src/providers/github-copilot-token.ts`
- Models discovery: `src/providers/github-copilot-models.ts`
- Auth: OAuth via Copilot extension

**Additional Providers (via pi-ai):**
- Google Gemini (`src/agents/google-gemini-switch.live.test.ts`)
- MiniMax (`MINIMAX_API_BASE_URL: https://api.minimax.chat/v1`)
- Xiaomi MiMo (`XIAOMI_BASE_URL: https://api.xiaomimimo.com/anthropic`)
- Moonshot/Kimi (`MOONSHOT_BASE_URL: https://api.moonshot.ai/v1`)
- Qwen Portal (`QWEN_PORTAL_BASE_URL: https://portal.qwen.ai/v1`)
- Venice (`src/agents/venice-models.ts`)
- Chutes OAuth (`src/agents/chutes-oauth.ts`)

## Messaging Channels

**Telegram:**
- SDK: grammy 1.39.x, @grammyjs/runner, @grammyjs/transformer-throttler
- Webhook support: `src/telegram/webhook.ts`
- Bot handlers: `src/telegram/bot.ts`
- Auth: `TELEGRAM_BOT_TOKEN` or config

**WhatsApp (Web):**
- SDK: @whiskeysockets/baileys 7.x (unofficial WhatsApp Web client)
- Session storage: `~/.openclaw/sessions/`
- QR pairing: `src/pairing/`

**Discord:**
- SDK: @buape/carbon 0.14.x
- Auth: Bot token in config
- Monitor: `src/discord/monitor/`

**Slack:**
- SDK: @slack/bolt 4.x, @slack/web-api 7.x
- Webhook handlers: `src/slack/http/`
- Auth: OAuth or bot token

**LINE:**
- SDK: @line/bot-sdk 10.x
- Webhook: `src/line/webhook.ts`
- Rich menus: `src/line/rich-menu.ts`
- Auth: Channel secret + access token

**Signal:**
- Implementation: `src/signal/` (extension-based)
- Monitor: `src/signal/monitor/`

**iMessage:**
- Implementation: `src/imessage/` (macOS-only)
- Requires Shortcuts/AppleScript integration

**Extension Channels (plugins):**
- MS Teams: `extensions/msteams/`
- Matrix: `extensions/matrix/`
- Google Chat: `extensions/googlechat/`
- Mattermost: `extensions/mattermost/`
- Nextcloud Talk: `extensions/nextcloud-talk/`
- Twitch: `extensions/twitch/`
- Nostr: `extensions/nostr/`
- Zalo: `extensions/zalo/`, `extensions/zalouser/`
- BlueBubbles: `extensions/bluebubbles/`

## Data Storage

**SQLite (Memory/Embeddings):**
- Built-in: `node:sqlite` via `src/memory/sqlite.ts`
- Vector search: sqlite-vec extension (`src/memory/sqlite-vec.ts`)
- Location: `~/.openclaw/memory/`

**File Storage:**
- Sessions: `~/.openclaw/sessions/`
- Agent data: `~/.openclaw/agents/<agentId>/`
- Media cache: transient, in-memory or temp files

**Caching:**
- In-memory caches for model catalogs, health state
- No external cache service

## Authentication & Identity

**Gateway Auth:**
- Token-based: `src/gateway/auth.ts`
- Mobile nodes: certificate pinning
- Web login: `src/provider-web.ts`, credentials at `~/.openclaw/credentials/`

**OAuth Flows:**
- GitHub Copilot: `extensions/copilot-proxy/`
- Google Gemini CLI: `extensions/google-gemini-cli-auth/`
- Google Antigravity: `extensions/google-antigravity-auth/`
- MiniMax Portal: `extensions/minimax-portal-auth/`
- Chutes: `src/agents/chutes-oauth.ts`
- Qwen Portal: `src/providers/qwen-portal-oauth.ts`

## Network Discovery

**mDNS/Bonjour:**
- SDK: @homebridge/ciao 1.3.x
- Service: `_openclaw-gw._tcp`
- Implementation: `src/infra/bonjour*.ts`

**Tailscale:**
- Integration: `src/infra/tailscale.ts`
- Gateway exposure: `src/gateway/server-tailscale.ts`
- Tailnet DNS: `src/infra/tailnet.ts`
- Binary discovery: PATH, `/Applications/Tailscale.app/`

**Wide-Area DNS-SD:**
- Android: dnsjava 3.6.x for unicast DNS-SD

## Browser Automation

**Playwright:**
- Core: playwright-core 1.58.x
- Session management: `src/browser/pw-session.ts`
- AI integration: `src/browser/pw-ai.ts`
- Chrome detection: `src/browser/chrome.ts`

**Chrome Extension Relay:**
- Local relay server: `src/browser/extension-relay.ts`
- CDP bridge: `src/browser/cdp.ts`

## Media Processing

**Image:**
- Primary: sharp 0.34.x (`src/media/image-ops.ts`)
- Fallback: macOS sips (for Bun runtime)
- Canvas: @napi-rs/canvas (optional peer dep)

**PDF:**
- SDK: pdfjs-dist 5.x (`src/media-understanding/`)

**TTS (Text-to-Speech):**
- SDK: node-edge-tts 1.x (`src/tts/`)

**Media Host:**
- Express server: `src/media/server.ts`
- Serves uploaded media to channels

## Monitoring & Observability

**Logging:**
- Framework: tslog 4.x
- Subsystem loggers: `src/logging/subsystem.ts`
- Diagnostic events: `src/logging/diagnostic.ts`

**OpenTelemetry (optional):**
- Extension: `extensions/diagnostics-otel/`

**Error Tracking:**
- None built-in (extension point available)

## CI/CD & Distribution

**Hosting:**
- npm registry: `openclaw` package
- macOS: Sparkle auto-updates
- iOS/Android: separate distribution

**CI Pipeline:**
- GitHub Actions (implied by `process.env.GITHUB_ACTIONS`)
- Docker tests: `scripts/e2e/*.sh`

## Webhooks & Callbacks

**Incoming Webhooks:**
- Telegram: `/telegram/webhook` endpoint
- Slack: Event subscriptions via Bolt
- LINE: `/line/webhook` endpoint
- Channel-specific webhook handlers in respective modules

**Outgoing Webhooks:**
- Hooks system: `src/hooks/` (Gmail, custom hooks)
- Gmail watch: `src/hooks/gmail-watcher.ts`

## Environment Configuration

**Required env vars (at least one LLM provider):**
- `ANTHROPIC_API_KEY` - Anthropic Claude
- `OPENAI_API_KEY` - OpenAI models
- `OPENROUTER_API_KEY` - OpenRouter proxy

**Optional env vars:**
- `TELEGRAM_BOT_TOKEN` - Telegram channel
- `PERPLEXITY_API_KEY` - Web search
- `OLLAMA_API_KEY` - Local Ollama
- `AWS_PROFILE` / `AWS_ACCESS_KEY_ID` - Bedrock
- `OPENCLAW_IMAGE_BACKEND` - Image processor selection

**Secrets location:**
- Config file: `~/.openclaw/config.yaml`
- Credentials: `~/.openclaw/credentials/`
- Auth profiles: `~/.openclaw/agents/<id>/auth-profiles.json`

---

*Integration audit: 2026-02-01*
