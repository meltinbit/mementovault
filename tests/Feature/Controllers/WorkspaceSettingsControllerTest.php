<?php

use App\Models\User;
use App\Models\Workspace;

test('can view workspace settings page', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get('/settings/workspace')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/workspace')
            ->has('workspace')
        );
});

test('can update workspace name and description', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->put('/settings/workspace', [
            'name' => 'New Workspace Name',
            'description' => 'New description',
        ])
        ->assertRedirect(route('workspace.settings'));

    $workspace->refresh();
    expect($workspace->name)->toBe('New Workspace Name');
    expect($workspace->description)->toBe('New description');
});

test('validation rejects empty name', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->put('/settings/workspace', [
            'name' => '',
            'description' => 'some desc',
        ])
        ->assertSessionHasErrors('name');
});

test('slug does not change when name changes', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'user_id' => $user->id,
        'name' => 'Original Name',
        'slug' => 'original-name',
    ]);

    $this->actingAs($user)
        ->put('/settings/workspace', [
            'name' => 'Completely Different Name',
        ]);

    $workspace->refresh();
    expect($workspace->slug)->toBe('original-name');
});

test('guests cannot access workspace settings', function () {
    $this->get('/settings/workspace')->assertRedirect('/login');
});

test('settings page includes mcp custom prompt', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'user_id' => $user->id,
        'settings' => ['mcp_custom_prompt' => 'Respond in Italian.'],
    ]);

    $this->actingAs($user)
        ->get('/settings/workspace')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/workspace')
            ->where('mcpCustomPrompt', 'Respond in Italian.')
        );
});

test('can save mcp custom prompt', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->put('/settings/workspace', [
            'name' => $workspace->name,
            'mcp_custom_prompt' => 'Always be concise.',
        ])
        ->assertRedirect(route('workspace.settings'));

    $workspace->refresh();
    expect($workspace->settings['mcp_custom_prompt'])->toBe('Always be concise.');
});

test('clearing mcp custom prompt removes it from settings', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'user_id' => $user->id,
        'settings' => ['mcp_custom_prompt' => 'Old prompt'],
    ]);

    $this->actingAs($user)
        ->put('/settings/workspace', [
            'name' => $workspace->name,
            'mcp_custom_prompt' => '',
        ])
        ->assertRedirect(route('workspace.settings'));

    $workspace->refresh();
    expect($workspace->settings)->toBeNull();
});

test('mcp custom prompt validation rejects over 2000 characters', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->put('/settings/workspace', [
            'name' => $workspace->name,
            'mcp_custom_prompt' => str_repeat('a', 2001),
        ])
        ->assertSessionHasErrors('mcp_custom_prompt');
});

test('settings page includes mcp instructions', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'user_id' => $user->id,
        'settings' => ['mcp_instructions' => 'My custom instructions.'],
    ]);

    $this->actingAs($user)
        ->get('/settings/workspace')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/workspace')
            ->where('mcpInstructions', 'My custom instructions.')
        );
});

test('can save mcp instructions', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->put('/settings/workspace', [
            'name' => $workspace->name,
            'mcp_instructions' => 'New base instructions.',
        ])
        ->assertRedirect(route('workspace.settings'));

    $workspace->refresh();
    expect($workspace->settings['mcp_instructions'])->toBe('New base instructions.');
});

test('mcp instructions validation rejects over 5000 characters', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->put('/settings/workspace', [
            'name' => $workspace->name,
            'mcp_instructions' => str_repeat('a', 5001),
        ])
        ->assertSessionHasErrors('mcp_instructions');
});
