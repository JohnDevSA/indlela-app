<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { home, search, calendar, person } from 'ionicons/icons'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// Determine if we should show tabs (customer view)
const showTabs = computed(() => {
  const noTabRoutes = ['/auth', '/provider-dashboard']
  return !noTabRoutes.some(path => route.path.startsWith(path))
})

const tabs = [
  { name: 'home', path: '/', icon: home, label: 'nav.home' },
  { name: 'services', path: '/services', icon: search, label: 'nav.services' },
  { name: 'bookings', path: '/bookings', icon: calendar, label: 'nav.bookings' },
  { name: 'profile', path: '/settings', icon: person, label: 'nav.profile' },
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const navigate = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="layout-container">
    <main class="layout-content">
      <slot />
    </main>

    <!-- Custom tab bar for customer navigation -->
    <nav v-if="showTabs" class="tab-bar">
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
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.layout-content {
  flex: 1;
  overflow: auto;
}

.tab-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: var(--ion-background-color, #fff);
  border-top: 1px solid var(--ion-border-color, #e0e0e0);
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
  color: var(--ion-color-medium, #92949c);
  font-size: 10px;
  cursor: pointer;
  transition: color 0.2s;
}

.tab-button ion-icon {
  font-size: 24px;
}

.tab-button.active {
  color: var(--ion-color-primary, #00A86B);
}

.tab-button span {
  font-weight: 500;
}
</style>