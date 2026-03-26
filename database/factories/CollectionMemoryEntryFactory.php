<?php

namespace Database\Factories;

use App\Models\Collection;
use Illuminate\Database\Eloquent\Factories\Factory;

class CollectionMemoryEntryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'collection_id' => Collection::factory(),
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
