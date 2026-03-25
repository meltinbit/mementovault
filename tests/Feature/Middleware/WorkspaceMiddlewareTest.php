<?php

use App\Models\User;
use App\Models\Workspace;

test('workspace middleware loads workspace into container', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk();

    expect(app()->bound('current_workspace'))->toBeTrue();
});

test('workspace middleware redirects when no workspace exists', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertRedirect('/');
});
