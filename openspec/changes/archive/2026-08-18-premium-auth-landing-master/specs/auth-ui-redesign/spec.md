## ADDED Requirements

### Requirement: Split-Layout Authentication Interface
The authentication pages SHALL render within a 50/50 desktop split layout featuring a brand rail on the left and form controls on the right.

#### Scenario: User visits login page
- **WHEN** a user visits `GET /login`
- **THEN** the left panel renders the Paperforge terracotta isotipo and craftsman quote, and the right panel renders the login form with social SSO buttons

#### Scenario: Mobile viewport responsiveness
- **WHEN** a user views an authentication page on a screen smaller than 768px
- **THEN** the left brand panel collapses gracefully, presenting a compact header and centered form container
