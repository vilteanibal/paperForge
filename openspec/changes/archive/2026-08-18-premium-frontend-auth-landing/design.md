## Context

Paperforge is a LaTeX editor SPA built on Laravel 13 + Inertia v3 + React 19 + Tailwind CSS v4. The backend engine (compiler, SyncTeX, file system) is mature. The frontend uses ShadCN/Radix UI components styled with generic oklch tokens and `Instrument Sans` (wrong font family). Authentication is handled by Laravel Fortify with 7 React page components using stock ShadCN styling. There is no landing page, no social auth, and no brand identity in the UI.

The Brand Identity System document defines a complete visual language: Instrument Serif for headings, DM Sans for UI, Terracotta/Parchment/Espresso color palette, and an editorial "Academic Craftsman" aesthetic.

**Current stack constraints:**
- Tailwind v4 uses CSS-first `@theme` directive (no `tailwind.config.js`)
- Inertia v3 `createInertiaApp` uses `withApp` callback and `layout` function
- Fortify manages all auth routes; views are registered in `FortifyServiceProvider`
- Components use `class-variance-authority` + `clsx` + `tailwind-merge` for styling
- Wayfinder generates typed route functions (`@/routes/*`, `@/actions/*`)

## Goals / Non-Goals

**Goals:**
- Establish the Paperforge Brand Identity as the sole visual language across all public surfaces
- Deliver an editorial-grade Landing Page that converts visitors to registered users
- Add Google and GitHub SSO with a clean `social_accounts` architecture
- Animate page transitions with Framer Motion without breaking Inertia's SPA behavior
- Make the design system extensible for future dashboard and editor theming

**Non-Goals:**
- Redesigning the editor workspace UI (covered by existing specs)
- Building a full CMS admin panel (only seeder-driven data for now)
- Implementing Stripe/payment integration for pricing tiers
- Adding more OAuth providers beyond Google and GitHub
- SSR configuration for the landing page
- Migrating existing ShadCN component internals (only re-skinning via tokens)

## Decisions

### D1: Token Bridge Strategy — Remap ShadCN variables to Paperforge values

**Decision:** Overwrite the `:root` and `.dark` CSS variable values in `app.css` with Paperforge hex values, keeping the ShadCN variable names (`--background`, `--primary`, `--accent`, etc.) intact.

**Rationale:** All ~20 ShadCN components (`Button`, `Input`, `Dialog`, `DropdownMenu`, etc.) reference these tokens. Remapping the values — rather than renaming the variables — re-skins every component instantly with zero code changes to `components/ui/`. The additional Paperforge-exclusive tokens (`--paper`, `--ui-rail`, `--shadow-paper`) are added as new CSS custom properties and registered in `@theme` for Tailwind utility access.

**Alternatives considered:**
- *Dual token system (ShadCN + Paperforge side-by-side):* Rejected — creates confusion about which token to use, and ShadCN components would remain generically styled.
- *Fork all ShadCN components:* Rejected — massive maintenance burden for a visual-only change.

**Mapping (Light Mode):**
| ShadCN Token | Paperforge Value | Source Token |
|---|---|---|
| `--background` | `#efedeb` | `--ui-bg` |
| `--foreground` | `#322f2c` | `--ui-ink` |
| `--primary` | `#bb6d4c` | `--ui-accent-deep` |
| `--primary-foreground` | `#fffaf6` | (white-warm) |
| `--secondary` | `#f3f0ed` | `--ui-surface-soft` |
| `--secondary-foreground` | `#322f2c` | `--ui-ink` |
| `--muted` | `#f3f0ed` | `--ui-surface-soft` |
| `--muted-foreground` | `#827c76` | `--ui-muted` |
| `--accent` | `#f3e1d8` | `--ui-accent-soft` |
| `--accent-foreground` | `#322f2c` | `--ui-ink` |
| `--destructive` | `#b95e48` | `--ui-red` |
| `--border` | `#d7d2cc` | `--ui-border` |
| `--input` | `#d7d2cc` | `--ui-border` |
| `--ring` | `#d88f6d` | `--ui-accent` |
| `--card` | `#f8f6f3` | `--ui-surface` |
| `--card-foreground` | `#322f2c` | `--ui-ink` |
| `--sidebar` | `#3f3d3b` | `--ui-rail` |
| `--sidebar-foreground` | `#e8e2dc` | `--ui-rail-text` |

### D2: Typography Installation via @fontsource

**Decision:** Install `@fontsource/instrument-serif` and `@fontsource/dm-sans` as npm packages and import them in `app.css`. Remove the Bunny Instrument Sans declaration from `vite.config.ts`.

**Rationale:** @fontsource provides self-hosted fonts with tree-shakeable weight imports, eliminating external CDN calls and ensuring font availability. Bunny Fonts is removed because it loads the wrong family (Instrument Sans ≠ Instrument Serif).

**Implementation:**
```css
/* app.css — top */
@import '@fontsource/instrument-serif';
@import '@fontsource/dm-sans/400.css';
@import '@fontsource/dm-sans/500.css';
@import '@fontsource/dm-sans/600.css';
@import '@fontsource/dm-sans/700.css';
```

The `@theme` block updates `--font-sans` to `"DM Sans"` and adds `--font-serif` as `"Instrument Serif"`.

### D3: Framer Motion + Inertia Integration

**Decision:** Inject `AnimatePresence` in `createInertiaApp`'s `withApp` callback. Each page component is wrapped in a `<motion.div>` by a new `PageTransition` layout wrapper. The `key` is derived from `usePage().url`.

**Rationale:** Inertia v3's `withApp` provides a single point to wrap the entire rendered app tree. `AnimatePresence` with `mode="wait"` ensures exit animations complete before enter animations start. Using `usePage().url` as key triggers re-animation on every navigation.

**Architecture:**
```
createInertiaApp({
  withApp(app) {
    return (
      <TooltipProvider>
        <PageTransitionWrapper>  ← NEW
          {app}
        </PageTransitionWrapper>
        <Toaster />
      </TooltipProvider>
    );
  }
})
```

Where `PageTransitionWrapper` is:
```tsx
function PageTransitionWrapper({ children }) {
  const { url } = usePage();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={url}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

**Risk mitigation:** If performance suffers on low-end devices, the transition can be simplified to CSS-only opacity or disabled entirely via `prefers-reduced-motion` media query.

### D4: Socialite Architecture — Separate social_accounts table

**Decision:** Create a `social_accounts` table with `(user_id, provider, provider_id)` and a unique constraint on `(provider, provider_id)`. One `SocialAuthController` handles redirect and callback for all providers.

**Rationale:** A separate table allows users to link multiple OAuth providers without polluting the `users` table. It also enables future features like "connected accounts" management in settings.

**Schema:**
```
social_accounts
├── id (bigint, PK)
├── user_id (bigint, FK → users.id, ON DELETE CASCADE)
├── provider (string, 50)
├── provider_id (string, 255)
├── created_at (timestamp)
└── updated_at (timestamp)
UNIQUE(provider, provider_id)
INDEX(user_id)
```

**Controller flow:**
```
GET /auth/{provider}/redirect → SocialAuthController@redirect
  → Socialite::driver($provider)->redirect()

GET /auth/{provider}/callback → SocialAuthController@callback
  → $socialUser = Socialite::driver($provider)->user()
  → Find SocialAccount by (provider, provider_id)
    → EXISTS: Auth::login(socialAccount->user)
    → NOT EXISTS + email match: Link + Auth::login
    → NOT EXISTS + no email match: Create User + SocialAccount + Auth::login
  → Redirect to /dashboard
```

**Validation:** The `{provider}` route parameter is validated via an inline `Rule::in(['google', 'github'])` or a route constraint. Invalid providers get 404.

### D5: Landing Page Data Architecture

**Decision:** Create `Feature` and `PricingTier` Eloquent models with migrations and seeders. `LandingController` queries these models and passes them as Inertia props.

**Rationale:** Seeder-driven data enables easy iteration during development and provides the model layer for a future admin CMS. The controller is thin — just queries and renders.

**Controller signature:**
```php
class LandingController extends Controller
{
    public function index(): \Inertia\Response
    {
        return Inertia::render('Landing/Index', [
            'features' => Feature::orderBy('sort_order')->get(),
            'pricingTiers' => PricingTier::orderBy('sort_order')->get(),
        ]);
    }
}
```

The route `/` changes from `ProjectController@index` (which requires auth) to `LandingController@index` (public). The authenticated dashboard remains at `/dashboard`.

### D6: Icon Migration Strategy — lucide-react → @phosphor-icons/react

**Decision:** Replace all `lucide-react` imports with equivalent `@phosphor-icons/react` imports across the entire codebase. Remove `lucide-react` from `package.json`.

**Rationale:** The Brand Identity System mandates Phosphor Icons (duotone variant for navigation, regular for interactive states). A full migration avoids shipping two icon libraries.

**Migration approach:**
1. Audit all files importing from `lucide-react` (grep)
2. Map each Lucide icon to its Phosphor equivalent (most have 1:1 matches)
3. Replace imports and JSX usage
4. Phosphor uses PascalCase with variant suffix: `<House weight="duotone" />`
5. Remove `lucide-react` from package.json, run `npm install`

### D7: Auth Layout — Split Panel Design

**Decision:** Redesign `auth-simple-layout.tsx` with a split-panel layout: left decorative panel (brand imagery, gradient), right form panel. Mobile collapses to single column with brand header.

**Rationale:** Split-panel auth is an industry-standard pattern for premium SaaS products. It provides visual real estate for brand storytelling while keeping the form focused and clean.

**Structure:**
```
┌──────────────────────────────────────────────────┐
│ Desktop                                          │
├───────────────────────┬──────────────────────────┤
│                       │                          │
│   BRAND PANEL         │   FORM PANEL             │
│                       │                          │
│   Isotipo (P circle)  │   Title (Inst. Serif)    │
│   Tagline             │   SSO Buttons            │
│   Abstract pattern    │   ─── or ───             │
│   bg: --ui-rail       │   Email/Password form    │
│                       │   Submit button          │
│                       │   bg: --ui-bg            │
│                       │                          │
└───────────────────────┴──────────────────────────┘

┌──────────────────────┐
│ Mobile               │
├──────────────────────┤
│ Isotipo + Wordmark   │
│ Title (Inst. Serif)  │
│ SSO Buttons          │
│ ─── or ───           │
│ Email/Password form  │
│ Submit button        │
└──────────────────────┘
```

## Risks / Trade-offs

- **[Icon migration scope]** → ~15 files need icon replacements. Not all Lucide icons have exact Phosphor matches. **Mitigation:** Create a mapping table during implementation; use closest semantic match.
- **[Framer Motion bundle size]** → framer-motion adds ~30KB gzipped. **Mitigation:** Tree-shake unused features; only import `motion` and `AnimatePresence`. Consider `motion/mini` if available.
- **[ShadCN token override fragility]** → Future ShadCN component additions may reference tokens we haven't mapped. **Mitigation:** Document the mapping table in the codebase; add a comment block in `app.css` noting the override strategy.
- **[Socialite env configuration]** → Google and GitHub OAuth require client IDs/secrets in `.env`. Development environments need these configured. **Mitigation:** Add `.env.example` entries and document setup in README.
- **[Route conflict]** → `/` currently points to `ProjectController@index` (the dashboard). Changing it to the landing page breaks authenticated user expectations. **Mitigation:** Authenticated users on `/` see the landing page with a "Go to Dashboard" CTA; the dashboard stays at `/dashboard`.
- **[Font loading FOUT]** → Self-hosted fonts may flash unstyled text. **Mitigation:** @fontsource loads fonts from local bundles (no network round-trip); add `font-display: swap` in CSS.

## Open Questions

- None remaining. All ambiguities were resolved in the explore phase. The user confirmed: social_accounts table, full Phosphor migration, .dark class, framer-motion (not motion), and seeder-driven CMS data.
