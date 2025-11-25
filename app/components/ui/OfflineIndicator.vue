<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { cloudOffline, sync } from 'ionicons/icons'

const { isOnline, isSyncing, pendingCount, forceSync } = useOffline()
const { t } = useI18n()

const handleSync = async () => {
  if (!isSyncing.value && isOnline.value) {
    await forceSync()
  }
}
</script>

<template>
  <div
    v-if="!isOnline || pendingCount > 0"
    class="offline-indicator"
    :class="{ 'is-offline': !isOnline, 'is-syncing': isSyncing }"
    @click="handleSync"
  >
    <IonIcon :icon="isSyncing ? sync : cloudOffline" class="icon" />
    <span class="text">
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
  </div>
</template>

<style scoped>
.offline-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--ion-color-warning);
  color: var(--ion-color-warning-contrast);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.offline-indicator.is-offline {
  background: var(--ion-color-danger);
  color: var(--ion-color-danger-contrast);
}

.offline-indicator.is-syncing {
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
}

.icon {
  font-size: 18px;
}

.is-syncing .icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.text {
  flex: 1;
}
</style>