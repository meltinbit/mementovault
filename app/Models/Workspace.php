<?php

namespace App\Models;

use App\Models\Traits\HasSlug;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workspace extends Model
{
    use HasFactory, HasSlug;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'settings',
        'onboarded_at',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'onboarded_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function systemDocuments(): HasMany
    {
        return $this->hasMany(SystemDocument::class);
    }

    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function skills(): HasMany
    {
        return $this->hasMany(Skill::class);
    }

    public function snippets(): HasMany
    {
        return $this->hasMany(Snippet::class);
    }

    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }

    public function tags(): HasMany
    {
        return $this->hasMany(Tag::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function memoryEntries(): HasMany
    {
        return $this->hasMany(MemoryEntry::class);
    }

    public function apiTokens(): HasMany
    {
        return $this->hasMany(ApiToken::class);
    }

    public static function defaultMcpInstructions(): string
    {
        return <<<'PROMPT'
# Memento Vault — AI Context Manager

## What you already have
When context loads, you receive: the user's **identity**, **instructions**, and an **inventory** of the active neuron (collection) — document slugs, content counts. Read this before calling any tool.

## How to work efficiently
- **Find content → use `search`** (covers documents, skills, snippets, assets, and collection documents in one call). Don't list-then-get sequentially. By default searches the active collection. If the user asks for something outside the collection or you can't find it, retry with `scope: "workspace"` to search all content.
- **Read a specific item → use the right tool with `get` action and the slug** (visible in your loaded context or search results).
- **Don't call `get_context` again** if you already have context loaded — it's already in your conversation.

## Tool reference (all use `action` param)
- `get_context` — Load context. Pass `collection: "slug"` to switch neuron. No action param.
- `collection_documents` — Neuron-level docs (Instructions, Architecture, etc.). Always in context. Actions: list, get, create, update, append, delete, reorder, list_templates
- `documents` — Workspace reference docs assigned to this neuron. Actions: list, get, create, update, append, delete
- `skills` — Operational instructions with triggers. Actions: list, get, create, update, append, delete
- `snippets` — Reusable text blocks. Actions: list, get, create, update, append, delete
- `assets` — Files and media. Actions: list, get_url, list_folders, create_folder, move, delete
- `search` — Full-text search across ALL content types. Params: `query` (required), `scope` ("collection" default or "workspace" for all content).
- `system_documents` — Workspace-level docs (identity, instructions, soul, etc.). Actions: list, get, update, append
- `memory` — Short notes AI should remember. Actions: list, get, create, update, delete, move, copy. Supports `scope` (workspace/collection) and cross-neuron operations via `target_collection`.
- `collections` — Manage collections (neurons). Actions: list, get, create, update, delete. Requires workspace token for create/update/delete.
- `graph` — Navigate the workspace knowledge graph. Actions: overview (workspace map), collection (single collection graph), connections (find what's linked to a content), path (shortest path between two nodes). Read-only. Use `[[slug]]` syntax in content to create wikilinks.

## Writing long content
Max ~1500 chars per call. Use `create` first, then `append` with the slug for additional chunks. One document per turn.

## Cross-neuron operations
To create content in a different neuron without switching: pass `target_collection: "slug"` on `create` (documents, skills, snippets, memory). Requires a nucleus (workspace) token. For memory, `move` and `copy` also support `target_collection`.

## Key distinctions
- **collection_documents** = neuron-level system docs, always loaded in context (Instructions, Architecture, Memory...)
- **documents** = workspace-level reference docs, fetched on demand (specs, guides, notes...)
- **system_documents** = workspace-level identity docs (identity, instructions, soul...) — shared across all neurons
PROMPT;
    }
}
