## ADDED Requirements

### Requirement: Socialite OAuth Provider Redirection
The system SHALL provide endpoints to redirect unauthenticated users to approved OAuth identity providers (`google`, `github`).

#### Scenario: Valid provider redirection
- **WHEN** a user initiates login with provider `google` via `GET /auth/google/redirect`
- **THEN** the system redirects the browser to the Google OAuth authorization URL

#### Scenario: Invalid provider rejection
- **WHEN** a user requests an unsupported provider via `GET /auth/facebook/redirect`
- **THEN** the system returns a `404 Not Found` response

### Requirement: Socialite Callback and User Synchronization
The system SHALL handle OAuth callbacks by finding or creating the user account and establishing an authenticated session.

#### Scenario: New user registers via Google OAuth
- **WHEN** Google returns a valid OAuth payload for an email not present in the `users` table
- **THEN** the system creates a new `User`, links a `SocialAccount` record with `provider="google"`, authenticates the user, and redirects to `/dashboard`

#### Scenario: Existing email links new OAuth provider
- **WHEN** GitHub returns a valid OAuth payload matching the email of an existing user
- **THEN** the system attaches a `SocialAccount` record to that existing user and authenticates them
