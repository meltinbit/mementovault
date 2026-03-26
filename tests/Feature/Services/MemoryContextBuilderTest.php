<?php

use App\Models\Collection;
use App\Models\CollectionMemoryEntry;
use App\Models\MemoryEntry;
use App\Models\User;
use App\Models\Workspace;
use App\Services\MemoryContextBuilder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createBuilderTestSetup(): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    return [$workspace, $collection];
}

test('builds markdown from workspace entries', function () {
    [$workspace] = createBuilderTestSetup();
    MemoryEntry::factory()->create(['workspace_id' => $workspace->id, 'content' => 'Prefers dark mode']);

    $builder = app(MemoryContextBuilder::class);
    $result = $builder->build($workspace);

    expect($result)->toContain('Prefers dark mode');
});

test('pinned entries are marked with emoji', function () {
    [$workspace] = createBuilderTestSetup();
    MemoryEntry::factory()->pinned()->create(['workspace_id' => $workspace->id, 'content' => 'Always use TypeScript']);

    $builder = app(MemoryContextBuilder::class);
    $result = $builder->build($workspace);

    expect($result)->toContain('📌');
    expect($result)->toContain('Always use TypeScript');
});

test('categories are included as badges', function () {
    [$workspace] = createBuilderTestSetup();
    MemoryEntry::factory()->create(['workspace_id' => $workspace->id, 'content' => 'No subscriptions', 'category' => 'pricing']);

    $builder = app(MemoryContextBuilder::class);
    $result = $builder->build($workspace);

    expect($result)->toContain('[pricing]');
    expect($result)->toContain('No subscriptions');
});

test('respects max_entries setting', function () {
    [$workspace] = createBuilderTestSetup();
    $workspace->update(['settings' => ['memory_max_entries' => 2]]);

    for ($i = 0; $i < 5; $i++) {
        MemoryEntry::factory()->create(['workspace_id' => $workspace->id, 'content' => "Entry {$i}"]);
    }

    $builder = app(MemoryContextBuilder::class);
    $result = $builder->build($workspace);

    // Should only have 2 regular entries
    $lines = array_filter(explode("\n", $result), fn ($l) => str_starts_with($l, '- '));
    expect(count($lines))->toBe(2);
});

test('pinned entries bypass max limit', function () {
    [$workspace] = createBuilderTestSetup();
    $workspace->update(['settings' => ['memory_max_entries' => 1]]);

    MemoryEntry::factory()->pinned()->create(['workspace_id' => $workspace->id, 'content' => 'Pinned 1']);
    MemoryEntry::factory()->pinned()->create(['workspace_id' => $workspace->id, 'content' => 'Pinned 2']);
    MemoryEntry::factory()->create(['workspace_id' => $workspace->id, 'content' => 'Regular']);

    $builder = app(MemoryContextBuilder::class);
    $result = $builder->build($workspace);

    expect($result)->toContain('Pinned 1');
    expect($result)->toContain('Pinned 2');
    expect($result)->toContain('Regular');
});

test('archived entries are excluded', function () {
    [$workspace] = createBuilderTestSetup();
    MemoryEntry::factory()->create(['workspace_id' => $workspace->id, 'content' => 'Active entry']);
    MemoryEntry::factory()->archived()->create(['workspace_id' => $workspace->id, 'content' => 'Archived entry']);

    $builder = app(MemoryContextBuilder::class);
    $result = $builder->build($workspace);

    expect($result)->toContain('Active entry');
    expect($result)->not->toContain('Archived entry');
});

test('returns empty string when no entries', function () {
    [$workspace] = createBuilderTestSetup();

    $builder = app(MemoryContextBuilder::class);
    $result = $builder->build($workspace);

    expect($result)->toBe('');
});

test('collection entries included when collection provided', function () {
    [$workspace, $collection] = createBuilderTestSetup();
    MemoryEntry::factory()->create(['workspace_id' => $workspace->id, 'content' => 'Workspace memory']);
    CollectionMemoryEntry::factory()->create(['collection_id' => $collection->id, 'content' => 'Collection memory']);

    $builder = app(MemoryContextBuilder::class);
    $result = $builder->build($workspace, $collection);

    expect($result)->toContain('Workspace memory');
    expect($result)->toContain('Collection memory');
    expect($result)->toContain($collection->name);
});
