<?php

namespace Database\Seeders;

use App\Models\Collection;
use App\Models\CollectionDocument;
use App\Models\SystemDocument;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DockerSeeder extends Seeder
{
    public function run(): void
    {
        // Create demo user
        $user = User::create([
            'name' => 'Demo User',
            'email' => 'mementovault@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Create workspace with MinIO storage pre-configured
        $workspace = Workspace::create([
            'user_id' => $user->id,
            'name' => 'Demo Workspace',
            'slug' => 'demo',
            'onboarded_at' => now(),
            'settings' => [
                'mcp_instructions' => Workspace::defaultMcpInstructions(),
                'storage' => [
                    'driver' => 's3',
                    'key' => 'mementovault',
                    'secret' => 'mementovault',
                    'region' => 'us-east-1',
                    'bucket' => 'mementovault',
                    'endpoint' => 'http://minio:9000',
                    'url' => 'http://localhost:9000/mementovault',
                    'use_path_style_endpoint' => true,
                ],
            ],
        ]);

        // Create core workspace documents
        SystemDocument::withoutGlobalScopes()->create([
            'workspace_id' => $workspace->id,
            'type' => 'identity',
            'content' => "# Identity\n\nThis is a demo workspace. Edit this to describe who you are.",
            'version' => 1,
        ]);

        SystemDocument::withoutGlobalScopes()->create([
            'workspace_id' => $workspace->id,
            'type' => 'instructions',
            'content' => "# Instructions\n\nDefine how AI should work with you — language, tone, conventions.",
            'version' => 1,
        ]);

        // Create a sample collection
        $collection = Collection::withoutGlobalScopes()->create([
            'workspace_id' => $workspace->id,
            'name' => 'Getting Started',
            'slug' => 'getting-started',
            'description' => 'A sample collection to explore how Memento Vault works.',
            'type' => 'custom',
            'color' => '#6366f1',
            'is_active' => true,
        ]);

        CollectionDocument::create([
            'collection_id' => $collection->id,
            'name' => 'Instructions',
            'slug' => 'instructions',
            'content' => "# Collection Instructions\n\nThis is a sample collection. Edit these instructions or create new documents.",
            'sort_order' => 0,
            'is_required' => true,
        ]);
    }
}
