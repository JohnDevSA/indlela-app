<script setup lang="ts">
import { IonApp } from '@ionic/vue'

const config = useRuntimeConfig()

// Simple online state (no API calls)
const isOnline = ref(true)

// Show dev tools only in development
const isDev = process.dev

// Initialize status bar
const { initStatusBar } = useStatusBar()

// Check online status and initialize native features
onMounted(async () => {
  isOnline.value = navigator.onLine
  window.addEventListener('online', () => isOnline.value = true)
  window.addEventListener('offline', () => isOnline.value = false)

  // Initialize status bar on native platforms
  await initStatusBar()
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

    <!-- Dev Mode Switcher (only in development) -->
    <DevDevSwitcher v-if="isDev" />
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