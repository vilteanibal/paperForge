## ADDED Requirements

### Requirement: Landing Controller
The system SHALL serve the landing page at route `/` via `LandingController@index`. It SHALL render the Inertia page `Landing/Index` with props: `features` (array of Feature models ordered by `sort_order`), `pricingTiers` (array of PricingTier models ordered by `sort_order`), and `auth` (current user or null).

#### Scenario: Unauthenticated visitor requests the landing page
- **WHEN** a guest user navigates to `GET /`
- **THEN** the application MUST return a 200 HTTP response rendering the Inertia component `Landing/Index` with `features`, `pricingTiers`, and `auth.user` set to null.

#### Scenario: Authenticated user requests the landing page
- **WHEN** an authenticated user navigates to `GET /`
- **THEN** the application MUST return a 200 HTTP response rendering the Inertia component `Landing/Index` with `features`, `pricingTiers`, and `auth.user` populated with the current user's profile.

### Requirement: Hero Section
The landing page SHALL display a Hero section with the Paperforge wordmark in Instrument Serif, a tagline describing the product, and a primary CTA button ('Get Started') linking to the register route. The Hero SHALL use Framer Motion for a staggered entrance animation.

#### Scenario: Hero section initial load animation
- **WHEN** the visitor enters the landing page
- **THEN** the Hero section MUST mount with a staggered entrance animation using Framer Motion on the wordmark, tagline, and CTA elements.

#### Scenario: Interacting with the primary CTA
- **WHEN** the visitor clicks the 'Get Started' button in the Hero section
- **THEN** the browser MUST navigate to the registration page (`/register`).

### Requirement: Value Proposition Section
The landing page SHALL display a grid of feature cards. Each card SHALL show an icon (Phosphor Icons duotone variant), a title, and a description. Features SHALL be loaded dynamically from the `features` prop.

#### Scenario: Rendering feature cards
- **WHEN** the `features` prop contains a non-empty list of feature models
- **THEN** the landing page MUST render a grid of cards displaying each feature's duotone Phosphor icon, title, and descriptive text sorted by `sort_order`.

### Requirement: Pricing Section
The landing page SHALL display pricing panels loaded from the `pricingTiers` prop. Each panel SHALL show: tier name, price, billing period, a list of included features, and a CTA button. One tier SHALL be visually highlighted as 'recommended' using the `--ui-accent-deep` color.

#### Scenario: Rendering pricing tiers
- **WHEN** the `pricingTiers` prop contains tier data
- **THEN** the landing page MUST display a card for each tier with its name, formatted price, billing period, list of feature bullets, and designated CTA button.

#### Scenario: Visual highlight for recommended tier
- **WHEN** a pricing tier has `is_highlighted` set to true
- **THEN** that tier's panel MUST be visually differentiated with prominent styling and border/accent using `--ui-accent-deep`.

### Requirement: CMS Data Models
The system SHALL create `Feature` and `PricingTier` Eloquent models with corresponding migrations and seeders. The Feature model SHALL have: id, icon (string), title (string), description (text), sort_order (integer). The PricingTier model SHALL have: id, name (string), price (decimal), billing_period (string), features (json), is_highlighted (boolean), cta_label (string), sort_order (integer).

#### Scenario: Feature model structure and persistence
- **WHEN** the `features` table migration and seeder are executed
- **THEN** the database schema MUST contain `id`, `icon`, `title`, `description`, and `sort_order` columns, allowing Eloquent queries to retrieve features ordered by `sort_order`.

#### Scenario: PricingTier model structure and persistence
- **WHEN** the `pricing_tiers` table migration and seeder are executed
- **THEN** the database schema MUST contain `id`, `name`, `price`, `billing_period`, `features`, `is_highlighted`, `cta_label`, and `sort_order` columns, with `features` cast to array/JSON.

#### Scenario: Seeding default CMS data
- **WHEN** the database seeders for features and pricing tiers run
- **THEN** initial editorial content for value propositions and pricing plans MUST be inserted into their respective tables.

### Requirement: Navigation Header
The landing page SHALL display a sticky navigation header with the Paperforge wordmark, navigation links, and auth buttons (Login/Register for guests, Dashboard for authenticated users). The header SHALL use a frosted-glass effect (`backdrop-filter: blur`).

#### Scenario: Sticky frosted-glass header layout
- **WHEN** the user scrolls down the landing page
- **THEN** the navigation header MUST remain fixed at the top of the viewport with a frosted-glass translucent background blur (`backdrop-filter: blur`).

#### Scenario: Header auth links for guest visitors
- **WHEN** the visitor is not authenticated (`auth.user` is null)
- **THEN** the navigation header MUST display 'Log in' linking to `/login` and 'Register' linking to `/register`.

#### Scenario: Header auth links for authenticated users
- **WHEN** the visitor is logged in (`auth.user` is present)
- **THEN** the navigation header MUST display a 'Dashboard' button linking to the user's dashboard or projects area.

### Requirement: Welcome Page Replacement
The boilerplate `welcome.tsx` SHALL be deleted. The route previously pointing to `welcome` SHALL point to `Landing/Index`.

#### Scenario: Legacy welcome page removal
- **WHEN** visiting the root path `/`
- **THEN** the server MUST NOT attempt to render `resources/js/pages/welcome.tsx`, and `welcome.tsx` MUST be removed from the project repository.
