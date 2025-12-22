<script setup lang="ts">
import { IonApp } from '@ionic/vue'

// Show dev tools only in development
const isDev = process.dev

// Initialize status bar
const { initStatusBar } = useStatusBar()

// Initialize native features on mount
onMounted(async () => {
  // Initialize status bar on native platforms
  await initStatusBar()
})
</script>

<template>
  <IonApp>
    <!-- Use NuxtLayout and NuxtPage for Nuxt routing -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Dev Mode Switcher (only in development) -->
    <DevDevSwitcher v-if="isDev" />
  </IonApp>
</template>