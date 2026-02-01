<script setup lang="ts">
/**
 * UiButton - Primary button component with multiple variants
 * Inspired by: Linear, Vercel, Stripe
 *
 * @example
 * <UiButton>Default</UiButton>
 * <UiButton variant="secondary">Secondary</UiButton>
 * <UiButton variant="ghost" size="sm">Small Ghost</UiButton>
 * <UiButton :loading="true">Loading...</UiButton>
 */

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  fullWidth: false,
  iconPosition: 'left',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const isDisabled = computed(() => props.disabled || props.loading)

const buttonClasses = computed(() => [
  'ui-button',
  `ui-button--${props.variant}`,
  `ui-button--${props.size}`,
  {
    'ui-button--full-width': props.fullWidth,
    'ui-button--loading': props.loading,
    'ui-button--disabled': isDisabled.value,
    'ui-button--icon-only': props.icon && !slots.default,
  },
])

const slots = useSlots()

function handleClick(event: MouseEvent) {
  if (!isDisabled.value) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="isDisabled"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <span v-if="loading" class="ui-button__spinner">
      <Icon name="lucide:loader-2" class="animate-spin" />
    </span>

    <!-- Icon left (slot takes priority over prop) -->
    <span v-if="slots['icon-left'] && !loading" class="ui-button__icon">
      <slot name="icon-left" />
    </span>
    <Icon
      v-else-if="icon && iconPosition === 'left' && !loading"
      :name="icon"
      class="ui-button__icon"
    />

    <!-- Content -->
    <span v-if="slots.default" class="ui-button__content">
      <slot />
    </span>

    <!-- Icon right (slot takes priority over prop) -->
    <span v-if="slots['icon-right'] && !loading" class="ui-button__icon">
      <slot name="icon-right" />
    </span>
    <Icon
      v-else-if="icon && iconPosition === 'right' && !loading"
      :name="icon"
      class="ui-button__icon"
    />
  </button>
</template>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: none;
  border-radius: var(--radius-button);
  font-family: var(--font-sans);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition-property: background-color, color, box-shadow, transform, opacity;
  transition-duration: var(--duration-normal);
  transition-timing-function: var(--ease-in-out);
  white-space: nowrap;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Focus states */
.ui-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-neutral-0), 0 0 0 4px var(--color-primary-500);
}

/* Active state - subtle press effect */
.ui-button:active:not(.ui-button--disabled) {
  transform: scale(0.98);
}

/* Sizes */
.ui-button--sm {
  height: 36px;
  padding: 0 var(--space-3);
  font-size: var(--text-sm);
}

.ui-button--md {
  height: var(--touch-target-min);
  padding: 0 var(--space-4);
  font-size: var(--text-base);
}

.ui-button--lg {
  height: var(--touch-target-lg);
  padding: 0 var(--space-6);
  font-size: var(--text-lg);
}

/* Variants */
.ui-button--primary {
  background: var(--color-primary-500);
  color: white;
}

.ui-button--primary:hover:not(.ui-button--disabled) {
  background: var(--color-primary-600);
  box-shadow: var(--shadow-primary);
}

.ui-button--secondary {
  background: var(--color-neutral-100);
  color: var(--color-neutral-900);
}

.ui-button--secondary:hover:not(.ui-button--disabled) {
  background: var(--color-neutral-200);
}

.ui-button--outline {
  background: transparent;
  color: var(--color-neutral-700);
  border: 1.5px solid var(--color-neutral-300);
}

.ui-button--outline:hover:not(.ui-button--disabled) {
  background: var(--color-neutral-50);
  border-color: var(--color-neutral-400);
}

.ui-button--ghost {
  background: transparent;
  color: var(--color-neutral-600);
}

.ui-button--ghost:hover:not(.ui-button--disabled) {
  background: var(--color-neutral-100);
  color: var(--color-neutral-900);
}

.ui-button--danger {
  background: var(--color-error-500);
  color: white;
}

.ui-button--danger:hover:not(.ui-button--disabled) {
  background: var(--color-error-600);
}

/* States */
.ui-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ui-button--loading {
  cursor: wait;
}

.ui-button--full-width {
  width: 100%;
}

.ui-button--icon-only.ui-button--sm {
  width: 36px;
  padding: 0;
}

.ui-button--icon-only.ui-button--md {
  width: var(--touch-target-min);
  padding: 0;
}

.ui-button--icon-only.ui-button--lg {
  width: var(--touch-target-lg);
  padding: 0;
}

/* Internal elements */
.ui-button__spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ui-button__icon {
  flex-shrink: 0;
  width: 1.25em;
  height: 1.25em;
}

.ui-button__content {
  display: flex;
  align-items: center;
}

/* Animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .ui-button--secondary {
    background: var(--color-neutral-800);
    color: var(--color-neutral-100);
  }

  .ui-button--secondary:hover:not(.ui-button--disabled) {
    background: var(--color-neutral-700);
  }

  .ui-button--outline {
    border-color: var(--color-neutral-600);
    color: var(--color-neutral-300);
  }

  .ui-button--outline:hover:not(.ui-button--disabled) {
    background: var(--color-neutral-800);
    border-color: var(--color-neutral-500);
  }

  .ui-button--ghost {
    color: var(--color-neutral-400);
  }

  .ui-button--ghost:hover:not(.ui-button--disabled) {
    background: var(--color-neutral-800);
    color: var(--color-neutral-100);
  }
}
</style>
