# 🔐 MementoVault

**Your AI brain, centralized.**

MementoVault is an AI Context Manager that lets you organize, version, and serve your entire AI context — identity, instructions, memory, documents, skills, and assets — to any MCP-compatible client via authenticated endpoints.

Stop repeating yourself to AI. Build your vault once, connect it everywhere.

---

## The Problem

Your AI context is fragmented:

- **Local folders** with `.md` files that only work on one machine
- **Copy-pasted prompts** scattered across conversations
- **Chat histories** that reset every time you start fresh
- **No versioning** — one bad edit and your context is gone
- **No sharing** — can't serve the same context to Claude.ai, Claude Code, and Cowork simultaneously

Every new AI conversation starts from zero. You waste time re-explaining who you are, how you work, what you're building.

## The Solution

MementoVault centralizes your entire AI "brain" and serves it via **MCP (Model Context Protocol)** to any compatible client.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Claude.ai   │     │  Claude Code │     │    Cowork    │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                    ┌───────▼───────┐
                    │ MementoVault  │
                    │  MCP Server   │
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
         ┌────▼───┐   ┌────▼───┐   ┌────▼────┐
         │Identity│   │ Skills │   │ Assets  │
         │Context │   │  Docs  │   │Snippets │
         │Memory  │   │        │   │         │
         └────────┘   └────────┘   └─────────┘
```

## How It Works

### 1. Define Your AI Identity
Set up who you are, how you communicate, your preferences and constraints. This follows you across every project and every AI client.

### 2. Organize by Project
Create **Collections** — curated packages of documents, skills, snippets, and assets for specific projects or clients. Each collection can override workspace-level context.

### 3. Connect via MCP
Each collection gets its own authenticated MCP endpoint. Paste the URL into any Claude client and your AI has full context instantly.

```
https://mementovault.dev/mcp/noisy-mind?token=mv_live_...
```

## Core Concepts

| Concept | What it is | Example |
|---------|-----------|---------|
| **Workspace** | Your account container | "MeltinBit" |
| **Identity** | Who you are, always present | Brand voice, stack, values |
| **Instructions** | How AI should work with you | Language, code style, things to avoid |
| **Context** | What's happening now | Active projects, priorities |
| **Memory** | What's been learned over time | Past decisions, patterns |
| **Collection** | Project context package + MCP endpoint | "Noisy Mind", "Client X" |
| **Document** | Project docs, specs, notes | API architecture, brand guidelines |
| **Skill** | Operational instruction for AI | Screenshot generator, code reviewer |
| **Snippet** | Reusable text block | Email signature, prompt template |
| **Asset** | Binary file with AI description | Logo, mockup, template file |

## Features

- **Centralized context** — one source of truth for all your AI interactions
- **MCP-native** — serves context via Model Context Protocol to any compatible client
- **Version history** — every change tracked, rollback anytime
- **Collection-based organization** — separate context per project/client
- **Smart merging** — workspace identity + collection overrides = complete context
- **File manager for assets** — folders, drag & drop, move, copy, batch operations
- **Token auth** — per-collection access tokens, generate and revoke anytime
- **Template system** — start fast with pre-built structures for developers, marketers, consultants
- **Full-text search** — find anything across your entire vault
- **Self-hostable** — your data, your server, your control

## Who Is This For

- **Indie developers** — manage context for multiple products and side projects
- **Freelancers** — separate context per client, reuse skills across projects
- **Marketers** — centralize brand voice, campaign context, content guidelines
- **Small agencies** — per-client AI context with team-wide shared skills
- **Consultants** — project-specific context with consistent personal identity

## Tech Stack

- **Backend:** Laravel 12 (PHP 8.3+)
- **Frontend:** React 19 + Inertia.js + Tailwind CSS
- **Database:** MySQL 8
- **Storage:** S3-compatible (Cloudflare R2)
- **MCP:** SSE transport with token authentication

## Self-Hosting

MementoVault is designed to be self-hosted. Recommended setup:

- Any VPS with 1GB+ RAM (Hetzner, DigitalOcean, etc.)
- MySQL 8
- Cloudflare R2 for asset storage (free tier: 10GB)
- Deploy via Coolify, Forge, or manually

### Quick Start

```bash
# Clone
git clone https://github.com/meltinbit/memento-vault.git
cd memento-vault

# Install
composer install
npm install

# Configure
cp .env.example .env
php artisan key:generate
# Edit .env with your DB and R2 credentials

# Database
php artisan migrate
php artisan db:seed

# Build
npm run build

# Serve
php artisan serve
```

### Environment Variables

```env
APP_NAME="MementoVault"
APP_URL=https://mementovault.dev

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=memento_vault
DB_USERNAME=vault
DB_PASSWORD=secret

R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET=mementovault-assets
R2_ENDPOINT=https://account-id.r2.cloudflarestorage.com
R2_URL=https://assets.mementovault.dev
```

## Connecting to Claude Clients

### Claude.ai
Settings → MCP Servers → Add server:
```
Name: MementoVault - Project Name
URL: https://mementovault.dev/mcp/your-collection?token=mv_live_...
```

### Claude Code
Add to `.claude/settings.json`:
```json
{
  "mcpServers": {
    "memento-vault": {
      "type": "url",
      "url": "https://mementovault.dev/mcp/your-collection?token=mv_live_..."
    }
  }
}
```

### Cowork
Add MCP server in Cowork settings with the same URL format.

## Roadmap

- [x] Core workspace and context management
- [x] Collection-based organization
- [x] MCP server with SSE transport
- [x] Version history and revisions
- [x] S3/R2 asset storage with folder management
- [x] Drag & drop asset organization with move/copy
- [ ] Setup wizard for first-time onboarding
- [ ] AI-assisted context generation
- [ ] Import from existing .md folder structures
- [ ] Workspace sharing and collaboration
- [ ] Public skill marketplace
- [ ] Webhook notifications on context changes

## License

MIT

---

Built with ☕ by [MeltinBit](https://meltinbit.com)