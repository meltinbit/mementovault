<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\ApiToken;
use App\Models\Asset;
use App\Models\Collection;
use App\Models\Document;
use App\Models\Skill;
use App\Models\Snippet;
use App\Models\SystemDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('dashboard', [
            'onboardingChecklist' => [
                'identity' => SystemDocument::where('type', 'identity')
                    ->where('content', '!=', '')
                    ->whereRaw("content NOT LIKE '%[%]%'")
                    ->exists(),
                'instructions' => SystemDocument::where('type', 'instructions')
                    ->where('content', '!=', '')
                    ->whereRaw("content NOT LIKE '%[%]%'")
                    ->exists(),
                'hasStorage' => ! empty(current_workspace()?->settings['storage']['key']),
                'hasCollection' => Collection::exists(),
                'hasToken' => ApiToken::exists(),
            ],
            'hideOnboarding' => current_workspace()?->settings['hide_onboarding'] ?? false,
            'stats' => Inertia::defer(fn () => [
                'documents' => Document::count(),
                'skills' => Skill::count(),
                'snippets' => Snippet::count(),
                'assets' => Asset::count(),
                'collections' => Collection::count(),
            ]),
            'recentActivity' => Inertia::defer(fn () => ActivityLog::with('user')
                ->latest('created_at')
                ->limit(10)
                ->get()
                ->map(fn (ActivityLog $log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'subject_type' => class_basename($log->subject_type),
                    'subject_id' => $log->subject_id,
                    'description' => $log->description,
                    'created_at' => $log->created_at->diffForHumans(),
                    'user' => $log->user ? ['name' => $log->user->name] : null,
                ])),
        ]);
    }
}
