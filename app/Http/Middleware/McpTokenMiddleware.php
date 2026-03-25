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

        $collection = $apiToken->collection;
        if (! $collection) {
            return response()->json(['error' => 'Collection not found'], 404);
        }

        $workspace = $collection->workspace;
        if (! $workspace) {
            return response()->json(['error' => 'Workspace not found'], 404);
        }

        // Bind workspace and collection to container for MCP tools
        app()->instance('current_workspace', $workspace);
        app()->instance('mcp_collection', $collection);

        // Update last used timestamp
        $apiToken->update(['last_used_at' => now()]);

        return $next($request);
    }
}
