<?php

namespace App\Http\Controllers;

use App\Models\ApiToken;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WorkspaceTokenController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $workspace = current_workspace();
        $plainToken = 'cv_ws_'.Str::random(32);

        $workspace->apiTokens()->create([
            'name' => $validated['name'] ?? 'default',
            'token_hash' => hash('sha256', $plainToken),
        ]);

        return back()->with('newWorkspaceToken', $plainToken);
    }

    public function destroy(ApiToken $token): RedirectResponse
    {
        $workspace = current_workspace();

        if ($token->workspace_id !== $workspace->id) {
            abort(404);
        }

        $token->delete();

        return back();
    }
}
