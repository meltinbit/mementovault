# Memento Vault

**Your AI brain, centralized.**

Memento Vault is an AI Context Manager that lets you organize, version, and serve your entire AI context — identity, instructions, documents, skills, snippets, and assets — to any MCP-compatible client via authenticated endpoints.

Stop repeating yourself to AI. Build your vault once, connect it everywhere.

---

## The Problem

Your AI context is fragmented:

- **Local folders** with `.md` files that only work on one machine
- **Copy-pasted prompts** scattered across conversations
- **Chat histories** that reset every time you start fresh
- **No versioning** — one bad edit and your context is gone
- **No sharing** — can't serve the same context to Claude.ai / Claude Desktop, Claude Code, and Cowork simultaneously

Every new AI conversation starts from zero. You waste time re-explaining who you are, how you work, what you're building.

## The Solution

Memento Vault centralizes your entire AI "brain" and serves it via **MCP (Model Context Protocol)** to any compatible client.

```
┌────────────────┐   ┌──────────────┐   ┌──────────────┐
│ Claude.ai /    │   │  Claude Code │   │  Any MCP     │
│ Claude Desktop │   │              │   │   Client     │
└───────┬────────┘   └──────┬───────┘   └──────┬───────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                    ┌───────▼───────┐
                    │ Memento Vault │
                    │  MCP Server   │
                    └───────┬───────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
     NUCLEUS           CONTENT          ORGANIZATION
  ┌──────────┐    ┌──────────────┐    ┌────────────┐
  │ Identity │    │  Documents   │    │  Neurons   │
  │ Instruct.│    │   Skills     │    │(specialized│
  │  Memory  │    │  Snippets    │    │ AI roles)  │
  │          │    │   Assets     │    │            │
  └──────────┘    └──────────────┘    └────────────┘
```

## How It Works

### 1. Define Your AI Identity
Set up nucleus documents — Identity, Instructions, and optional documents like Soul, Services, Products, ICP. These follow you across every project and AI client.

### 2. Create Your Neurons
Create **Neurons** with their own named documents (Instructions, Architecture, Brand Voice, Roadmap, etc.). Assign nucleus content (documents, skills, snippets, assets) to neurons.

### 3. Connect via MCP
Use a **nucleus token** for access to all neurons with dynamic switching, or a **neuron token** for a dedicated single-project connection.

```
https://yourdomain.com/mcp?token=cv_ws_...
```

## Core Concepts

| Concept | What it is | Example |
|---------|-----------|---------|
| **Nucleus** | Your identity base | "MeltinBit" |
| **Nucleus Documents** | Global AI persona docs (Identity, Instructions + optional) | Brand voice, stack, values |
| **Neuron** | Specialized AI role with own documents + MCP endpoint | "Sales Agent", "Dev Mode" |
| **Neuron Documents** | Project-specific docs (Instructions, Architecture, etc.) | Architecture, Roadmap, Brand Voice |
| **Document** | Reference material AI retrieves on demand | API specs, guidelines |
| **Skill** | Operational instruction with trigger description | Code reviewer, content writer |
| **Snippet** | Reusable text block inserted as-is | Email signature, disclaimer |
| **Asset** | Binary file with AI description, organized in folders | Logo, mockup, video |
| **Memory** | Structured entries (nucleus or neuron scoped) | Past decisions, preferences |

## Features

- **Centralized context** — one source of truth for all your AI interactions
- **MCP-native** — 9 consolidated tools with action-based API
- **Lazy context loading** — minimal initial context, everything fetched on demand
- **Nucleus tokens** — single token for all neurons with dynamic switching
- **Neuron tokens** — dedicated per-project access
- **Neuron documents** — flexible named documents per project (template-based)
- **Document templates** — 20+ built-in templates (Architecture, Brand Voice, FAQ, etc.)
- **Version history** — every change tracked with revision history
- **Asset management** — folders, drag & drop, move, copy, batch operations, video playback
- **Full-text search** — find anything across your entire vault
- **Chunked writing** — append action for writing long content via MCP
- **Self-hostable** — your data, your server, your control

## Who Is This For

- **Indie developers** — manage context for multiple products and side projects
- **Freelancers** — separate context per client, reuse skills across projects
- **Marketers** — centralize brand voice, campaign context, content guidelines
- **Small agencies** — per-client AI context with shared skills and identity
- **Consultants** — project-specific context with consistent personal identity

## MCP Tools

| Tool | Actions | Description |
|------|---------|-------------|
| `get_context` | — | Load context, list/switch neurons (nucleus tokens) |
| `collection_documents` | list, get, create, update, append, delete, reorder, list_templates | Manage neuron documents |
| `documents` | list, get, create, update, append, delete | Manage nucleus documents |
| `skills` | list, get, create, update, append, delete | Manage skills |
| `snippets` | list, get, create, update, append, delete | Manage snippets |
| `assets` | list, get_url, list_folders, create_folder, move, delete | Manage assets and folders |
| `search` | — | Full-text search across all content |
| `system_documents` | list, get, update, append | Manage nucleus-level system documents |
| `memory` | list, get, create, update, delete, move, copy | Manage memory entries (nucleus or neuron scoped) |

### CRUD Coverage

| Resource | list | get | create | update | append | delete | Other |
|----------|:----:|:---:|:------:|:------:|:------:|:------:|-------|
| **Neuron Documents** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | reorder, list_templates |
| **Documents** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | |
| **Skills** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | |
| **Snippets** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | |
| **Assets** | ✅ | ✅ | — | — | — | ✅ | list_folders, create_folder, move |
| **System Documents** | ✅ | ✅ | — | ✅ | ✅ | — | Fixed types (identity, instructions, etc.) |
| **Memory** | ✅ | ✅ | ✅ | ✅ | — | ✅ | move, copy (cross-neuron) |

## Tech Stack

- **Backend:** Laravel 12 (PHP 8.2+)
- **Frontend:** React 19 + Inertia.js v2 + Tailwind CSS v4
- **Database:** MySQL 8
- **Storage:** S3-compatible (Cloudflare R2)
- **MCP:** Streamable HTTP transport with token authentication
- **Testing:** Pest 3

## Self-Hosting

### Docker (Quickest)

```bash
git clone https://github.com/meltinbit/mementovault.git
cd mementovault
docker compose up -d
```

Open [http://localhost:4242](http://localhost:4242) — login with `mementovault@example.com` / `password`.

Includes MySQL, MinIO (S3-compatible storage), and a pre-configured demo nucleus. Assets upload to MinIO automatically. MinIO console at [http://localhost:9001](http://localhost:9001) (mementovault/mementovault).

### Manual Setup

Recommended for production:

- Any VPS with 1GB+ RAM (Hetzner, DigitalOcean, etc.)
- MySQL 8
- Cloudflare R2 for asset storage (free tier: 10GB)
- Deploy via Coolify, Forge, or manually

### Quick Start (Manual)

```bash
# Clone
git clone https://github.com/meltinbit/mementovault.git
cd mementovault

# Install
composer install
npm install

# Configure
cp .env.example .env
php artisan key:generate
# Edit .env with your DB and storage credentials

# Database
php artisan migrate
php artisan db:seed --class=CollectionDocumentTemplateSeeder

# Build
npm run build

# Serve
php artisan serve
```

### Connecting to Claude

**Claude.ai / Claude Desktop** — Customize → Connectors → Add custom connector:
```
https://yourdomain.com/mcp?token=YOUR_TOKEN
```

> **Important:** In Claude Desktop, go to **Admin → Capabilities** and add your Memento Vault domain (e.g. `yourdomain.com`) to the **network allowlist**. Without this, Claude Desktop won't be able to download assets or reach your server from within the sandbox.

**Claude Code** — Run from your terminal:
```bash
claude mcp add --transport http memento-vault https://yourdomain.com/mcp?token=YOUR_TOKEN
```

> For local Docker setup, use `http://localhost:4242/mcp?token=YOUR_TOKEN`. Claude Desktop requires HTTPS — use a tunnel (e.g. `ngrok http 4242`) for local testing with Claude Desktop.

Token types:
- `cv_ws_*` — Nucleus token (access all neurons, switch dynamically)
- `cv_live_*` — Neuron token (scoped to one neuron)

## What You Can Ask

Once connected, just talk to your AI naturally:

**Memory** — "Remember that I prefer [preference] for [context]" · "What do you remember about my preferences?"

**Documents** — "Search my docs for [topic]" · "Create a document with [description]"

**Skills** — "List all my skills" · "Create a skill for [task] with my conventions"

**Assets** — "What assets do I have?" · "Get the URL for the [filename]"

**Search** — "Search everything for [keyword]"

**Neurons** — "What neurons do I have?" · "Switch to the [name] neuron"

## License

[GNU Affero General Public License v3.0](LICENSE)

---

Built with care by [MeltinBit](https://meltinbit.com)
