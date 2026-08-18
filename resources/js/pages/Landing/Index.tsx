import { Head } from '@inertiajs/react';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { LandingNav } from './components/LandingNav';
import { PricingPanel } from './components/PricingPanel';
import { ValueProposition } from './components/ValueProposition';
import type { LandingFeature, LandingPricingTier } from './types';

interface LandingIndexProps {
    features: LandingFeature[];
    pricingTiers: LandingPricingTier[];
}

export default function LandingIndex({
    features = [],
    pricingTiers = [],
}: LandingIndexProps) {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-[#d88f6d]/20 selection:text-[#d88f6d]">
            <Head title="The Academic Craftsman LaTeX IDE" />

            <LandingNav />

            <main>
                <HeroSection />
                <ValueProposition features={features} />
                <PricingPanel pricingTiers={pricingTiers} />
            </main>

            <Footer />
        </div>
    );
}

LandingIndex.layout = null;
