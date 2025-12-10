# Create UI Component

Create a new reusable UI component following Indlela's design system patterns.

## Instructions

When the user asks you to create a new UI component, follow these guidelines:

### 1. Component Structure
- Place the component in the appropriate directory:
  - `app/components/ui/base/` - Core primitives (buttons, inputs, cards)
  - `app/components/ui/feedback/` - Toasts, modals, loading states
  - `app/components/ui/layout/` - Layout components, grids, containers
  - `app/components/ui/ai/` - AI-specific components (chat, voice)
  - `app/components/[feature]/` - Feature-specific components

### 2. Component Template
```vue
<script setup lang="ts">
/**
 * ComponentName - Brief description
 * Inspired by: [Reference apps/patterns]
 *
 * @example
 * <ComponentName prop="value" />
 */

interface Props {
  // Define props with defaults
}

const props = withDefaults(defineProps<Props>(), {
  // Default values
})

const emit = defineEmits<{
  // Typed events
}>()

// Composables, computed, methods...
</script>

<template>
  <!-- Semantic HTML with proper ARIA -->
</template>

<style scoped>
/* Use design tokens from design-tokens.css */
/* Follow BEM-like naming: .component__element--modifier */
/* Include dark mode support */
/* Include reduced motion support */
</style>
```

### 3. Design System Requirements
- Use CSS custom properties from `design-tokens.css`
- Minimum touch target: 44x44px (var(--touch-target-min))
- Support dark mode via media query
- Respect `prefers-reduced-motion`
- Follow the color palette (primary green, secondary gold)

### 4. Accessibility Checklist
- [ ] Proper semantic HTML elements
- [ ] ARIA labels where needed
- [ ] Keyboard navigation support
- [ ] Focus visible states
- [ ] Color contrast ratios
- [ ] Screen reader compatible

### 5. Icon Usage
Use the `<Icon>` component with Iconify names:
- Heroicons: `heroicons:icon-name`
- Phosphor: `ph:icon-name`
- Lucide: `lucide:icon-name`

### 6. Animation Guidelines
- Use transitions from `animations.css`
- Provide haptic feedback via `useAnimation()` composable
- Keep animations subtle and purposeful

## Arguments

$COMPONENT_NAME - The name of the component to create (e.g., "ServiceCard", "BookingStatus")
$COMPONENT_TYPE - The type: base, feedback, layout, ai, or feature name
$DESCRIPTION - Brief description of what the component does

## Example Usage

```
/ui-component ServiceCard feature "Display service provider information with rating and price"
```
