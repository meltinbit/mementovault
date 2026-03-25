<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class WorkspaceFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'user_id' => User::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'settings' => null,
            'onboarded_at' => now(),
        ];
    }
}
