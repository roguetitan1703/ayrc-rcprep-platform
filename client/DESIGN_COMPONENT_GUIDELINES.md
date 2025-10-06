## ARC UI Component & Interaction Guidelines

Purpose

- Capture the decisions, patterns, and implementation details used across the app so future components follow the same UX, animation, accessibility and theme rules.
- Keep this short, actionable and code-aware (Tailwind-first). Add to it when new patterns are introduced.

Audience

- Frontend engineers building or updating components.
- Designers who want to verify implementation details.
- QA engineers validating animations and behaviours.

---

## Top-level principles

- Mobile-first: default styling targets small screens; use `md:` for desktop changes.
- Motion: prefer subtle, short animations. Default durations: 160–220ms for UI transitions, 200ms for slide transforms.
- Accessibility first: keyboard focus, ARIA where appropriate, and focus restore after overlays/drawers close.
- Predictable layout: avoid layout shifts during transitions by overlaying the animated panel while switching the underlying layout (rail vs expanded).
- Tailwind classes are the source-of-truth for rhythm and spacing — prefer utility-driven implementation over ad-hoc CSS.

---

## Components (summary)

- TopBar

  - Responsibilities: breadcrumbs, mobile nav toggle, desktop back button, top-right actions.
  - Key behaviors: mobile left toggle (chevrons), desktop "long arrow" back icon; back button appears only when there is a nested route (not on Home/Dashboard). Breadcrumb intermediate segments are inert on mobile.
  - Accessibility: toggle has aria-expanded; focus restoration uses MobileNavContext.setToggleRef.

- Sidebar & SidebarContent (Item, Heading)

  - Responsibilities: persistent rail + expandable hover panel (desktop), compact mobile rendering inside the mobile drawer.
  - Modes: `locked` (expanded permanently), `collapsed` (rail), `hover overlay` (transient expanded on hover), `mobile` (full overlay drawer).
  - Key decisions:
    - Use CSS variable `--arc-sidebar-width` to control layout width across the app.
    - Keep the rail visible immediately when collapsing; overlay the expanded panel on top and slide it away (prevents text-wrapping and reflow).
    - Footer: Logout placed before the user card, user card pinned to bottom (prevents it from scrolling away). Avatar uses `object-cover`.
  - API: `Sidebar({ bare, mobile, compact })` and `SidebarContent({ expanded, mobile, compact, ... })`.

- MobileSidebar (drawer)

  - Responsibilities: render `Sidebar` inside a portal on small screens, handle slide-in/out, scrim, swipe-to-close, ESC and browser Back behaviour.
  - Key behaviors:
    - Slide animation using `transform: translate-x-*` for smooth GPU-accelerated motion.
    - Scrim: `bg-black/50` + `backdrop-blur-sm` to create depth and subtle blur.
    - Close triggers: scrim click, ESC, back button (popstate), swipe-right (dx > 50px).
    - History integration: push a single { mobileNav:true } state on open, track it with a `pushedHistory` flag and ignore programmatic pops with `ignorePop` to avoid stacking entries.
    - Focus: when slid in, focus the first actionable element; on close restore focus to the toggle button.

- MobileNavContext

  - Responsibilities: global state for mobile nav open/close, storing toggle ref for focus restore.
  - API: `{ open, setOpen, openNav, close, setToggleRef }`.

- Toasts

  - Provider is portaled to `document.body` so toasts float above content and do not get clipped by containers.
  - Keep toasts brief; color-coded success / error and accessible roles.

- Breadcrumbs

  - Only `Home` is a real link. Intermediate segments are non-clickable text (to avoid synthetic parents). On desktop we render intermediate segments as clickable back affordances only when appropriate.

- AuthShell

  - 50/50 split for desktop (banner + form), stacked on mobile. Form card hides white wrapper on mobile and centers content.

- ResultsPage
  - Placeholder created and routes wired — follow the layout shell conventions.

---

## Animation & Motion rules

- Default timings:
  - Slide transforms: 200ms (ease-out or `ease-in-out` for symmetric behavior).
  - Fade/opacity transitions: 120–160ms.
  - Skeleton pulse: `animate-pulse` (Tailwind default) for placeholder.
- Transform usage:
  - Always use `transform: translateX` for sliding drawers/panels to use the GPU and avoid layout recalculation.
- Overlays & layering:
  - Drawer and overlay z-index: high (z-40, z-50) to ensure they sit above the main content.
  - Scrim should sit behind the drawer but above main content and apply a subtle `backdrop-blur-sm`.

---

## Interaction & UX decisions

- Drawer open/close

  - Use requestAnimationFrame to toggle the `slidIn` class after mounting so CSS transitions animate as expected.
  - Push a single history entry on open; on close, call `history.back()` if that state is present. Avoid pushing more than one entry for repeated opens (use a boolean `pushedHistory`).
  - For swipe-to-close, use a threshold (50px) and close; pan-drag (continuous follow) is deferred until confirmed.

- Focus management

  - When opening overlays/drawers, focus the first actionable control inside.
  - On close, restore focus to the element that opened the overlay (toggle button) using a stored ref in `MobileNavContext`.

- Sidebar unlock transition (desktop)

  - To avoid mid-transition text wrapping when going from locked -> collapsed: show the rail immediately, overlay an expanded panel and slide the overlay out (the "slide-back" overlay). This avoids reflow and maintains stable typography.

- Avatar & image handling
  - Avatar images are loaded with `loading="eager"` and `fetchPriority="high"` for initial fetch.
  - Use a module-level session cache (`avatarLoadedCache`) to avoid re-showing skeleton/loading state when the sidebar mounts/unmounts repeatedly.
  - On `onLoad` add the `avatarUrl` to the cache so subsequent mounts treat it as already loaded.
  - For persistent caching across full-page reloads, consider persisting the URL to localStorage or using a stable CDN endpoint.

---

## Theming & tokens

- Tailwind-first: rely on Tailwind utility classes and a small set of custom CSS variables for layout-critical values.
- Sidebar width tokens:
  - Rail width: `--arc-sidebar-rail` (current implementation uses 5.5rem)
  - Expanded width: `--arc-sidebar-expanded` (current: 16rem)
  - Implement these via `document.documentElement.style.setProperty('--arc-sidebar-width', ...)` where the app expects a variable for layout.
- Color tokens: use tailwind colors and semantic tokens (e.g., `text-primary`, `bg-card-surface`, `surface-muted`). Prefer semantic names (primary, error, surface-muted) over raw color hexes.

---

## Accessibility checklist

- All interactive elements must have keyboard focus styles (Tailwind `focus:` utilities + focus ring for clarity).
- ARIA states for overlays/drawers: `role="dialog" aria-modal="true"` where appropriate.
- Ensure `aria-expanded` on nav toggle button.
- Restore focus to the originating control after closing overlays.
- Avoid trapping keyboard users: overlays may trap focus but provide an accessible close method (ESC and a visible close control if applicable).

---

## Conventions & patterns

- Component props should be explicit about mode: `mobile`, `compact`, `expanded`, `bare`.
- Keep hooks at top-level; avoid conditional hooks to prevent hook-order errors.
- Prefer `requestAnimationFrame` for animation state toggles after mount.
- Use portal for floating UI (toasts, mobile drawer) so parents don't clip content.
- Centralize small timing constants at the top of files if reused.

---

## PR / QA checklist

- Visual: animations render smoothly (no abrupt jumps), rail->expanded->rail transition is smooth on unlock.
- Accessibility: tab order, ESC close, aria attributes present, focus is restored.
- Performance: avatars load once per session and do not retrigger skeleton on each sidebar mount. No duplicate history entries from drawer open/close.
- Code: no conditional hooks, no console errors.

---

## Notes & future items

- Pan-drag for the mobile drawer (drag follow) is planned but held until confirmed — design a physics-friendly drag with inertia and thresholds.
- Consider a small design tokens file (`src/styles/tokens.css` or Tailwind variables) for colors, spacings, and motion durations for consistent theming.
- If avatars come from a CDN, ensure an appropriately sized URL (e.g., `?w=40`) to reduce payload.

---

If you'd like, I can also create a lightweight lint/test harness that runs a quick visual smoke test for the drawer open/close cycle (headless browser script), or persist avatar URL in localStorage so it survives full-page reloads — tell me which you prefer and I'll implement it.
