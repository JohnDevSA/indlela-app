<script setup lang="ts">
/**
 * UiCard - Flexible card component with multiple variants
 * Inspired by: Linear, Notion, Stripe
 *
 * @example
 * <UiCard>Basic card content</UiCard>
 * <UiCard variant="elevated" :interactive="true">Clickable card</UiCard>
 * <UiCard variant="outlined" padding="lg">Large padding</UiCard>
 */

interface Props {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  interactive: false,
  disabled: false,
  loading: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const cardClasses = computed(() => [
  'ui-card',
  `ui-card--${props.variant}`,
  `ui-card--padding-${props.padding}`,
  {
    'ui-card--interactive': props.interactive,
    'ui-card--disabled': props.disabled,
    'ui-card--loading': props.loading,
  },
])

function handleClick(event: MouseEvent) {
  if (props.interactive && !props.disabled) {
    emit('click', event)
  }
}
</script>

<template>
  <div
    :class="cardClasses"
    :tabindex="interactive && !disabled ? 0 : undefined"
    :role="interactive ? 'button' : undefined"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Loading overlay -->
    <div v-if="loading" class="ui-card__loading">
      <Icon name="lucide:loader-2" class="animate-spin" />
    </div>

    <!-- Header slot -->
    <div v-if="$slots.header" class="ui-card__header">
      <slot name="header" />
    </div>

    <!-- Main content -->
    <div class="ui-card__content">
      <slot />
    </div>

    <!-- Footer slot -->
    <div v-if="$slots.footer" class="ui-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.ui-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition-property: transform, box-shadow, border-color;
  transition-duration: var(--duration-normal);
  transition-timing-function: var(--ease-in-out);
}

/* Variants */
.ui-card--default {
  background: var(--color-neutral-0);
  box-shadow: var(--shadow-sm);
}

.ui-card--elevated {
  background: var(--color-neutral-0);
  box-shadow: var(--shadow-md);
}

.ui-card--outlined {
  background: var(--color-neutral-0);
  border: 1.5px solid var(--color-neutral-200);
}

.ui-card--filled {
  background: var(--color-neutral-100);
}

.ui-card--glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Padding */
.ui-card--padding-none {
  padding: 0;
}

.ui-card--padding-sm {
  padding: var(--space-3);
}

.ui-card--padding-md {
  padding: var(--space-4);
}

.ui-card--padding-lg {
  padding: var(--space-6);
}

/* Interactive state */
.ui-card--interactive {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.ui-card--interactive:hover:not(.ui-card--disabled) {
  transform: translateY(-2px);
}

.ui-card--default.ui-card--interactive:hover:not(.ui-card--disabled) {
  box-shadow: var(--shadow-md);
}

.ui-card--elevated.ui-card--interactive:hover:not(.ui-card--disabled) {
  box-shadow: var(--shadow-lg);
}

.ui-card--outlined.ui-card--interactive:hover:not(.ui-card--disabled) {
  border-color: var(--color-primary-300);
}

.ui-card--interactive:active:not(.ui-card--disabled) {
  transform: translateY(0) scale(0.99);
}

.ui-card--interactive:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-neutral-0), 0 0 0 4px var(--color-primary-500);
}

/* Disabled state */
.ui-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading state */
.ui-card--loading {
  pointer-events: none;
}

.ui-card__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.ui-card__loading :deep(svg) {
  width: 24px;
  height: 24px;
  color: var(--color-primary-500);
}

/* Sections */
.ui-card__header {
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-neutral-200);
  margin-bottom: var(--space-3);
}

.ui-card--padding-none .ui-card__header {
  padding: var(--space-4);
  padding-bottom: var(--space-3);
  margin-bottom: 0;
}

.ui-card__content {
  flex: 1;
}

.ui-card__footer {
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-neutral-200);
  margin-top: var(--space-3);
}

.ui-card--padding-none .ui-card__footer {
  padding: var(--space-4);
  padding-top: var(--space-3);
  margin-top: 0;
}

/* Animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .ui-card--default,
  .ui-card--elevated,
  .ui-card--outlined {
    background: var(--color-neutral-900);
  }

  .ui-card--outlined {
    border-color: var(--color-neutral-700);
  }

  .ui-card--filled {
    background: var(--color-neutral-800);
  }

  .ui-card--glass {
    background: rgba(23, 23, 23, 0.7);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .ui-card__header,
  .ui-card__footer {
    border-color: var(--color-neutral-700);
  }

  .ui-card__loading {
    background: rgba(23, 23, 23, 0.8);
  }
}
</style>
