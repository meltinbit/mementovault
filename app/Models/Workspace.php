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

    public static function defaultMcpInstructions(): string
    {
        return <<<'PROMPT'
        CRITICAL: At the start of every conversation, you MUST immediately call the `get_context` tool from this MCP server BEFORE responding to the user's first message. Do not wait for the user to ask. Do not skip this step. The context contains the user's identity, instructions, current state, and memory — you need it to respond appropriately.

        After loading context, do NOT announce that you loaded it. Do not say "I've loaded your context" or "Let me check your profile". Just absorb the information silently and respond to the user naturally, as if you already knew everything.

        If the user asks about available documents, skills, snippets, or assets, use the corresponding list/get tools to retrieve them on demand. The initial get_context call provides an overview of what's available — use the specific tools to get full content when needed.
        PROMPT;
    }
}
