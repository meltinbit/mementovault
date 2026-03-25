<?php

namespace App\Http\Controllers;

use App\Models\ApiToken;
use App\Models\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CollectionTokenController extends Controller
{
    public function store(Request $request, Collection $collection): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $plainToken = 'cv_live_'.Str::random(32);

        $collection->apiTokens()->create([
            'name' => $validated['name'] ?? 'default',
            'token_hash' => hash('sha256', $plainToken),
        ]);

        return back()->with('newToken', $plainToken);
    }

    public function destroy(Collection $collection, ApiToken $token): RedirectResponse
    {
        if ($token->collection_id !== $collection->id) {
            abort(404);
        }

        $token->delete();

        return back();
    }
}
