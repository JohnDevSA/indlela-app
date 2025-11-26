<script setup lang="ts">
/**
 * UiBadge - Status badges and labels
 * Inspired by: GitHub, Linear, Notion
 *
 * @example
 * <UiBadge>Default</UiBadge>
 * <UiBadge variant="success">Completed</UiBadge>
 * <UiBadge variant="warning" dot>Pending</UiBadge>
 */

interface Props {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  pill?: boolean
  outline?: boolean
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  dot: false,
  pill: true,
  outline: false,
})

const badgeClasses = computed(() => [
  'ui-badge',
  `ui-badge--${props.variant}`,
  `ui-badge--${props.size}`,
  {
    'ui-badge--pill': props.pill,
    'ui-badge--outline': props.outline,
    'ui-badge--with-dot': props.dot,
    'ui-badge--with-icon': props.icon,
  },
])
</script>

<template>
  <span :class="badgeClasses">
    <span v-if="dot" class="ui-badge__dot" />
    <Icon v-if="icon" :name="icon" class="ui-badge__icon" />
    <span class="ui-badge__content">
      <slot />
    </span>
  </span>
</template>

<style scoped>
.ui-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-weight: var(--font-medium);
  white-space: nowrap;
  vertical-align: middle;
  border: 1.5px solid transparent;
}

/* Sizes */
.ui-badge--sm {
  height: 20px;
  padding: 0 var(--space-2);
  font-size: 11px;
  border-radius: var(--radius-sm);
}

.ui-badge--md {
  height: 24px;
  padding: 0 var(--space-3);
  font-size: var(--text-xs);
  border-radius: var(--radius-md);
}

.ui-badge--lg {
  height: 28px;
  padding: 0 var(--space-3);
  font-size: var(--text-sm);
  border-radius: var(--radius-md);
}

.ui-badge--pill {
  border-radius: var(--radius-full);
}

/* Variants - Solid */
.ui-badge--default {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
}

.ui-badge--primary {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}

.ui-badge--secondary {
  background: var(--color-secondary-100);
  color: var(--color-secondary-800);
}

.ui-badge--success {
  background: var(--color-success-50);
  color: var(--color-success-600);
}

.ui-badge--warning {
  background: var(--color-warning-50);
  color: var(--color-warning-600);
}

.ui-badge--error {
  background: var(--color-error-50);
  color: var(--color-error-600);
}

.ui-badge--info {
  background: var(--color-info-50);
  color: var(--color-info-600);
}

/* Outline variants */
.ui-badge--outline.ui-badge--default {
  background: transparent;
  border-color: var(--color-neutral-300);
  color: var(--color-neutral-600);
}

.ui-badge--outline.ui-badge--primary {
  background: transparent;
  border-color: var(--color-primary-300);
  color: var(--color-primary-600);
}

.ui-badge--outline.ui-badge--secondary {
  background: transparent;
  border-color: var(--color-secondary-300);
  color: var(--color-secondary-600);
}

.ui-badge--outline.ui-badge--success {
  background: transparent;
  border-color: var(--color-success-500);
  color: var(--color-success-600);
}

.ui-badge--outline.ui-badge--warning {
  background: transparent;
  border-color: var(--color-warning-500);
  color: var(--color-warning-600);
}

.ui-badge--outline.ui-badge--error {
  background: transparent;
  border-color: var(--color-error-500);
  color: var(--color-error-600);
}

.ui-badge--outline.ui-badge--info {
  background: transparent;
  border-color: var(--color-info-500);
  color: var(--color-info-600);
}

/* Dot indicator */
.ui-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.ui-badge--default .ui-badge__dot {
  background: var(--color-neutral-500);
}

.ui-badge--primary .ui-badge__dot {
  background: var(--color-primary-500);
}

.ui-badge--secondary .ui-badge__dot {
  background: var(--color-secondary-500);
}

.ui-badge--success .ui-badge__dot {
  background: var(--color-success-500);
}

.ui-badge--warning .ui-badge__dot {
  background: var(--color-warning-500);
}

.ui-badge--error .ui-badge__dot {
  background: var(--color-error-500);
}

.ui-badge--info .ui-badge__dot {
  background: var(--color-info-500);
}

/* Icon */
.ui-badge__icon {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .ui-badge--default {
    background: var(--color-neutral-800);
    color: var(--color-neutral-300);
  }

  .ui-badge--primary {
    background: rgba(0, 168, 107, 0.2);
    color: var(--color-primary-400);
  }

  .ui-badge--secondary {
    background: rgba(245, 166, 35, 0.2);
    color: var(--color-secondary-400);
  }

  .ui-badge--success {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
  }

  .ui-badge--warning {
    background: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
  }

  .ui-badge--error {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
  }

  .ui-badge--info {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
  }
}
</style>
