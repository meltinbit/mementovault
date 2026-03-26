<?php

namespace Database\Factories;

use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

class MemoryEntryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'content' => fake()->sentence(),
            'category' => fake()->optional(0.5)->word(),
            'is_pinned' => false,
            'is_archived' => false,
        ];
    }

    public function pinned(): static
    {
        return $this->state(['is_pinned' => true]);
    }

    public function archived(): static
    {
        return $this->state(['is_archived' => true]);
    }
}
