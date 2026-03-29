<?php

namespace App\Http\Controllers;

use App\Models\SystemDocument;
use App\Services\WorkspaceTemplateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function __construct(
        private WorkspaceTemplateService $templateService,
    ) {}

    public function show(Request $request): Response
    {
        $workspace = $request->user()->workspace;

        if ($workspace->onboarded_at) {
            return Inertia::render('dashboard');
        }

        return Inertia::render('onboarding/index', [
            'templates' => $this->templateService->availableTemplates(),
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'template' => ['required', 'string', 'in:developer,marketer,consultant,agency,custom'],
            'identity_content' => ['nullable', 'string', 'max:65535'],
        ]);

        $workspace = $request->user()->workspace;
        $template = $this->templateService->getTemplate($validated['template']);

        // Update core workspace documents with template content
        foreach (['identity', 'instructions'] as $type) {
            $content = $type === 'identity' && $validated['identity_content']
                ? $validated['identity_content']
                : ($template[$type]['content'] ?? '');

            SystemDocument::withoutGlobalScopes()
                ->where('workspace_id', $workspace->id)
                ->where('type', $type)
                ->update(['content' => $content]);
        }

        $workspace->update(['onboarded_at' => now()]);

        return to_route('dashboard');
    }
}
