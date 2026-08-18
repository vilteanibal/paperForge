import { Feather, Heart } from '@phosphor-icons/react';

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-card/40 py-12 text-center text-sm text-muted-foreground">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-[#d88f6d] text-white">
                        <Feather size={14} weight="duotone" />
                    </div>
                    <span className="font-serif text-lg font-medium text-foreground">
                        paper<span className="text-[#d88f6d]">Forge</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                        — The Academic Craftsman IDE
                    </span>
                </div>

                <p className="text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} paperForge. Handcrafted for researchers worldwide.
                </p>

                <div className="flex items-center gap-6 text-xs font-medium">
                    <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                    <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
                </div>
            </div>
        </footer>
    );
}
