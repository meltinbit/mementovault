# MementoVault — Collection System Documents Restructure

## Problem

The current design has a fixed `ENUM('instructions', 'context')` for collection system documents. This forces every collection into the same rigid structure regardless of its purpose. A "Sales Agent" collection needs completely different system documents than a "Social Manager" or "Software Project".

The term "Context" is too generic and doesn't guide users on what to put inside. Different collection types need different named documents with different purposes.

## Solution

Replace the fixed enum with **flexible named system documents** per collection. Each collection can have any number of system documents with custom names. Templates pre-populate the right documents for each collection type, but users can rename, add, or remove them freely.

---

## Database Changes

### Drop table: `collection_system_documents`

Remove the old table with its fixed enum.

### Drop table: `collection_system_document_revisions`

Remove the old revision table.

### New table: `collection_documents`

Replaces `collection_system_documents`. These are the "system-level" documents of a collection — served automatically via MCP as part of the context.

```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
collection_id   BIGINT UNSIGNED FK(collections.id) ON DELETE CASCADE
name            VARCHAR(255) — user-facing name: "Products & Services", "Architecture", "Brand Voice", etc.
slug            VARCHAR(255) — auto-generated from name, used in MCP
content         LONGTEXT — markdown content
sort_order      INT UNSIGNED DEFAULT 0 — controls display and MCP delivery order
is_required     BOOLEAN DEFAULT FALSE — template-defined docs can be marked required (user can't delete)
version         INT UNSIGNED DEFAULT 1
created_at      TIMESTAMP
updated_at      TIMESTAMP

INDEX (collection_id, sort_order)
UNIQUE INDEX (collection_id, slug)
```

**Key difference from regular `documents` table:** `collection_documents` belong directly to a collection and are always served in MCP context. Regular `documents` are workspace-level content that gets optionally assigned to collections via the `collectables` pivot.

### New table: `collection_document_revisions`

```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
collection_document_id  BIGINT UNSIGNED FK(collection_documents.id) ON DELETE CASCADE
content         LONGTEXT
version         INT UNSIGNED
created_at      TIMESTAMP
```

### Keep `instructions` as a dedicated field? NO.

Instructions is now just another collection document — it's pre-created by templates with `sort_order: 0` so it appears first and gets served first in MCP context. But it's not structurally different from other collection documents. The user can rename it, and templates for non-technical roles might call it "Operating Rules" or "Guidelines" instead.

---

## Updated Collection Templates

Each template defines a set of initial collection documents with name, sort_order, and placeholder content.

Templates are stored as JSON in `database/seeders/templates/collections/`.

### Template: Sales Agent

```json
{
  "type": "sales_agent",
  "label": "Sales Agent",
  "description": "Outbound sales, lead generation, client prospecting",
  "documents": [
    {
      "name": "Instructions",
      "slug": "instructions",
      "sort_order": 0,
      "is_required": true,
      "placeholder": "# How to operate as my Sales Agent\n\n## Tone\nHow should you communicate with prospects?\n\n## Language\nWhat language for outreach?\n\n## Rules\nWhat to always do / never do?"
    },
    {
      "name": "Products & Services",
      "slug": "products-services",
      "sort_order": 1,
      "is_required": false,
      "placeholder": "# What I sell\n\n## Products\nList your products, features, pricing.\n\n## Services\nList your services, deliverables, pricing.\n\n## Value Proposition\nWhy should someone buy from you?"
    },
    {
      "name": "Target Market",
      "slug": "target-market",
      "sort_order": 2,
      "is_required": false,
      "placeholder": "# Who I sell to\n\n## Ideal Customer Profile\nIndustry, company size, role, pain points.\n\n## Segments\nDifferent customer segments and how to approach each.\n\n## Disqualifiers\nWho is NOT a good fit?"
    },
    {
      "name": "Sales Playbook",
      "slug": "sales-playbook",
      "sort_order": 3,
      "is_required": false,
      "placeholder": "# How I sell\n\n## Process\nSteps from first contact to close.\n\n## Common Objections\nFrequent pushbacks and how to handle them.\n\n## Email Templates\nOutreach templates, follow-up templates.\n\n## Qualification Criteria\nHow to determine if a lead is worth pursuing."
    }
  ]
}
```

### Template: Social Manager

```json
{
  "type": "social_manager",
  "label": "Social Manager",
  "description": "Social media content creation, scheduling, engagement",
  "documents": [
    {
      "name": "Instructions",
      "slug": "instructions",
      "sort_order": 0,
      "is_required": true,
      "placeholder": "# How to operate as my Social Manager\n\n## Content Language\nWhat language for posts?\n\n## Tone\nCasual? Professional? Playful?\n\n## Rules\nEmoji usage, hashtag limits, things to avoid."
    },
    {
      "name": "Content Strategy",
      "slug": "content-strategy",
      "sort_order": 1,
      "is_required": false,
      "placeholder": "# What to communicate\n\n## Content Pillars\nMain themes and topics.\n\n## Content Calendar\nPosting frequency, best times, recurring series.\n\n## Goals\nWhat are we trying to achieve? Followers, engagement, leads?"
    },
    {
      "name": "Brand Voice",
      "slug": "brand-voice",
      "sort_order": 2,
      "is_required": false,
      "placeholder": "# How the brand sounds\n\n## Personality\nAdjectives that describe the brand voice.\n\n## Do's\nPhrases, styles, approaches that fit.\n\n## Don'ts\nThings that are off-brand.\n\n## Examples\nExample posts that nail the voice."
    },
    {
      "name": "Channels & Formats",
      "slug": "channels-formats",
      "sort_order": 3,
      "is_required": false,
      "placeholder": "# Where and how to post\n\n## Platforms\nWhich platforms, any platform-specific rules.\n\n## Formats\nPost types: text, carousel, video, story, thread.\n\n## Hashtag Strategy\nHashtag groups, limits per platform."
    }
  ]
}
```

### Template: Software Project

```json
{
  "type": "software_project",
  "label": "Software Project",
  "description": "Development project with codebase, architecture, roadmap",
  "documents": [
    {
      "name": "Instructions",
      "slug": "instructions",
      "sort_order": 0,
      "is_required": true,
      "placeholder": "# Development rules for this project\n\n## Stack\nLanguages, frameworks, tools.\n\n## Code Style\nConventions, linting, formatting.\n\n## Things to avoid\nAnti-patterns, forbidden libraries, bad practices."
    },
    {
      "name": "Architecture",
      "slug": "architecture",
      "sort_order": 1,
      "is_required": false,
      "placeholder": "# System architecture\n\n## Overview\nHigh-level architecture description.\n\n## Database\nSchema overview, key tables, relationships.\n\n## API\nEndpoints, authentication, data flow.\n\n## Infrastructure\nHosting, CI/CD, deployment."
    },
    {
      "name": "Roadmap",
      "slug": "roadmap",
      "sort_order": 2,
      "is_required": false,
      "placeholder": "# Project status and plan\n\n## Current State\nWhat's built, what's working, known issues.\n\n## Next Steps\nImmediate priorities.\n\n## Backlog\nFuture features and improvements."
    }
  ]
}
```

### Template: Client Project

```json
{
  "type": "client_project",
  "label": "Client Project",
  "description": "Client-facing project with brief, deliverables, communication rules",
  "documents": [
    {
      "name": "Instructions",
      "slug": "instructions",
      "sort_order": 0,
      "is_required": true,
      "placeholder": "# How to work on this client project\n\n## Communication Style\nHow to communicate about/for this client.\n\n## Deliverable Format\nExpected formats, quality standards.\n\n## Boundaries\nWhat's in scope, what's out of scope."
    },
    {
      "name": "Client Brief",
      "slug": "client-brief",
      "sort_order": 1,
      "is_required": false,
      "placeholder": "# About the client\n\n## Who they are\nCompany, industry, size.\n\n## What they need\nProject goals, desired outcomes.\n\n## Key Contacts\nWho to reference, decision makers."
    },
    {
      "name": "Deliverables",
      "slug": "deliverables",
      "sort_order": 2,
      "is_required": false,
      "placeholder": "# What we're delivering\n\n## Scope\nDetailed deliverables list.\n\n## Timeline\nMilestones and deadlines.\n\n## Status\nCurrent progress per deliverable."
    }
  ]
}
```

### Template: Strategy / Brainstorm

```json
{
  "type": "strategy_brainstorm",
  "label": "Strategy & Brainstorm",
  "description": "Strategic thinking, MVP validation, idea exploration",
  "documents": [
    {
      "name": "Instructions",
      "slug": "instructions",
      "sort_order": 0,
      "is_required": true,
      "placeholder": "# How to think with me\n\n## Role\nBe a critical sparring partner. Challenge my assumptions.\n\n## Approach\nPropose alternatives, think about market fit, be honest about weaknesses.\n\n## Format\nHow to structure analysis: SWOT, lean canvas, pros/cons?"
    },
    {
      "name": "Ideas Pipeline",
      "slug": "ideas-pipeline",
      "sort_order": 1,
      "is_required": false,
      "placeholder": "# Ideas I'm exploring\n\nList current ideas, their status, initial thoughts on each."
    },
    {
      "name": "Market Context",
      "slug": "market-context",
      "sort_order": 2,
      "is_required": false,
      "placeholder": "# Market landscape\n\n## Trends\nWhat's happening in the market.\n\n## Competitors\nWho's doing similar things.\n\n## Opportunities\nGaps I see."
    },
    {
      "name": "Validation Framework",
      "slug": "validation-framework",
      "sort_order": 3,
      "is_required": false,
      "placeholder": "# How I validate ideas\n\n## Criteria\nWhat makes an idea worth pursuing for me?\n\n## Process\nSteps from idea to MVP decision.\n\n## Kill Criteria\nWhen to abandon an idea."
    }
  ]
}
```

### Template: Marketing

```json
{
  "type": "marketing",
  "label": "Marketing",
  "description": "Marketing campaigns, content marketing, SEO, ads",
  "documents": [
    {
      "name": "Instructions",
      "slug": "instructions",
      "sort_order": 0,
      "is_required": true,
      "placeholder": "# Marketing operation rules\n\n## Tone & Language\nBrand tone for marketing content.\n\n## Channels\nActive marketing channels.\n\n## Guidelines\nDo's and don'ts for marketing content."
    },
    {
      "name": "Brand & Positioning",
      "slug": "brand-positioning",
      "sort_order": 1,
      "is_required": false,
      "placeholder": "# Brand positioning\n\n## Value Proposition\nCore message.\n\n## Differentiators\nWhat makes us unique.\n\n## Target Audience\nWho we're talking to."
    },
    {
      "name": "Campaigns",
      "slug": "campaigns",
      "sort_order": 2,
      "is_required": false,
      "placeholder": "# Active campaigns\n\nCurrent campaigns, goals, status, metrics."
    },
    {
      "name": "Content Bank",
      "slug": "content-bank",
      "sort_order": 3,
      "is_required": false,
      "placeholder": "# Reusable content\n\n## Key Messages\nCore messages to reinforce.\n\n## Proof Points\nCase studies, testimonials, data points.\n\n## Keywords\nSEO keywords, phrases to target."
    }
  ]
}
```

### Template: Custom (Blank)

```json
{
  "type": "custom",
  "label": "Custom",
  "description": "Start from scratch with just Instructions",
  "documents": [
    {
      "name": "Instructions",
      "slug": "instructions",
      "sort_order": 0,
      "is_required": true,
      "placeholder": "# Instructions\n\nDefine how Claude should operate in this collection."
    }
  ]
}
```

---

## Model Changes

### Remove `CollectionSystemDocument` model

Delete entirely.

### Remove `CollectionSystemDocumentRevision` model

Delete entirely.

### New model: `CollectionDocument`

```php
class CollectionDocument extends Model
{
    use HasRevisions, HasSlug;

    protected $fillable = [
        'collection_id',
        'name',
        'slug',
        'content',
        'sort_order',
        'is_required',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'sort_order' => 'integer',
        'version' => 'integer',
    ];

    public function collection()
    {
        return $this->belongsTo(Collection::class);
    }

    public function revisions()
    {
        return $this->hasMany(CollectionDocumentRevision::class);
    }
}
```

Note: `CollectionDocument` does NOT use the `BelongsToWorkspace` trait because it belongs to a Collection, not directly to a Workspace. Access control is enforced through the Collection's workspace scope.

### Update `Collection` model

```php
// Replace:
public function systemDocuments()
{
    return $this->hasMany(CollectionSystemDocument::class);
}

// With:
public function collectionDocuments()
{
    return $this->hasMany(CollectionDocument::class)->orderBy('sort_order');
}
```

### Updated relationships map

```
Collection
  ├─ belongsTo: Workspace
  ├─ hasMany: CollectionDocument (ordered by sort_order)
  ├─ hasMany: ApiToken
  ├─ hasMany: CollectionMemoryEntry
  ├─ morphedByMany: Document (via collectables)
  ├─ morphedByMany: Skill (via collectables)
  ├─ morphedByMany: Snippet (via collectables)
  └─ morphedByMany: Asset (via collectables)

CollectionDocument
  ├─ belongsTo: Collection
  └─ hasMany: CollectionDocumentRevision
```

---

## MCP Context Merging Update

The `get_context` response changes from fixed sections to dynamic:

### Old format:

```
1. [IDENTITY]        — workspace identity
2. [INSTRUCTIONS]    — workspace instructions + collection instructions
3. [CONTEXT]         — workspace context + collection context
4. [MEMORY]          — workspace memory + collection memory
5. [AVAILABLE ITEMS] — lists of skills, documents, snippets, assets
```

### New format:

```
1. [IDENTITY]               — workspace system_documents.identity
2. [INSTRUCTIONS]           — workspace system_documents.instructions
3. [COLLECTION: {name}]     — collection name + description
4. [collection doc 1 name]  — first collection document content (by sort_order)
5. [collection doc 2 name]  — second collection document content
6. [collection doc N name]  — ... all collection documents in order
7. [MEMORY]                 — workspace memory entries + collection memory entries
8. [AVAILABLE SKILLS]       — list of skill names + descriptions
9. [AVAILABLE DOCUMENTS]    — list of workspace document titles
10. [AVAILABLE SNIPPETS]    — list of snippet names
11. [AVAILABLE ASSETS]      — list of asset names + descriptions
```

### Implementation:

```php
public function buildContext(Collection $collection): string
{
    $workspace = $collection->workspace;
    $sections = [];

    // 1. Workspace Identity
    $identity = $workspace->systemDocuments()->where('type', 'identity')->first();
    if ($identity && $identity->content) {
        $sections[] = "## Identity\n\n" . $identity->content;
    }

    // 2. Workspace Instructions
    $instructions = $workspace->systemDocuments()->where('type', 'instructions')->first();
    if ($instructions && $instructions->content) {
        $sections[] = "## Instructions\n\n" . $instructions->content;
    }

    // 3. Collection header
    $sections[] = "## Collection: {$collection->name}\n\n" .
        ($collection->description ? $collection->description . "\n" : '');

    // 4-6. Collection documents (in sort_order)
    foreach ($collection->collectionDocuments as $doc) {
        if ($doc->content) {
            $sections[] = "### {$doc->name}\n\n" . $doc->content;
        }
    }

    // 7. Memory (workspace + collection)
    $memoryBuilder = new MemoryContextBuilder();
    $workspaceMemory = $memoryBuilder->buildWorkspaceMemory($workspace);
    $collectionMemory = $memoryBuilder->buildCollectionMemory($collection);

    if ($workspaceMemory || $collectionMemory) {
        $memorySection = "## Memory\n\n";
        if ($workspaceMemory) {
            $memorySection .= "### General\n" . $workspaceMemory . "\n\n";
        }
        if ($collectionMemory) {
            $memorySection .= "### {$collection->name}\n" . $collectionMemory;
        }
        $sections[] = $memorySection;
    }

    // 8-11. Available items
    $sections[] = $this->buildAvailableItems($collection);

    return implode("\n\n---\n\n", $sections);
}
```

---

## Workspace System Documents Update

Remove 'context' from the workspace system documents enum since context now lives only in collection documents:

```
OLD: type ENUM('identity', 'instructions', 'context', 'memory')
NEW: type ENUM('identity', 'instructions')
```

Memory was already removed in MEMORY_SYSTEM.md. Now context is also removed. Workspace keeps only Identity and Instructions.

Migrate existing workspace context content: if a workspace has a 'context' system document with content, create a note in the activity log suggesting the user move it to the appropriate collection. Do not auto-migrate to a collection since we don't know which one it belongs to.

---

## Frontend Changes

### Collection Create/Edit pages

When creating a collection:

1. User selects a template type
2. Template pre-populates collection documents with names and placeholder content
3. User can immediately start editing the documents or skip and do it later

### Collection Show page (`Pages/Collections/Show.jsx`)

Replace the fixed "Context / Instructions / Memory" override sections with a dynamic list:

**Collection Documents section:**
- Ordered list of documents (drag to reorder via sort_order)
- Each document: name (editable), expand to show markdown editor
- "Add document" button to add new custom documents
- Delete button on non-required documents
- Required documents show a lock icon (can't delete, can rename)

**Memory section:**
- Same structured entries UI from MEMORY_SYSTEM.md, scoped to collection

### Sidebar navigation update

Remove "Context" from the WORKSPACE section in the sidebar. Workspace section becomes:

```
WORKSPACE
├── Dashboard
├── Identity
├── Instructions
└── Memory
```

### Workspace pages

- Remove `Pages/Workspace/Context.jsx`
- Keep `Pages/Workspace/Identity.jsx`
- Keep `Pages/Workspace/Instructions.jsx`
- `Pages/Workspace/Memory.jsx` already updated per MEMORY_SYSTEM.md

---

## Routes Changes

### Remove:
```
GET  /workspace/context              → REMOVE
```

### Update workspace system document route:
```
PUT  /workspace/{type}               → type is now only 'identity' or 'instructions'
```

### Add collection document routes:
```
GET    /collections/{collection}/documents                  → List collection documents
POST   /collections/{collection}/documents                  → Add new document
PUT    /collections/{collection}/documents/{document}       → Update content/name
DELETE /collections/{collection}/documents/{document}       → Delete (if not required)
POST   /collections/{collection}/documents/reorder          → Update sort_order (body: { ids: [ordered list] })
```

---

## Migration Checklist

1. Create `collection_documents` table
2. Create `collection_document_revisions` table
3. Migrate data from `collection_system_documents` to `collection_documents`:
   - type 'instructions' → name "Instructions", slug "instructions", sort_order 0, is_required true
   - type 'context' → name "Context", slug "context", sort_order 1, is_required false
   - Preserve content and version
4. Drop `collection_system_documents` table
5. Drop `collection_system_document_revisions` table
6. Remove 'context' from workspace `system_documents` enum (becomes `ENUM('identity', 'instructions')`)
7. If workspace had context content, log activity suggesting user move it to a collection
8. Remove 'memory' from workspace `system_documents` enum if not already done (per MEMORY_SYSTEM.md)
9. Create collection template JSON files in `database/seeders/templates/collections/`

---

## Testing Checklist

1. Create collection with "Sales Agent" template → verify 4 documents created with correct names and placeholders
2. Create collection with "Custom" template → verify only Instructions document created
3. Edit a collection document → verify revision created
4. Add new custom document to a collection → verify it appears in sort order
5. Delete a non-required document → verify deleted
6. Try to delete a required document → verify blocked
7. Reorder documents via drag → verify sort_order updated
8. Connect via MCP → verify `get_context` returns workspace identity + instructions + all collection documents in order + memory
9. Rename a collection document → verify slug remains unchanged (MCP references stable)
10. Verify MCP `list_documents` still returns workspace-level documents (from `collectables`), separate from collection documents