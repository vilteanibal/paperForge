## ADDED Requirements

### Requirement: Public Editorial Landing Page
The application SHALL render a public landing page at `GET /` displaying the Paperforge identity, product capabilities, feature showcase, and pricing tiers.

#### Scenario: Unauthenticated visitor views landing page
- **WHEN** a guest requests `GET /`
- **THEN** the system returns HTTP 200 rendering the Inertia component `Landing/Index` with `features` and `pricingTiers` props

#### Scenario: Authenticated user visits landing page
- **WHEN** an authenticated user visits `GET /`
- **THEN** the navigation bar displays a direct CTA linking to `/dashboard` instead of Login/Register

### Requirement: Editorial Craftsman Aesthetic Presentation
The landing page components SHALL strictly adhere to brand typography (*Instrument Serif* for headlines, *DM Sans* for body/UI) and responsive layout standards.

#### Scenario: Desktop view rendering
- **WHEN** the landing page renders on a viewport wider than 1024px
- **THEN** the hero headline displays in Instrument Serif with negative tracking and staggered Framer Motion entrance animations
