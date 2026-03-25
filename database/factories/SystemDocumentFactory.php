<?php

namespace Database\Factories;

use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

class SystemDocumentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'type' => fake()->randomElement(['identity', 'instructions', 'context', 'memory']),
            'content' => fake()->paragraphs(3, true),
            'version' => 1,
        ];
    }

    public function identity(): static
    {
        return $this->state(fn () => ['type' => 'identity']);
    }

    public function instructions(): static
    {
        return $this->state(fn () => ['type' => 'instructions']);
    }

    public function context(): static
    {
        return $this->state(fn () => ['type' => 'context']);
    }

    public function memory(): static
    {
        return $this->state(fn () => ['type' => 'memory']);
    }
}
