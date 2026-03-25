<?php

use App\Models\User;
use App\Models\Workspace;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    Workspace::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user);

    $this->get('/dashboard')->assertOk();
});