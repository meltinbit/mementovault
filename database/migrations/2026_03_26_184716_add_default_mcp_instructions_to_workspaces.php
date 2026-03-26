<?php

use App\Models\Workspace;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $defaultInstructions = Workspace::defaultMcpInstructions();

        Workspace::query()->each(function (Workspace $workspace) use ($defaultInstructions) {
            $settings = $workspace->settings ?? [];

            if (! isset($settings['mcp_instructions'])) {
                $settings['mcp_instructions'] = $defaultInstructions;
                $workspace->settings = $settings;
                $workspace->save();
            }
        });
    }

    public function down(): void
    {
        Workspace::query()->each(function (Workspace $workspace) {
            $settings = $workspace->settings ?? [];
            unset($settings['mcp_instructions']);
            $workspace->settings = $settings ?: null;
            $workspace->save();
        });
    }
};
