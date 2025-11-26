<script setup lang="ts">
/**
 * OfflineIndicator - Shows offline status and sync state
 * Refined to use Indlela design system tokens
 *
 * Automatically shows when offline or has pending sync items.
 * Click to manually trigger sync when online.
 *
 * @example
 * <OfflineIndicator />
 */

const { isOnline, isSyncing, pendingCount, forceSync } = useOffline()
const { t } = useI18n()
const { haptic } = useAnimation()

const handleSync = async () => {
  if (!isSyncing.value && isOnline.value) {
    haptic('light')
    await forceSync()
    haptic('success')
  }
}

const statusType = computed(() => {
  if (!isOnline.value) return 'offline'
  if (isSyncing.value) return 'syncing'
  if (pendingCount.value > 0) return 'pending'
  return 'online'
})

const iconName = computed(() => {
  switch (statusType.value) {
    case 'offline':
      return 'heroicons:signal-slash'
    case 'syncing':
      return 'lucide:refresh-cw'
    case 'pending':
      return 'heroicons:cloud-arrow-up'
    default:
      return 'heroicons:wifi'
  }
})

const isVisible = computed(() => !isOnline.value || pendingCount.value > 0)
</script>

<template>
  <Transition name="slide-down">
    <button
      v-if="isVisible"
      type="button"
      :class="[
        'offline-indicator',
        `offline-indicator--${statusType}`,
      ]"
      :disabled="!isOnline.value || isSyncing"
      @click="handleSync"
    >
      <Icon
        :name="iconName"
        :class="['offline-indicator__icon', { 'animate-spin': isSyncing }]"
      />
      <span class="offline-indicator__text">
        <template v-if="!isOnline">
          {{ t('common.offline_mode') }}
        </template>
        <template v-else-if="isSyncing">
          {{ t('common.loading') }}
        </template>
        <template v-else-if="pendingCount > 0">
          {{ t('common.pending_sync', { count: pendingCount }) }}
        </template>
      </span>
      <span v-if="pendingCount > 0 && isOnline && !isSyncing" class="offline-indicator__hint">
        {{ t('common.tap_to_sync') }}
      </span>
    </button>
  </Transition>
</template>

<style scoped>
.offline-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: none;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-out);
}

.offline-indicator:disabled {
  cursor: default;
}

/* Offline state - red/danger */
.offline-indicator--offline {
  background: var(--color-error-500);
  color: white;
}

/* Syncing state - primary */
.offline-indicator--syncing {
  background: var(--color-primary-500);
  color: white;
}

/* Pending state - warning */
.offline-indicator--pending {
  background: var(--color-warning-500);
  color: var(--color-neutral-900);
}

.offline-indicator--pending:hover:not(:disabled) {
  background: var(--color-warning-600);
}

/* Icon */
.offline-indicator__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Text */
.offline-indicator__text {
  flex: 1;
}

/* Hint text */
.offline-indicator__hint {
  font-size: var(--text-xs);
  opacity: 0.8;
}

/* Spin animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Slide transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform var(--duration-normal) var(--ease-out),
              opacity var(--duration-normal) var(--ease-out);
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-spin {
    animation: none;
  }

  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: opacity var(--duration-fast);
  }

  .slide-down-enter-from,
  .slide-down-leave-to {
    transform: none;
  }
}
</style>
