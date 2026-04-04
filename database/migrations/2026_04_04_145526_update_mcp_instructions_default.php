<?php

use App\Models\Workspace;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $defaultInstructions = Workspace::defaultMcpInstructions();

        foreach (Workspace::all() as $workspace) {
            $settings = $workspace->settings ?? [];
            $settings['mcp_instructions'] = $defaultInstructions;
            $workspace->update(['settings' => $settings]);
        }
    }

    public function down(): void
    {
        // Keep current instructions — no destructive rollback
    }
};
