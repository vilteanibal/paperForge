# Technical Design: Master Frontend, Auth SSO & Landing Page Architecture

## Context
Paperforge requires a public landing page, social OAuth capabilities, and a brand-aligned auth interface. During foundation setup, wrapping `PageTransitionWrapper` in `app.tsx (withApp)` triggered a crash loop because `usePage()` ran outside Inertia's `PageContext.Provider`. This design establishes the context boundaries, data schemas, and UI layout patterns.

## Goals / Non-Goals

**Goals:**
- Resolve the crash loop by confining page transition animations to Layout components where `PageContext` exists.
- Implement robust social authentication for Google and GitHub with secure find-or-create logic.
- Deliver an editorial public landing page with interactive hero, value proposition, and pricing tiers.
- Deliver a 50/50 split-layout authentication experience aligned with "The Academic Craftsman" aesthetic.

**Non-Goals:**
- Custom billing/Stripe checkout execution (only landing pricing tiers UI and seeders).
- Socialite providers beyond Google and GitHub in this phase.

## Decisions

### Decision 1: Inertia v3 Transition Boundary
- **Choice**: Remove `PageTransitionWrapper` from `withApp` in `app.tsx`. Place transitions inside layout wrappers (`AppLayout`, `AuthLayout`).
- **Rationale**: `withApp` wraps `<App />` from the outside before `PageContext.Provider` mounts. Calling `usePage()` there returns `undefined`. Placing the wrapper inside layout components guarantees `PageContext` availability.
- **Alternatives Considered**: Creating an artificial context provider at the root was rejected as redundant and error-prone.

### Decision 2: Socialite OAuth Data Flow
- **Choice**: Dedicated `social_accounts` table (`user_id`, `provider`, `provider_id`) linked to `User`.
- **Rationale**: Keeps the core `users` table clean, supports multiple OAuth providers per user, and allows passwordless or password-backed accounts.

### Decision 3: Editorial Aesthetic Standards
- **Choice**: Enforce *Instrument Serif* for headlines, *DM Sans* for UI/body, and `--paper` (`#fffefa`) / `--ui-accent` (`#d88f6d`) / `--ui-rail` (`#3f3d3b`) brand tokens.
- **Rationale**: Satisfies the brand identity guidelines, providing an academic and artisanal feel distinct from generic SaaS designs.

### Decision 4: Split-Layout Authentication Experience
- **Choice**: `auth-simple-layout.tsx` refactored into a 50/50 split layout. Left: Brand Rail with terracotta isotipo and craftsman quote. Right: Form panel with `SocialAuthButtons` and email/password inputs.
- **Rationale**: Elevates perceived quality and brand presence immediately upon accessing authentication.

## Risks / Trade-offs

- **[Risk]**: OAuth callback email collisions if provider email is unverified.
  - **Mitigation**: Verify email presence before linking; only link existing users if email matches.
- **[Risk]**: Layout unmount transitions causing scroll jumping.
  - **Mitigation**: Use `mode="wait"` with subtle opacity transitions (`0.2s duration`).
