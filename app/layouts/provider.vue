<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { briefcase, wallet, calendar, settings } from 'ionicons/icons'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const tabs = [
  { name: 'jobs', path: '/provider-dashboard', icon: briefcase, label: 'provider.nav.jobs' },
  { name: 'schedule', path: '/provider-dashboard/schedule', icon: calendar, label: 'provider.nav.schedule' },
  { name: 'earnings', path: '/provider-dashboard/earnings', icon: wallet, label: 'provider.nav.earnings' },
  { name: 'settings', path: '/provider-dashboard/profile', icon: settings, label: 'provider.nav.settings' },
]

const isActive = (path: string) => {
  if (path === '/provider-dashboard') {
    return route.path === '/provider-dashboard' || route.path === '/provider-dashboard/'
  }
  return route.path.startsWith(path)
}

const navigate = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="provider-layout">
    <main class="provider-content">
      <slot />
    </main>

    <nav class="provider-tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        class="tab-button"
        :class="{ active: isActive(tab.path) }"
        @click="navigate(tab.path)"
      >
        <IonIcon :icon="tab.icon" />
        <span>{{ t(tab.label) }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.provider-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.provider-content {
  flex: 1;
  overflow: auto;
}

.provider-tab-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: var(--ion-color-primary);
  padding: 8px 0;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
}

.tab-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  cursor: pointer;
  transition: color 0.2s;
}

.tab-button ion-icon {
  font-size: 24px;
}

.tab-button.active {
  color: white;
}

.tab-button span {
  font-weight: 500;
}
</style>