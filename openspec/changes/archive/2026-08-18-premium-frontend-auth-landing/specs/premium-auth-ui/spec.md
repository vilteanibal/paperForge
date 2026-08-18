## ADDED Requirements

### Requirement: Auth Layout Redesign
The auth layout (`auth-simple-layout.tsx`) SHALL be redesigned with a split-panel layout consisting of a decorative left panel with brand imagery and a form right panel. The layout SHALL display the Paperforge isotipo (circle with 'P' in Instrument Serif) as the logo, set the background color to `--ui-bg` (`#efedeb`), and apply Framer Motion entrance animations to the form panel.

#### Scenario: Rendering auth split-panel layout on desktop
- **WHEN** a user navigates to any authentication route utilizing `auth-simple-layout.tsx` on a desktop viewport
- **THEN** the layout renders a split-panel structure displaying the decorative branded left panel, the Paperforge isotipo logo with 'P' in Instrument Serif, background color `--ui-bg`, and Framer Motion entrance animations on the form panel.

#### Scenario: Mobile viewport responsiveness
- **WHEN** a user visits an authentication route on a mobile or narrow viewport
- **THEN** the layout collapses the split panel, hiding or stacking the decorative left panel while keeping the form panel and Paperforge logo fully visible and accessible.

### Requirement: Login Page Styling and Social Auth
The login page SHALL use Instrument Serif for the title 'Welcome back', DM Sans for form labels and body text, and the `--ui-accent-deep` (`#bb6d4c`) color token for the primary submit button. The login page SHALL include SSO buttons for Google and GitHub positioned above the email/password form, separated by an 'or continue with email' divider.

#### Scenario: User visits the login page
- **WHEN** an unauthenticated user navigates to the login route
- **THEN** the page displays the title 'Welcome back' in Instrument Serif font, form labels and helper texts in DM Sans, SSO login buttons for Google and GitHub above the credentials form, an 'or continue with email' divider, and the primary submit button styled with `--ui-accent-deep`.

### Requirement: Register Page Styling and Social Auth
The register page SHALL mirror the login page styling. The register page SHALL use Instrument Serif for the title 'Create your account', DM Sans for body text and form labels, include SSO buttons for Google and GitHub above the registration form with an 'or continue with email' divider, and use the same brand-aligned form styling and primary button token (`--ui-accent-deep`).

#### Scenario: User visits the registration page
- **WHEN** a user accesses the user registration page
- **THEN** the page displays the title 'Create your account' in Instrument Serif font, Google and GitHub SSO buttons, an 'or continue with email' divider, DM Sans typography for input fields, and the submit button styled with `--ui-accent-deep`.

### Requirement: Consistent Auth Views Brand Alignment
All 7 Fortify authentication pages (`login`, `register`, `forgot-password`, `reset-password`, `confirm-password`, `verify-email`, and `two-factor-challenge`) SHALL use the Paperforge Brand Identity color tokens, Instrument Serif for page headings and titles, DM Sans for body text and input labels, `--ui-accent-deep` for primary action buttons, and `--ui-border` (`#d7d2cc`) for input borders.

#### Scenario: Navigating across all authentication flows
- **WHEN** a user visits any of the secondary auth pages (`forgot-password`, `reset-password`, `confirm-password`, `verify-email`, or `two-factor-challenge`)
- **THEN** each view renders with typography in Instrument Serif for titles and DM Sans for body/labels, `--ui-border` for form input borders, and `--ui-accent-deep` for primary call-to-action buttons, maintaining visual consistency across the entire authentication suite.

### Requirement: Auth Form Component Styling
All auth form inputs SHALL use rounded corners of 5px (`--radius` from brand design tokens), border color `--ui-border`, focus ring color `--ui-accent`, and placeholder text color `--ui-muted`. Validation error messages and error states SHALL use `--ui-red` (`#b95e48`).

#### Scenario: Input interaction and focus state
- **WHEN** a user focuses on any text input within an authentication form
- **THEN** the input displays rounded corners of 5px, maintains a base border of `--ui-border`, applies a focus ring styled with `--ui-accent`, and uses `--ui-muted` for placeholder text.

#### Scenario: Validation error display
- **WHEN** a form submission fails validation or an error is triggered on an input field
- **THEN** the error message text and field invalid state indicators are displayed using the `--ui-red` (`#b95e48`) color token.

### Requirement: Dark Mode Support
All authentication pages and layout components SHALL support dark mode using the `.dark` class selector, mapping background, text, border, and input styles to the dark palette tokens defined in the Paperforge Brand Identity System.

#### Scenario: Toggling dark mode on auth views
- **WHEN** the user enables dark mode or the `.dark` class is applied to the document root on any authentication page
- **THEN** the auth layout, form containers, typography, input fields, and buttons automatically adapt to the dark palette tokens without broken contrast or unstyled elements.
