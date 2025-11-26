<script setup lang="ts">
/**
 * UiSpinner - Loading spinner with multiple variants
 * Inspired by: Linear, Vercel, Stripe
 *
 * @example
 * <UiSpinner />
 * <UiSpinner size="lg" color="primary" />
 * <UiSpinner variant="dots" />
 */

interface Props {
  variant?: 'spin' | 'dots' | 'pulse'
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'neutral' | 'current'
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'spin',
  size: 'md',
  color: 'primary',
})

const sizeMap = {
  sm: '16px',
  md: '24px',
  lg: '32px',
}

const spinnerClasses = computed(() => [
  'ui-spinner',
  `ui-spinner--${props.variant}`,
  `ui-spinner--${props.size}`,
  `ui-spinner--${props.color}`,
])
</script>

<template>
  <div
    :class="spinnerClasses"
    role="status"
    :aria-label="label || 'Loading'"
  >
    <!-- Spin variant -->
    <template v-if="variant === 'spin'">
      <svg class="ui-spinner__svg" viewBox="0 0 24 24" fill="none">
        <circle
          class="ui-spinner__track"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="3"
        />
        <path
          class="ui-spinner__indicator"
          d="M12 2C6.47715 2 2 6.47715 2 12"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>
    </template>

    <!-- Dots variant -->
    <template v-else-if="variant === 'dots'">
      <span class="ui-spinner__dot" />
      <span class="ui-spinner__dot" />
      <span class="ui-spinner__dot" />
    </template>

    <!-- Pulse variant -->
    <template v-else-if="variant === 'pulse'">
      <span class="ui-spinner__pulse" />
    </template>

    <span class="sr-only">{{ label || 'Loading' }}</span>
  </div>
</template>

<style scoped>
.ui-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Sizes */
.ui-spinner--sm {
  width: 16px;
  height: 16px;
}

.ui-spinner--md {
  width: 24px;
  height: 24px;
}

.ui-spinner--lg {
  width: 32px;
  height: 32px;
}

/* Colors */
.ui-spinner--primary {
  color: var(--color-primary-500);
}

.ui-spinner--white {
  color: white;
}

.ui-spinner--neutral {
  color: var(--color-neutral-500);
}

.ui-spinner--current {
  color: currentColor;
}

/* Spin variant */
.ui-spinner__svg {
  width: 100%;
  height: 100%;
  animation: rotate 1s linear infinite;
}

.ui-spinner__track {
  opacity: 0.2;
}

.ui-spinner__indicator {
  opacity: 1;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

/* Dots variant */
.ui-spinner--dots {
  gap: 4px;
}

.ui-spinner__dot {
  width: 25%;
  height: 25%;
  background: currentColor;
  border-radius: var(--radius-full);
  animation: bounce 1.4s ease-in-out infinite both;
}

.ui-spinner__dot:nth-child(1) {
  animation-delay: -0.32s;
}

.ui-spinner__dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Pulse variant */
.ui-spinner--pulse {
  position: relative;
}

.ui-spinner__pulse {
  width: 100%;
  height: 100%;
  background: currentColor;
  border-radius: var(--radius-full);
  animation: pulse-ring 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* Screen reader only */
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
