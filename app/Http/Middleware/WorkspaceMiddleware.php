<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class WorkspaceMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        $workspace = $user->workspace;

        if (! $workspace) {
            return redirect()->route('home');
        }

        app()->instance('current_workspace', $workspace);

        return $next($request);
    }
}
