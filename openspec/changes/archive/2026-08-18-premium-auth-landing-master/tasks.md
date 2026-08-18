## 1. Architectural Core Fix & Layout Transitions

- [x] 1.1 Remove `PageTransitionWrapper` from `withApp` in `resources/js/app.tsx` so `withApp` only wraps root providers (`TooltipProvider`, `Toaster`)
- [x] 1.2 Encapsulate `PageTransitionWrapper` within `resources/js/layouts/app-layout.tsx` around `{children}`
- [x] 1.3 Encapsulate `PageTransitionWrapper` within `resources/js/layouts/auth-layout.tsx` around `{children}`
- [x] 1.4 Verify `http://localhost:8000` loads immediately without render-time exceptions or refresh loops

## 2. Social Authentication Backend

- [x] 2.1 Create migration `create_social_accounts_table` (`id`, `user_id` FK cascade, `provider` string 50, `provider_id` string 255, timestamps, unique `[provider, provider_id]`, index `user_id`)
- [x] 2.2 Run migration: `php artisan migrate --no-interaction`
- [x] 2.3 Create `App\Models\SocialAccount` model with `$fillable` and `belongsTo(User::class)`
- [x] 2.4 Add `socialAccounts(): HasMany` relationship to `App\Models\User`
- [x] 2.5 Create `App\Http\Controllers\Auth\SocialAuthController` with `redirect($provider)` and `callback($provider)` implementing secure find-or-create logic
- [x] 2.6 Register OAuth routes in `routes/web.php`: `GET /auth/{provider}/redirect` and `GET /auth/{provider}/callback` with `whereIn('provider', ['google', 'github'])`
- [x] 2.7 Create Pest feature test `tests/Feature/Auth/SocialAuthTest.php` testing redirects, callback user creation, email matching, and invalid provider 404
- [x] 2.8 Run Socialite tests: `php artisan test --compact --filter=SocialAuth`

## 3. Landing Page Backend

- [x] 3.1 Create `Feature` model, migration, factory, and seeder (`php artisan make:model Feature -mfs --no-interaction`)
- [x] 3.2 Define `features` table columns (`id`, `icon`, `title`, `description`, `sort_order`, timestamps)
- [x] 3.3 Create `PricingTier` model, migration, factory, and seeder (`php artisan make:model PricingTier -mfs --no-interaction`)
- [x] 3.4 Define `pricing_tiers` table columns (`id`, `name`, `price`, `billing_period`, `features` JSON, `is_highlighted` boolean, `cta_label`, `sort_order`, timestamps)
- [x] 3.5 Run migrations: `php artisan migrate --no-interaction`
- [x] 3.6 Populate `FeatureSeeder` with editorial craftsmanship features and `PricingTierSeeder` with Free, Pro, and Academic tiers
- [x] 3.7 Register seeders in `DatabaseSeeder` and run `php artisan db:seed --no-interaction`
- [x] 3.8 Create `App\Http\Controllers\LandingController` with `index()` returning `Landing/Index` with `features` and `pricingTiers`
- [x] 3.9 Update `routes/web.php`: assign public route `GET /` to `LandingController@index`
- [x] 3.10 Create Pest feature test `tests/Feature/LandingPageTest.php` and verify: `php artisan test --compact --filter=LandingPage`

## 4. Landing Page Frontend ("The Academic Craftsman")

- [x] 4.1 Delete legacy `resources/js/pages/welcome.tsx`
- [x] 4.2 Create `resources/js/pages/Landing/Index.tsx` with layout function returning `null` (self-contained layout)
- [x] 4.3 Create `resources/js/pages/Landing/components/LandingNav.tsx` with frosted glass styling, wordmark, and auth CTA links
- [x] 4.4 Create `resources/js/pages/Landing/components/HeroSection.tsx` with *Instrument Serif* heading and staggered Framer Motion entrance
- [x] 4.5 Create `resources/js/pages/Landing/components/ValueProposition.tsx` with responsive grid and Phosphor duotone icons
- [x] 4.6 Create `resources/js/pages/Landing/components/PricingPanel.tsx` with craftsman cards and highlighted tier using `--ui-accent-deep`
- [x] 4.7 Create `resources/js/pages/Landing/components/Footer.tsx` with editorial links and minimal design
- [x] 4.8 Update `resources/js/app.tsx` layout resolver to handle `Landing/Index`
- [x] 4.9 Run Wayfinder generation: `php artisan wayfinder:generate`
- [x] 4.10 Create Vitest test `resources/js/pages/Landing/__tests__/HeroSection.test.tsx` verifying typography hierarchy and CTA presence
- [x] 4.11 Run Vitest suite: `npm run test`

## 5. Premium Auth UI Redesign

- [x] 5.1 Redesign `resources/js/layouts/auth/auth-simple-layout.tsx` into a 50/50 split panel with Brand Rail (`--ui-rail`), terracotta isotipo, and quote
- [x] 5.2 Update `resources/js/components/app-logo-icon.tsx` to render the terracotta craftsman circle with 'P'
- [x] 5.3 Create `resources/js/components/social-auth-buttons.tsx` providing Google & GitHub SSO buttons with Phosphor icons and divider
- [x] 5.4 Update `resources/js/pages/auth/login.tsx` with *Instrument Serif* headline, `SocialAuthButtons`, and brand tokens
- [x] 5.5 Update `resources/js/pages/auth/register.tsx` with *Instrument Serif* headline, `SocialAuthButtons`, and brand tokens
- [x] 5.6 Refine styling on `forgot-password.tsx`, `reset-password.tsx`, `confirm-password.tsx`, `verify-email.tsx`, and `two-factor-challenge.tsx`
- [x] 5.7 Verify all auth views render properly without visual discrepancies

## 6. Gatekeeping, Linting & Build Verification

- [x] 6.1 Run full Laravel test suite: `php artisan test --compact`
- [x] 6.2 Run full frontend test suite: `npm run test`
- [x] 6.3 Run TypeScript type verification: `npx tsc --noEmit`
- [x] 6.4 Format PHP code with Pint: `vendor/bin/pint --dirty --format agent`
- [x] 6.5 Run Vite production build: `npm run build`
