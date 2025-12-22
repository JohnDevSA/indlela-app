<script setup lang="ts">
/**
 * OfflineHeaderBar - Unified offline/sync status bar
 * Integrates below header title, replaces multiple offline indicators
 *
 * States:
 * - offline: Red bar, shows "You're offline"
 * - syncing: Primary color, shows "Syncing..."
 * - pending: Warning color, shows pending count with tap-to-sync
 *
 * @example
 * <!-- In your page header, after the title toolbar -->
 * <IonHeader>
 *   <IonToolbar color="primary">
 *     <IonTitle>Indlela</IonTitle>
 *   </IonToolbar>
 *   <OfflineHeaderBar />
 * </IonHeader>
 */

const { isOnline, isSyncing, pendingCount, forceSync } = useOffline()
const { t } = useI18n()
const { haptic } = useAnimation()

// Computed: should the bar be visible?
const isVisible = computed(() => !isOnline.value || pendingCount.value > 0)

// Computed: current status type
const statusType = computed(() => {
  if (!isOnline.value) return 'offline'
  if (isSyncing.value) return 'syncing'
  if (pendingCount.value > 0) return 'pending'
  return 'online'
})

// Computed: icon based on status
const iconName = computed(() => {
  switch (statusType.value) {
    case 'offline':
      return 'heroicons:wifi-slash'
    case 'syncing':
      return 'heroicons:arrow-path'
    case 'pending':
      return 'heroicons:cloud-arrow-up'
    default:
      return 'heroicons:wifi'
  }
})

// Computed: status message
const statusMessage = computed(() => {
  switch (statusType.value) {
    case 'offline':
      return t('common.offline_mode')
    case 'syncing':
      return t('common.syncing')
    case 'pending':
      return t('common.pending_sync', { count: pendingCount.value })
    default:
      return ''
  }
})

// Computed: can tap to sync
const canSync = computed(() =>
  isOnline.value && pendingCount.value > 0 && !isSyncing.value
)

// Handle tap to sync
const handleTap = async () => {
  if (canSync.value) {
    haptic('light')
    await forceSync()
    haptic('success')
  }
}
</script>

<template>
  <Transition name="slide-down">
    <div
      v-if="isVisible"
      :class="[
        'offline-header-bar',
        `offline-header-bar--${statusType}`,
        { 'offline-header-bar--interactive': canSync }
      ]"
      role="status"
      :aria-live="statusType === 'offline' ? 'assertive' : 'polite'"
      @click="handleTap"
    >
      <div class="offline-header-bar__content">
        <Icon
          :name="iconName"
          :class="[
            'offline-header-bar__icon',
            { 'offline-header-bar__icon--spin': isSyncing }
          ]"
        />
        <span class="offline-header-bar__text">{{ statusMessage }}</span>
        <span v-if="canSync" class="offline-header-bar__action">
          {{ t('common.tap_to_sync') }}
        </span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.offline-header-bar {
  width: 100%;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  user-select: none;
}

.offline-header-bar__content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  min-height: 36px;
}

/* Offline state - Red/Danger */
.offline-header-bar--offline {
  background: var(--color-error-500);
  color: white;
}

/* Syncing state - Primary */
.offline-header-bar--syncing {
  background: var(--color-primary-500);
  color: white;
}

/* Pending state - Warning/Amber */
.offline-header-bar--pending {
  background: var(--color-warning-500);
  color: var(--color-neutral-900);
}

/* Interactive state (can sync) */
.offline-header-bar--interactive {
  cursor: pointer;
}

.offline-header-bar--interactive:active {
  opacity: 0.9;
}

/* Icon */
.offline-header-bar__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.offline-header-bar__icon--spin {
  animation: spin 1s linear infinite;
}

/* Text */
.offline-header-bar__text {
  line-height: 1.2;
}

/* Action hint */
.offline-header-bar__action {
  font-size: var(--text-xs);
  opacity: 0.85;
  margin-left: var(--space-1);
}

.offline-header-bar__action::before {
  content: '\2022';
  margin-right: var(--space-1);
}

/* Spin animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Slide-down transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.25s ease-out, opacity 0.25s ease-out;
  transform-origin: top;
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
  .offline-header-bar__icon--spin {
    animation: none;
  }

  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: opacity 0.15s;
  }

  .slide-down-enter-from,
  .slide-down-leave-to {
    transform: none;
  }
}
</style>
