<script setup lang="ts">
/**
 * UiSkeleton - Loading placeholder with shimmer animation
 * Inspired by: Facebook, LinkedIn, Stripe
 *
 * @example
 * <UiSkeleton /> <!-- Default line -->
 * <UiSkeleton variant="circle" size="lg" /> <!-- Avatar placeholder -->
 * <UiSkeleton variant="rect" :height="200" /> <!-- Image placeholder -->
 */

interface Props {
  variant?: 'line' | 'circle' | 'rect'
  size?: 'sm' | 'md' | 'lg'
  width?: string | number
  height?: string | number
  animate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'line',
  size: 'md',
  animate: true,
})

const sizeMap = {
  sm: { line: '12px', circle: '32px' },
  md: { line: '16px', circle: '40px' },
  lg: { line: '20px', circle: '56px' },
}

const computedStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }

  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  } else if (props.variant === 'line') {
    style.height = sizeMap[props.size].line
  } else if (props.variant === 'circle') {
    style.width = sizeMap[props.size].circle
    style.height = sizeMap[props.size].circle
  }

  return style
})

const skeletonClasses = computed(() => [
  'ui-skeleton',
  `ui-skeleton--${props.variant}`,
  {
    'ui-skeleton--animated': props.animate,
  },
])
</script>

<template>
  <div :class="skeletonClasses" :style="computedStyle" />
</template>

<style scoped>
.ui-skeleton {
  background: var(--color-neutral-200);
  position: relative;
  overflow: hidden;
}

.ui-skeleton--line {
  width: 100%;
  border-radius: var(--radius-md);
}

.ui-skeleton--circle {
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.ui-skeleton--rect {
  width: 100%;
  min-height: 100px;
  border-radius: var(--radius-lg);
}

/* Shimmer animation */
.ui-skeleton--animated::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.5) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
  transform: translateX(-100%);
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .ui-skeleton {
    background: var(--color-neutral-800);
  }

  .ui-skeleton--animated::after {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
  }
}
</style>
