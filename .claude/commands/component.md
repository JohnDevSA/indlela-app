# Create New Component

Create a new Vue component for Indlela following project conventions.

## Instructions

When the user runs `/component <name>`, create a new component.

## Naming & Location

- UI components: `app/components/ui/<Name>.vue`
- Feature components: `app/components/<feature>/<Name>.vue`
- Use PascalCase for component names

## Requirements

1. **Structure**:
   - `<script setup lang="ts">` at the top
   - `<template>` in the middle
   - `<style scoped>` at the bottom

2. **TypeScript**:
   - Define props with `defineProps<{...}>()`
   - Define emits with `defineEmits<{...}>()`
   - Use proper type imports

3. **Accessibility**:
   - Minimum 44x44px touch targets
   - Proper ARIA labels where needed
   - Semantic HTML elements

4. **Ionic Integration**:
   - Use Ionic components where appropriate
   - Follow Ionic design patterns
   - Support dark mode via CSS variables

## Component Template

```vue
<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import type { PropType } from 'vue'

// Props
interface Props {
  title: string
  subtitle?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

// Emits
const emit = defineEmits<{
  click: [event: MouseEvent]
  change: [value: string]
}>()

// State
const isActive = ref(false)

// Methods
const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<template>
  <div
    class="component-name"
    :class="{ 'is-disabled': disabled, 'is-active': isActive }"
    @click="handleClick"
  >
    <slot name="icon" />
    <div class="content">
      <h3 class="title">{{ title }}</h3>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </div>
    <slot name="action" />
  </div>
</template>

<style scoped>
.component-name {
  display: flex;
  align-items: center;
  gap: var(--indlela-spacing-md);
  padding: var(--indlela-spacing-md);
  min-height: var(--indlela-touch-target);
  border-radius: var(--indlela-radius-md);
  background: var(--ion-card-background);
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.component-name:active {
  transform: scale(0.98);
}

.component-name.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.content {
  flex: 1;
  min-width: 0;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-text-color);
}

.subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--ion-color-medium);
}
</style>
```

## Common Component Types

- **Card**: Display entity (ProviderCard, BookingCard)
- **List**: Display collection with loading/empty states
- **Form**: Input with validation
- **Button**: Action with loading state
- **Badge**: Status indicator
- **Modal**: Overlay content

Now create the component based on the user's input.