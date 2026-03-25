<?php

namespace Database\Factories;

use App\Models\Collection;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ApiTokenFactory extends Factory
{
    public function definition(): array
    {
        return [
            'collection_id' => Collection::factory(),
            'name' => 'default',
            'token_hash' => hash('sha256', 'cv_live_' . Str::random(32)),
            'last_used_at' => null,
            'expires_at' => null,
        ];
    }
}
