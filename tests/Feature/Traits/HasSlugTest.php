<?php

use App\Models\Document;
use App\Models\Workspace;

test('slug is auto-generated from source field', function () {
    $workspace = Workspace::factory()->create();
    app()->instance('current_workspace', $workspace);

    $document = Document::create([
        'workspace_id' => $workspace->id,
        'title' => 'My Great Document',
        'content' => 'content',
    ]);

    expect($document->slug)->toBe('my-great-document');
});

test('slug is unique within workspace', function () {
    $workspace = Workspace::factory()->create();
    app()->instance('current_workspace', $workspace);

    $doc1 = Document::create([
        'workspace_id' => $workspace->id,
        'title' => 'Duplicate',
        'content' => 'content 1',
    ]);

    $doc2 = Document::create([
        'workspace_id' => $workspace->id,
        'title' => 'Duplicate',
        'content' => 'content 2',
    ]);

    expect($doc1->slug)->toBe('duplicate');
    expect($doc2->slug)->toBe('duplicate-2');
});

test('slug is immutable after creation', function () {
    $workspace = Workspace::factory()->create();
    app()->instance('current_workspace', $workspace);

    $document = Document::create([
        'workspace_id' => $workspace->id,
        'title' => 'Original',
        'content' => 'content',
    ]);

    $document->update(['slug' => 'changed-slug']);

    expect($document->fresh()->slug)->toBe('original');
});
