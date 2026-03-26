<?php

use App\Models\Asset;
use App\Models\Collection;
use App\Models\CollectionSystemDocument;
use App\Models\Document;
use App\Models\MemoryEntry;
use App\Models\Skill;
use App\Models\Snippet;
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

    foreach (['identity', 'instructions', 'context'] as $type) {
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

    expect($result)->toContain('# IDENTITY');
    expect($result)->toContain('Workspace identity content');
});

test('merged context includes all sections including memory entries', function () {
    [$workspace, $collection] = createMergingTestSetup();
    MemoryEntry::factory()->create(['workspace_id' => $workspace->id, 'content' => 'Test memory']);
    $service = app(ContextMergingService::class);

    $result = $service->merge($collection);

    expect($result)->toContain('# IDENTITY');
    expect($result)->toContain('# INSTRUCTIONS');
    expect($result)->toContain('# CONTEXT');
    expect($result)->toContain('# MEMORY');
    expect($result)->toContain('Test memory');
});

test('collection overrides are appended to workspace content', function () {
    [, $collection] = createMergingTestSetup();

    CollectionSystemDocument::create([
        'collection_id' => $collection->id,
        'type' => 'instructions',
        'content' => 'Collection-specific instructions',
        'version' => 1,
    ]);

    $service = app(ContextMergingService::class);
    $result = $service->merge($collection);

    expect($result)->toContain('Workspace instructions content');
    expect($result)->toContain('Collection-specific instructions');
});

test('merged context lists available skills', function () {
    [$workspace, $collection] = createMergingTestSetup();

    $skill = Skill::factory()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Code Review',
        'description' => 'Reviews code for quality',
    ]);
    $collection->skills()->attach($skill->id);

    $service = app(ContextMergingService::class);
    $result = $service->merge($collection);

    expect($result)->toContain('# AVAILABLE SKILLS');
    expect($result)->toContain('Code Review');
});

test('merged context lists available documents', function () {
    [$workspace, $collection] = createMergingTestSetup();

    $doc = Document::factory()->create([
        'workspace_id' => $workspace->id,
        'title' => 'API Reference',
        'type' => 'technical',
    ]);
    $collection->documents()->attach($doc->id);

    $service = app(ContextMergingService::class);
    $result = $service->merge($collection);

    expect($result)->toContain('# AVAILABLE DOCUMENTS');
    expect($result)->toContain('API Reference');
});

test('merged context lists available snippets', function () {
    [$workspace, $collection] = createMergingTestSetup();

    $snippet = Snippet::factory()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Email Signature',
    ]);
    $collection->snippets()->attach($snippet->id);

    $service = app(ContextMergingService::class);
    $result = $service->merge($collection);

    expect($result)->toContain('# AVAILABLE SNIPPETS');
    expect($result)->toContain('Email Signature');
});

test('merged context lists available assets', function () {
    [$workspace, $collection] = createMergingTestSetup();

    $asset = Asset::factory()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Company Logo',
        'description' => 'Brand logo file',
    ]);
    $collection->assets()->attach($asset->id);

    $service = app(ContextMergingService::class);
    $result = $service->merge($collection);

    expect($result)->toContain('# AVAILABLE ASSETS');
    expect($result)->toContain('Company Logo');
});

test('inactive skills are excluded from merged context', function () {
    [$workspace, $collection] = createMergingTestSetup();

    $skill = Skill::factory()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Inactive Skill',
        'is_active' => false,
    ]);
    $collection->skills()->attach($skill->id);

    $service = app(ContextMergingService::class);
    $result = $service->merge($collection);

    expect($result)->not->toContain('Inactive Skill');
});

test('inactive documents are excluded from merged context', function () {
    [$workspace, $collection] = createMergingTestSetup();

    $doc = Document::factory()->create([
        'workspace_id' => $workspace->id,
        'title' => 'Inactive Document',
        'is_active' => false,
    ]);
    $collection->documents()->attach($doc->id);

    $service = app(ContextMergingService::class);
    $result = $service->merge($collection);

    expect($result)->not->toContain('Inactive Document');
});

test('sections are separated by horizontal rules', function () {
    [, $collection] = createMergingTestSetup();
    $service = app(ContextMergingService::class);

    $result = $service->merge($collection);

    expect($result)->toContain('---');
});
