<?php

namespace App\Http\Middleware;

use App\Mcp\ActiveCollection;
use App\Models\ApiToken;
use App\Models\Collection;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class McpTokenMiddleware
{
    /**
     * Tools that act on a collection and accept an optional `collection` argument
     * to target it for that call only, without changing the active collection.
     */
    public const COLLECTION_SCOPED_TOOLS = [
        'collection_documents',
        'documents',
        'skills',
        'snippets',
        'assets',
        'search',
        'memory',
        'export_claude_md',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $plainToken = $request->bearerToken() ?? $request->query('token');

        if (! $plainToken) {
            return response()->json(['error' => 'Token required'], 401);
        }

        $tokenHash = hash('sha256', $plainToken);
        $apiToken = ApiToken::where('token_hash', $tokenHash)->first();

        if (! $apiToken) {
            return response()->json(['error' => 'Invalid token'], 401);
        }

        if ($apiToken->expires_at && $apiToken->expires_at->isPast()) {
            return response()->json(['error' => 'Token expired'], 401);
        }

        // Store the token instance for tools that need to update active_collection_id
        app()->instance('mcp_token', $apiToken);

        if ($apiToken->isWorkspaceToken()) {
            // Workspace token — bind workspace, optionally bind active collection
            $workspace = $apiToken->workspace;
            if (! $workspace) {
                return response()->json(['error' => 'Workspace not found'], 404);
            }

            app()->instance('current_workspace', $workspace);

            // Bind the collection this session selected (or the token's default)
            $collection = ActiveCollection::resolve($apiToken, $request->header('MCP-Session-Id'));
            if ($collection) {
                app()->instance('mcp_collection', $collection);
            }
        } else {
            // Collection token — existing behavior
            $collection = $apiToken->collection;
            if (! $collection) {
                return response()->json(['error' => 'Collection not found'], 404);
            }

            $workspace = $collection->workspace;
            if (! $workspace) {
                return response()->json(['error' => 'Workspace not found'], 404);
            }

            app()->instance('current_workspace', $workspace);
            app()->instance('mcp_collection', $collection);
        }

        $apiToken->update(['last_used_at' => now()]);

        if ($error = $this->bindRequestedCollection($request, $apiToken)) {
            return $error;
        }

        return $next($request);
    }

    /**
     * Honors the `collection` argument of a tools/call on a collection-scoped tool:
     * binds that collection for this request only. Returns a tool error response
     * when the collection can't be used, so nothing is written to the wrong one.
     */
    private function bindRequestedCollection(Request $request, ApiToken $apiToken): ?Response
    {
        if ($request->input('method') !== 'tools/call'
            || ! in_array($request->input('params.name'), self::COLLECTION_SCOPED_TOOLS, true)) {
            return null;
        }

        $slug = $request->input('params.arguments.collection');
        if (! is_string($slug) || $slug === '') {
            return null;
        }

        $workspace = app('current_workspace');
        $collection = Collection::where('workspace_id', $workspace->id)
            ->where('slug', $slug)
            ->first();

        if (! $collection) {
            return $this->toolError($request, "Collection '{$slug}' not found in this workspace.");
        }

        if (! $apiToken->isWorkspaceToken() && $collection->id !== $apiToken->collection_id) {
            return $this->toolError($request, 'This token can only access its own collection. Use a workspace token to work on other collections.');
        }

        app()->instance('mcp_collection', $collection);

        return null;
    }

    private function toolError(Request $request, string $message): Response
    {
        return response()->json([
            'jsonrpc' => '2.0',
            'id' => $request->input('id'),
            'result' => [
                'content' => [['type' => 'text', 'text' => $message]],
                'isError' => true,
            ],
        ]);
    }
}
