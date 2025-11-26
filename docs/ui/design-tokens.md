# Design Tokens

Design tokens are the visual design atoms of the design system. They define colors, spacing, typography, and other low-level values.

## Usage

All tokens are available as CSS custom properties:

```css
.my-component {
  color: var(--color-primary-500);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
}
```

## Color System

### Primary Colors (Ubuntu Green)
Represents community, growth, and trust.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary-50` | #e6f7f0 | Subtle backgrounds |
| `--color-primary-100` | #b3e8d4 | Hover states |
| `--color-primary-200` | #80d9b8 | Borders |
| `--color-primary-300` | #4dca9c | - |
| `--color-primary-400` | #26be85 | - |
| `--color-primary-500` | #00A86B | **Main brand color** |
| `--color-primary-600` | #009760 | Hover/pressed states |
| `--color-primary-700` | #008352 | Text on light bg |
| `--color-primary-800` | #006f45 | - |
| `--color-primary-900` | #004d30 | - |

### Secondary Colors (Warm Gold)
Represents trust, value, and premium quality.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-secondary-500` | #F5A623 | **Main secondary** |
| `--color-secondary-600` | #e09520 | Hover states |

### Semantic Colors

| Category | Token | Usage |
|----------|-------|-------|
| Success | `--color-success-500` | Completed states, confirmations |
| Warning | `--color-warning-500` | Pending states, cautions |
| Error | `--color-error-500` | Errors, destructive actions |
| Info | `--color-info-500` | Informational states |

### Neutral Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-neutral-0` | #ffffff | #0a0a0a | Backgrounds |
| `--color-neutral-50` | #f9fafb | #171717 | Subtle backgrounds |
| `--color-neutral-100` | #f3f4f6 | #262626 | Cards, inputs |
| `--color-neutral-500` | #6b7280 | #a3a3a3 | Secondary text |
| `--color-neutral-900` | #111827 | #fafafa | Primary text |

## Spacing System

Based on an 8px grid for consistent rhythm.

| Token | Value | Pixels |
|-------|-------|--------|
| `--space-1` | 0.25rem | 4px |
| `--space-2` | 0.5rem | 8px |
| `--space-3` | 0.75rem | 12px |
| `--space-4` | 1rem | 16px |
| `--space-5` | 1.25rem | 20px |
| `--space-6` | 1.5rem | 24px |
| `--space-8` | 2rem | 32px |
| `--space-10` | 2.5rem | 40px |
| `--space-12` | 3rem | 48px |
| `--space-16` | 4rem | 64px |

```css
/* Example usage */
.card {
  padding: var(--space-4);      /* 16px */
  margin-bottom: var(--space-6); /* 24px */
  gap: var(--space-2);          /* 8px */
}
```

## Typography

### Font Families

| Token | Value |
|-------|-------|
| `--font-sans` | System font stack |
| `--font-mono` | SF Mono, Fira Code, etc. |

### Font Sizes

| Token | Value | Usage |
|-------|-------|-------|
| `--text-xs` | 0.75rem (12px) | Captions, labels |
| `--text-sm` | 0.875rem (14px) | Secondary text |
| `--text-base` | 1rem (16px) | Body text |
| `--text-lg` | 1.125rem (18px) | Subtitles |
| `--text-xl` | 1.25rem (20px) | Section headers |
| `--text-2xl` | 1.5rem (24px) | Page titles |
| `--text-3xl` | 1.875rem (30px) | Hero text |

### Font Weights

| Token | Value |
|-------|-------|
| `--font-normal` | 400 |
| `--font-medium` | 500 |
| `--font-semibold` | 600 |
| `--font-bold` | 700 |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Small elements |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards |
| `--radius-xl` | 16px | Modals |
| `--radius-2xl` | 24px | Large cards |
| `--radius-full` | 9999px | Pills, avatars |

## Shadows

| Token | Usage |
|-------|-------|
| `--shadow-xs` | Subtle elevation |
| `--shadow-sm` | Cards, buttons |
| `--shadow-md` | Dropdowns, popovers |
| `--shadow-lg` | Modals, toasts |
| `--shadow-xl` | Large modals |
| `--shadow-primary` | Primary CTA glow |
| `--shadow-secondary` | Secondary CTA glow |

## Transitions

### Durations

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 100ms | Hover states |
| `--duration-normal` | 200ms | Most transitions |
| `--duration-slow` | 300ms | Page transitions |
| `--duration-slower` | 500ms | Complex animations |

### Easing Functions

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-linear` | linear | Progress bars |
| `--ease-in` | cubic-bezier(0.4, 0, 1, 1) | Exit animations |
| `--ease-out` | cubic-bezier(0, 0, 0.2, 1) | Enter animations |
| `--ease-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | General use |
| `--ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Bouncy effects |

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Default |
| `--z-dropdown` | 10 | Dropdowns |
| `--z-sticky` | 20 | Sticky headers |
| `--z-fixed` | 30 | Fixed elements |
| `--z-modal-backdrop` | 40 | Modal overlay |
| `--z-modal` | 50 | Modal content |
| `--z-popover` | 60 | Popovers |
| `--z-tooltip` | 70 | Tooltips |
| `--z-toast` | 80 | Toast notifications |

## Touch Targets

| Token | Value | Usage |
|-------|-------|-------|
| `--touch-target-min` | 44px | Minimum for accessibility |
| `--touch-target-sm` | 36px | Dense UIs only |
| `--touch-target-lg` | 56px | Primary CTAs |

## Dark Mode

Dark mode is automatically applied via CSS media query:

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Tokens are automatically swapped */
  }
}
```

All neutral color tokens automatically adjust for dark mode. Use the tokens consistently and dark mode will "just work."
