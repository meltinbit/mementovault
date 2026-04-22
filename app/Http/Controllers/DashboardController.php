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
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('dashboard', [
            'onboardingChecklist' => [
                'hasToken' => ApiToken::exists(),
                'identity' => $this->isSystemDocumentPersonalized('identity'),
                'instructions' => $this->isSystemDocumentPersonalized('instructions'),
                'hasCollection' => Collection::where(function ($q) {
                    $q->whereHas('documents')
                        ->orWhereHas('skills')
                        ->orWhereHas('snippets')
                        ->orWhereHas('assets');
                })->exists(),
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

    public function hideOnboarding(Request $request): RedirectResponse
    {
        $workspace = current_workspace();
        $settings = $workspace->settings;
        $settings['hide_onboarding'] = true;
        $workspace->update(['settings' => $settings]);

        return back();
    }

    private function isSystemDocumentPersonalized(string $type): bool
    {
        $doc = SystemDocument::where('type', $type)->first();

        if (! $doc || empty(trim($doc->content))) {
            return false;
        }

        // Detect template placeholders like [Your name, role...] but not markdown links [text](url)
        if (preg_match('/\[[A-Z][^\]]{3,}\]/', $doc->content)) {
            return false;
        }

        return true;
    }
}
