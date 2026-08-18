import { Link } from '@inertiajs/react';
import { Check, Star } from '@phosphor-icons/react';
import type { LandingPricingTier } from '../types';

interface PricingPanelProps {
    pricingTiers: LandingPricingTier[];
}

export function PricingPanel({ pricingTiers }: PricingPanelProps) {
    return (
        <section id="pricing" className="relative border-t border-border/40 py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#d88f6d]">
                        Transparent Investment
                    </span>
                    <h2 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl md:text-5xl">
                        Simple plans for solo scholars and global labs.
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                        Start completely free with zero limits on your local disk. Upgrade whenever your research requires cloud sync and team collaboration.
                    </p>
                </div>

                {/* Cards Container */}
                <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-stretch">
                    {pricingTiers.map((tier) => {
                        const isHighlighted = tier.is_highlighted;
                        const priceNumber = Number(tier.price);

                        return (
                            <div
                                key={tier.id}
                                className={`relative flex flex-col justify-between rounded-2xl p-8 transition-all duration-300 ${
                                    isHighlighted
                                        ? 'border-2 border-[#d88f6d] bg-card shadow-xl ring-1 ring-[#d88f6d]/20 lg:-translate-y-2'
                                        : 'border border-border/70 bg-card/60 hover:border-border hover:bg-card/90 hover:shadow-md'
                                }`}
                            >
                                {isHighlighted && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-[#d88f6d] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-sm">
                                            <Star size={12} weight="fill" />
                                            <span>Most Popular</span>
                                        </span>
                                    </div>
                                )}

                                <div>
                                    <h3 className="font-sans text-xl font-bold text-foreground">
                                        {tier.name}
                                    </h3>
                                    <div className="mt-4 flex items-baseline gap-1">
                                        <span className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                                            ${priceNumber === 0 ? '0' : priceNumber.toFixed(0)}
                                        </span>
                                        <span className="text-sm font-medium text-muted-foreground">
                                            /{tier.billing_period === 'forever' ? 'forever' : 'mo'}
                                        </span>
                                    </div>

                                    {/* Features List */}
                                    <ul className="mt-8 space-y-3.5 text-sm text-muted-foreground">
                                        {Array.isArray(tier.features) &&
                                            tier.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#d88f6d]/15 text-[#d88f6d]">
                                                        <Check size={11} weight="bold" />
                                                    </div>
                                                    <span className="text-foreground/90">{feature}</span>
                                                </li>
                                            ))}
                                    </ul>
                                </div>

                                <div className="mt-8 pt-4">
                                    <Link
                                        href="/register"
                                        className={`inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium transition-all ${
                                            isHighlighted
                                                ? 'bg-[#d88f6d] text-white shadow-md hover:bg-[#c47b59] hover:shadow-lg active:scale-[0.98]'
                                                : 'border border-border bg-card text-foreground hover:bg-accent/40 active:scale-[0.98]'
                                        }`}
                                    >
                                        {tier.cta_label}
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
