<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class McpTokenMiddleware
{
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

            // If a collection was previously selected, bind it
            if ($apiToken->active_collection_id) {
                $collection = $apiToken->activeCollection;
                if ($collection && $collection->workspace_id === $workspace->id) {
                    app()->instance('mcp_collection', $collection);
                }
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

        return $next($request);
    }
}
