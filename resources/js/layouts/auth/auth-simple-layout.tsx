import { Link } from '@inertiajs/react';
import { Feather, Quotes } from '@phosphor-icons/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full flex-col lg:grid lg:grid-cols-2">
            {/* Left Brand Rail (Desktop Only) */}
            <div className="relative hidden flex-col justify-between bg-[#3f3d3b] p-12 text-white lg:flex">
                {/* Brand Top */}
                <Link href={home()} className="flex items-center gap-3 transition-opacity hover:opacity-90">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d88f6d] text-white shadow-md">
                        <Feather size={22} weight="duotone" />
                    </div>
                    <span className="font-serif text-3xl font-medium tracking-tight text-white">
                        paper<span className="text-[#d88f6d]">Forge</span>
                    </span>
                </Link>

                {/* Center Inspirational Quote */}
                <div className="relative max-w-md space-y-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-[#d88f6d] backdrop-blur-sm">
                        <Quotes size={24} weight="fill" />
                    </div>
                    <blockquote className="font-serif text-2xl font-normal leading-relaxed text-zinc-100 italic">
                        &ldquo;Typography is to literature what choreography is to dance. It gives form, elegance, and immortality to scientific thought.&rdquo;
                    </blockquote>
                    <p className="font-sans text-xs uppercase tracking-widest text-[#d88f6d] font-semibold">
                        The Academic Craftsman Manifesto
                    </p>
                </div>

                {/* Footer note */}
                <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Local-First Zero Latency LaTeX</span>
                    <span>v2.0 Craftsman</span>
                </div>
            </div>

            {/* Right Form Container */}
            <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-12">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Brand Header */}
                    <div className="flex flex-col items-center text-center lg:hidden">
                        <Link href={home()} className="flex items-center gap-2">
                            <AppLogoIcon className="h-10 w-10" />
                            <span className="font-serif text-2xl font-semibold text-foreground">
                                paper<span className="text-[#d88f6d]">Forge</span>
                            </span>
                        </Link>
                    </div>

                    {/* Page Title & Description */}
                    <div className="space-y-2 text-center lg:text-left">
                        {title && (
                            <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                                {title}
                            </h1>
                        )}
                        {description && (
                            <p className="font-sans text-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Form Component Body */}
                    <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs sm:p-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
