<?php

use App\Models\Asset;
use App\Models\Collection;
use App\Models\Document;
use App\Models\Skill;
use App\Models\Snippet;
use App\Models\SystemDocument;
use App\Models\Tag;
use App\Models\User;
use App\Models\Workspace;

test('workspace belongs to a user', function () {
    $workspace = Workspace::factory()->create();

    expect($workspace->user)->toBeInstanceOf(User::class);
});

test('user has one workspace', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    expect($user->workspace->id)->toBe($workspace->id);
});

test('workspace has many system documents', function () {
    $workspace = Workspace::factory()->create();
    SystemDocument::withoutGlobalScopes()->create([
        'workspace_id' => $workspace->id,
        'type' => 'identity',
        'content' => 'test',
    ]);

    expect($workspace->systemDocuments()->withoutGlobalScopes()->count())->toBe(1);
});

test('workspace has many collections', function () {
    $workspace = Workspace::factory()->create();
    Collection::withoutGlobalScopes()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Test Collection',
        'slug' => 'test-collection',
    ]);

    expect($workspace->collections()->withoutGlobalScopes()->count())->toBe(1);
});

test('workspace has many documents', function () {
    $workspace = Workspace::factory()->create();
    Document::withoutGlobalScopes()->create([
        'workspace_id' => $workspace->id,
        'title' => 'Test Doc',
        'slug' => 'test-doc',
        'content' => 'content',
    ]);

    expect($workspace->documents()->withoutGlobalScopes()->count())->toBe(1);
});

test('workspace has many skills', function () {
    $workspace = Workspace::factory()->create();
    Skill::withoutGlobalScopes()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Test Skill',
        'slug' => 'test-skill',
        'description' => 'A test skill',
        'content' => 'content',
    ]);

    expect($workspace->skills()->withoutGlobalScopes()->count())->toBe(1);
});

test('workspace has many snippets', function () {
    $workspace = Workspace::factory()->create();
    Snippet::withoutGlobalScopes()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Test Snippet',
        'slug' => 'test-snippet',
        'content' => 'content',
    ]);

    expect($workspace->snippets()->withoutGlobalScopes()->count())->toBe(1);
});

test('workspace has many assets', function () {
    $workspace = Workspace::factory()->create();
    Asset::withoutGlobalScopes()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Test Asset',
        'original_filename' => 'test.txt',
        'storage_path' => '/test/path',
        'mime_type' => 'text/plain',
        'size_bytes' => 100,
    ]);

    expect($workspace->assets()->withoutGlobalScopes()->count())->toBe(1);
});

test('workspace has many tags', function () {
    $workspace = Workspace::factory()->create();
    Tag::withoutGlobalScopes()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Test Tag',
        'slug' => 'test-tag',
    ]);

    expect($workspace->tags()->withoutGlobalScopes()->count())->toBe(1);
});

test('workspace auto-generates slug from name', function () {
    $workspace = Workspace::factory()->create(['name' => 'My Test Workspace', 'slug' => null]);

    expect($workspace->slug)->toBe('my-test-workspace');
});
