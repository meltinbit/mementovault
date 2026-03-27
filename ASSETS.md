# MementoVault — Implementation Guide

## Agent Orchestration

You are the **Supervisor**. You do NOT write code directly. You orchestrate a team of specialized agents using the `Task` tool. Each agent works in isolation on its domain, receives clear instructions, and returns completed work.

### Agent Team

| Agent | Role | Scope |
|-------|------|-------|
| `db-agent` | Database & Migrations | Migrations, seeders, model definitions, relationships, traits (`BelongsToWorkspace`, `HasRevisions`, `HasSlug`, `Collectable`, `Taggable`), observers, global scopes |
| `backend-agent` | Laravel Backend | Controllers, middleware (`WorkspaceMiddleware`), form requests, event listeners, service classes, routes (web), policies |
| `frontend-agent` | React Frontend | Inertia pages, components, layouts (`AppLayout`, `GuestLayout`, `LandingLayout`), Tailwind styling. Reference the mockup artifact for design system |
| `mcp-agent` | MCP Server | SSE transport, MCP tool definitions, token auth middleware (`auth.mcp`), context merging logic, MCP routes |
| `docs-agent` | Docs & Public Pages | Landing page content/sections, `/docs` page content, README updates, SEO meta tags |

### Orchestration Rules

1. **Always delegate via Task** — never write implementation code yourself as Supervisor
2. **One agent per task** — do not ask an agent to work outside its scope
3. **Sequential by phase** — follow the Implementation Order (Phase 1→7). Within a phase, agents can work in parallel when there are no dependencies
4. **Context passing** — when delegating, give the agent ONLY the relevant section of this document, not the entire file. Include file paths and specific requirements
5. **Verify before proceeding** — after each agent completes, review the output. If it's not right, send it back with corrections before moving to the next task
6. **Integration points** — when one agent's work depends on another's (e.g., frontend needs controller responses), the Supervisor defines the interface/contract and passes it to both agents

### Delegation Template

When using Task, structure your prompt like this:

```
You are the [agent-name] for MementoVault.

## Your task
[Specific deliverable]

## Context
[Relevant section from this CLAUDE.md — only what they need]

## Files to create/modify
[Explicit file paths]

## Constraints
[Stack rules, patterns to follow, things to avoid]

## Definition of done
[How to verify the task is complete]
```

### Dependency Order Within Phases

```
Phase 1: db-agent (migrations, models, traits) → backend-agent (middleware, event listeners) → frontend-agent (layout shell)
Phase 2: backend-agent (controllers) → frontend-agent (pages)
Phase 3: backend-agent (controllers) → frontend-agent (pages)
Phase 4: backend-agent (controllers) → frontend-agent (pages)
Phase 5: mcp-agent (standalone — depends only on Phase 1 models)
Phase 6: docs-agent (standalone) + frontend-agent (landing page component)
Phase 7: all agents for polish in their domains
```

---

## Project Overview

MementoVault is an **AI Context Manager** — a centralized platform to organize, version, and serve AI context (identity, instructions, memory, documents, skills, assets, snippets) to any MCP-compatible client (Claude.ai, Claude Code, Cowork).

Think of it as **1Password for AI context**: upload, organize, version, and serve everything your AI agents need to know via MCP endpoints.

**Core value proposition:** Instead of managing scattered .md files in local folders, MementoVault centralizes your entire AI "brain" and serves it via authenticated MCP endpoints to any client, from any device.

---

## Tech Stack

- **Backend:** Laravel 12 (PHP 8.3+)
- **Frontend:** React 19 + Inertia.js v2 + Tailwind CSS 4
- **Database:** MySQL 8
- **Object Storage:** S3-compatible (Cloudflare R2)
- **Auth:** Laravel Starter Kit with React (includes authentication, registration, password reset out of the box)
- **MCP Protocol:** SSE (Server-Sent Events) transport
- **Deployment:** Coolify on Hetzner VPS

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  React Frontend                  │
│          (Inertia.js — no separate API)          │
├─────────────────────────────────────────────────┤
│                 Laravel 12 Backend               │
│  ┌───────────┐  ┌───────────┐  ┌─────────────┐ │
│  │ Inertia   │  │ MCP Server│  │ S3/R2       │ │
│  │ Controllers│  │ (SSE)     │  │ Storage     │ │
│  └───────────┘  └───────────┘  └─────────────┘ │
│  ┌───────────────────────────────────────────┐  │
│  │              MySQL 8 Database              │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Database Schema

### `users`
Standard Laravel users table with Starter Kit defaults.

### `workspaces`
```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
user_id         BIGINT UNSIGNED FK(users.id) ON DELETE CASCADE
name            VARCHAR(255)
slug            VARCHAR(255) UNIQUE
description     TEXT NULLABLE
settings        JSON NULLABLE — workspace-level config (default language, etc.)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### `system_documents`
The 4 first-class workspace-level documents: identity, instructions, context, memory.

```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
workspace_id    BIGINT UNSIGNED FK(workspaces.id) ON DELETE CASCADE
type            ENUM('identity', 'instructions', 'context', 'memory')
content         LONGTEXT — markdown content
version         INT UNSIGNED DEFAULT 1
created_at      TIMESTAMP
updated_at      TIMESTAMP

UNIQUE INDEX (workspace_id, type)
```

### `system_document_revisions`
Version history for system documents.

```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
system_document_id  BIGINT UNSIGNED FK(system_documents.id) ON DELETE CASCADE
content         LONGTEXT
version         INT UNSIGNED
created_by      VARCHAR(255) NULLABLE — 'user' or 'mcp' or null
created_at      TIMESTAMP

INDEX (system_document_id, version)
```

### `collections`
Packages of context, each with its own MCP endpoint.

```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
workspace_id    BIGINT UNSIGNED FK(workspaces.id) ON DELETE CASCADE
name            VARCHAR(255)
slug            VARCHAR(255)
description     TEXT NULLABLE
type            VARCHAR(50) DEFAULT 'custom' — 'software_project', 'client_project', 'product_saas', 'marketing', 'custom'
color           VARCHAR(7) DEFAULT '#6366f1' — hex color
is_active       BOOLEAN DEFAULT TRUE
created_at      TIMESTAMP
updated_at      TIMESTAMP

UNIQUE INDEX (workspace_id, slug)
```

### `collection_system_documents`
Collection-level overrides for context, instructions, memory (NOT identity — that stays workspace-only).

```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
collection_id   BIGINT UNSIGNED FK(collections.id) ON DELETE CASCADE
type            ENUM('instructions', 'context', 'memory')
content         LONGTEXT
version         INT UNSIGNED DEFAULT 1
created_at      TIMESTAMP
updated_at      TIMESTAMP

UNIQUE INDEX (collection_id, type)
```

### `collection_system_document_revisions`
Version history for collection-level system documents.

```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
collection_system_document_id  BIGINT UNSIGNED FK(collection_system_documents.id) ON DELETE CASCADE
content         LONGTEXT
version         INT UNSIGNED
created_at      TIMESTAMP
```

### `documents`
Project documentation, specs, notes — generic markdown documents.

```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
workspace_id    BIGINT UNSIGNED FK(workspaces.id) ON DELETE CASCADE
title           VARCHAR(255)
slug            VARCHAR(255)
content         LONGTEXT
type            VARCHAR(50) DEFAULT 'general' — 'technical', 'copy', 'brand', 'process', 'general'
is_active       BOOLEAN DEFAULT TRUE
version         INT UNSIGNED DEFAULT 1
created_at      TIMESTAMP
updated_at      TIMESTAMP

INDEX (workspace_id, slug)
```

### `document_revisions`
```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
document_id     BIGINT UNSIGNED FK(documents.id) ON DELETE CASCADE
content         LONGTEXT
version         INT UNSIGNED
created_at      TIMESTAMP
```

### `skills`
Operational instructions with triggering metadata.

```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
workspace_id    BIGINT UNSIGNED FK(workspaces.id) ON DELETE CASCADE
name            VARCHAR(255)
slug            VARCHAR(255)
description     TEXT — used for trigger matching by Claude
content         LONGTEXT — the full SKILL.md content
is_active       BOOLEAN DEFAULT TRUE
version         INT UNSIGNED DEFAULT 1
created_at      TIMESTAMP
updated_at      TIMESTAMP

INDEX (workspace_id, slug)
```

### `skill_revisions`
```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
skill_id        BIGINT UNSIGNED FK(skills.id) ON DELETE CASCADE
content         LONGTEXT
version         INT UNSIGNED
created_at      TIMESTAMP
```

### `snippets`
Reusable text blocks — prompts, signatures, templates, disclaimers.

```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
workspace_id    BIGINT UNSIGNED FK(workspaces.id) ON DELETE CASCADE
name            VARCHAR(255)
slug            VARCHAR(255)
content         TEXT
is_active       BOOLEAN DEFAULT TRUE
created_at      TIMESTAMP
updated_at      TIMESTAMP

INDEX (workspace_id, slug)
```

### `asset_folders`
Hierarchical folder structure for organizing assets. Supports nesting via `parent_id`.

```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
workspace_id    BIGINT UNSIGNED FK(workspaces.id) ON DELETE CASCADE
parent_id       BIGINT UNSIGNED NULLABLE FK(asset_folders.id) ON DELETE CASCADE
name            VARCHAR(255)
slug            VARCHAR(255)
sort_order      INT UNSIGNED DEFAULT 0
created_at      TIMESTAMP
updated_at      TIMESTAMP

INDEX (workspace_id, parent_id)
UNIQUE INDEX (workspace_id, parent_id, slug)
```

### `assets`
Binary files stored on S3/R2. Only metadata in DB. Organized in folders.

```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
workspace_id    BIGINT UNSIGNED FK(workspaces.id) ON DELETE CASCADE
folder_id       BIGINT UNSIGNED NULLABLE FK(asset_folders.id) ON DELETE SET NULL — null = root level
name            VARCHAR(255)
original_filename VARCHAR(255)
storage_path    VARCHAR(500) — S3/R2 key
mime_type       VARCHAR(100)
size_bytes      BIGINT UNSIGNED
description     TEXT NULLABLE — AI-readable description of the asset (critical for MCP)
sort_order      INT UNSIGNED DEFAULT 0
is_active       BOOLEAN DEFAULT TRUE
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### `tags`
```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
workspace_id    BIGINT UNSIGNED FK(workspaces.id) ON DELETE CASCADE
name            VARCHAR(100)
slug            VARCHAR(100)
color           VARCHAR(7) NULLABLE

UNIQUE INDEX (workspace_id, slug)
```

### `taggables` (polymorphic pivot)
```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
tag_id          BIGINT UNSIGNED FK(tags.id) ON DELETE CASCADE
taggable_id     BIGINT UNSIGNED
taggable_type   VARCHAR(255) — 'document', 'skill', 'snippet', 'asset'

UNIQUE INDEX (tag_id, taggable_id, taggable_type)
```

### `collectables` (polymorphic pivot)
Assigns content to collections. Many-to-many: same document can be in multiple collections.

```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
collection_id   BIGINT UNSIGNED FK(collections.id) ON DELETE CASCADE
collectable_id  BIGINT UNSIGNED
collectable_type VARCHAR(255) — 'document', 'skill', 'snippet', 'asset'

UNIQUE INDEX (collection_id, collectable_id, collectable_type)
```

### `api_tokens`
MCP authentication tokens, scoped per collection.

```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
collection_id   BIGINT UNSIGNED FK(collections.id) ON DELETE CASCADE
name            VARCHAR(255) DEFAULT 'default'
token_hash      VARCHAR(255) — hashed token, plain shown once on creation
last_used_at    TIMESTAMP NULLABLE
expires_at      TIMESTAMP NULLABLE
created_at      TIMESTAMP
updated_at      TIMESTAMP

INDEX (token_hash)
```

### `activity_log`
Track changes across the workspace.

```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
workspace_id    BIGINT UNSIGNED FK(workspaces.id) ON DELETE CASCADE
user_id         BIGINT UNSIGNED NULLABLE FK(users.id)
action          VARCHAR(50) — 'created', 'updated', 'deleted', 'accessed', 'moved', 'copied'
subject_type    VARCHAR(255) — model class
subject_id      BIGINT UNSIGNED
description     VARCHAR(500) NULLABLE
metadata        JSON NULLABLE
created_at      TIMESTAMP

INDEX (workspace_id, created_at)
```

---

## Workspace Templates

When creating a workspace, the user selects a template that pre-populates system documents with guided sections.

### Template: Developer / Indie Hacker
**Identity sections:** Who I am, Stack, Voice & Tone, Values
**Instructions sections:** Language, Code style, Stack preferences, Things to avoid
**Context sections:** Active projects, Priorities, Deadlines
**Memory:** Starts empty

### Template: Marketer / Content Creator
**Identity sections:** Brand, Target audience, Voice & Tone, Channels
**Instructions sections:** Language, Content style, Formatting rules, Platform guidelines
**Context sections:** Active campaigns, Editorial calendar, KPIs
**Memory:** Starts empty

### Template: Consultant / Freelancer
**Identity sections:** Expertise, Positioning, Client types, Communication style
**Instructions sections:** Language, Deliverable format, Client communication rules
**Context sections:** Active projects, Pipeline, Priorities
**Memory:** Starts empty

### Template: Agency
**Identity sections:** Agency brand, Services, Team structure, Values
**Instructions sections:** Language, Brand guidelines, Quality standards
**Context sections:** Active clients, Team capacity
**Memory:** Starts empty

### Template: Custom (Blank)
All 4 system documents created empty with minimal placeholder text.

Templates are stored as JSON seed files in `database/seeders/templates/` and loaded during workspace creation. They are NOT database records — just starter content.

---

## Collection Templates

When creating a collection, the user picks a type that suggests initial structure:

- **Software Project** → context with architecture/stack/status, instructions with code conventions
- **Client Project** → context with brief/objectives, instructions with communication rules
- **Product / SaaS** → context with roadmap/pricing/target, instructions with brand guidelines
- **Marketing** → context with campaigns/calendar, instructions with tone/channels
- **Custom** → blank

---

## Asset Management System

Assets are organized in a **file manager-style interface** with folders, drag & drop, and move/copy operations. This is NOT a flat list — it's a proper hierarchical file browser.

### Folder Structure

- Folders can be nested (parent_id → child folders)
- Assets without a folder live at root level
- Folders belong to the workspace, NOT to collections (an asset in any folder can be assigned to any collection)
- Default folders created on workspace setup: "Logos", "Images", "Documents", "Templates" (user can rename, delete, add more)

### UI Layout

The Assets page has a two-panel layout:

**Left panel — Folder tree sidebar:**
- Expandable/collapsible tree view of all folders
- "Root" at the top for unorganized assets
- Click folder to navigate into it
- Right-click context menu: Rename, Delete, New subfolder
- Drag folders to reorder or nest inside other folders
- Folder shows asset count badge

**Right panel — Asset grid/list:**
- Shows assets in the currently selected folder
- Toggle between grid view (thumbnails) and list view (table)
- Grid view: thumbnail preview for images, file type icon for others, name below
- List view: icon, name, type, size, description preview, date
- Multi-select with checkboxes or Shift+Click
- Breadcrumb navigation at top (Root > Logos > Brand)

### Drag & Drop Operations

All drag & drop uses `@dnd-kit/core` + `@dnd-kit/sortable`.

**Upload:**
- Drag files from OS directly into the right panel → upload to current folder
- Drag files onto a folder in the left panel → upload directly into that folder
- Drop zone highlights when dragging over a valid target
- Multiple file upload supported
- Progress indicator per file during upload

**Move:**
- Drag one or more assets from the right panel onto a folder in the left panel → move assets to that folder
- Drag assets onto breadcrumb segments to move to a parent folder
- This is the DEFAULT drag behavior — dragging always means MOVE
- Updates `folder_id` on the asset records
- Activity log entry: action "moved", metadata includes source and target folder

**Copy:**
- Hold Alt/Option while dragging → copy instead of move
- Visual indicator changes (cursor shows + badge, ghost shows copy icon)
- Creates a new asset record pointing to the SAME R2 storage file (no file duplication on storage)
- The copy gets a new DB record with `name` appended with " (copy)" — auto-increment if copy already exists
- The `storage_path` is identical — only metadata is duplicated, not the binary
- Activity log entry: action "copied"

**Between folders via context menu (alternative to drag):**
- Right-click asset(s) → "Move to..." → folder picker modal
- Right-click asset(s) → "Copy to..." → folder picker modal

### Batch Operations

When multiple assets are selected (via checkboxes or Shift+Click):

- **Move selected to...** → folder picker modal
- **Copy selected to...** → folder picker modal
- **Assign to collection** → collection picker
- **Remove from collection** → if viewing collection-filtered assets
- **Delete selected** → confirmation dialog

### Asset Detail Panel

Clicking an asset opens a detail slide-over panel (not a new page):

- Full preview (image rendered, PDF first page, others show icon)
- Editable fields: name, description (critical for MCP — this is what Claude reads)
- Read-only fields: original filename, mime type, size, upload date, storage path
- Tags management (add/remove tags)
- Collections list (which collections this asset belongs to)
- Move to folder button
- Copy to folder button
- Delete button
- Download button (signed R2 URL)

### Backend Routes for Assets

```
— Asset Folders —
GET    /asset-folders                        → List folder tree
POST   /asset-folders                        → Create folder
PUT    /asset-folders/{folder}               → Update folder (rename, move via parent_id)
DELETE /asset-folders/{folder}               → Delete folder (assets inside move to root)

— Assets —
GET    /assets                               → List assets (filterable by folder_id, collection, tag, search)
POST   /assets                               → Upload asset(s) to folder
PUT    /assets/{asset}                       → Update metadata (name, description, tags)
DELETE /assets/{asset}                       → Delete asset (removes from R2 too)
POST   /assets/move                          → Move assets to folder (body: { asset_ids: [], folder_id: int|null })
POST   /assets/copy                          → Copy assets to folder (body: { asset_ids: [], folder_id: int|null })
POST   /assets/batch-delete                  → Delete multiple assets
GET    /assets/{asset}/download              → Generate signed R2 URL and redirect
```

### Asset Controller Logic

**Move** (`POST /assets/move`):
```
- Validate asset_ids belong to current workspace
- Validate folder_id belongs to current workspace (or null for root)
- Update folder_id on all assets
- Log activity for each: action "moved", metadata { from_folder, to_folder }
```

**Copy** (`POST /assets/copy`):
```
- Validate asset_ids belong to current workspace
- Validate folder_id belongs to current workspace (or null for root)
- For each asset:
  - Create new Asset record with same storage_path, mime_type, size_bytes
  - Set folder_id to target folder
  - Set name to "{original_name} (copy)" — auto-increment if copy already exists
  - Copy tag associations from original
  - Do NOT copy collection associations (user assigns separately)
  - Do NOT duplicate the file on R2 — same storage_path
- Log activity for each: action "copied"
```

**Delete asset** (`DELETE /assets/{asset}`):
```
- Check if any other asset record shares the same storage_path
- If this is the LAST record pointing to that R2 file → delete from R2
- If other records share it → only delete the DB record
- Log activity
```

**Delete folder** (`DELETE /asset-folders/{folder}`):
```
- Move all assets inside the folder to root (set folder_id = null)
- Move all sub-folders to root (set parent_id = null)
- Delete the folder record
- Log activity
```

---

## MCP Server Implementation

### Transport
SSE (Server-Sent Events) — the standard for remote MCP servers.

### Endpoint Format
```
GET /mcp/{collection_slug}?token={api_token}
```

### Authentication Flow
1. Client connects to MCP endpoint with token as query parameter
2. Server hashes token, looks up in `api_tokens` table
3. If valid → load collection and associated workspace
4. If invalid or expired → return 401
5. Update `last_used_at` on token

### MCP Tools Exposed

The MCP server exposes these tools to Claude:

#### `get_context`
Returns the merged context: workspace identity + workspace instructions + workspace context + workspace memory + collection-level overrides (instructions, context, memory). Merged as markdown with clear section headers.

#### `list_documents`
Returns list of all active documents in the collection with title, type, slug.

#### `get_document`
Returns full content of a specific document by slug.

#### `list_skills`
Returns list of all active skills in the collection with name, description (for triggering), slug.

#### `get_skill`
Returns full SKILL.md content of a specific skill by slug.

#### `list_snippets`
Returns list of all active snippets in the collection with name, slug.

#### `get_snippet`
Returns content of a specific snippet by slug.

#### `list_assets`
Returns list of all active assets in the collection with name, mime_type, description, size, folder path.

#### `get_asset_url`
Returns a temporary signed URL to download a specific asset from S3/R2.

#### `search`
Full-text search across all content in the collection (documents, skills, snippets). Returns matching items with relevance snippets.

### Context Merging Logic

When `get_context` is called, the server builds the full context in this order:

```
1. [IDENTITY]        — workspace.system_documents.identity
2. [INSTRUCTIONS]    — workspace.system_documents.instructions
                       + collection.system_documents.instructions (if exists, appended)
3. [CONTEXT]         — workspace.system_documents.context
                       + collection.system_documents.context (if exists, appended)
4. [MEMORY]          — workspace.system_documents.memory
                       + collection.system_documents.memory (if exists, appended)
5. [AVAILABLE SKILLS] — list of skill names + descriptions (for triggering)
6. [AVAILABLE DOCUMENTS] — list of document titles + types
7. [AVAILABLE SNIPPETS]  — list of snippet names
8. [AVAILABLE ASSETS]    — list of asset names + descriptions + folder paths
```

This gives Claude a complete picture on connect, then Claude can use the other tools to drill into specific items.

---

## Laravel Implementation Details

### Multi-User Isolation

This is a multi-user SaaS application. Every registered user gets their own isolated workspace. No user can ever see, access, or modify another user's data.

#### Registration Flow
1. User registers via Laravel Starter Kit (standard email/password)
2. On `Registered` event, a listener automatically creates a Workspace for the user
3. The 4 system documents (identity, instructions, context, memory) are created with template content based on user's choice (or blank defaults)
4. Default asset folders are created: "Logos", "Images", "Documents", "Templates"
5. User lands on the dashboard with their workspace ready

#### Workspace Scoping — CRITICAL
Every model that belongs to a workspace MUST be scoped to the current user's workspace in every query. This is the most important architectural rule.

**Implementation: `BelongsToWorkspace` trait** applied to every workspace-owned model (SystemDocument, Collection, Document, Skill, Snippet, Asset, AssetFolder, Tag, ActivityLog). This trait:
- Adds `workspace()` belongsTo relationship
- Registers a global scope that automatically filters by the authenticated user's workspace
- Auto-sets `workspace_id` on model creation

**Implementation: `WorkspaceMiddleware`** applied to all authenticated app routes:
- Loads the current user's workspace (User hasOne Workspace for v1)
- Stores it in the request and makes it available via `request()->workspace()` or a helper `current_workspace()`
- If no workspace exists (should never happen after registration), redirects to workspace creation

**Every controller** receives data already filtered. Controllers never manually filter by workspace — the global scope handles it. This prevents accidental data leaks.

**Example:**
```php
// This automatically returns only documents in the current user's workspace
Document::all();

// This is safe — the global scope prevents accessing other workspaces' documents
Document::findOrFail($id); // throws 404 if document belongs to another workspace

// Creating — workspace_id is auto-set by the trait
Document::create(['title' => 'My Doc', 'content' => '...']);
```

#### MCP Token Isolation
MCP tokens are scoped to collections, which are scoped to workspaces. The MCP auth middleware validates the token and loads the associated collection → workspace chain. No workspace mixing is possible.

#### R2 Storage Isolation
Asset storage paths include the workspace slug: `/{workspace_slug}/assets/{uuid}/{filename}`. This provides namespace isolation on the storage level too.

### Models & Relationships

```
User
  └─ hasOne: Workspace (v1: one user = one workspace)

Workspace
  ├─ belongsTo: User
  ├─ hasMany: SystemDocument
  ├─ hasMany: Collection
  ├─ hasMany: Document
  ├─ hasMany: Skill
  ├─ hasMany: Snippet
  ├─ hasMany: AssetFolder
  ├─ hasMany: Asset
  ├─ hasMany: Tag
  └─ hasMany: ActivityLog

SystemDocument
  ├─ belongsTo: Workspace
  └─ hasMany: SystemDocumentRevision

Collection
  ├─ belongsTo: Workspace
  ├─ hasMany: CollectionSystemDocument
  ├─ hasMany: ApiToken
  ├─ morphedByMany: Document (via collectables)
  ├─ morphedByMany: Skill (via collectables)
  ├─ morphedByMany: Snippet (via collectables)
  └─ morphedByMany: Asset (via collectables)

AssetFolder
  ├─ belongsTo: Workspace
  ├─ belongsTo: AssetFolder (parent, nullable)
  ├─ hasMany: AssetFolder (children)
  └─ hasMany: Asset

Asset
  ├─ belongsTo: Workspace
  ├─ belongsTo: AssetFolder (nullable — null = root)
  ├─ morphToMany: Collection (via collectables)
  └─ morphToMany: Tag (via taggables)

Document / Skill / Snippet
  ├─ belongsTo: Workspace
  ├─ morphToMany: Collection (via collectables)
  └─ morphToMany: Tag (via taggables)
```

### Key Traits

**BelongsToWorkspace** — THE most important trait. Applied to every workspace-owned model. Adds global scope filtering by current user's workspace, auto-sets workspace_id on creation, adds workspace() relationship.

**HasRevisions** — shared trait for SystemDocument, Document, Skill. Auto-creates revision on content update, increments version.

**HasSlug** — auto-generates slug from name/title on creation.

**Collectable** — trait for Document, Skill, Snippet, Asset. Adds `collections()` relationship and scopes.

**Taggable** — trait for Document, Skill, Snippet, Asset. Adds `tags()` relationship and scopes.

### Middleware

**`WorkspaceMiddleware`** — applied to all authenticated routes. Loads current user's workspace into request context.

**`auth.mcp`** — custom middleware for MCP routes. Validates token from query string, loads collection + workspace into request. Does NOT use session auth — token-only.

### Observers

**ContentObserver** — on update of any content model (SystemDocument, Document, Skill), create a revision and log activity.

### Event Listeners

**CreateWorkspaceOnRegistration** — listens to `Registered` event, creates workspace with system documents from selected template and default asset folders.

---

## Frontend Structure (React + Inertia)

### Layout

```
resources/js/
├── app.jsx                    — Inertia app entry
├── Layouts/
│   ├── AppLayout.jsx          — main app layout with sidebar
│   ├── GuestLayout.jsx        — auth pages layout
│   └── LandingLayout.jsx      — landing page layout
├── Pages/
│   ├── Landing/
│   │   └── Index.jsx          — public landing/home page
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── Dashboard/
│   │   └── Index.jsx          — workspace dashboard
│   ├── Workspace/
│   │   ├── Identity.jsx       — system doc editor
│   │   ├── Instructions.jsx
│   │   ├── Context.jsx
│   │   └── Memory.jsx
│   ├── Documents/
│   │   ├── Index.jsx          — list with search/filter
│   │   ├── Create.jsx
│   │   └── Edit.jsx
│   ├── Skills/
│   │   ├── Index.jsx
│   │   ├── Create.jsx
│   │   └── Edit.jsx
│   ├── Snippets/
│   │   ├── Index.jsx
│   │   ├── Create.jsx
│   │   └── Edit.jsx
│   ├── Assets/
│   │   └── Index.jsx          — file manager: folder tree + asset grid with drag & drop
│   ├── Collections/
│   │   ├── Index.jsx          — list
│   │   ├── Show.jsx           — detail with MCP endpoint, tokens, contents
│   │   ├── Create.jsx
│   │   └── Edit.jsx
│   ├── Settings/
│   │   └── Index.jsx
│   └── Docs/
│       └── Index.jsx          — public documentation page
├── Components/
│   ├── Sidebar.jsx
│   ├── MarkdownEditor.jsx     — textarea with markdown preview and toolbar
│   ├── RevisionHistory.jsx    — version selector with diff
│   ├── TagInput.jsx           — tag autocomplete/create
│   ├── CollectionPicker.jsx   — assign items to collections
│   ├── TokenManager.jsx       — generate/revoke tokens
│   ├── SearchBar.jsx          — global search
│   ├── ActivityFeed.jsx       — recent changes
│   ├── StatsCard.jsx
│   ├── Assets/
│   │   ├── FolderTree.jsx     — left panel: expandable folder tree with drag targets
│   │   ├── AssetGrid.jsx      — right panel: grid view of assets with drag sources
│   │   ├── AssetListView.jsx  — right panel: table view alternative
│   │   ├── AssetCard.jsx      — single asset thumbnail card (drag source)
│   │   ├── AssetDetailPanel.jsx — slide-over panel for asset details/edit
│   │   ├── UploadDropZone.jsx — drag files from OS, progress indicators
│   │   ├── FolderPickerModal.jsx — modal for move/copy target selection
│   │   ├── Breadcrumb.jsx     — folder path breadcrumb (also drop target)
│   │   └── BatchActions.jsx   — toolbar for multi-select operations
│   └── DragDrop/
│       ├── DragProvider.jsx   — @dnd-kit context provider
│       ├── DraggableAsset.jsx — wrapper for draggable asset items
│       └── DroppableFolder.jsx — wrapper for folder drop targets
```

### Design System

- **Theme:** Dark UI (background #0e0e12, surfaces #111118, borders #1a1a22)
- **Primary color:** Indigo #6366f1
- **Font:** DM Sans (UI), JetBrains Mono (code/editor)
- **Tailwind CSS 4** with CSS variables for theming
- **No component library** — custom components for full control
- **Drag & Drop:** Use `@dnd-kit/core` + `@dnd-kit/sortable` for all drag interactions
- Refer to the React mockup artifact for exact styling reference

### Drag & Drop Technical Notes

Use `@dnd-kit` (not react-dnd or HTML5 native) because:
- Better accessibility
- Touch support (mobile)
- Customizable drag overlays
- Works well with React state

Key implementation details:
- `DragProvider` wraps the entire Assets page
- Assets in the grid are `DraggableAsset` components
- Folders in the tree and breadcrumbs are `DroppableFolder` components
- On drag start: show ghost overlay with asset thumbnail
- On drag over folder: highlight the folder
- On drag end: determine move vs copy (check if Alt/Option key is held via `event.activatorEvent`)
- On drop from OS (file upload): use the `UploadDropZone` component which listens to native drag events separately from @dnd-kit

---

## Landing Page (Home / Public)

Route: `GET /` — public, no auth required.

### Sections

1. **Hero**
   - Headline: "Your AI brain, centralized."
   - Subheadline: "Organize identity, context, skills, and assets in one place. Serve them to any AI client via MCP."
   - CTA: "Get Started Free" → register
   - Visual: animated representation of context flowing to multiple AI clients

2. **Problem**
   - "Your AI context is scattered across local folders, copy-pasted prompts, and chat histories. Every new conversation starts from zero."

3. **How It Works** (3 steps)
   - Step 1: "Define your AI identity" — set up who you are, how you work, your brand voice
   - Step 2: "Organize by project" — create collections with documents, skills, assets
   - Step 3: "Connect via MCP" — paste one URL into any Claude client, done

4. **Features Grid**
   - Centralized context management
   - MCP-native delivery
   - Version history on everything
   - Collection-based organization
   - Asset management with folders and drag & drop
   - Token-based auth per collection
   - Works with Claude.ai, Claude Code, Cowork

5. **Use Cases**
   - Developers: stack preferences, code conventions, project context
   - Marketers: brand voice, campaigns, content guidelines
   - Consultants: client briefs, processes, deliverable templates
   - Agencies: per-client context, team-wide skills

6. **CTA Footer**
   - "Stop repeating yourself to AI. Start building your vault."
   - Register button

---

## Docs Page

Route: `GET /docs` — public, no auth required.

### Content Sections

1. **Getting Started**
   - What is MementoVault
   - Create your workspace
   - Set up your identity & instructions
   - Create your first collection

2. **Core Concepts**
   - Workspace: your account container
   - System Documents: identity, instructions, context, memory
   - Collections: project packages with MCP endpoints
   - Documents, Skills, Snippets explained
   - Asset management: folders, upload, move, copy, descriptions for MCP
   - How context merging works (workspace + collection = what Claude sees)

3. **Connecting to Clients**
   - How to connect to Claude.ai (MCP settings)
   - How to connect to Claude Code (.claude/settings.json)
   - How to connect to Cowork
   - Token management and security

4. **Content Management**
   - Creating and editing documents
   - Writing effective skills (description for triggering, content structure)
   - Using snippets
   - Managing assets: uploading, organizing in folders, drag & drop, move & copy
   - Why asset descriptions matter for MCP
   - Tagging and organization

5. **Templates**
   - Available workspace templates
   - Available collection templates
   - Customizing templates

6. **API / MCP Reference**
   - Available MCP tools (get_context, list_documents, get_document, etc.)
   - Authentication
   - Context merging order
   - Rate limits

The docs page is a single-page React component with sidebar navigation and anchor links. Content is hardcoded in the component (no CMS needed for v1). Markdown-rendered sections.

---

## S3 / Cloudflare R2 Configuration

### Laravel Filesystem Config

```php
// config/filesystems.php
'disks' => [
    'assets' => [
        'driver' => 's3',
        'key' => env('R2_ACCESS_KEY_ID'),
        'secret' => env('R2_SECRET_ACCESS_KEY'),
        'region' => 'auto',
        'bucket' => env('R2_BUCKET'),
        'url' => env('R2_URL'),
        'endpoint' => env('R2_ENDPOINT'),
        'use_path_style_endpoint' => true,
    ],
],
```

### Upload Flow
1. User drops file(s) in UploadDropZone component (or onto a folder in the tree)
2. Frontend sends Inertia POST to `AssetController@store` with file(s) + folder_id + metadata
3. Controller uploads each file to R2 via `Storage::disk('assets')->put()`
4. Storage path saved in `assets.storage_path`
5. For download: generate temporary signed URL via `Storage::disk('assets')->temporaryUrl()`

### Storage Structure on R2
```
/{workspace_slug}/assets/{uuid}/{original_filename}
```

Note: folder structure is DB-only. R2 storage is flat by UUID — folders don't exist on R2. This means move/copy operations are instant (just DB updates, no file operations on R2).

---

## Routes Structure

### Web (Inertia)
```
GET  /                               → Landing page (public)
GET  /docs                           → Documentation (public)

— Auth (Starter Kit) —
GET  /login
GET  /register
POST /login
POST /register
POST /logout

— App (auth required) —
GET  /dashboard                      → Dashboard
GET  /workspace/identity             → Edit identity
GET  /workspace/instructions         → Edit instructions
GET  /workspace/context              → Edit context
GET  /workspace/memory               → Edit memory
PUT  /workspace/{type}               → Update system document

GET  /documents                      → List documents
GET  /documents/create               → Create form
POST /documents                      → Store
GET  /documents/{document}/edit      → Edit form
PUT  /documents/{document}           → Update
DELETE /documents/{document}         → Delete

(same CRUD pattern for /skills, /snippets)

— Asset Folders —
GET    /asset-folders                → Folder tree
POST   /asset-folders                → Create folder
PUT    /asset-folders/{folder}       → Rename / move folder
DELETE /asset-folders/{folder}       → Delete folder (contents move to root)

— Assets —
GET    /assets                       → File manager (filterable by folder, collection, tag, search)
POST   /assets                       → Upload to folder
PUT    /assets/{asset}               → Update metadata
DELETE /assets/{asset}               → Delete
POST   /assets/move                  → Move assets to folder
POST   /assets/copy                  → Copy assets to folder
POST   /assets/batch-delete          → Delete multiple
GET    /assets/{asset}/download      → Signed R2 URL redirect

— Collections —
GET  /collections                    → List collections
GET  /collections/create             → Create form
POST /collections                    → Store
GET  /collections/{collection}       → Show detail
GET  /collections/{collection}/edit  → Edit form
PUT  /collections/{collection}       → Update
DELETE /collections/{collection}     → Delete

POST /collections/{collection}/tokens        → Generate token
DELETE /collections/{collection}/tokens/{token} → Revoke token

POST /collections/{collection}/items         → Attach items (documents/skills/snippets/assets)
DELETE /collections/{collection}/items        → Detach items

GET  /settings                       → Workspace settings
PUT  /settings                       → Update settings

GET  /tags                           → Manage tags
POST /tags                           → Create tag
DELETE /tags/{tag}                   → Delete tag
```

### MCP
```
GET  /mcp/{collection_slug}          → SSE MCP endpoint (token auth via query param)
```

---

## Implementation Order

### Phase 1 — Foundation
1. `composer create-project laravel/laravel memento-vault`
2. Install Laravel Starter Kit with React stack (provides auth, Inertia, Tailwind out of the box)
3. Set up MySQL database
4. Create all migrations in order (workspaces → system_documents → collections → documents → skills → snippets → asset_folders → assets → tags → taggables → collectables → api_tokens → activity_log → revision tables)
5. Create all Eloquent models with relationships
6. Create `BelongsToWorkspace` trait with global scope for workspace isolation — apply to every workspace-owned model
7. Create `WorkspaceMiddleware` and register on all authenticated routes
8. Create `CreateWorkspaceOnRegistration` event listener on `Registered` event (creates workspace + system docs + default asset folders)
9. Create workspace template seed files (JSON) in `database/seeders/templates/`
10. Set up AppLayout with sidebar navigation

### Phase 2 — Workspace Core
1. Dashboard page with stats and activity feed
2. System document pages (Identity, Instructions, Context, Memory) with markdown editor
3. Revision history component and system document versioning
4. Workspace settings page

### Phase 3 — Content Management
1. Documents CRUD with list view, search, tag filter
2. Skills CRUD with description field for triggering
3. Snippets CRUD
4. Asset management: folder tree, asset grid, upload drop zone, drag & drop move/copy, detail panel, batch operations
5. Tag management (create, assign, filter)

### Phase 4 — Collections
1. Collection CRUD with type templates
2. Collection detail view with content assignment (attach/detach items)
3. Collection system document overrides (context, instructions, memory)
4. Token generation and revocation
5. MCP endpoint URL display with copy button

### Phase 5 — MCP Server
1. MCP SSE transport implementation
2. Token authentication middleware
3. Implement all MCP tools (get_context, list_documents, get_document, list_skills, get_skill, list_snippets, get_snippet, list_assets, get_asset_url, search)
4. Context merging logic (workspace + collection)
5. Test with Claude.ai MCP settings

### Phase 6 — Public Pages
1. Landing page with all sections (hero, problem, how it works, features, use cases, CTA)
2. Docs page with sidebar navigation and all content sections
3. SEO basics (meta tags, OG tags)

### Phase 7 — Polish
1. Activity logging across all operations
2. Full-text search across workspace content
3. Asset description AI-generation helper (optional)
4. Onboarding wizard (first workspace setup flow)
5. Responsive design pass
6. Error handling and validation

---

## Environment Variables

```env
APP_NAME="MementoVault"
APP_URL=https://mementovault.dev

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=memento_vault
DB_USERNAME=
DB_PASSWORD=

R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=mementovault-assets
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_URL=https://assets.mementovault.dev
```

---

## Key Implementation Notes

- **WORKSPACE ISOLATION IS PARAMOUNT:** Every model query must be scoped to the current user's workspace via the `BelongsToWorkspace` trait's global scope. Never bypass this. Never use `withoutGlobalScopes()` in controllers.
- **Auto workspace creation:** On user registration (`Registered` event), automatically create a workspace with the 4 system documents and default asset folders. The user should never see a "create workspace" page — it just exists after signup.
- **One user = one workspace (v1):** User `hasOne` Workspace. Keep it simple. Multi-workspace per user can come later.
- **Starter Kit auth:** Use the Laravel Starter Kit with React stack as-is for authentication. Do not customize the auth flow beyond styling. It provides login, register, password reset, email verification out of the box.
- **Versioning trait:** Every time `content` is updated on SystemDocument, Document, or Skill, automatically create a revision record and increment `version`. Use an Eloquent observer or model event.
- **Slug generation:** Use `Str::slug()` on creation. Slugs are immutable after creation to avoid breaking MCP references.
- **Soft deletes:** Do NOT use soft deletes. When something is deleted, it's deleted. Use `is_active` flag for temporary disabling.
- **Activity logging:** Log every create/update/delete/move/copy across all models. Use a single ActivityLog observer or trait.
- **MCP token security:** Store tokens hashed (SHA-256). Show plain token only once on creation. The token format should be `mv_live_` + 32 random chars.
- **R2 signed URLs:** Temporary URLs should expire after 1 hour.
- **R2 path isolation:** Asset paths must include workspace slug: `/{workspace_slug}/assets/{uuid}/{filename}`.
- **R2 is flat storage:** Folder structure is DB-only. R2 files are stored flat by UUID. Move/copy are instant DB operations.
- **Asset copy shares R2 file:** When copying an asset, create a new DB record with the same `storage_path`. On delete, only remove from R2 if no other asset record points to the same path.
- **Markdown editor:** Use a simple textarea with a markdown preview toggle and basic toolbar (bold, italic, headings, lists, code). No WYSIWYG — keep it clean. Consider using `@uiw/react-md-editor` or build custom.
- **Drag & drop library:** Use `@dnd-kit/core` + `@dnd-kit/sortable` for all drag interactions in the asset manager.
- **Search:** For v1, use MySQL FULLTEXT indexes on content fields. No need for Meilisearch/Algolia yet.
- **MCP endpoint is stateless:** MCP auth uses token-only, no session. The MCP middleware must not depend on web session or CSRF.