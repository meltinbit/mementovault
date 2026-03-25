<?php

namespace Database\Factories;

use App\Models\SystemDocument;
use Illuminate\Database\Eloquent\Factories\Factory;

class SystemDocumentRevisionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'system_document_id' => SystemDocument::factory(),
            'content' => fake()->paragraphs(3, true),
            'version' => 1,
            'created_by' => fake()->randomElement(['user', 'mcp', null]),
        ];
    }
}
