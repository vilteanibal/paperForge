## ADDED Requirements

### Requirement: Social Accounts Table
The system SHALL create a `social_accounts` table to persist third-party OAuth provider associations for users. The table MUST include the following columns: `id` (primary key), `user_id` (foreign key referencing `users.id` with cascade deletion), `provider` (string, e.g. 'google', 'github'), `provider_id` (string), `created_at`, and `updated_at`. The system MUST enforce a unique composite constraint on `(provider, provider_id)`. A user SHALL be permitted to have multiple social accounts associated with different providers (one per provider).

#### Scenario: Schema migration and table creation
- **WHEN** database migrations are executed
- **THEN** the `social_accounts` table is created with `id`, `user_id`, `provider`, `provider_id`, timestamps, a foreign key constraint on `user_id`, and a unique index on `(provider, provider_id)`

#### Scenario: Unique constraint enforcement per provider and provider ID
- **WHEN** an attempt is made to insert a duplicate `(provider, provider_id)` tuple
- **THEN** the database rejects the insertion due to unique constraint violation

### Requirement: OAuth Redirect
The system SHALL provide a GET route at `/auth/{provider}/redirect` that redirects the user to the third-party OAuth provider's authorization page via Laravel Socialite. The route SHALL only accept `'google'` and `'github'` as valid providers. Any request specifying an invalid or unsupported provider MUST return an HTTP 404 Not Found response.

#### Scenario: Redirecting to valid OAuth provider
- **WHEN** a user navigates to `/auth/google/redirect` or `/auth/github/redirect`
- **THEN** the system generates the authorization URL via Socialite and redirects the user to the provider's OAuth authorization page

#### Scenario: Attempting redirect with invalid provider
- **WHEN** a user or client requests `/auth/{provider}/redirect` with an unsupported provider (e.g., `/auth/twitter/redirect`)
- **THEN** the system returns an HTTP 404 Not Found response

### Requirement: OAuth Callback
The system SHALL provide a GET route at `/auth/{provider}/callback` that handles the OAuth callback from the third-party provider via Laravel Socialite. If a `social_accounts` record with the returned `provider_id` exists, the system SHALL authenticate the associated user. If no `social_accounts` record exists but a user with the same email exists in the database, the system SHALL link the social account to that user and authenticate them. If neither exists, the system SHALL create a new user record and a corresponding `social_accounts` record, then authenticate the new user.

#### Scenario: Existing social account login
- **WHEN** an OAuth callback is received for a provider and `provider_id` that already exists in `social_accounts`
- **THEN** the system authenticates the associated existing user and redirects to the intended page or dashboard

#### Scenario: Linking social account to existing user by email
- **WHEN** an OAuth callback returns an email matching an existing user in `users` but no `social_accounts` record exists for `(provider, provider_id)`
- **THEN** the system creates a new `social_accounts` record linked to that existing user, authenticates them, and redirects to the intended page or dashboard

#### Scenario: New user registration and social account creation
- **WHEN** an OAuth callback returns credentials for an email not present in `users` and no matching `social_accounts` record exists
- **THEN** the system creates a new `User` record, creates the corresponding `SocialAccount` record, authenticates the user, and redirects to the intended page or dashboard

### Requirement: SSO Frontend Buttons
The login and register pages SHALL display 'Continue with Google' and 'Continue with GitHub' buttons that link to the respective OAuth redirect routes (`/auth/google/redirect` and `/auth/github/redirect`). The buttons SHALL use Phosphor Icons (`@phosphor-icons/react`) for the provider logos.

#### Scenario: SSO buttons display on login and register pages
- **WHEN** a user visits the `/login` or `/register` page
- **THEN** 'Continue with Google' and 'Continue with GitHub' buttons are displayed with their respective Phosphor Icons and valid redirect links

#### Scenario: Clicking an SSO button
- **WHEN** a user clicks on 'Continue with Google' or 'Continue with GitHub'
- **THEN** the user is directed to `/auth/google/redirect` or `/auth/github/redirect` respectively

### Requirement: SocialAccount Model
The system SHALL create an Eloquent model `App\Models\SocialAccount` with a `belongsTo` relationship to `App\Models\User`. The `App\Models\User` model SHALL define a `hasMany` relationship to `SocialAccount`.

#### Scenario: SocialAccount to User relationship resolution
- **WHEN** accessing the `user` relationship on a `SocialAccount` instance
- **THEN** Eloquent resolves and returns the associated `User` model instance

#### Scenario: User to SocialAccount relationship resolution
- **WHEN** accessing the `socialAccounts` relationship on a `User` instance
- **THEN** Eloquent resolves and returns a collection of associated `SocialAccount` model instances
