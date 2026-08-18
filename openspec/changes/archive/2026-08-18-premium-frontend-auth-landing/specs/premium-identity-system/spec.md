## ADDED Requirements

### Requirement: Brand Token Injection
The system SHALL remap all ShadCN CSS variables (`--background`, `--foreground`, `--primary`, `--primary-foreground`, `--accent`, `--accent-foreground`, `--muted`, `--muted-foreground`, `--border`, `--input`, `--ring`, `--card`, `--popover`, etc.) in `resources/css/app.css` to Paperforge Brand Identity hex values. In `:root` (light mode), `--background` MUST map to `#efedeb`, `--primary` MUST map to `#bb6d4c`, `--accent` MUST map to `#d88f6d`, and `--foreground` MUST map to `#322f2c`. In `.dark` mode, the CSS variables MUST map to the Paperforge dark palette (`--background: #282726`, `--primary: #eca987`, `--accent: #e09a77`, `--foreground: #f2eee8`, `--muted: #aaa39c`, `--border: #4c4844`).

#### Scenario: Light mode brand token resolution
- **WHEN** the application renders in default light mode (`:root`)
- **THEN** `--background` evaluates to `#efedeb`, `--primary` evaluates to `#bb6d4c`, `--accent` evaluates to `#d88f6d`, and `--foreground` evaluates to `#322f2c`.

#### Scenario: Dark mode brand token resolution
- **WHEN** the `.dark` class is active on the application root container
- **THEN** `--background` evaluates to `#282726`, `--primary` evaluates to `#eca987`, `--accent` evaluates to `#e09a77`, `--foreground` evaluates to `#f2eee8`, and `--border` evaluates to `#4c4844`.

### Requirement: Typography System
The system SHALL use Instrument Serif (via `@fontsource/instrument-serif`) for all headings (h1–h6), brand wordmarks, and display elements with negative `letter-spacing` between `-0.03em` and `-0.04em`. The system SHALL use DM Sans (via `@fontsource/dm-sans`, weights 400, 500, 600, 700) as the default UI font for body text, inputs, buttons, and navigation. The system SHALL use JetBrains Mono (via `@fontsource/jetbrains-mono` or `ui-monospace`) as the code font for LaTeX code editors, monospace labels, and terminal outputs.

#### Scenario: Heading and brand typography rendering
- **WHEN** any heading (`h1` through `h6`) or brand title element is rendered
- **THEN** the applied font family MUST be `Instrument Serif` and the `letter-spacing` MUST be between `-0.03em` and `-0.04em`.

#### Scenario: UI body font rendering
- **WHEN** standard UI text, forms, buttons, or navigation components are rendered
- **THEN** the applied font family MUST be `DM Sans` loaded from `@fontsource/dm-sans`.

#### Scenario: Monospace code rendering
- **WHEN** LaTeX code snippets, editor areas, line numbers, or terminal elements are rendered
- **THEN** the applied font family MUST be `JetBrains Mono` or `ui-monospace`.

### Requirement: Icon Library Migration
The system SHALL use `@phosphor-icons/react` exclusively for all iconography throughout the frontend application. All existing imports from `lucide-react` MUST be replaced with their corresponding Phosphor icon components (`duotone`, `regular`, or `fill` variants). The `lucide-react` package dependency MUST be completely removed from `package.json`.

#### Scenario: Phosphor icon rendering in UI components
- **WHEN** any UI component (navigation rail, topbar, buttons, form fields, alerts) renders an icon
- **THEN** the icon MUST be imported from `@phosphor-icons/react` and render with valid Phosphor props and weights.

#### Scenario: Removal of lucide-react dependency
- **WHEN** project dependencies and source code are analyzed
- **THEN** no source file SHALL contain imports from `lucide-react` and `lucide-react` SHALL NOT be listed in `package.json`.

### Requirement: Page Transition Animation
The system SHALL wrap the Inertia application with Framer Motion's `AnimatePresence` inside the `createInertiaApp` setup callback in `resources/js/app.tsx`. Each page component transition SHALL execute an opacity fade animation with initial opacity of `0`, animate opacity of `1`, exit opacity of `0`, and a duration of `200ms`. The key for `AnimatePresence` and the animating wrapper MUST be derived from the current page URL.

#### Scenario: Page navigation opacity transition
- **WHEN** the user navigates between Inertia pages
- **THEN** the exiting page MUST fade out to `opacity: 0` and the entering page MUST fade in from `opacity: 0` to `opacity: 1` over a `200ms` transition duration.

#### Scenario: URL-derived animation keying
- **WHEN** Inertia updates the page state with a new URL path
- **THEN** `AnimatePresence` MUST trigger a transition cycle using the updated page URL as its unique key.

### Requirement: Tailwind v4 Theme Extension
The system SHALL use the `@theme` directive in `resources/css/app.css` to register Paperforge color tokens (`paperforge-accent`, `paperforge-ink`, `paperforge-surface`, `paperforge-rail`, `paperforge-paper` and their sub-variants), custom font families (`--font-serif: "Instrument Serif"`, `--font-sans: "DM Sans"`, `--font-mono: "JetBrains Mono"`), and custom box shadows (`--shadow-paper`, `--shadow-modal`).

#### Scenario: Paperforge color and font utility classes
- **WHEN** Tailwind utility classes such as `bg-paperforge-surface`, `text-paperforge-accent-deep`, `font-serif`, or `font-sans` are applied to JSX/TSX elements
- **THEN** Tailwind v4 MUST resolve and output CSS rules matching the tokens registered under `@theme`.

#### Scenario: Custom shadow utility classes
- **WHEN** elements are styled using `shadow-paper` or `shadow-modal` classes
- **THEN** the rendered CSS box shadow MUST resolve to `0 18px 46px rgba(58, 50, 43, 0.13), 0 2px 6px rgba(58, 50, 43, 0.08)` for `shadow-paper` and `0 24px 65px rgba(36, 31, 27, 0.25)` for `shadow-modal`.
