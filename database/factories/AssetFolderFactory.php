<?php

namespace Database\Factories;

use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssetFolderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'parent_id' => null,
            'name' => fake()->words(2, true),
            'sort_order' => 0,
        ];
    }
}
