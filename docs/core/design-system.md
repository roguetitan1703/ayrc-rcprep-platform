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

**Final Palette:** https://coolors.co/f7f8fc-273043-d33f49-1a2a6c-f6b26b

(Defined in `tailwind.config.js` under `theme.extend.colors`)

### Core Palette (From Coolors)

| Token        | Hex     | Usage                                           |
| ------------ | ------- | ----------------------------------------------- |
| background   | #F7F8FC | App canvas, large neutral sections              |
| text-primary | #273043 | High-emphasis text, headings                    |
| primary      | #D33F49 | Primary actions (crimson), key highlights, CTAs |
| focus-ring   | #1A2A6C | Focus outlines, secondary accents (navy blue)   |
| accent-amber | #F6B26B | Warnings, highlights (USE SPARINGLY)            |

### Extended Tokens (With Interaction States)

| Token                  | Hex     | Usage                                    |
| ---------------------- | ------- | ---------------------------------------- |
| card-surface           | #FFFFFF | Cards, modals, dropdown panels           |
| surface-muted          | #EEF1FA | Section differentiation, timeline strips |
| text-secondary         | #5C6784 | Body copy, metadata                      |
| **Primary Variants**   |         |                                          |
| primary                | #D33F49 | Base crimson                             |
| primary-light          | #E25C62 | Hover state for buttons                  |
| primary-dark           | #B32F3A | Active/pressed state                     |
| primary-hover          | #E25C62 | Explicit hover (alias of primary-light)  |
| **Secondary Variants** |         |                                          |
| secondary/focus-ring   | #1A2A6C | Base navy blue                           |
| secondary-light        | #2d4087 | Hover state for secondary elements       |
| secondary-dark         | #0f1a3a | Active state for secondary elements      |
| info-blue              | #3B82F6 | Analytics, informational content         |
| **Accent Variants**    |         |                                          |
| accent-amber           | #F6B26B | Base amber (USE SPARINGLY)               |
| accent-amber-light     | #f9c589 | Hover state for amber elements           |
| accent-amber-dark      | #d99a52 | Active state for amber elements          |
| **Status Variants**    |         |                                          |
| success-green          | #23A094 | Success states, positive trends          |
| success-green-light    | #2db8aa | Success hover                            |
| success-green-dark     | #1d8077 | Success active                           |
| error-red              | #E4572E | Errors, destructive actions              |
| error-red-light        | #e8724f | Error hover                              |
| error-red-dark         | #c54824 | Error active                             |
| neutral-grey           | #A9B2C3 | Disabled text, placeholder, icons        |
| border-soft            | #D8DEE9 | Card and section dividers (1px)          |

### Color Usage Rules

- **Primary (Crimson)**: Main CTAs, important actions, brand highlights
  - Base: `bg-primary`
  - Hover: `hover:bg-primary-light`
  - Active: `active:bg-primary-dark`
- **Secondary/Focus Ring (Navy)**: Focus outlines, accessibility, secondary accents
  - Base: `bg-secondary` or `ring-focus-ring`
  - Hover: `hover:bg-secondary-light`
- **Accent Amber**: USE SPARINGLY - warnings, highlights only. NOT for primary actions.
  - Base: `bg-accent-amber`
  - Hover: `hover:bg-accent-amber-light`
- **Text Primary (#273043)**: All headings, emphasis text, dark buttons
- Use `border-soft` over semi-transparent colors on light backgrounds
- Only `primary` may be used in primary call-to-action buttons
- Avoid combining `primary` and `accent-amber` in adjacent elements

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

- Results Page: Wrap the content in a vertical flex container (`flex flex-col space-y-6`) instead of a fixed max-width, and center the list cards using a grid with `grid grid-cols-1 lg:grid-cols-2 gap-6 justify-center` to ensure cards span the available space evenly.

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

## 12. Component Patterns (Real Implementation)

This section documents **actual implemented patterns** extracted from the codebase. Use these as authoritative examples when creating new components or pages.

### 12.1 Navigation Items (Sidebar)

**Active State:**

```jsx
// Active navigation item
<button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary bg-primary/15 w-full">
  <Icon size={22} />
  <span>Dashboard</span>
</button>
```

**Hover State:**

```jsx
// Inactive with hover
<button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-muted transition-colors w-full">
  <Icon size={22} />
  <span>Archive</span>
</button>
```

**Mobile Compact:**

```jsx
// Mobile drawer uses larger touch targets
<button className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-text-secondary hover:bg-surface-muted">
  <Icon size={18} />
  <span>Settings</span>
</button>
```

**Section Headings:**

```jsx
// Collapsed (rail mode): renders separator line
<hr className="my-2 border-border-soft" />

// Expanded: renders text heading
<div className="px-3 py-2 text-xs font-semibold tracking-wider text-text-tertiary uppercase">
  Administration
</div>
```

### 12.2 Buttons (From Button.jsx)

**⚠️ NOTE:** The current `Button.jsx` uses `accent-amber` as primary variant. This is **incorrect** per design system rules. Use inline classes for proper primary buttons until Button.jsx is refactored.

**Correct Primary Button Pattern:**

```jsx
// ✅ DO: Primary action with crimson
<button className="px-3.5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-light active:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 transition-colors">
  Submit
</button>

// Full-width form button (AdminLogin pattern)
<button className="w-full h-12 bg-primary hover:bg-primary-light active:bg-primary-dark text-white font-semibold rounded-xl transition-colors">
  Sign In
</button>
```

**Outline Button:**

```jsx
// Secondary action with border
<button className="px-3.5 py-2 border border-soft text-text-primary font-medium rounded-lg hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-focus-ring transition-colors">
  Cancel
</button>
```

**Ghost Button (TopBar Pattern):**

```jsx
// Minimal button for secondary actions
<button className="px-3 py-1.5 rounded-lg text-sm text-text-secondary bg-surface-muted hover:bg-surface-hover transition-colors">
  View All
</button>
```

**Icon Button:**

```jsx
// Back button or toggle
<button className="p-2 rounded-lg hover:bg-surface-muted transition-colors">
  <ArrowLeft size={18} />
</button>
```

**Disabled State:**

```jsx
<button
  disabled
  className="px-3.5 py-2 bg-neutral-grey text-text-secondary font-medium rounded-lg opacity-50 cursor-not-allowed"
>
  Disabled
</button>
```

### 12.3 Cards (Content Containers)

**Card Component Usage:**

```jsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card'

// Standard card with sections
;<Card className="max-w-xl mx-auto">
  <CardHeader>
    <h2 className="text-xl font-semibold text-text-primary">Results Summary</h2>
    <p className="text-sm text-text-secondary mt-1">Practice Test • RC #12345</p>
  </CardHeader>
  <CardContent>
    {/* Main content with internal spacing */}
    <div className="space-y-4">
      <div className="flex justify-between">
        <span className="text-text-secondary">Score</span>
        <span className="text-xl font-bold text-primary">85%</span>
      </div>
    </div>
  </CardContent>
  <CardFooter className="flex gap-3 justify-end">
    <Button variant="outline">Review</Button>
    <Button variant="primary">Continue</Button>
  </CardFooter>
</Card>
```

**Card Padding Standards:**

- Desktop: `p-6` (24px) for CardHeader/CardContent/CardFooter
- Mobile: `p-4` (16px) override with responsive classes
- Internal content: Use `space-y-4` (16px) or `space-y-6` (24px) for vertical rhythm

**When to Use Cards:**

- ✅ Results summaries, profile sections, settings panels
- ✅ Feature highlights, analytics widgets
- ✅ Form containers on auth pages (mobile only)
- ❌ Test questions (use bare containers for full-width)
- ❌ Nested cards (flatten hierarchy with sections instead)

### 12.4 Auth Pages (AuthShell Pattern)

**50/50 Split Layout:**

```jsx
<AuthShell title="Welcome to ARYC" showTerms={true}>
  <form className="space-y-5">
    <div>
      <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
      <Input type="email" placeholder="you@example.com" icon={Mail} />
    </div>
    <div>
      <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
      <PasswordInput placeholder="••••••••" />
    </div>
    <Button className="w-full h-12 bg-primary hover:bg-primary-light text-white font-semibold rounded-xl">
      Sign In
    </Button>
  </form>
</AuthShell>
```

**AuthShell Behavior:**

- Desktop: 50/50 split (form left, gradient banner right)
- Mobile: Card background for form (`bg-card-surface rounded-2xl shadow-lg`), banner hidden
- Form container: `max-w-[420px] lg:max-w-[480px]`
- Form spacing: `space-y-5` between fields

**Banner Gradient (Right Side):**

```jsx
// Triple-stop gradient for depth
<div className="bg-gradient-to-br from-primary via-text-primary to-secondary min-h-[700px]">
  {/* Decorative elements with layered opacity */}
</div>
```

**Alert Boxes (Admin Warning):**

```jsx
<div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-start gap-3">
  <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
  <p className="text-xs text-text-secondary">
    This area is restricted to authorized administrators only.
  </p>
</div>
```

### 12.5 Header Patterns (TopBar)

**Mobile Toggle (Left Side):**

```jsx
<button className="p-2 rounded-lg hover:bg-surface-muted transition-colors md:hidden">
  <ChevronsLeft size={18} />
</button>
```

**Desktop Back Button:**

```jsx
// Only shown when breadcrumb depth > 1 AND not on /dashboard
{
  showBack && (
    <button className="hidden md:inline-flex p-2 rounded-lg hover:bg-surface-muted transition-colors">
      <ArrowLeft size={18} />
    </button>
  )
}
```

**Breadcrumbs:**

```jsx
<nav className="flex items-center text-sm">
  <Link to="/" className="text-text-secondary hover:text-primary transition-colors">
    Home
  </Link>
  <ChevronRight size={14} className="mx-1.5 text-neutral-grey" />
  <span className="text-text-primary font-medium">Dashboard</span>
</nav>
```

**Streak Indicator:**

```jsx
<div className="flex items-center gap-2 px-2.5 py-1.5 bg-surface-muted rounded-lg">
  <span className="text-sm font-medium text-text-primary">🔥 7</span>
</div>
```

**Action Button:**

```jsx
<button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-surface-muted hover:bg-surface-hover transition-colors">
  Attempt RC
</button>
```

### 12.6 Form Inputs

**Text Input with Icon:**

```jsx
<div className="relative">
  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-grey" />
  <input
    type="email"
    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-soft bg-card-surface text-text-primary placeholder:text-neutral-grey focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-focus-ring transition"
    placeholder="you@example.com"
  />
</div>
```

**Label Pattern:**

```jsx
<label className="block text-sm font-medium text-text-primary mb-2">Email Address</label>
```

**Error State:**

```jsx
<input className="border-error-red focus:ring-error-red" />
<p className="text-xs text-error-red mt-1">Invalid email format</p>
```

**Field Spacing:**

- Form vertical rhythm: `space-y-5` (20px between fields)
- Label to input: `mb-2` (8px)
- Input to error text: `mt-1` (4px)

### 12.7 Badges & Tags

**Question Type Badge:**

```jsx
<span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-surface-muted text-text-primary">
  Inference
</span>
```

**Status Badge (Results):**

```jsx
// Success
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success-green/15 text-success-green">
  <Check size={12} />
  Correct
</span>

// Error
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-error-red/15 text-error-red">
  <X size={12} />
  Incorrect
</span>
```

### 12.8 Loading States

**Skeleton Loader:**

```jsx
// Use gradient-warm for non-interactive loading
<div className="h-10 w-10 rounded-full bg-gradient-warm animate-pulse" />

// Text skeleton
<div className="h-4 w-32 bg-surface-muted animate-pulse rounded" />
```

**Avatar Loading with Cache:**

```jsx
// Module-level cache to prevent re-loading
const avatarLoadedCache = new Set()

function Avatar({ src, userId }) {
  const [loaded, setLoaded] = useState(avatarLoadedCache.has(userId))

  const handleLoad = () => {
    setLoaded(true)
    avatarLoadedCache.add(userId)
  }

  return (
    <>
      {!loaded && <div className="w-10 h-10 rounded-full bg-gradient-warm animate-pulse" />}
      <img
        src={src}
        className={`w-10 h-10 rounded-full object-cover ${loaded ? 'block' : 'hidden'}`}
        onLoad={handleLoad}
      />
    </>
  )
}
```

---

## 13. Layout Conventions

### 13.1 Shell Pattern (Route Wrapping)

**When to Use Shell:**

- ✅ All authenticated content pages (Dashboard, Results, Analysis, Profile, Archive, Feedback)
- ✅ Pages that need sidebar navigation
- ❌ Test routes (`/test/*`) - full-width, no sidebar
- ❌ Auth routes (`/login`, `/register`, etc.) - use AuthShell instead

**Shell Structure:**

```jsx
// In AppRoutes.jsx
<Route element={<RequireAuth />}>
  <Route element={<Shell />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/results/:id" element={<Results />} />
    <Route path="/analysis/:id" element={<Analysis />} />
  </Route>

  {/* Test routes WITHOUT Shell */}
  <Route path="/test/:id" element={<Test />} />
</Route>
```

**Shell Provides:**

- Fixed sidebar (desktop rail/expanded, mobile portal drawer)
- TopBar with breadcrumbs and actions
- Main content area with proper left offset (`style={{ marginLeft: 'var(--arc-sidebar-width)' }}` on desktop)
- Focus management and mobile nav context

### 13.2 Container Width Standards

**Centered Cards (Results, Profile):**

```jsx
<div className="max-w-xl mx-auto px-4 py-6">
  <Card>{/* Content */}</Card>
</div>
```

**Wide Content (Dashboard, Analysis):**

```jsx
<div className="max-w-7xl mx-auto px-4 py-6">{/* Grid or multi-column layout */}</div>
```

**Narrative Content (Reading passages, long-form):**

```jsx
<div className="max-w-4xl mx-auto px-4 py-6">
  <div className="prose prose-slate">{/* Markdown or rich text */}</div>
</div>
```

**Full-Width (Test interface):**

```jsx
// No max-width constraint
<div className="px-4 py-6">{/* Test questions, timers, full-width controls */}</div>
```

### 13.3 Responsive Breakpoint Usage

**Mobile-First Approach:**

```jsx
// Base styles for mobile (< 768px)
<div className="flex flex-col gap-4 p-4">
  {/* Desktop overrides with md: prefix (≥ 768px) */}
  <div className="md:flex-row md:gap-6 md:p-6">
    {/* Large desktop with lg: prefix (≥ 1024px) */}
    <div className="lg:max-w-[480px]">{/* Content */}</div>
  </div>
</div>
```

**Common Breakpoint Patterns:**

- Mobile-only: Default classes without prefix (e.g., `flex-col`)
- Desktop-only: `hidden md:block` (hide on mobile, show on desktop)
- Mobile-only: `md:hidden` (show on mobile, hide on desktop)
- Responsive spacing: `p-4 md:p-6 lg:p-8`
- Responsive typography: `text-base md:text-lg`

### 13.4 Sidebar Width & Offset

**CSS Variable System:**

```jsx
// Desktop: sidebar fixed with dynamic width
<aside style={{ width: isExpanded ? '16rem' : '5.5rem' }}>
  {/* Sidebar content */}
</aside>

// Main content: offset by sidebar width
<main style={{ marginLeft: isExpanded ? '16rem' : '5.5rem' }}>
  {/* Page content */}
</main>

// Or using CSS variable
<main style={{ marginLeft: 'var(--arc-sidebar-width)' }}>
```

**Mobile Exception:**

```jsx
// On mobile: no offset, sidebar is portal overlay
<main className="md:ml-[5.5rem]">{/* Content */}</main>
```

**Test Route Exception:**

```jsx
// Remove offset on test routes
const isTestRoute = location.pathname.startsWith('/test')
<main style={{ marginLeft: isTestRoute ? 0 : 'var(--arc-sidebar-width)' }}>
```

### 13.5 Vertical Rhythm

**Section Spacing:**

```jsx
// Small gaps (related items)
<div className="space-y-2">
  <label>Email</label>
  <input />
</div>

// Medium gaps (form fields, list items)
<div className="space-y-4">
  <FormField />
  <FormField />
</div>

// Large gaps (sections, cards)
<div className="space-y-6">
  <Card />
  <Card />
</div>

// Extra large (page sections)
<div className="space-y-12">
  <Section />
  <Section />
</div>
```

**Page Padding:**

```jsx
// Standard page: 24px vertical on mobile, 32px on desktop
<div className="py-6 md:py-8">
  {/* Content */}
</div>

// Hero sections: 48-80px vertical
<div className="py-12 md:py-20">
  {/* Hero content */}
</div>
```

---

## 14. Icon Sizing Standards

Consistent icon sizing improves visual hierarchy and touch targets.

| Size | Pixels | Usage                                     | Example            |
| ---- | ------ | ----------------------------------------- | ------------------ |
| 12px | w-3    | Badge icons, inline indicators            | Check, X in badges |
| 14px | w-3.5  | Breadcrumb separators, small action icons | ChevronRight       |
| 18px | w-4.5  | Button icons, mobile toggles, compact nav | ChevronsLeft       |
| 22px | w-5.5  | Desktop nav items, form field icons       | Home, User         |
| 24px | w-6    | Page headers, prominent actions           | Settings, Bell     |

**Implementation:**

```jsx
// Lucide icons with size prop
<ArrowLeft size={18} />
<Mail size={22} />

// Or with Tailwind classes
<Icon className="w-4.5 h-4.5" /> // 18px
<Icon className="w-5.5 h-5.5" /> // 22px
```

**Icon-Text Spacing:**

```jsx
// Small gap for tight inline elements
<div className="flex items-center gap-1.5">
  <Icon size={14} />
  <span className="text-xs">Label</span>
</div>

// Medium gap for buttons
<button className="flex items-center gap-2">
  <Icon size={18} />
  <span>Action</span>
</button>

// Large gap for nav items
<a className="flex items-center gap-3">
  <Icon size={22} />
  <span>Navigation</span>
</a>
```

---

## 15. Animation & Transition Standards

### 15.1 Timing & Easing

**Standard Durations:**

- **Fast (160ms)**: Hover states, button presses, color changes
- **Medium (200ms)**: Slides, drawer open/close, panel transitions
- **Slow (300ms)**: Page transitions, modal fade-in (use sparingly)

**Easing Functions:**

- `ease-out`: Default for UI transitions (feels snappy)
- `ease-in-out`: Smooth bidirectional animations (slides)
- `linear`: Progress bars, loading spinners only

### 15.2 Transform Patterns

**Slide-In Drawer (Mobile Sidebar):**

```jsx
// Initial state: off-screen
<div className={`fixed inset-y-0 left-0 w-72 transform transition-transform duration-200 ease-out ${
  isOpen ? 'translate-x-0' : '-translate-x-full'
}`}>
  {/* Drawer content */}
</div>

// Scrim backdrop
<div className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
  isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
}`} />
```

**Slide-Back Overlay (Desktop Sidebar Unlock):**

```jsx
// When unlocking: show rail immediately, slide expanded panel away
{
  isUnlocking && (
    <div className="fixed top-0 left-[5.5rem] w-[10.5rem] h-full bg-card-surface border-r border-soft transition-transform duration-200 ease-out translate-x-0 animate-slide-out">
      {/* Expanded sidebar content */}
    </div>
  )
}
```

**Fade-In (Modals, Toasts):**

```jsx
<div className="opacity-0 animate-fade-in">
  {/* Content appears smoothly */}
</div>

// Custom animation in tailwind.config.js
animation: {
  'fade-in': 'fadeIn 180ms ease-out forwards'
}
keyframes: {
  fadeIn: {
    from: { opacity: 0, transform: 'translateY(4px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  }
}
```

### 15.3 Hover & Focus Transitions

**Button Hover:**

```jsx
// Always include transition-colors for smooth state changes
<button className="bg-primary hover:bg-primary-light transition-colors duration-160">
  Click Me
</button>
```

**Card Hover Elevation:**

```jsx
<div className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
  {/* Card content */}
</div>
```

**Focus Ring (Keyboard Navigation):**

```jsx
// Focus ring appears instantly (no transition delay)
<button className="focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2">
  Accessible Button
</button>
```

### 15.4 Loading Animations

**Pulse (Skeletons):**

```jsx
<div className="bg-surface-muted animate-pulse rounded h-4 w-32" />
```

**Spin (Loading Indicators):**

```jsx
<div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
```

**Progress Bar:**

```jsx
<div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
  <div
    className="h-full bg-primary transition-all duration-300 ease-linear"
    style={{ width: `${progress}%` }}
  />
</div>
```

---

## 16. Gradient & Decorative Element Guidelines

### 16.1 When to Use Gradients

**✅ DO Use Gradients:**

- Auth page banners (50/50 split right side)
- Hero sections on marketing/landing pages
- Feature highlight cards (with white overlay: `bg-white/10`)
- Loading skeletons (`gradient-warm`)

**❌ DON'T Use Gradients:**

- Primary CTA buttons (use solid `bg-primary` instead)
- Small repeated UI elements (nav items, badges)
- Data tables or analytics cards
- Text backgrounds (readability issues)

### 16.2 Gradient Patterns

**Primary Gradient (Triple-Stop):**

```jsx
// For auth banners and hero sections
<div className="bg-gradient-to-br from-primary via-text-primary to-secondary">
  {/* Content with white/light text */}
</div>
```

**Accent Gradient (Warm - Loading Only):**

```jsx
// For skeletons and loading states
<div className="bg-gradient-warm animate-pulse" />
```

**Feature Card Gradient Overlay:**

```jsx
// Semi-transparent with backdrop blur
<div className="bg-gradient-to-br from-primary via-text-primary to-secondary p-8">
  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
    {/* Feature content */}
  </div>
</div>
```

### 16.3 Decorative Element Opacity Layers

Use descending opacity for depth perception on gradient backgrounds:

```jsx
// AuthShell banner decorative elements
<div className="relative overflow-hidden bg-gradient-to-br from-primary via-text-primary to-secondary">
  {/* Logo watermark - highest opacity */}
  <div className="absolute top-8 right-8 opacity-12">
    <Logo size={120} />
  </div>

  {/* Diagonal accent line */}
  <div className="absolute top-1/4 -right-20 w-96 h-1 bg-white/30 rotate-45" />

  {/* Geometric shapes - medium opacity */}
  <div className="absolute bottom-20 left-10 w-32 h-32 border-2 border-white/20 rounded-full" />

  {/* Blur circles - lowest opacity for ambient effect */}
  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
  <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent-amber/3 rounded-full blur-3xl" />
</div>
```

**Opacity Scale for Decorative Elements:**
| Layer Type | Opacity | Use Case |
| -------------- | ------- | ------------------------------- |
| Main icon | 0.12 | Logo watermark, primary graphic |
| Accent lines | 0.30 | Diagonal lines, dividers |
| Shapes | 0.20 | Circles, squares, borders |
| Secondary | 0.15 | Smaller shapes, patterns |
| Tertiary | 0.10 | Background texture |
| Ambient (far) | 0.08 | Blur circles (background) |
| Ambient (mid) | 0.05 | Blur circles (mid-ground) |
| Ambient (near) | 0.03 | Blur circles (foreground) |
| Ultra-subtle | 0.02 | Extreme depth, edge glow |

---

## 17. Accessibility Implementation Guide

### 17.1 Focus Ring Standards

**Interactive Elements (Buttons, Links, Inputs):**

```jsx
// Standard focus ring (blue ring, 2px offset)
<button className="focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background">
  Click Me
</button>

// Input focus (blue border + ring)
<input className="border border-soft focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-focus-ring" />
```

**Custom Focus Indicators:**

```jsx
// For dark backgrounds: increase ring offset
<button className="bg-primary text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary">
  Dark Button
</button>
```

### 17.2 ARIA Attributes

**Icon Buttons:**

```jsx
// Always include aria-label for icon-only buttons
<button aria-label="Open navigation menu">
  <Menu size={18} />
</button>

<button aria-label="Go back to previous page">
  <ArrowLeft size={18} />
</button>
```

**Disclosure States (Drawers, Accordions):**

```jsx
// Indicate expanded/collapsed state
<button aria-expanded={isOpen} aria-controls="mobile-drawer">
  <ChevronsLeft size={18} />
</button>

<div id="mobile-drawer" role="dialog" aria-modal="true">
  {/* Drawer content */}
</div>
```

**Status Messages:**

```jsx
// Announce dynamic content changes to screen readers
<div role="status" aria-live="polite" className="sr-only">
  {loading ? 'Loading results...' : 'Results loaded'}
</div>
```

### 17.3 Keyboard Navigation

**Focus Trap (Modals, Drawers):**

```jsx
// Focus first actionable element on open
useEffect(() => {
  if (isOpen) {
    const firstButton = dialogRef.current.querySelector('button, a, input')
    firstButton?.focus()
  }
}, [isOpen])
```

**Focus Restore (Drawer Close):**

```jsx
// Store trigger element, restore focus on close
const toggleRef = useRef()

const openDrawer = () => {
  toggleRef.current = document.activeElement
  setIsOpen(true)
}

const closeDrawer = () => {
  setIsOpen(false)
  toggleRef.current?.focus()
}
```

**ESC Key Handler:**

```jsx
useEffect(() => {
  const handleEsc = (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeDrawer()
    }
  }
  document.addEventListener('keydown', handleEsc)
  return () => document.removeEventListener('keydown', handleEsc)
}, [isOpen])
```

### 17.4 Screen Reader Patterns

**Skip to Content:**

```jsx
// First focusable element (hidden until focused)
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg">
  Skip to main content
</a>

<main id="main-content">
  {/* Page content */}
</main>
```

**Visually Hidden Labels:**

```jsx
// Provide context without visible label
<button>
  <span className="sr-only">Close navigation</span>
  <X size={18} aria-hidden="true" />
</button>
```

**Loading States:**

```jsx
<button disabled>
  <span className="sr-only">Loading, please wait</span>
  <Loader className="animate-spin" aria-hidden="true" />
</button>
```

---

## 18. Mobile-First Development Checklist

### 18.1 Touch Target Sizes

**Minimum Interactive Size:**

- Buttons, links: 44px × 44px minimum
- Form inputs: 44px height minimum
- Nav items: 48px height recommended

**Implementation:**

```jsx
// Mobile: larger touch target
<button className="p-3 min-h-[44px] min-w-[44px]">
  <Icon size={18} />
</button>

// Desktop: can be smaller
<button className="p-3 md:p-2 min-h-[44px] md:min-h-0">
  <Icon size={18} />
</button>
```

### 18.2 Drawer Patterns (Mobile Overlays)

**Portal to Body:**

```jsx
// Render overlay outside main DOM tree to avoid z-index conflicts
import { createPortal } from 'react-dom'

function MobileDrawer({ isOpen, children }) {
  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
      <div className="absolute inset-y-0 left-0 w-72 bg-card-surface">{children}</div>
    </div>,
    document.body
  )
}
```

**Swipe-to-Close:**

```jsx
// Track horizontal drag distance
const [dragX, setDragX] = useState(0)

const handleTouchMove = (e) => {
  const touch = e.touches[0]
  const deltaX = touch.clientX - startX
  if (deltaX < 0) setDragX(deltaX) // Only allow left swipe
}

const handleTouchEnd = () => {
  if (dragX < -50) {
    // Threshold: 50px
    closeDrawer()
  }
  setDragX(0)
}
```

**Browser Back Integration:**

```jsx
// Push history state on drawer open
useEffect(() => {
  if (isOpen && !pushedHistory.current) {
    window.history.pushState({ drawer: true }, '')
    pushedHistory.current = true
  }
}, [isOpen])

// Handle back button
useEffect(() => {
  const handlePopState = () => {
    if (isOpen) {
      closeDrawer()
    }
  }
  window.addEventListener('popstate', handlePopState)
  return () => window.removeEventListener('popstate', handlePopState)
}, [isOpen])
```

### 18.3 Responsive Typography

**Base Sizes (Mobile → Desktop):**

```jsx
// Headings scale up on larger screens
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Page Title
</h1>

// Body text remains consistent or slightly larger
<p className="text-base md:text-lg leading-relaxed">
  Body content...
</p>

// Small text stays readable
<span className="text-sm md:text-sm text-text-secondary">
  Metadata
</span>
```

### 18.4 Mobile-Specific UI Patterns

**Bottom Tab Bar (If Used):**

```jsx
<nav className="fixed bottom-0 inset-x-0 bg-card-surface/90 backdrop-blur-sm border-t border-soft md:hidden">
  <div className="flex justify-around py-2">
    <button className="flex flex-col items-center gap-1 p-2 min-w-[60px]">
      <Home size={22} />
      <span className="text-xs">Home</span>
    </button>
  </div>
</nav>
```

**Collapsible Sections (Accordions):**

```jsx
// Expand to reveal details on tap (mobile)
;<button className="flex items-center justify-between w-full p-4 text-left" onClick={toggle}>
  <span className="font-medium">Section Title</span>
  <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} size={18} />
</button>
{
  isOpen && <div className="p-4 border-t border-soft">{/* Expanded content */}</div>
}
```

---

## 19. Naming Conventions & Class Patterns

### 19.1 Token Suffix Patterns

**Color Variants:**

- Base: `primary`, `secondary`, `accent-amber`
- Hover: `-light` suffix → `primary-light`, `secondary-light`
- Active: `-dark` suffix → `primary-dark`, `secondary-dark`
- Muted: `-muted` suffix → `surface-muted`

**Surface Tokens:**

- `background`: App canvas (#F7F8FC)
- `card-surface`: Elevated cards (#FFFFFF)
- `surface-muted`: Section differentiation (#EEF1FA)
- `surface-hover`: Hover state for ghost buttons (not in config, use `surface-muted`)

**Text Tokens:**

- `text-primary`: High emphasis (#273043)
- `text-secondary`: Body copy (#5C6784)
- `text-tertiary`: De-emphasized (use `text-neutral-grey`)

### 19.2 State Class Prefixes

**Interactive States:**

```jsx
// Standard progression
<button className="bg-primary hover:bg-primary-light active:bg-primary-dark">

// Focus state
<button className="focus:outline-none focus:ring-2 focus:ring-focus-ring">

// Disabled state
<button className="disabled:opacity-50 disabled:bg-neutral-grey disabled:cursor-not-allowed">
```

**Responsive Prefixes:**

- `sm:` → ≥ 640px
- `md:` → ≥ 768px (primary mobile/desktop breakpoint)
- `lg:` → ≥ 1024px
- `xl:` → ≥ 1280px

### 19.3 Component Class Structure

**Order of Classes (Recommended):**

1. Layout (flex, grid, block, inline-flex)
2. Position (absolute, relative, fixed)
3. Sizing (w-, h-, max-w-, min-h-)
4. Spacing (p-, m-, gap-)
5. Typography (text-, font-, leading-)
6. Colors (bg-, text-, border-)
7. Border & Radius (border, rounded-)
8. Shadow (shadow-)
9. Transitions (transition-)
10. States (hover:, focus:, active:)
11. Responsive (md:, lg:)

**Example:**

```jsx
<button
  className="
  flex items-center gap-2
  px-3.5 py-2
  text-sm font-medium
  bg-primary text-white
  rounded-lg
  shadow-sm
  transition-colors
  hover:bg-primary-light
  active:bg-primary-dark
  focus:outline-none focus:ring-2 focus:ring-focus-ring
  md:px-4 md:text-base
"
>
  Submit
</button>
```

### 19.4 Avoid Raw Hex Values

**✅ DO:**

```jsx
<div className="bg-primary text-white border-soft">
```

**❌ DON'T:**

```jsx
<div className="bg-[#D33F49] text-[#FFFFFF] border-[#D8DEE9]">
```

**Exception:** Only use raw hex in `tailwind.config.js` for token definitions.

---

## 20. Component Catalog Reference

Quick reference for implemented design system components.

### 20.1 Core UI Components

| Component     | Path                         | Props                             | Usage                           |
| ------------- | ---------------------------- | --------------------------------- | ------------------------------- |
| Button        | `components/ui/Button.jsx`   | variant, size, disabled, as       | Actions, form submission        |
| Card          | `components/ui/Card.jsx`     | className                         | Content containers              |
| CardHeader    | `components/ui/Card.jsx`     | className                         | Card title section              |
| CardContent   | `components/ui/Card.jsx`     | className                         | Card body                       |
| CardFooter    | `components/ui/Card.jsx`     | className                         | Card action buttons             |
| Input         | `components/ui/Input.jsx`    | type, icon, placeholder, error    | Text fields                     |
| PasswordInput | `components/ui/Input.jsx`    | placeholder, error                | Password fields (show/hide)     |
| Badge         | `components/ui/Badge.jsx`    | variant, children                 | Status indicators, tags         |
| Icon          | `components/ui/Icon.jsx`     | name, size, className             | Lucide icon wrapper             |
| Toast         | `components/ui/Toast.jsx`    | message, variant, duration        | Notifications                   |
| Modal         | `components/ui/Modal.jsx`    | isOpen, onClose, title, children  | Dialogs, confirmations          |
| Skeleton      | `components/ui/Skeleton.jsx` | className                         | Loading placeholders            |
| Sidebar       | `components/ui/Sidebar.jsx`  | mode (compact/expanded), isMobile | Navigation component (exported) |

### 20.2 Layout Components

| Component     | Path                                  | Props                       | Usage                             |
| ------------- | ------------------------------------- | --------------------------- | --------------------------------- |
| Shell         | `components/layout/Shell.jsx`         | children                    | Main app layout wrapper           |
| AuthShell     | `components/layout/AuthShell.jsx`     | title, showTerms, children  | Auth page 50/50 layout            |
| Sidebar       | `components/layout/Sidebar.jsx`       | (internal state)            | Desktop/mobile navigation         |
| TopBar        | `components/layout/TopBar.jsx`        | (reads route context)       | Header with breadcrumbs, actions  |
| MobileSidebar | `components/layout/MobileSidebar.jsx` | (uses MobileNavContext)     | Portal drawer for mobile          |
| Footer        | `components/layout/Footer.jsx`        | (inside Sidebar)            | User card, logout                 |
| PageHeader    | `components/layout/PageHeader.jsx`    | title, actions, breadcrumbs | Page-level header (if not TopBar) |
| StaticPage    | `components/layout/StaticPage.jsx`    | title, children             | Static content wrapper            |

### 20.3 Usage Examples

**Card:**

```jsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card'
;<Card>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Toast:**

```jsx
import { useToast } from '@/components/ui/Toast'

const toast = useToast()
toast.show('Success!', { variant: 'success' })
toast.show('Error occurred', { variant: 'error' })
```

**Modal:**

```jsx
import { Modal } from '@/components/ui/Modal'
;<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Confirm Action">
  <p>Are you sure?</p>
  <div className="flex gap-3 justify-end mt-4">
    <Button variant="outline" onClick={onClose}>
      Cancel
    </Button>
    <Button onClick={onConfirm}>Confirm</Button>
  </div>
</Modal>
```

---

## 21. Revision Log

| Date       | Change                                                                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2025-10-02 | Initial v1 authored (extracted from sprint + palette finalization)                                                                                                                                            |
| 2025-01-XX | **Major Update:** Added comprehensive implementation patterns from production codebase: Component patterns (§12), Layout conventions (§13), Icon sizing (§14), Animation standards (§15), Gradient guidelines |
|            | (§16), Accessibility guide (§17), Mobile-first checklist (§18), Naming conventions (§19), Component catalog (§20). Extracted real examples from Sidebar, TopBar, AuthShell, AdminLogin, Button, Card.         |

End of document.
