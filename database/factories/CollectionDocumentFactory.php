<?php

namespace Database\Factories;

use App\Models\Collection;
use Illuminate\Database\Eloquent\Factories\Factory;

class CollectionDocumentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'collection_id' => Collection::factory(),
            'name' => fake()->words(2, true),
            'content' => fake()->paragraphs(2, true),
            'sort_order' => 0,
            'is_required' => false,
            'version' => 1,
        ];
    }

    public function required(): static
    {
        return $this->state(['is_required' => true]);
    }
}
