# Inertia Page Transitions Specification

## Requirements

### Requirement: Layout-Encapsulated Page Transitions
The application SHALL render Framer Motion page transition wrappers exclusively inside Layout components (`AppLayout`, `AuthLayout`, etc.) where Inertia's `PageContext` is mounted, and SHALL NOT call page-dependent hooks within the root `withApp` callback in `app.tsx`.

#### Scenario: Navigating between authenticated routes
- **WHEN** an authenticated user transitions from `/dashboard` to `/settings/profile`
- **THEN** `AppLayout` executes a smooth opacity fade transition via `PageTransitionWrapper` without throwing context errors

#### Scenario: Visiting public landing or guest routes
- **WHEN** a visitor navigates directly to `http://localhost:8000/` or `/login`
- **THEN** the root `withApp` provider renders without throwing unhandled `TypeError` exceptions and without entering an infinite refresh loop
