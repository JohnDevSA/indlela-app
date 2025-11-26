# Accessibility Guidelines

Accessibility is a core requirement for Indlela. Follow these guidelines to ensure the app is usable by everyone.

## Core Requirements

### 1. Touch Targets

All interactive elements must have a minimum size of 44x44 pixels.

```css
.interactive-element {
  min-height: var(--touch-target-min); /* 44px */
  min-width: var(--touch-target-min);
}
```

**Why?** Users with motor impairments need larger targets. This also improves usability for everyone on mobile devices.

### 2. Color Contrast

- **Normal text**: 4.5:1 contrast ratio minimum
- **Large text (18px+)**: 3:1 contrast ratio minimum
- **Interactive elements**: 3:1 contrast ratio minimum

Our design tokens ensure proper contrast:
- Use `--color-neutral-900` for primary text
- Use `--color-neutral-600` for secondary text (not lighter)
- Never use `--color-neutral-400` or lighter for text

### 3. Color Independence

Never use color as the only indicator:

```vue
<!-- Bad: Only color indicates error -->
<input :class="{ 'border-red': hasError }" />

<!-- Good: Icon + color + text -->
<div v-if="hasError" class="error-message">
  <Icon name="heroicons:exclamation-circle" />
  <span>{{ errorMessage }}</span>
</div>
```

### 4. Focus States

All interactive elements must have visible focus states:

```css
.interactive:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-neutral-0), 0 0 0 4px var(--color-primary-500);
}
```

**Never remove focus outlines without providing an alternative!**

### 5. Keyboard Navigation

Ensure all functionality is accessible via keyboard:

- `Tab` - Move between interactive elements
- `Enter/Space` - Activate buttons/links
- `Escape` - Close modals/dropdowns
- Arrow keys - Navigate within components

```vue
<template>
  <div
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    Accessible button
  </div>
</template>
```

## Semantic HTML

### Use Correct Elements

```vue
<!-- Bad: Div as button -->
<div @click="submit">Submit</div>

<!-- Good: Actual button -->
<button @click="submit">Submit</button>

<!-- Bad: Span as link -->
<span @click="navigate">Go to page</span>

<!-- Good: Actual link -->
<NuxtLink to="/page">Go to page</NuxtLink>
```

### Heading Hierarchy

Use headings in order without skipping levels:

```vue
<!-- Good -->
<h1>Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection</h3>

<!-- Bad: Skipped h2 -->
<h1>Page Title</h1>
<h3>Section Title</h3>
```

### Form Labels

Every input must have an associated label:

```vue
<!-- Explicit label -->
<label for="email">Email</label>
<input id="email" type="email" />

<!-- Or use aria-label -->
<input type="search" aria-label="Search providers" />
```

## ARIA Attributes

### When to Use ARIA

1. **Only when HTML semantics aren't enough**
2. **Roles** - Define what an element is
3. **States** - Define current condition
4. **Properties** - Define relationships

### Common Patterns

```vue
<!-- Loading state -->
<button :aria-busy="isLoading" :disabled="isLoading">
  {{ isLoading ? 'Loading...' : 'Submit' }}
</button>

<!-- Expanded/collapsed -->
<button :aria-expanded="isOpen" aria-controls="dropdown">
  Menu
</button>
<div id="dropdown" v-show="isOpen">...</div>

<!-- Live regions for dynamic content -->
<div aria-live="polite" aria-atomic="true">
  {{ statusMessage }}
</div>

<!-- Modal dialog -->
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Confirm Action</h2>
  ...
</div>
```

## Screen Readers

### Announce Dynamic Changes

```vue
<template>
  <!-- Announce when list updates -->
  <div aria-live="polite" class="sr-only">
    {{ searchResults.length }} results found
  </div>

  <ul>
    <li v-for="result in searchResults" :key="result.id">
      {{ result.name }}
    </li>
  </ul>
</template>

<style scoped>
/* Visually hidden but readable by screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
```

### Meaningful Link Text

```vue
<!-- Bad: Vague link text -->
<a href="/booking/123">Click here</a>

<!-- Good: Descriptive link text -->
<a href="/booking/123">View booking details for plumbing service</a>

<!-- Or use aria-label -->
<a href="/booking/123" aria-label="View booking details for plumbing service">
  View details
</a>
```

## Reduced Motion

Respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

In JavaScript:
```ts
const { prefersReducedMotion } = useAnimation()

if (!prefersReducedMotion.value) {
  // Run animation
}
```

## Images

### Alt Text

```vue
<!-- Decorative image (no alt needed) -->
<img src="/decorative.png" alt="" role="presentation" />

<!-- Informative image -->
<img
  src="/provider.jpg"
  alt="John Doe, 5-star rated plumber"
/>

<!-- Complex image -->
<figure>
  <img src="/chart.png" alt="Rating distribution chart" />
  <figcaption>
    Distribution of ratings: 80% 5-star, 15% 4-star, 5% 3-star or below
  </figcaption>
</figure>
```

## Testing Checklist

- [ ] Tab through entire page - all interactive elements reachable?
- [ ] Can complete all actions with keyboard only?
- [ ] Focus visible on all interactive elements?
- [ ] Color contrast meets requirements?
- [ ] Screen reader announces all content meaningfully?
- [ ] Touch targets are 44px minimum?
- [ ] Works with browser zoom at 200%?
- [ ] Animations respect reduced motion preference?

## Tools

- **axe DevTools** - Browser extension for automated testing
- **WAVE** - Web accessibility evaluation tool
- **VoiceOver (Mac/iOS)** - Built-in screen reader
- **TalkBack (Android)** - Built-in screen reader
- **Lighthouse** - Chrome DevTools accessibility audit
