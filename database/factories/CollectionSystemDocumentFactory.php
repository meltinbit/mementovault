<?php

namespace Database\Factories;

use App\Models\Collection;
use Illuminate\Database\Eloquent\Factories\Factory;

class CollectionSystemDocumentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'collection_id' => Collection::factory(),
            'type' => fake()->randomElement(['instructions', 'context', 'memory']),
            'content' => fake()->paragraphs(3, true),
            'version' => 1,
        ];
    }
}
