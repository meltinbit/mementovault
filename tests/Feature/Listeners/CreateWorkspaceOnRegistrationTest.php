<?php

use App\Models\SystemDocument;
use App\Models\User;

test('workspace is created on user registration', function () {
    $response = $this->post('/register', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $user = User::where('email', 'john@example.com')->first();

    expect($user->workspace)->not->toBeNull();
    expect($user->workspace->name)->toBe("John Doe's Workspace");
});

test('core system documents are created on registration', function () {
    $this->post('/register', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $user = User::where('email', 'jane@example.com')->first();
    $workspace = $user->workspace;

    $systemDocs = SystemDocument::withoutGlobalScopes()
        ->where('workspace_id', $workspace->id)
        ->get();

    expect($systemDocs)->toHaveCount(3);
    expect($systemDocs->pluck('type')->sort()->values()->all())
        ->toBe(['context', 'identity', 'instructions']);
});
