<?php

namespace App\Mcp;

use App\Models\ApiToken;
use App\Models\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * The collection a workspace token is working on, kept per MCP session so that
 * several clients sharing the same token (e.g. parallel Claude Code sessions)
 * don't switch each other's collection.
 *
 * The token's `active_collection_id` is the default for sessions that haven't
 * picked one yet, and the fallback for clients that don't send MCP-Session-Id.
 */
class ActiveCollection
{
    private const TTL_DAYS = 30;

    public static function resolve(ApiToken $token, ?string $sessionId): ?Collection
    {
        $key = self::cacheKey($token, $sessionId);
        $collectionId = $key ? Cache::get($key) : null;

        if (! $collectionId) {
            $collectionId = $token->active_collection_id;

            // Pin the session to the token's current collection, so a later
            // switch from another session doesn't move this one.
            if ($key && $collectionId) {
                Cache::put($key, $collectionId, now()->addDays(self::TTL_DAYS));
            }
        }

        if (! $collectionId) {
            return null;
        }

        $collection = Collection::find($collectionId);

        return $collection && $collection->workspace_id === $token->workspace_id ? $collection : null;
    }

    public static function set(ApiToken $token, ?string $sessionId, Collection $collection): void
    {
        if ($key = self::cacheKey($token, $sessionId)) {
            Cache::put($key, $collection->id, now()->addDays(self::TTL_DAYS));
        }

        // Also the default for new sessions and for clients without a session id.
        $token->update(['active_collection_id' => $collection->id]);
    }

    private static function cacheKey(ApiToken $token, ?string $sessionId): ?string
    {
        if (! $sessionId) {
            return null;
        }

        return 'mcp:active_collection:'.$token->id.':'.hash('sha256', $sessionId);
    }
}
