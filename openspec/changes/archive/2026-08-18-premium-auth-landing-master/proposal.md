# Proposal: Master Implementation - Premium Frontend, Auth SSO & Landing Page

## Why
Paperforge requires a production-ready, editorial public landing page, robust OAuth social authentication (Google & GitHub), and a premium split-layout authentication experience aligned with "The Academic Craftsman" brand identity. Additionally, a critical context hierarchy flaw in the root `app.tsx` (`withApp` wrapping with `usePage` outside `PageContext.Provider`) causing a crash loop on `localhost:8000` must be architecturally fixed by delegating Framer Motion page transitions to Layout components.

## What Changes
- **Core Architectural Fix**: Remove `PageTransitionWrapper` from `withApp` in `resources/js/app.tsx` and integrate route transitions cleanly within layout components (`AppLayout`, `AuthLayout`).
- **Social Authentication Backend**: Add `social_accounts` database table, `SocialAccount` model, `User::socialAccounts()` relationship, `SocialAuthController` with Google/GitHub OAuth redirect and callback handling, and full feature test coverage.
- **Landing Page Backend**: Create `Feature` and `PricingTier` models, migrations, seeders with editorial craftsman content, and `LandingController@index` serving public visitors at `/`.
- **Landing Page Frontend**: Build `resources/js/pages/Landing/Index.tsx` with modular sections (`LandingNav`, `HeroSection`, `ValueProposition`, `PricingPanel`, `Footer`) utilizing *Instrument Serif*, *DM Sans*, Phosphor duotone icons, and Framer Motion entrance animations.
- **Premium Auth UI Redesign**: Modernize `auth-simple-layout.tsx` into a 50/50 split-panel layout with an editorial brand rail, create reusable `SocialAuthButtons`, and update all Fortify auth views (`login`, `register`, `forgot-password`, etc.).

## Capabilities

### New Capabilities
- `inertia-page-transitions`: Safe Framer Motion page transitions encapsulated inside layout components where Inertia's `PageContext` is fully mounted.
- `social-auth`: OAuth authentication integration supporting Google and GitHub via Laravel Socialite with verified email linking and user creation.
- `landing-page`: Public-facing showcase presenting Paperforge's value propositions, pricing tiers, and quick onboarding paths.
- `auth-ui-redesign`: Editorial split-layout authentication interface with branding rail, social SSO buttons, and refined typography.

### Modified Capabilities
<!-- No requirement changes to existing compiler or workspace capabilities -->

## Impact
- **Backend**: New migrations for `social_accounts`, `features`, and `pricing_tiers`. New controllers `SocialAuthController` and `LandingController`. Route `/` redirected from project list to public landing.
- **Frontend**: `app.tsx` root cleanup, new landing components, refactored auth layout, updated login/register views.
- **Dependencies**: `laravel/socialite`, `framer-motion`, `@phosphor-icons/react`, `@fontsource/instrument-serif`, `@fontsource/dm-sans`.
