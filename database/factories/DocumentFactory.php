<?php

namespace Database\Factories;

use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class DocumentFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->sentence(3);

        return [
            'workspace_id' => Workspace::factory(),
            'title' => $title,
            'slug' => Str::slug($title),
            'content' => fake()->paragraphs(5, true),
            'type' => fake()->randomElement(['technical', 'copy', 'brand', 'process', 'general']),
            'is_active' => true,
            'version' => 1,
        ];
    }
}
