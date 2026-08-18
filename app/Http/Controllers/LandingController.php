<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Feature;
use App\Models\PricingTier;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    /**
     * Display the public landing page.
     */
    public function index(): Response
    {
        $features = Feature::orderBy('sort_order')->get();
        $pricingTiers = PricingTier::orderBy('sort_order')->get();

        return Inertia::render('Landing/Index', [
            'features' => $features,
            'pricingTiers' => $pricingTiers,
        ]);
    }
}
