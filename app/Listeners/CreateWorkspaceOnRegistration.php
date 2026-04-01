<?php

namespace App\Listeners;

use App\Enums\SystemDocumentType;
use App\Models\SystemDocument;
use App\Models\Workspace;
use App\Services\WorkspaceTemplateService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Str;

class CreateWorkspaceOnRegistration
{
    public function __construct(
        private WorkspaceTemplateService $templateService,
    ) {}

    public function handle(Registered $event): void
    {
        $user = $event->user;

        $settings = [
            'mcp_instructions' => Workspace::defaultMcpInstructions(),
        ];

        if (config('services.minio.default_storage')) {
            $settings['storage'] = config('services.minio.default_storage');
        }

        $workspace = Workspace::create([
            'user_id' => $user->id,
            'name' => $user->name."'s Workspace",
            'slug' => Str::slug($user->name.' '.Str::random(4)),
            'description' => null,
            'settings' => $settings,
        ]);

        $template = $this->templateService->getTemplate('custom');

        foreach (SystemDocumentType::CORE as $type) {
            SystemDocument::withoutGlobalScopes()->create([
                'workspace_id' => $workspace->id,
                'type' => $type,
                'content' => $template[$type]['content'] ?? '',
                'version' => 1,
            ]);
        }
    }
}
