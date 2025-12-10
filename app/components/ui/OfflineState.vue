<script setup lang="ts">
/**
 * OfflineState - Offline/sync state display for offline-first functionality
 * Designed for no connection, sync pending, sync in progress scenarios
 *
 * @example
 * <!-- No connection preset -->
 * <OfflineState preset="no-connection" />
 *
 * <!-- Sync pending -->
 * <OfflineState
 *   preset="sync-pending"
 *   :pending-count="3"
 *   @sync="syncNow"
 * />
 *
 * <!-- Custom offline state -->
 * <OfflineState
 *   icon="heroicons:cloud-arrow-up"
 *   title="You're Offline"
 *   message="Your changes will sync when you're back online"
 * />
 */

export interface OfflineStatePreset {
  icon: string
  title: string
  message: string
  actionLabel?: string
  showAction?: boolean
  variant?: 'info' | 'warning' | 'neutral'
}

interface Props {
  /**
   * Preset offline type
   * 'no-connection' - No internet, data cached
   * 'sync-pending' - Changes waiting to sync
   * 'syncing' - Actively syncing
   * 'limited-connection' - Slow/unreliable connection
   */
  preset?: 'no-connection' | 'sync-pending' | 'syncing' | 'limited-connection'

  /** Custom icon (overrides preset) */
  icon?: string

  /** Custom title (overrides preset) */
  title?: string

  /** Custom message (overrides preset) */
  message?: string

  /** Label for action button */
  actionLabel?: string

  /** Variant for action button */
  actionVariant?: 'primary' | 'secondary' | 'outline' | 'ghost'

  /** Show action button */
  showAction?: boolean

  /** Number of pending items to sync */
  pendingCount?: number

  /** Size variant */
  size?: 'sm' | 'md' | 'lg'

  /** Show animated sync indicator */
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  preset: 'no-connection',
  actionVariant: 'outline',
  size: 'md',
  showAction: true,
  animated: false,
  pendingCount: 0,
})

const emit = defineEmits<{
  sync: []
  action: []
}>()

// Preset configurations
const presets: Record<string, OfflineStatePreset> = {
  'no-connection': {
    icon: 'heroicons:wifi-slash',
    title: 'You\'re Offline',
    message: 'Don\'t worry! Your data is saved locally and will sync when you\'re back online',
    actionLabel: 'Continue Offline',
    showAction: true,
    variant: 'info',
  },
  'sync-pending': {
    icon: 'heroicons:cloud-arrow-up',
    title: 'Sync Pending',
    message: 'You have changes waiting to sync',
    actionLabel: 'Sync Now',
    showAction: true,
    variant: 'warning',
  },
  syncing: {
    icon: 'heroicons:arrow-path',
    title: 'Syncing...',
    message: 'Your changes are being synced to the cloud',
    showAction: false,
    variant: 'info',
  },
  'limited-connection': {
    icon: 'heroicons:signal',
    title: 'Slow Connection',
    message: 'You\'re on a limited connection. Some features may be slower',
    actionLabel: 'Continue',
    showAction: true,
    variant: 'warning',
  },
}

const currentPreset = computed(() => presets[props.preset || 'no-connection'])

const displayIcon = computed(() => props.icon || currentPreset.value.icon)
const displayTitle = computed(() => props.title || currentPreset.value.title)
const displayMessage = computed(() => {
  let message = props.message || currentPreset.value.message

  // Append pending count to message if provided
  if (props.pendingCount > 0 && props.preset === 'sync-pending') {
    message += ` (${props.pendingCount} ${props.pendingCount === 1 ? 'item' : 'items'})`
  }

  return message
})
const displayActionLabel = computed(() => props.actionLabel || currentPreset.value.actionLabel || 'OK')
const shouldShowAction = computed(() => props.showAction && currentPreset.value.showAction !== false)

const sizeClasses = computed(() => `offline-state--${props.size}`)
const variantClass = computed(() => `offline-state--${currentPreset.value.variant || 'info'}`)
const animatedClass = computed(() => props.animated || props.preset === 'syncing' ? 'offline-state--animated' : '')
</script>

<template>
  <div :class="['offline-state', sizeClasses, variantClass, animatedClass]">
    <div class="offline-state__icon-wrapper">
      <Icon :name="displayIcon" class="offline-state__icon" />
    </div>

    <h3 class="offline-state__title">{{ displayTitle }}</h3>

    <p class="offline-state__message">{{ displayMessage }}</p>

    <div v-if="shouldShowAction || actionLabel" class="offline-state__actions">
      <UiButton
        :variant="actionVariant"
        @click="emit(preset === 'sync-pending' ? 'sync' : 'action')"
      >
        {{ displayActionLabel }}
      </UiButton>
    </div>
  </div>
</template>

<style scoped>
.offline-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  animation: fade-in var(--duration-normal) var(--ease-out);
}

/* Sizes */
.offline-state--sm {
  padding: var(--space-6) var(--space-4);
}

.offline-state--md {
  padding: var(--space-12) var(--space-6);
}

.offline-state--lg {
  padding: var(--space-16) var(--space-8);
}

/* Icon wrapper - variants */
.offline-state--info .offline-state__icon-wrapper {
  background: var(--color-info-50);
}

.offline-state--warning .offline-state__icon-wrapper {
  background: var(--color-warning-50);
}

.offline-state--neutral .offline-state__icon-wrapper {
  background: var(--color-neutral-100);
}

.offline-state__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin-bottom: var(--space-4);
  border-radius: var(--radius-full);
  transition: transform var(--duration-normal) var(--ease-in-out);
}

.offline-state--sm .offline-state__icon-wrapper {
  width: 56px;
  height: 56px;
}

.offline-state--lg .offline-state__icon-wrapper {
  width: 96px;
  height: 96px;
}

/* Icon - variants */
.offline-state--info .offline-state__icon {
  color: var(--color-info-500);
}

.offline-state--warning .offline-state__icon {
  color: var(--color-warning-500);
}

.offline-state--neutral .offline-state__icon {
  color: var(--color-neutral-400);
}

.offline-state__icon {
  width: 40px;
  height: 40px;
}

.offline-state--sm .offline-state__icon {
  width: 28px;
  height: 28px;
}

.offline-state--lg .offline-state__icon {
  width: 48px;
  height: 48px;
}

/* Animated icon (for syncing state) */
.offline-state--animated .offline-state__icon {
  animation: spin-pulse 2s ease-in-out infinite;
}

/* Title */
.offline-state__title {
  margin: 0 0 var(--space-2);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
  line-height: var(--leading-tight);
}

.offline-state--sm .offline-state__title {
  font-size: var(--text-base);
}

.offline-state--lg .offline-state__title {
  font-size: var(--text-xl);
}

/* Message */
.offline-state__message {
  margin: 0 0 var(--space-6);
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
  max-width: 280px;
  line-height: var(--leading-relaxed);
}

.offline-state--sm .offline-state__message {
  font-size: var(--text-xs);
  margin-bottom: var(--space-4);
}

.offline-state--lg .offline-state__message {
  font-size: var(--text-base);
  max-width: 320px;
}

/* Action buttons */
.offline-state__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
  max-width: 280px;
  margin-top: var(--space-2);
}

.offline-state--sm .offline-state__actions {
  max-width: 240px;
}

.offline-state--lg .offline-state__actions {
  max-width: 320px;
}

/* Animations */
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

@keyframes spin-pulse {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .offline-state--info .offline-state__icon-wrapper {
    background: rgba(59, 130, 246, 0.15);
  }

  .offline-state--warning .offline-state__icon-wrapper {
    background: rgba(245, 158, 11, 0.15);
  }

  .offline-state--neutral .offline-state__icon-wrapper {
    background: var(--color-neutral-800);
  }

  .offline-state__title {
    color: var(--color-neutral-100);
  }

  .offline-state__message {
    color: var(--color-neutral-400);
  }
}
</style>