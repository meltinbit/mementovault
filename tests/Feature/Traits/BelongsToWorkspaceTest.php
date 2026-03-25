<?php

use App\Models\Document;
use App\Models\Workspace;

test('global scope filters by current workspace', function () {
    $workspace1 = Workspace::factory()->create();
    $workspace2 = Workspace::factory()->create();

    Document::withoutGlobalScopes()->create([
        'workspace_id' => $workspace1->id,
        'title' => 'Doc 1',
        'slug' => 'doc-1',
        'content' => 'content 1',
    ]);

    Document::withoutGlobalScopes()->create([
        'workspace_id' => $workspace2->id,
        'title' => 'Doc 2',
        'slug' => 'doc-2',
        'content' => 'content 2',
    ]);

    app()->instance('current_workspace', $workspace1);

    $documents = Document::all();

    expect($documents)->toHaveCount(1);
    expect($documents->first()->title)->toBe('Doc 1');
});

test('auto-sets workspace_id on creation when workspace is bound', function () {
    $workspace = Workspace::factory()->create();
    app()->instance('current_workspace', $workspace);

    $document = Document::create([
        'title' => 'Auto Workspace Doc',
        'slug' => 'auto-workspace-doc',
        'content' => 'content',
    ]);

    expect($document->workspace_id)->toBe($workspace->id);
});

test('cross-workspace isolation prevents accessing other workspace data', function () {
    $workspace1 = Workspace::factory()->create();
    $workspace2 = Workspace::factory()->create();

    Document::withoutGlobalScopes()->create([
        'workspace_id' => $workspace2->id,
        'title' => 'Secret Doc',
        'slug' => 'secret-doc',
        'content' => 'secret',
    ]);

    app()->instance('current_workspace', $workspace1);

    expect(Document::count())->toBe(0);
});
