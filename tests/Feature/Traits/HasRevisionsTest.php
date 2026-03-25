<?php

use App\Models\Document;
use App\Models\DocumentRevision;
use App\Models\Workspace;

test('revision is created when content is updated', function () {
    $workspace = Workspace::factory()->create();
    app()->instance('current_workspace', $workspace);

    $document = Document::create([
        'workspace_id' => $workspace->id,
        'title' => 'Test Doc',
        'slug' => 'test-doc',
        'content' => 'Original content',
    ]);

    $document->update(['content' => 'Updated content']);

    expect(DocumentRevision::count())->toBe(1);
    expect(DocumentRevision::first()->content)->toBe('Original content');
    expect(DocumentRevision::first()->version)->toBe(1);
});

test('version is incremented on content update', function () {
    $workspace = Workspace::factory()->create();
    app()->instance('current_workspace', $workspace);

    $document = Document::create([
        'workspace_id' => $workspace->id,
        'title' => 'Test Doc',
        'slug' => 'test-doc',
        'content' => 'V1',
    ]);

    expect($document->version)->toBe(1);

    $document->update(['content' => 'V2']);
    expect($document->fresh()->version)->toBe(2);

    $document->refresh();
    $document->update(['content' => 'V3']);
    expect($document->fresh()->version)->toBe(3);
    expect(DocumentRevision::count())->toBe(2);
});

test('revision is not created when non-content field is updated', function () {
    $workspace = Workspace::factory()->create();
    app()->instance('current_workspace', $workspace);

    $document = Document::create([
        'workspace_id' => $workspace->id,
        'title' => 'Test Doc',
        'slug' => 'test-doc',
        'content' => 'Same content',
    ]);

    $document->update(['title' => 'New Title']);

    expect(DocumentRevision::count())->toBe(0);
    expect($document->fresh()->version)->toBe(1);
});
