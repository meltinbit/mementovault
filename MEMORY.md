# MementoVault — Structured Memory System

## Problem

Memory is currently a single LONGTEXT markdown field on `system_documents` and `collection_system_documents`. Over time this becomes a huge blob that wastes tokens and dilutes important information. There is no way to archive outdated entries, no cap on what gets sent to Claude, and no structure for organizing memories.

## Solution

Replace the free-text memory document with a **structured entries system**. Memory becomes a list of discrete, taggable, archivable entries — not a single markdown document.

---

## Database Changes

### Remove memory from system_documents

The `system_documents` table currently has `type ENUM('identity', 'instructions', 'context', 'memory')`. Change this to:

```
type ENUM('identity', 'instructions', 'context')
```

Memory is no longer a system document. Delete any existing rows where `type = 'memory'` during migration (or migrate content into the new entries table — see migration strategy below).

Same for `collection_system_documents`: change the enum to remove `'memory'`:

```
type ENUM('instructions', 'context')
```

### New table: `memory_entries`

Workspace-level memory entries.

```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
workspace_id    BIGINT UNSIGNED FK(workspaces.id) ON DELETE CASCADE
content         TEXT — short, 1-3 sentences max per entry
category        VARCHAR(100) NULLABLE — freeform: 'pricing', 'infra', 'workflow', 'communication', etc.
is_pinned       BOOLEAN DEFAULT FALSE — pinned entries always included in context regardless of cap
is_archived     BOOLEAN DEFAULT FALSE — archived entries excluded from MCP context but kept in DB
created_at      TIMESTAMP
updated_at      TIMESTAMP

INDEX (workspace_id, is_archived, created_at)
INDEX (workspace_id, is_pinned)
```

### New table: `collection_memory_entries`

Collection-level memory entries.

```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
collection_id   BIGINT UNSIGNED FK(collections.id) ON DELETE CASCADE
content         TEXT
category        VARCHAR(100) NULLABLE
is_pinned       BOOLEAN DEFAULT FALSE
is_archived     BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP
updated_at      TIMESTAMP

INDEX (collection_id, is_archived, created_at)
INDEX (collection_id, is_pinned)
```

### Update `workspaces.settings` JSON

Add these keys to the settings JSON:

```json
{
  "memory_max_entries": 50,
  "collection_memory_max_entries": 30
}
```

Defaults: 50 for workspace, 30 for collection. User can change in Settings.

---

## Migration Strategy

For existing workspaces that have memory content in `system_documents`:

1. Read the content of the memory system document
2. Split by line breaks or markdown headers into individual entries
3. Create one `memory_entry` per chunk
4. Delete the memory system document row
5. Log the migration in activity_log

Same for collection-level memory documents.

If the content can't be cleanly split (it's free-form prose), create a single entry with the full content and let the user restructure it manually.

---

## Models

### MemoryEntry

```php
class MemoryEntry extends Model
{
    use BelongsToWorkspace;

    protected $fillable = [
        'workspace_id',
        'content',
        'category',
        'is_pinned',
        'is_archived',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'is_archived' => 'boolean',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_archived', false);
    }

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true)->where('is_archived', false);
    }

    public function scopeForContext($query, int $limit)
    {
        // Pinned first (always included, not counted toward limit)
        // Then most recent non-pinned, non-archived, up to $limit
        // This is handled in the service, not a single scope
    }
}
```

### CollectionMemoryEntry

```php
class CollectionMemoryEntry extends Model
{
    protected $fillable = [
        'collection_id',
        'content',
        'category',
        'is_pinned',
        'is_archived',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'is_archived' => 'boolean',
    ];

    public function collection()
    {
        return $this->belongsTo(Collection::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_archived', false);
    }

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true)->where('is_archived', false);
    }
}
```

### Update Workspace model

```php
// Add to Workspace model:
public function memoryEntries()
{
    return $this->hasMany(MemoryEntry::class);
}
```

### Update Collection model

```php
// Add to Collection model:
public function memoryEntries()
{
    return $this->hasMany(CollectionMemoryEntry::class);
}
```

---

## Memory Context Builder Service

This service builds the memory section for MCP context delivery.

```php
class MemoryContextBuilder
{
    /**
     * Build workspace memory for MCP context.
     * Returns formatted markdown string.
     */
    public function buildWorkspaceMemory(Workspace $workspace): string
    {
        $maxEntries = $workspace->settings['memory_max_entries'] ?? 50;

        // Always include pinned entries (no limit)
        $pinned = $workspace->memoryEntries()
            ->pinned()
            ->orderBy('created_at', 'desc')
            ->get();

        // Fill remaining slots with most recent non-pinned active entries
        $regular = $workspace->memoryEntries()
            ->active()
            ->where('is_pinned', false)
            ->orderBy('created_at', 'desc')
            ->limit($maxEntries)
            ->get();

        return $this->formatEntries($pinned, $regular);
    }

    /**
     * Build collection memory for MCP context.
     */
    public function buildCollectionMemory(Collection $collection): string
    {
        $workspace = $collection->workspace;
        $maxEntries = $workspace->settings['collection_memory_max_entries'] ?? 30;

        $pinned = $collection->memoryEntries()
            ->pinned()
            ->orderBy('created_at', 'desc')
            ->get();

        $regular = $collection->memoryEntries()
            ->active()
            ->where('is_pinned', false)
            ->orderBy('created_at', 'desc')
            ->limit($maxEntries)
            ->get();

        return $this->formatEntries($pinned, $regular);
    }

    /**
     * Format entries as markdown for MCP delivery.
     */
    private function formatEntries($pinned, $regular): string
    {
        if ($pinned->isEmpty() && $regular->isEmpty()) {
            return '';
        }

        $lines = [];

        if ($pinned->isNotEmpty()) {
            foreach ($pinned as $entry) {
                $cat = $entry->category ? "[{$entry->category}] " : '';
                $lines[] = "- 📌 {$cat}{$entry->content}";
            }
        }

        if ($regular->isNotEmpty()) {
            foreach ($regular as $entry) {
                $cat = $entry->category ? "[{$entry->category}] " : '';
                $date = $entry->created_at->format('Y-m-d');
                $lines[] = "- {$cat}{$entry->content} ({$date})";
            }
        }

        return implode("\n", $lines);
    }
}
```

---

## Update MCP Context Merging

In the MCP `get_context` tool handler, update the memory section to use the new builder:

```
OLD:
4. [MEMORY] — workspace.system_documents.memory
              + collection.system_documents.memory (if exists, appended)

NEW:
4. [MEMORY] — MemoryContextBuilder::buildWorkspaceMemory()
              + MemoryContextBuilder::buildCollectionMemory() (if collection has entries)
```

The format served to Claude becomes:

```markdown
## Memory

### General Memory
- 📌 [pricing] I prefer one-time purchase or credit-based models. Never suggest subscription.
- 📌 [infra] Always monitor disk space on Hetzner — Supabase analytics consumed 35GB+.
- [workflow] Direct communication style, provide concrete proposals, I'll iterate. (2026-02-15)
- [stack] SQLite for small projects, Postgres for serious ones. (2026-01-20)
- [app-store] iPad compatibility mode: use deployment in compatibility mode. (2025-12-10)

### Noisy Mind Memory
- 📌 [architecture] Credit packs, not subscription. Target is casual user.
- [decision] App name "Noisy Mind" is final, do not suggest alternatives. (2026-03-01)
- [icon] Uses "neural mic" concept for the icon. (2026-02-20)
```

---

## Backend Routes

```
— Workspace Memory —
GET    /memory                          → List entries (filterable: active/archived/pinned, category, search)
POST   /memory                          → Create entry
PUT    /memory/{entry}                  → Update entry content/category
POST   /memory/{entry}/pin              → Toggle pin
POST   /memory/{entry}/archive          → Archive entry
POST   /memory/{entry}/unarchive        → Restore archived entry
DELETE /memory/{entry}                  → Permanently delete entry
POST   /memory/batch-archive            → Archive multiple entries

— Collection Memory —
GET    /collections/{collection}/memory              → List entries
POST   /collections/{collection}/memory              → Create entry
PUT    /collections/{collection}/memory/{entry}      → Update entry
POST   /collections/{collection}/memory/{entry}/pin  → Toggle pin
POST   /collections/{collection}/memory/{entry}/archive    → Archive
POST   /collections/{collection}/memory/{entry}/unarchive  → Restore
DELETE /collections/{collection}/memory/{entry}      → Delete
POST   /collections/{collection}/memory/batch-archive      → Archive multiple
```

---

## Frontend

### Workspace Memory Page (`Pages/Workspace/Memory.jsx`)

Replace the current markdown editor with a structured entries interface:

**Layout:**
- Top bar: "Add memory" button + search + filter (category dropdown, active/archived/pinned toggle)
- Entry list below, sorted by pinned first then by date desc
- Each entry shows: content, category badge, pin icon, date, actions

**Entry card:**
- Content text (editable inline on click)
- Category badge (editable, autocomplete from existing categories)
- Pin toggle button (star/pin icon)
- Archive button (moves to archived, hidden from active view)
- Delete button (with confirmation)
- Date label (subtle, right-aligned)

**Filter tabs:**
- "Active" (default) — shows non-archived entries
- "Pinned" — shows only pinned entries
- "Archived" — shows archived entries with "Restore" button
- "All" — shows everything

**Add entry:**
- Clicking "Add memory" opens an inline form at the top of the list
- Fields: content (textarea, 2-3 lines), category (text input with autocomplete)
- Save button, cancel button
- After save, entry appears at the top of the list

**Batch operations:**
- Checkboxes on entries for multi-select
- "Archive selected" bulk action

### Collection Memory (`Pages/Collections/Show.jsx`)

In the collection detail page, add a "Memory" tab alongside the existing content tabs. Same UI as workspace memory, scoped to the collection.

### Settings Addition (`Pages/Settings/Index.jsx`)

Add to the Settings page under "MCP Behavior" section:

```
Memory Limits
├── Max workspace memory entries in context: [number input, default 50]
├── Max collection memory entries in context: [number input, default 30]
└── Helper: "Pinned entries are always included regardless of limit. Only the most recent entries up to this limit are sent to Claude."
```

---

## Update Sidebar Navigation

The sidebar currently has "Memory" under WORKSPACE linking to a markdown editor. Update it to link to the new entries-based Memory page. Same icon, same position.

---

## MCP Tool Update

### Update `get_context` tool

The memory section of the context response now uses `MemoryContextBuilder` instead of reading a system document. See "Update MCP Context Merging" section above.

### New MCP tool: `append_memory`

Allow Claude to add memory entries via MCP (so Claude can "learn" and save things during a conversation).

```
Tool: append_memory
Description: Save a new memory entry. Use this when you learn something important about the user's preferences, decisions, or patterns that should be remembered for future conversations.
Parameters:
  - content (string, required): The memory to save. Keep it concise — 1-2 sentences.
  - category (string, optional): Category tag like 'pricing', 'workflow', 'decision', 'preference'.
  - scope (string, optional, default 'workspace'): 'workspace' for general memory, 'collection' for collection-specific memory.
```

This tool creates a new `memory_entry` or `collection_memory_entry` record. The `created_by` can be tracked in the activity log as 'mcp'.

**Important:** This tool should be mentioned in the MCP server instructions so Claude knows it can use it:

Append this to the hardcoded MCP instructions (from MCP_AUTO_CONTEXT.md):

```
When you discover important information about the user during a conversation — such as preferences, decisions, patterns, or lessons learned — use the `append_memory` tool to save it for future conversations. Keep entries concise (1-2 sentences). Use appropriate categories like 'preference', 'decision', 'workflow', 'technical'. Use scope 'collection' for project-specific memories, 'workspace' for general ones.
```

---

## Testing Checklist

1. Create memory entries at workspace level — verify they appear in `get_context` MCP response
2. Create memory entries at collection level — verify they appear merged with workspace memory
3. Pin an entry — verify it always appears regardless of cap
4. Archive an entry — verify it disappears from MCP context but is still visible in "Archived" tab
5. Set max entries to 5, create 10 entries + 2 pinned — verify MCP returns 2 pinned + 5 most recent
6. Test `append_memory` MCP tool — Claude saves a memory, verify it appears in the UI
7. Test collection-scoped `append_memory` — verify entry is created on the correct collection
8. Batch archive — select multiple, archive, verify all removed from active view
9. Restore archived entry — verify it returns to active view and MCP context
10. Delete entry permanently — verify removed from DB
11. Test category filter — verify filtering works in UI
12. Test search — verify entries are searchable by content
13. Verify old memory system documents are migrated correctly to entries