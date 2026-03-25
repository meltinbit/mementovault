<?php

namespace Database\Factories;

use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AssetFactory extends Factory
{
    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'name' => fake()->words(2, true),
            'original_filename' => fake()->word() . '.pdf',
            'storage_path' => 'test/assets/' . Str::uuid() . '/file.pdf',
            'mime_type' => 'application/pdf',
            'size_bytes' => fake()->numberBetween(1024, 10485760),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
