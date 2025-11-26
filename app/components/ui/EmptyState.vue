<script setup lang="ts">
/**
 * EmptyState - Empty state display with icon, title, message, and optional action
 * Refined to use Indlela design system tokens
 *
 * @example
 * <EmptyState
 *   icon="heroicons:inbox"
 *   title="No bookings yet"
 *   message="Your bookings will appear here"
 *   action-label="Find Services"
 *   @action="navigateToServices"
 * />
 */

interface Props {
  icon: string
  title: string
  message?: string
  actionLabel?: string
  actionVariant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  actionVariant: 'outline',
  size: 'md',
})

const emit = defineEmits<{
  action: []
}>()

const sizeClasses = computed(() => `empty-state--${props.size}`)
</script>

<template>
  <div :class="['empty-state', sizeClasses]">
    <div class="empty-state__icon-wrapper">
      <Icon :name="icon" class="empty-state__icon" />
    </div>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p v-if="message" class="empty-state__message">{{ message }}</p>
    <UiButton
      v-if="actionLabel"
      :variant="actionVariant"
      class="empty-state__action"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </UiButton>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  animation: fade-in var(--duration-normal) var(--ease-out);
}

/* Sizes */
.empty-state--sm {
  padding: var(--space-6) var(--space-4);
}

.empty-state--md {
  padding: var(--space-12) var(--space-6);
}

.empty-state--lg {
  padding: var(--space-16) var(--space-8);
}

/* Icon wrapper */
.empty-state__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin-bottom: var(--space-4);
  background: var(--color-neutral-100);
  border-radius: var(--radius-full);
}

.empty-state--sm .empty-state__icon-wrapper {
  width: 56px;
  height: 56px;
}

.empty-state--lg .empty-state__icon-wrapper {
  width: 96px;
  height: 96px;
}

/* Icon */
.empty-state__icon {
  width: 40px;
  height: 40px;
  color: var(--color-neutral-400);
}

.empty-state--sm .empty-state__icon {
  width: 28px;
  height: 28px;
}

.empty-state--lg .empty-state__icon {
  width: 48px;
  height: 48px;
}

/* Title */
.empty-state__title {
  margin: 0 0 var(--space-2);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
  line-height: var(--leading-tight);
}

.empty-state--sm .empty-state__title {
  font-size: var(--text-base);
}

.empty-state--lg .empty-state__title {
  font-size: var(--text-xl);
}

/* Message */
.empty-state__message {
  margin: 0 0 var(--space-6);
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
  max-width: 280px;
  line-height: var(--leading-relaxed);
}

.empty-state--sm .empty-state__message {
  font-size: var(--text-xs);
  margin-bottom: var(--space-4);
}

.empty-state--lg .empty-state__message {
  font-size: var(--text-base);
  max-width: 320px;
}

/* Action button */
.empty-state__action {
  margin-top: var(--space-2);
}

/* Animation */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .empty-state__icon-wrapper {
    background: var(--color-neutral-800);
  }

  .empty-state__title {
    color: var(--color-neutral-100);
  }

  .empty-state__message {
    color: var(--color-neutral-400);
  }
}
</style>
