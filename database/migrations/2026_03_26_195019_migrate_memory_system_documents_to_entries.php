<?php

use App\Models\CollectionMemoryEntry;
use App\Models\CollectionSystemDocument;
use App\Models\MemoryEntry;
use App\Models\SystemDocument;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Migrate workspace memory system documents to memory_entries
        SystemDocument::withoutGlobalScopes()
            ->where('type', 'memory')
            ->where('content', '!=', '')
            ->each(function (SystemDocument $doc) {
                $blocks = preg_split('/\n{2,}/', trim($doc->content));

                foreach (array_filter($blocks) as $block) {
                    $block = trim($block);
                    if ($block === '') {
                        continue;
                    }

                    MemoryEntry::withoutGlobalScopes()->create([
                        'workspace_id' => $doc->workspace_id,
                        'content' => $block,
                        'created_at' => $doc->updated_at,
                        'updated_at' => $doc->updated_at,
                    ]);
                }
            });

        // Migrate collection memory system documents to collection_memory_entries
        CollectionSystemDocument::withoutGlobalScopes()
            ->where('type', 'memory')
            ->where('content', '!=', '')
            ->each(function (CollectionSystemDocument $doc) {
                $blocks = preg_split('/\n{2,}/', trim($doc->content));

                foreach (array_filter($blocks) as $block) {
                    $block = trim($block);
                    if ($block === '') {
                        continue;
                    }

                    CollectionMemoryEntry::create([
                        'collection_id' => $doc->collection_id,
                        'content' => $block,
                        'created_at' => $doc->updated_at,
                        'updated_at' => $doc->updated_at,
                    ]);
                }
            });

        // Delete the old memory system documents
        SystemDocument::withoutGlobalScopes()->where('type', 'memory')->delete();
        CollectionSystemDocument::withoutGlobalScopes()->where('type', 'memory')->delete();
    }

    public function down(): void
    {
        // Re-create memory system documents from entries
        MemoryEntry::withoutGlobalScopes()
            ->select('workspace_id')
            ->distinct()
            ->pluck('workspace_id')
            ->each(function (int $workspaceId) {
                $content = MemoryEntry::withoutGlobalScopes()
                    ->where('workspace_id', $workspaceId)
                    ->where('is_archived', false)
                    ->orderByDesc('created_at')
                    ->pluck('content')
                    ->join("\n\n");

                SystemDocument::withoutGlobalScopes()->create([
                    'workspace_id' => $workspaceId,
                    'type' => 'memory',
                    'content' => $content,
                    'version' => 1,
                ]);
            });
    }
};
