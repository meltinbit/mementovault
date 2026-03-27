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

test('server instructions include core guidelines', function () {
    $instructions = getServerInstructions();

    expect($instructions)->toContain('get_context');
    expect($instructions)->toContain('append');
});

test('server instructions append custom prompt when set', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'user_id' => $user->id,
        'settings' => ['mcp_custom_prompt' => 'Always respond in Italian.'],
    ]);
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    app()->instance('current_workspace', $workspace);
    app()->instance('mcp_collection', $collection);

    $instructions = getServerInstructions();

    expect($instructions)->toContain('get_context');
    expect($instructions)->toContain('Always respond in Italian.');
});

test('server instructions without custom prompt are minimal', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'user_id' => $user->id,
        'settings' => [],
    ]);
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    app()->instance('current_workspace', $workspace);
    app()->instance('mcp_collection', $collection);

    $instructions = getServerInstructions();

    expect(mb_strlen($instructions))->toBeLessThan(200);
});
