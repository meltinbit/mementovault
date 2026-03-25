<?php

use App\Models\User;
use App\Models\Workspace;

test('guests are redirected to login from dashboard', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    Workspace::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk();
});

test('dashboard renders the dashboard component', function () {
    $user = User::factory()->create();
    Workspace::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard'));
});
