<?php

use App\Mcp\Servers\ContextVaultServer;
use App\Models\Collection;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Mcp\Server\Contracts\Transport;

uses(RefreshDatabase::class);

function getServerInstructions(): string
{
    $transport = Mockery::mock(Transport::class);
    $server = new ContextVaultServer($transport);

    $boot = new ReflectionMethod($server, 'boot');
    $boot->invoke($server);

    $prop = new ReflectionProperty($server, 'instructions');

    return $prop->getValue($server);
}

test('server instructions are read from workspace settings', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'user_id' => $user->id,
        'settings' => ['mcp_instructions' => 'Custom base instructions here.'],
    ]);
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    app()->instance('current_workspace', $workspace);
    app()->instance('mcp_collection', $collection);

    $instructions = getServerInstructions();

    expect($instructions)->toBe('Custom base instructions here.');
});

test('server instructions use default when workspace has mcp_instructions set', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'user_id' => $user->id,
        'settings' => ['mcp_instructions' => Workspace::defaultMcpInstructions()],
    ]);
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    app()->instance('current_workspace', $workspace);
    app()->instance('mcp_collection', $collection);

    $instructions = getServerInstructions();

    expect($instructions)->toContain('CRITICAL');
    expect($instructions)->toContain('get_context');
});

test('server instructions append custom prompt when set', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'user_id' => $user->id,
        'settings' => [
            'mcp_instructions' => 'Base instructions.',
            'mcp_custom_prompt' => 'Always respond in Italian.',
        ],
    ]);
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    app()->instance('current_workspace', $workspace);
    app()->instance('mcp_collection', $collection);

    $instructions = getServerInstructions();

    expect($instructions)->toContain('Base instructions.');
    expect($instructions)->toContain('--- Additional Instructions ---');
    expect($instructions)->toContain('Always respond in Italian.');
});

test('server instructions do not include additional section when custom prompt is empty', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'user_id' => $user->id,
        'settings' => ['mcp_instructions' => 'Base only.'],
    ]);
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    app()->instance('current_workspace', $workspace);
    app()->instance('mcp_collection', $collection);

    $instructions = getServerInstructions();

    expect($instructions)->toBe('Base only.');
    expect($instructions)->not->toContain('Additional Instructions');
});

test('server instructions return empty string when no workspace is bound', function () {
    $instructions = getServerInstructions();

    expect($instructions)->toBe('');
});
