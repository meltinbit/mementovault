<?php

use App\Models\Collection;
use App\Models\CollectionDocument;
use App\Models\Document;
use App\Models\Skill;
use App\Models\SystemDocument;
use App\Models\User;
use App\Models\Workspace;
use App\Services\ContextMergingService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createMergingTestSetup(): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    foreach (['identity', 'instructions'] as $type) {
        SystemDocument::withoutGlobalScopes()->create([
            'workspace_id' => $workspace->id,
            'type' => $type,
            'content' => "Workspace {$type} content",
        ]);
    }

    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    return [$workspace, $collection];
}

test('merged context includes workspace identity', function () {
    [, $collection] = createMergingTestSetup();
    $service = app(ContextMergingService::class);

    $result = $service->merge($collection);

    expect($result)->toContain('Workspace identity content');
});

test('merged context includes workspace instructions', function () {
    [, $collection] = createMergingTestSetup();
    $service = app(ContextMergingService::class);

    $result = $service->merge($collection);

    expect($result)->toContain('Workspace instructions content');
});

test('merged context includes collection name', function () {
    [, $collection] = createMergingTestSetup();
    $service = app(ContextMergingService::class);

    $result = $service->merge($collection);

    expect($result)->toContain("Collection: {$collection->name}");
});

test('merged context lists collection document slugs', function () {
    [, $collection] = createMergingTestSetup();

    CollectionDocument::create([
        'collection_id' => $collection->id,
        'name' => 'Architecture',
        'content' => 'System architecture details',
        'sort_order' => 0,
    ]);

    $service = app(ContextMergingService::class);
    $result = $service->merge($collection);

    expect($result)->toContain('architecture');
    // No full content in context — only slugs
    expect($result)->not->toContain('System architecture details');
});

test('merged context shows content counts', function () {
    [$workspace, $collection] = createMergingTestSetup();

    $skill = Skill::factory()->create(['workspace_id' => $workspace->id]);
    $collection->skills()->attach($skill->id);

    $doc = Document::factory()->create(['workspace_id' => $workspace->id]);
    $collection->documents()->attach($doc->id);

    $service = app(ContextMergingService::class);
    $result = $service->merge($collection);

    expect($result)->toContain('1 skills');
    expect($result)->toContain('1 documents');
});

test('merged context excludes inactive items from counts', function () {
    [$workspace, $collection] = createMergingTestSetup();

    $skill = Skill::factory()->create(['workspace_id' => $workspace->id, 'is_active' => false]);
    $collection->skills()->attach($skill->id);

    $service = app(ContextMergingService::class);
    $result = $service->merge($collection);

    expect($result)->not->toContain('skills');
});

test('merged context is compact', function () {
    [, $collection] = createMergingTestSetup();
    $service = app(ContextMergingService::class);

    $result = $service->merge($collection);

    // Context should be small — no full documents, no memory, just index
    expect(mb_strlen($result))->toBeLessThan(2000);
});

test('sections are separated by horizontal rules', function () {
    [, $collection] = createMergingTestSetup();
    $service = app(ContextMergingService::class);

    $result = $service->merge($collection);

    expect($result)->toContain('---');
});
