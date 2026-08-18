import { GithubLogo, GoogleLogo } from '@phosphor-icons/react';

export function SocialAuthButtons() {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <a
                    href="/auth/google/redirect"
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border/80 bg-card px-3 text-xs font-medium text-foreground shadow-xs transition-all hover:bg-accent/40 hover:border-border active:scale-[0.99]"
                >
                    <GoogleLogo size={16} weight="bold" className="text-[#EA4335]" />
                    <span>Google</span>
                </a>
                <a
                    href="/auth/github/redirect"
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border/80 bg-card px-3 text-xs font-medium text-foreground shadow-xs transition-all hover:bg-accent/40 hover:border-border active:scale-[0.99]"
                >
                    <GithubLogo size={16} weight="fill" className="text-foreground" />
                    <span>GitHub</span>
                </a>
            </div>

            <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-border/60" />
                <span className="absolute bg-background px-3 font-sans text-xs uppercase tracking-wider text-muted-foreground">
                    Or continue with email
                </span>
            </div>
        </div>
    );
}
