import {
    ArrowsClockwise,
    Books,
    Cpu,
    Eye,
    Lightning,
    ShieldCheck,
    Sparkle,
} from '@phosphor-icons/react';
import type { LandingFeature } from '../types';

interface ValuePropositionProps {
    features: LandingFeature[];
}

const iconMap: Record<string, React.ElementType> = {
    Lightning,
    Eye,
    ArrowsClockwise,
    Cpu,
    ShieldCheck,
    Books,
};

export function ValueProposition({ features }: ValuePropositionProps) {
    return (
        <section id="features" className="relative border-t border-border/40 py-20 md:py-28 bg-card/20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#d88f6d]">
                        Built For Precision
                    </span>
                    <h2 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl md:text-5xl">
                        Engineered for the demands of rigorous scholarship.
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                        Every tool, shortcut, and compiler optimization was crafted to give researchers total focus and zero friction.
                    </p>
                </div>

                {/* Grid */}
                <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => {
                        const IconComponent = iconMap[feature.icon] ?? Sparkle;

                        return (
                            <div
                                key={feature.id}
                                className="group relative rounded-2xl border border-border/60 bg-card/60 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#d88f6d]/50 hover:bg-card/90 hover:shadow-lg"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d88f6d]/10 text-[#d88f6d] transition-colors group-hover:bg-[#d88f6d] group-hover:text-white">
                                    <IconComponent size={26} weight="duotone" />
                                </div>
                                <h3 className="mt-5 font-sans text-lg font-semibold text-foreground">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
