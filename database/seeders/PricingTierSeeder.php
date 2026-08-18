<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\PricingTier;
use Illuminate\Database\Seeder;

class PricingTierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tiers = [
            [
                'name' => 'Craftsman',
                'price' => 0.00,
                'billing_period' => 'forever',
                'features' => [
                    'Unlimited local projects',
                    'pdfLaTeX, XeLaTeX & LuaLaTeX engines',
                    'Bidirectional SyncTeX navigation',
                    'Visual & Code split-mode editing',
                    'Community support',
                ],
                'is_highlighted' => false,
                'cta_label' => 'Start Crafting Free',
                'sort_order' => 1,
            ],
            [
                'name' => 'Scholar Pro',
                'price' => 12.00,
                'billing_period' => 'monthly',
                'features' => [
                    'Everything in Craftsman',
                    'Cloud workspace backup & sync',
                    'Unlimited PDF compilation cache',
                    'Custom style (.sty) & class (.cls) templates',
                    'Priority developer support',
                ],
                'is_highlighted' => true,
                'cta_label' => 'Unlock Scholar Pro',
                'sort_order' => 2,
            ],
            [
                'name' => 'Academic Lab',
                'price' => 49.00,
                'billing_period' => 'monthly',
                'features' => [
                    'Everything in Scholar Pro',
                    'Multi-author collaborative workspaces',
                    'Institutional Git integration',
                    'Advanced audit logging & SSO enforcement',
                    'Dedicated SLA support',
                ],
                'is_highlighted' => false,
                'cta_label' => 'Deploy for Lab',
                'sort_order' => 3,
            ],
        ];

        foreach ($tiers as $tier) {
            PricingTier::updateOrCreate(['name' => $tier['name']], $tier);
        }
    }
}
