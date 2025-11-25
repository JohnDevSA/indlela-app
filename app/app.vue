<script setup lang="ts">
import { IonApp } from '@ionic/vue'

// Simple online state (no API calls)
const isOnline = ref(true)

// Check online status
onMounted(() => {
  isOnline.value = navigator.onLine
  window.addEventListener('online', () => isOnline.value = true)
  window.addEventListener('offline', () => isOnline.value = false)
})
</script>

<template>
  <IonApp>
    <!-- Offline Banner -->
    <div v-if="!isOnline" class="offline-banner safe-area-top">
      {{ $t('common.offline_mode') }}
    </div>

    <!-- Use NuxtLayout and NuxtPage for Nuxt routing -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </IonApp>
</template>

<style scoped>
.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background-color: var(--ion-color-warning);
  color: var(--ion-color-warning-contrast);
  padding: 8px 16px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
}
</style>