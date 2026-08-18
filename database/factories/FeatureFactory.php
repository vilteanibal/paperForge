<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Feature;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Feature>
 */
class FeatureFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'icon' => fake()->randomElement(['Lightning', 'Eye', 'ArrowsClockwise', 'Cpu', 'ShieldCheck', 'Books']),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }
}
