import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Feather } from '@phosphor-icons/react';
import type { Auth } from '@/types';

export function LandingNav() {
    const { auth } = usePage<{ auth?: Auth }>().props;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md transition-all">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d88f6d] text-white shadow-sm ring-1 ring-black/5">
                        <Feather size={20} weight="duotone" className="text-white" />
                    </div>
                    <span className="font-serif text-2xl font-medium tracking-tight text-foreground">
                        paper<span className="text-[#d88f6d]">Forge</span>
                    </span>
                </Link>

                {/* Center Nav */}
                <nav className="hidden items-center gap-8 md:flex">
                    <a
                        href="#features"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Features
                    </a>
                    <a
                        href="#pricing"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Pricing
                    </a>
                    <a
                        href="#craft"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        The Craft
                    </a>
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {auth?.user ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background shadow transition-all hover:bg-foreground/90"
                        >
                            <span>Dashboard</span>
                            <ArrowRight size={15} weight="bold" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#d88f6d] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#c47b59] active:scale-[0.98]"
                            >
                                <span>Get Started</span>
                                <ArrowRight size={15} weight="bold" />
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
