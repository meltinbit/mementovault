<?php

use App\Models\CollectionDocument;
use App\Models\CollectionSystemDocument;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $typeMap = [
        'instructions' => ['name' => 'Instructions', 'sort_order' => 0, 'is_required' => true],
        'context' => ['name' => 'Context', 'sort_order' => 1, 'is_required' => false],
    ];

    public function up(): void
    {
        // Migrate collection_system_documents → collection_documents
        CollectionSystemDocument::withoutGlobalScopes()
            ->where('type', '!=', 'memory') // memory already migrated
            ->each(function (CollectionSystemDocument $doc) {
                $map = $this->typeMap[$doc->type] ?? [
                    'name' => ucfirst($doc->type),
                    'sort_order' => 10,
                    'is_required' => false,
                ];

                CollectionDocument::create([
                    'collection_id' => $doc->collection_id,
                    'name' => $map['name'],
                    'slug' => $doc->type,
                    'content' => $doc->content ?? '',
                    'sort_order' => $map['sort_order'],
                    'is_required' => $map['is_required'],
                    'version' => $doc->version ?? 1,
                    'created_at' => $doc->created_at,
                    'updated_at' => $doc->updated_at,
                ]);
            });
    }

    public function down(): void
    {
        DB::table('collection_documents')->truncate();
    }
};
