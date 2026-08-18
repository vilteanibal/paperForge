<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\PricingTier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PricingTier>
 */
class PricingTierFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->word().' Plan',
            'price' => fake()->randomFloat(2, 0, 99),
            'billing_period' => 'monthly',
            'features' => ['Feature 1', 'Feature 2', 'Feature 3'],
            'is_highlighted' => false,
            'cta_label' => 'Get Started',
            'sort_order' => fake()->numberBetween(1, 5),
        ];
    }
}
