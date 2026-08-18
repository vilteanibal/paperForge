## Why

The core engine (compiler, editor, SyncTeX) is consolidated but the public-facing layer is still Laravel's default boilerplate. Visitors land on a generic Laravel 13 welcome page, authentication screens use stock ShadCN styling, there is no OAuth/SSO, and the Brand Identity System (Instrument Serif + Terracotta palette + editorial aesthetic) has zero presence in the frontend. This change replaces every public-facing surface with a premium, on-brand experience and adds social authentication.

## What Changes

- **Replace** the boilerplate `welcome.tsx` with a full editorial Landing Page (Hero, Value Proposition, Pricing) rendered via a dedicated `LandingController`.
- **Remap** the Tailwind v4 design tokens in `app.css` from generic ShadCN oklch neutrals to the Paperforge Brand Identity System hex values (`--paper`, `--ui-accent`, `--ui-rail`, etc.).
- **Install** Instrument Serif and DM Sans via `@fontsource` packages; remove the Bunny Instrument Sans font from vite config.
- **Replace** `lucide-react` with `@phosphor-icons/react` across all components.
- **Install** `framer-motion` and wire `AnimatePresence` into `createInertiaApp` for page-transition animations using `initialPage.url` as key.
- **Install** `laravel/socialite` and create a `social_accounts` table (provider, provider_id, user_id) for Google and GitHub OAuth.
- **Redesign** all 7 existing auth pages (login, register, forgot-password, reset-password, confirm-password, verify-email, two-factor-challenge) to match the Paperforge editorial aesthetic.
- **Inject** Landing page content (features, pricing tiers) from a `LandingController` using Eloquent models and seeders, ready for a future admin CMS.

## Capabilities

### New Capabilities
- `premium-identity-system`: Tailwind token remapping, typography installation (Instrument Serif + DM Sans), icon library migration (Phosphor Icons), and Framer Motion page-transition infrastructure.
- `social-auth`: Laravel Socialite integration with `social_accounts` table, OAuth controller, routes, and frontend SSO buttons for Google and GitHub.
- `landing-page`: Editorial Landing Page with Hero section, Value Proposition grid, and Pricing panels, powered by a `LandingController` that injects structured CMS-ready props.
- `premium-auth-ui`: Complete visual overhaul of all Fortify authentication views to match the Paperforge Brand Identity System.

### Modified Capabilities
<!-- No existing spec-level requirements are changing. The auth routes remain Fortify-managed; only the frontend presentation changes. -->

## Impact

- **Dependencies added**: `framer-motion`, `@phosphor-icons/react`, `@fontsource/instrument-serif`, `@fontsource/dm-sans` (npm); `laravel/socialite` (composer).
- **Dependencies removed**: `lucide-react` (npm).
- **Files replaced**: `resources/js/pages/welcome.tsx` → `resources/js/pages/Landing/Index.tsx`.
- **Files modified**: `resources/css/app.css`, `vite.config.ts`, `resources/js/app.tsx`, `resources/js/layouts/auth-layout.tsx`, `resources/js/layouts/auth/auth-simple-layout.tsx`, all 7 auth page components, every component importing from `lucide-react`.
- **Files created**: `database/migrations/*_create_social_accounts_table.php`, `app/Models/SocialAccount.php`, `app/Http/Controllers/Auth/SocialAuthController.php`, `routes/web.php` (modified), `app/Http/Controllers/LandingController.php`, `app/Models/Feature.php`, `app/Models/PricingTier.php`, seeder files, new Landing sub-components (`HeroSection`, `ValueProposition`, `PricingPanel`).
- **Database**: New `social_accounts` table; optional `features` and `pricing_tiers` tables for CMS data.
- **Breaking**: Icon imports across ~15 components change from `lucide-react` to `@phosphor-icons/react`. Visual appearance of all auth pages changes completely.
