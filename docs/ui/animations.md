# Animations & Motion

Guidelines for creating smooth, purposeful animations in Indlela.

## Philosophy

1. **Purposeful** - Animations should guide users, not distract
2. **Subtle** - Less is more; keep animations fast and light
3. **Accessible** - Respect `prefers-reduced-motion`
4. **Performant** - Use GPU-accelerated properties

## Animation Tokens

### Durations

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 100ms | Hover states, micro-interactions |
| `--duration-normal` | 200ms | Most transitions |
| `--duration-slow` | 300ms | Page transitions, modals |
| `--duration-slower` | 500ms | Complex animations |

### Easing Functions

| Token | Usage |
|-------|-------|
| `--ease-linear` | Progress bars, continuous motion |
| `--ease-in` | Elements exiting |
| `--ease-out` | Elements entering |
| `--ease-in-out` | General purpose |
| `--ease-spring` | Bouncy, playful effects |

## CSS Animation Classes

Import `animations.css` for pre-built animations:

### Entrance Animations

```vue
<div class="animate-fade-in">Fades in</div>
<div class="animate-slide-up">Slides up</div>
<div class="animate-slide-down">Slides down</div>
<div class="animate-scale-in">Scales in</div>
<div class="animate-spring-in">Bouncy entrance</div>
```

### Continuous Animations

```vue
<Icon name="lucide:loader-2" class="animate-spin" />
<div class="animate-pulse">Pulsing element</div>
<div class="animate-bounce">Bouncing element</div>
```

### Interaction States

```vue
<!-- Lift on hover -->
<div class="hover-lift">Card that lifts</div>

<!-- Scale on hover -->
<div class="hover-scale">Card that scales</div>

<!-- Press effect -->
<button class="press-scale">Button with press</button>

<!-- Combined interactive -->
<div class="interactive">Full interaction set</div>
```

## Staggered Lists

Animate list items with staggered delays:

```vue
<ul class="stagger-list">
  <li class="stagger-item">Item 1</li>
  <li class="stagger-item">Item 2</li>
  <li class="stagger-item">Item 3</li>
</ul>
```

## Vue Transitions

### Basic Fade

```vue
<template>
  <Transition name="v-fade">
    <div v-if="show">Content</div>
  </Transition>
</template>
```

### Slide Up

```vue
<template>
  <Transition name="v-slide-up">
    <div v-if="show">Content</div>
  </Transition>
</template>
```

### Scale

```vue
<template>
  <Transition name="v-scale">
    <div v-if="show">Content</div>
  </Transition>
</template>
```

### List Transitions

```vue
<template>
  <TransitionGroup name="v-list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </TransitionGroup>
</template>
```

## useAnimation Composable

The `useAnimation` composable provides utilities and haptic feedback:

```ts
const { haptic, hapticSelection, prefersReducedMotion } = useAnimation()

// Trigger haptic feedback
function handlePress() {
  haptic('light')  // light, medium, heavy
}

function handleSuccess() {
  haptic('success')  // success, warning, error
}

// Selection haptic (for toggles)
function handleToggle() {
  hapticSelection()
}

// Check motion preferences
if (!prefersReducedMotion.value) {
  // Run animation
}
```

### Haptic Types

| Type | Usage |
|------|-------|
| `light` | Subtle feedback (taps, hovers) |
| `medium` | Normal interactions (button press) |
| `heavy` | Important actions |
| `success` | Successful operations |
| `warning` | Warnings, cautions |
| `error` | Errors, destructive actions |

## Scroll Animations

Animate elements as they scroll into view:

```vue
<script setup lang="ts">
const { useScrollAnimation } = useAnimation()
const elementRef = ref<HTMLElement | null>(null)
const { isVisible } = useScrollAnimation(elementRef)
</script>

<template>
  <div
    ref="elementRef"
    :class="['scroll-animate', { 'is-visible': isVisible }]"
  >
    Animates when scrolled into view
  </div>
</template>
```

## AI Chat Animations

Special animations for AI interfaces:

### Typing Indicator

```vue
<div class="typing-indicator">
  <span class="dot"></span>
  <span class="dot"></span>
  <span class="dot"></span>
</div>
```

### Streaming Cursor

```vue
<span class="streaming-cursor">
  Text being streamed...
</span>
```

### Message Entrance

```vue
<div class="message-enter">
  New chat message
</div>
```

## Performance Guidelines

### Use GPU-Accelerated Properties

```css
/* Good: GPU accelerated */
.animate {
  transform: translateY(10px);
  opacity: 0.5;
}

/* Avoid: Triggers layout */
.animate {
  top: 10px;
  width: 100px;
}
```

### Avoid Layout Thrashing

```ts
// Bad: Forces multiple reflows
elements.forEach(el => {
  el.style.height = el.offsetHeight + 10 + 'px'
})

// Good: Batch reads and writes
const heights = elements.map(el => el.offsetHeight)
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px'
})
```

### Use `will-change` Sparingly

```css
/* Only when needed */
.animating {
  will-change: transform;
}

/* Remove after animation */
.animation-done {
  will-change: auto;
}
```

## Reduced Motion

Always respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation: none;
    transition: none;
  }
}
```

```ts
const { prefersReducedMotion, getDuration } = useAnimation()

// Get appropriate duration
const duration = getDuration(300) // Returns 0 if reduced motion
```

## Animation Timing Guidelines

| Action | Duration | Easing |
|--------|----------|--------|
| Hover state | 100ms | ease-out |
| Button press | 100ms | ease-out |
| Modal open | 200ms | ease-spring |
| Modal close | 150ms | ease-in |
| Page transition | 300ms | ease-in-out |
| Toast entrance | 300ms | ease-spring |
| Toast exit | 200ms | ease-in |
| List item stagger | 50ms delay | ease-out |
