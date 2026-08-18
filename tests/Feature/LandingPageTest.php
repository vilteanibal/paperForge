<?php

declare(strict_types=1);

use App\Models\Feature;
use App\Models\PricingTier;
use Inertia\Testing\AssertableInertia as Assert;

test('landing page returns 200 and renders Landing/Index with features and pricing tiers', function () {
    Feature::factory()->create([
        'title' => 'Offline LaTeX IDE',
        'sort_order' => 1,
    ]);

    PricingTier::factory()->create([
        'name' => 'Scholar Free',
        'price' => 0.00,
        'billing_period' => 'forever',
        'features' => ['Unlimited local projects'],
        'is_highlighted' => false,
        'sort_order' => 1,
    ]);

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Landing/Index')
        ->has('features')
        ->has('pricingTiers')
    );
});
