## 1. Dependencies & Toolchain Setup

- [x] 1.1 Install npm packages: `framer-motion`, `@phosphor-icons/react`, `@fontsource/instrument-serif`, `@fontsource/dm-sans`
- [x] 1.2 Remove `lucide-react` from `package.json` and run `npm install`
- [x] 1.3 Install composer package: `laravel/socialite`
- [x] 1.4 Remove Bunny Instrument Sans font declaration from `vite.config.ts` (the `fonts` array in the `laravel()` plugin)
- [x] 1.5 Add `@fontsource` CSS imports to the top of `resources/css/app.css` (instrument-serif, dm-sans weights 400/500/600/700)
- [x] 1.6 Add Socialite env variables to `.env.example`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_REDIRECT_URI`
- [x] 1.7 Add Socialite service config entries in `config/services.php` for google and github drivers

## 2. Design System & Token Remapping

- [x] 2.1 Remap `:root` CSS variables in `resources/css/app.css` from oklch ShadCN defaults to Paperforge hex values (per design.md D1 mapping table)
- [x] 2.2 Remap `.dark` CSS variables in `resources/css/app.css` to Paperforge dark palette hex values
- [x] 2.3 Add Paperforge-exclusive CSS custom properties to `:root` and `.dark` blocks: `--paper`, `--paper-ink`, `--paper-muted`, `--paper-rule`, `--shadow-paper`, `--ui-accent`, `--ui-accent-deep`, `--ui-accent-soft`, `--ui-rail`, `--ui-rail-soft`, `--ui-rail-text`, `--ui-rail-muted`, `--ui-green`, `--ui-green-soft`, `--ui-amber`, `--ui-amber-soft`, `--ui-red`, `--ui-red-soft`
- [x] 2.4 Update `@theme` block: change `--font-sans` to `"DM Sans"`, add `--font-serif` as `"Instrument Serif"`, add `--font-mono` as `"JetBrains Mono"`, register `--color-paperforge-*` tokens and `--shadow-paper`/`--shadow-modal` custom box shadows
- [x] 2.5 Update `--radius` value to `0.3125rem` (5px) to match brand spec's rounded corner standard

## 3. Icon Migration (lucide-react → @phosphor-icons/react)

- [x] 3.1 Audit all files importing from `lucide-react` using `grep -rn "from 'lucide-react'" resources/js/`
- [x] 3.2 Create a Lucide→Phosphor icon mapping table (document in a scratch file for reference)
- [x] 3.3 Replace icon imports and JSX usage in `components/app-sidebar.tsx`
- [x] 3.4 Replace icon imports and JSX usage in `components/app-header.tsx`
- [x] 3.5 Replace icon imports and JSX usage in `components/nav-main.tsx`, `nav-footer.tsx`, `nav-user.tsx`
- [x] 3.6 Replace icon imports and JSX usage in `components/user-menu-content.tsx`
- [x] 3.7 Replace icon imports and JSX usage in all other components referencing lucide-react (breadcrumbs, heading, delete-user, passkey components, etc.)
- [x] 3.8 Replace icon imports in auth page components (login, register, forgot-password, etc.)
- [x] 3.9 Replace icon imports in settings page components
- [x] 3.10 Verify zero remaining `lucide-react` imports: `grep -rn "lucide-react" resources/js/` returns empty
- [x] 3.11 Run `npm run build` to confirm no broken imports

## 4. Framer Motion Page Transitions

- [x] 4.1 Create `resources/js/components/page-transition.tsx` with `AnimatePresence` + `motion.div` wrapper using `usePage().url` as key
- [x] 4.2 Update `resources/js/app.tsx`: import `PageTransitionWrapper`, wrap `{app}` inside it within the `withApp` callback
- [x] 4.3 Verify page transitions work by navigating between routes in dev mode

## 5. Social Authentication Backend

- [ ] 5.1 Create migration `create_social_accounts_table` with schema: id, user_id (FK → users ON DELETE CASCADE), provider (string 50), provider_id (string 255), timestamps, unique(provider, provider_id), index(user_id)
- [ ] 5.2 Run `php artisan migrate`
- [ ] 5.3 Create `app/Models/SocialAccount.php` Eloquent model with `belongsTo(User::class)` and `$fillable = ['user_id', 'provider', 'provider_id']`
- [ ] 5.4 Add `socialAccounts(): HasMany` relationship to `app/Models/User.php`
- [ ] 5.5 Create `app/Http/Controllers/Auth/SocialAuthController.php` with `redirect($provider)` and `callback($provider)` methods implementing the find-or-create flow from design.md D4
- [ ] 5.6 Add Socialite routes in `routes/web.php`: `GET /auth/{provider}/redirect` and `GET /auth/{provider}/callback` with provider validation constraint (`google|github`)
- [ ] 5.7 Write Feature test: `tests/Feature/Auth/SocialAuthTest.php` — test redirect to providers (mock Socialite), test callback creates user, test callback links existing user by email, test callback authenticates existing social account, test invalid provider returns 404
- [ ] 5.8 Run social auth tests: `php artisan test --compact --filter=SocialAuth`

## 6. Landing Page Backend

- [ ] 6.1 Create `Feature` model, migration, factory, and seeder (`php artisan make:model Feature -mfs --no-interaction`)
- [ ] 6.2 Define Feature migration columns: id, icon (string), title (string), description (text), sort_order (integer), timestamps
- [ ] 6.3 Create `PricingTier` model, migration, factory, and seeder (`php artisan make:model PricingTier -mfs --no-interaction`)
- [ ] 6.4 Define PricingTier migration columns: id, name (string), price (decimal 8,2), billing_period (string), features (json), is_highlighted (boolean default false), cta_label (string), sort_order (integer), timestamps
- [ ] 6.5 Run migrations: `php artisan migrate`
- [ ] 6.6 Implement `FeatureSeeder` with 4-6 editorial features (icons, titles, descriptions) representing Paperforge's value propositions
- [ ] 6.7 Implement `PricingTierSeeder` with 3 tiers (Free, Pro, Team) with realistic features JSON and one highlighted
- [ ] 6.8 Register seeders in `DatabaseSeeder` and run `php artisan db:seed`
- [ ] 6.9 Create `app/Http/Controllers/LandingController.php` with `index()` method rendering `Landing/Index` with features and pricingTiers props
- [ ] 6.10 Update `routes/web.php`: change `/` route from `ProjectController@index` to `LandingController@index` (public, no auth middleware)
- [ ] 6.11 Write Feature test: `tests/Feature/LandingPageTest.php` — test GET `/` returns 200 with Inertia component `Landing/Index` and correct props
- [ ] 6.12 Run landing tests: `php artisan test --compact --filter=LandingPage`

## 7. Landing Page Frontend

- [ ] 7.1 Delete `resources/js/pages/welcome.tsx`
- [ ] 7.2 Create `resources/js/pages/Landing/Index.tsx` — main landing page component with TypeScript props interface for features and pricingTiers
- [ ] 7.3 Create `resources/js/pages/Landing/components/LandingNav.tsx` — sticky frosted-glass navigation header with wordmark, auth links (Login/Register or Dashboard), Phosphor icons
- [ ] 7.4 Create `resources/js/pages/Landing/components/HeroSection.tsx` — Instrument Serif wordmark, tagline, primary CTA "Get Started", staggered Framer Motion entrance animation
- [ ] 7.5 Create `resources/js/pages/Landing/components/ValueProposition.tsx` — responsive grid of feature cards with Phosphor duotone icons
- [ ] 7.6 Create `resources/js/pages/Landing/components/PricingPanel.tsx` — pricing tier cards with highlighted "recommended" panel using --ui-accent-deep
- [ ] 7.7 Create `resources/js/pages/Landing/components/Footer.tsx` — minimal footer with copyright and links
- [ ] 7.8 Update `resources/js/app.tsx` layout function: add case for landing page (name === 'Landing/Index') returning null layout (page manages its own layout)
- [ ] 7.9 Run Wayfinder generation: `php artisan wayfinder:generate` to pick up new routes
- [ ] 7.10 Write Vitest test: `resources/js/pages/Landing/__tests__/HeroSection.test.tsx` — verify HeroSection renders title with Instrument Serif class
- [ ] 7.11 Run frontend tests: `npm run test`
- [ ] 7.12 Verify landing page renders in browser: `npm run dev` + visit localhost

## 8. Premium Auth UI Redesign

- [ ] 8.1 Redesign `resources/js/layouts/auth/auth-simple-layout.tsx` with split-panel layout: left brand panel (--ui-rail background, isotipo, tagline), right form panel (--ui-bg background), Framer Motion entrance for form panel, mobile collapse
- [ ] 8.2 Update `resources/js/components/app-logo-icon.tsx` to render the Paperforge isotipo (terracotta circle with 'P' in Instrument Serif)
- [ ] 8.3 Create `resources/js/components/social-auth-buttons.tsx` — reusable SSO buttons component ('Continue with Google', 'Continue with GitHub') with Phosphor icons and 'or continue with email' divider
- [ ] 8.4 Update `resources/js/pages/auth/login.tsx`: add title 'Welcome back' in Instrument Serif, integrate SocialAuthButtons above the form, style with brand tokens
- [ ] 8.5 Update `resources/js/pages/auth/register.tsx`: add title 'Create your account' in Instrument Serif, integrate SocialAuthButtons, brand-aligned styling
- [ ] 8.6 Update `resources/js/pages/auth/forgot-password.tsx`: Instrument Serif title, brand token styling
- [ ] 8.7 Update `resources/js/pages/auth/reset-password.tsx`: Instrument Serif title, brand token styling
- [ ] 8.8 Update `resources/js/pages/auth/confirm-password.tsx`: Instrument Serif title, brand token styling
- [ ] 8.9 Update `resources/js/pages/auth/verify-email.tsx`: Instrument Serif title, brand token styling
- [ ] 8.10 Update `resources/js/pages/auth/two-factor-challenge.tsx`: Instrument Serif title, brand token styling
- [ ] 8.11 Verify all auth pages render correctly in dev mode (login, register, forgot-password, reset-password, confirm-password, verify-email, two-factor-challenge)

## 9. Verification & Cleanup

- [ ] 9.1 Run full PHP test suite: `php artisan test --compact`
- [ ] 9.2 Run full frontend test suite: `npm run test`
- [ ] 9.3 Run TypeScript type check: `npm run types:check`
- [ ] 9.4 Run ESLint: `npm run lint`
- [ ] 9.5 Run Laravel Pint: `vendor/bin/pint --dirty --format agent`
- [ ] 9.6 Run production build: `npm run build` — verify no errors
- [ ] 9.7 Verify all auth flows work end-to-end in dev mode (manual smoke test of login, register, password reset)
- [ ] 9.8 Verify landing page sections render with correct brand styling (fonts, colors, shadows)
