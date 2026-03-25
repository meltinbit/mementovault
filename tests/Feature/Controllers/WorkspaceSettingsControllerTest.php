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
