# ARC Design System (Signature Theme: Crimson Trust)

Last Updated: 2025-10-02
Owner: Product + Engineering
Status: v1 (Foundational) – Dark mode deferred

---

## 1. Theme Philosophy

A single, opinionated light theme that communicates trust, focus, and analytical clarity. Color usage prioritizes semantic meaning over decorative variety. All components must consume tokens; no raw hex values or inline arbitrary colors.

Principles:

1. Semantic First – Classes map to tailwind tokens (e.g. `bg-card-surface`, `text-text-secondary`).
2. Reduced Cognitive Load – Limited accent hues (crimson, blue, amber, green) with clear purpose.
3. Visual Hierarchy – Background → surface → elevated surface via subtle shadow & soft border.
4. Accessible Contrast – Text tokens maintain ≥4.5:1 on primary surfaces.
5. Motion as Feedback – Animations reinforce interaction, never distract.

---

## 2. Color Tokens

(Defined in `tailwind.config.js` under `theme.extend.colors`)

| Token                        | Hex     | Usage                                                 |
| ---------------------------- | ------- | ----------------------------------------------------- |
| background                   | #F7F8FC | App canvas, large neutral sections                    |
| surface-muted                | #EEF1FA | Section differentiation, timeline strips              |
| card-surface                 | #FFFFFF | Cards, modals, dropdown panels                        |
| text-primary                 | #273043 | High-emphasis text, headings                          |
| text-secondary               | #5C6784 | Body copy, metadata                                   |
| primary                      | #D33F49 | Primary actions, key highlights                       |
| primary-light                | #E25C62 | Hover state / light fills / subtle gradients          |
| primary-dark                 | #B32F3A | Active state, pressed buttons                         |
| accent-amber / warning-amber | #F6B26B | Warnings, secondary KPI highlight, warm gradient stop |
| success-green                | #23A094 | Success states, positive trend indicators             |
| error-red                    | #E4572E | Destructive actions, validation failures              |
| info-blue                    | #3B82F6 | Informational accent (admin portal, links, charts)    |
| warm-orange                  | #FB923C | Secondary warm transition stop (replacing raw hex)    |
| neutral-grey                 | #A9B2C3 | Disabled text, placeholder, icon subtle               |
| border-soft                  | #D8DEE9 | Card and section dividers (1px)                       |
| focus-ring                   | #1A2A6C | Focus outlines, interactive a11y affordance           |

Gradients (utility classes configured):

- `bg-gradient-primary`: Crimson depth fill
- `bg-gradient-accent`: Deep blue analytical accent
- `bg-gradient-warm`: Amber highlight shimmer

Rules:

- Use `border-soft` over semi-transparent white on light backgrounds.
- Only `primary` or `accent-amber` may be used in call-to-action buttons.
- Avoid simultaneously combining `primary` and `success-green` in adjacent KPI callouts.

---

## 3. Typography

Stacks (configured in Tailwind):

- Sans (`font-sans`): Poppins (UI headings) – bold geometric character pairs well with analytical interface.
- Serif (`font-serif`): Inter currently placeholder for long-form; future: Source Serif Pro (deferred until added to build pipeline).

Scale (rem based):
| Role | Size | Line Height | Notes |
|------|------|-------------|-------|
| Display (Hero) | 2.5–3.0rem | 1.1 | Use sparingly on marketing surfaces |
| H1 | 2.25rem | 1.15 | Section entry points |
| H2 | 1.875rem | 1.2 | Major grouping headers |
| H3 | 1.5rem | 1.25 | Card / modal titles |
| Body | 1rem | 1.55–1.6 | Default reading size |
| Small | 0.875rem | 1.4 | Meta, labels, helper text |
| Micro | 0.75rem | 1.3 | Uppercase tags, overlines |

Accessibility: Maintain max text width ~68ch for passages. Apply `leading-relaxed` for long RC text blocks.

---

## 4. Spacing & Layout

Base unit: 4px (Tailwind scale). Common patterns:

- Card padding: 24px (`p-6`) desktop, 16px (`p-4`) mobile.
- Section vertical rhythm: 48–80px depending on hierarchy (`py-12`, `py-20`).
- Grid gaps: 16px (`gap-4`) for dense analytics; 24px (`gap-6`) for marketing.

Breakpoints (already defined): `sm 640`, `md 768`, `lg 1024`, `xl 1280`.

Containers: Use a `max-w-7xl mx-auto px-4` wrapper for primary surfaces; narrow reading width with `max-w-4xl` where narrative.

---

## 5. Elevation & Borders

Shadows (Tailwind tokens):

- `shadow-card`: Default interactive card.
- `shadow-card-hover`: Hover/focus amplify.

Border strategy:

- Default: `border border-soft` for card edges on white surfaces.
- Muted sections: Use background color change (`surface-muted`) instead of heavy border.
- Focus state: Add `outline-none ring-2 ring-focus-ring ring-offset-2 ring-offset-background`.

---

## 6. Component Guidelines

### Buttons

| Variant          | Classes                                                                      | Use                       |
| ---------------- | ---------------------------------------------------------------------------- | ------------------------- |
| Primary          | `bg-primary text-white hover:bg-primary-dark`                                | Main CTA per view only    |
| Gradient Primary | `bg-gradient-primary text-white`                                             | Hero & marketing emphasis |
| Ghost            | `bg-transparent text-text-primary border border-soft hover:bg-surface-muted` | Secondary actions         |
| Destructive      | `bg-error-red text-white hover:opacity-90`                                   | Irreversible actions      |
| Success          | `bg-success-green text-white hover:brightness-110`                           | Confirmations             |

Disable state: `opacity-50 cursor-not-allowed` + remove gradient backgrounds.

### Inputs / Form Elements

- Use `@tailwindcss/forms` baseline. Add `focus:ring-focus-ring focus:border-focus-ring`.
- Placeholder color: `text-neutral-grey`.
- Validation: Error border `border-error-red` + helper `text-error-red`.

### Cards

`bg-card-surface border border-soft rounded-xl shadow-card hover:shadow-card-hover transition`.
Avoid nested heavy borders; use subtle separators `divide-y divide-border-soft` when needed.

### Navigation

- Sidebar: `bg-card-surface` with subtle right divider `border-r border-soft`.
- Mobile Tab Bar: Fixed bottom, blur + backdrop: `backdrop-blur-sm bg-card-surface/90 border-t border-soft`.

### Tables / Data

- Header row: `bg-surface-muted text-text-secondary uppercase text-xs tracking-wide`.
- Row hover: `hover:bg-surface-muted`.
- Numeric emphasis: Wrap KPI deltas in `text-success-green` or `text-error-red`.

### Analytics Visuals

- Radar dataset colors: Actual `primary` fill 40% opacity, target dashed stroke `info-blue`.
- Line charts: Accuracy line `primary`, attempts bars `info-blue` or `surface-muted`.
- Badges (question type): `bg-surface-muted text-text-primary rounded-md px-2 py-1 text-xs font-medium`.

### Feedback & Reason Tagging

- Reason multiselect / dropdown: Chips use `bg-surface-muted` on unselected, `bg-primary text-white` when active.
- Coverage progress: Inline bar `bg-surface-muted` with inner `bg-primary` width = coverage%.

### Toasts

Top-right stack: `bg-card-surface/90 backdrop-blur-sm border border-soft shadow-card`.
Severity icons tinted per palette (success-green, error-red, info-blue, accent-amber).

### Modals

Centered, width `max-w-lg`, `p-6 sm:p-8`, `bg-card-surface border border-soft shadow-card rounded-2xl`.
Overlay: `bg-background/60 backdrop-blur-xs`.

---

## 7. Interaction & Motion

- Easing: `ease-out` 180ms; entrance `opacity + translate-y-1`.
- Scale on hover limited to <=105% (cards, feature tiles).
- Skeleton: Use `bg-gradient-warm animate-pulse` (reserve gradient primary for real actions).
- Focus transitions prioritized over hover on keyboard nav.

---

## 8. Accessibility

- All interactive elements must have visible focus (`ring-focus-ring`).
- Color-only distinctions require secondary indicator (icon, label, underline).
- Icon buttons need `aria-label`.
- Chart components provide data table fallback (`sr-only` description + downloadable CSV).

---

## 9. Tooling & Enforcement

- Lint rule (custom ESLint plugin TBD) to reject raw hex except in `tailwind.config.js`.
- Pre-commit grep script: Fail if pattern `#[0-9a-fA-F]{3,6}` appears in `src/` excluding config, test snapshots.
- Story sandbox (optional): `/design-sandbox` route enumerating core components with theme classes.
- Visual regression (Phase S3+) for palette drift.

---

## 10. Migration Checklist (Applied / To Do)

| Item                            | Status | Notes                                  |
| ------------------------------- | ------ | -------------------------------------- |
| Tailwind palette updated        | ✅     | Added semantic + supplemental tokens   |
| Static pages refactored (About) | ✅     | Removed raw hex (#3b82f6, #fb923c)     |
| Terms page audit                | ✅     | Typo fix; no color changes needed      |
| Remaining static pages audit    | 🔄     | Run search for raw hex & replace       |
| Component library sweep         | 🔄     | Buttons/Input/etc. align to guidelines |
| Add pre-commit hex guard        | ⏳     | Script not yet created                 |
| Focus ring standardization      | 🔄     | Replace ad-hoc ring classes            |
| Border soft adoption            | 🔄     | Replace `border-white/opacity` usage   |

Legend: ✅ done, 🔄 in progress/planned, ⏳ not started.

---

## 11. Future Extensions

- Dark mode variant mapping (saturated accents on deep slate background).
- Density toggle (comfortable vs compact analytics tables).
- Theming API for white-label (token indirection layer).

---

## 12. Revision Log

| Date       | Change                                                             |
| ---------- | ------------------------------------------------------------------ |
| 2025-10-02 | Initial v1 authored (extracted from sprint + palette finalization) |

End of document.
