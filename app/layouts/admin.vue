<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { grid, people, briefcase, calendar, statsChart, settings, arrowBack } from 'ionicons/icons'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const tabs = [
  { name: 'dashboard', path: '/admin', icon: grid, label: 'Dashboard' },
  { name: 'users', path: '/admin/users', icon: people, label: 'Users' },
  { name: 'providers', path: '/admin/providers', icon: briefcase, label: 'Providers' },
  { name: 'bookings', path: '/admin/bookings', icon: calendar, label: 'Bookings' },
  { name: 'reports', path: '/admin/reports', icon: statsChart, label: 'Reports' },
]

const isActive = (path: string) => {
  if (path === '/admin') {
    return route.path === '/admin' || route.path === '/admin/'
  }
  return route.path.startsWith(path)
}

const navigate = (path: string) => {
  router.push(path)
}

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="admin-layout">
    <!-- Admin Header -->
    <header class="admin-header">
      <button class="back-button" @click="goBack">
        <IonIcon :icon="arrowBack" />
      </button>
      <h1>Admin Panel</h1>
      <div class="header-badge">DEV</div>
    </header>

    <!-- Admin Navigation -->
    <nav class="admin-nav">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        class="nav-button"
        :class="{ active: isActive(tab.path) }"
        @click="navigate(tab.path)"
      >
        <IonIcon :icon="tab.icon" />
        <span>{{ tab.label }}</span>
      </button>
    </nav>

    <!-- Main Content -->
    <main class="admin-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--ion-color-light);
}

.admin-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: var(--ion-color-danger);
  color: white;
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  padding: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-button ion-icon {
  font-size: 20px;
}

.admin-header h1 {
  flex: 1;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
}

.admin-nav {
  display: flex;
  gap: 4px;
  padding: 8px;
  background: white;
  border-bottom: 1px solid var(--ion-border-color);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.admin-nav::-webkit-scrollbar {
  display: none;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--ion-color-light);
  border: 1px solid var(--ion-border-color);
  border-radius: 8px;
  font-size: 13px;
  color: var(--ion-color-medium-shade);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.nav-button ion-icon {
  font-size: 16px;
}

.nav-button.active {
  background: var(--ion-color-danger);
  border-color: var(--ion-color-danger);
  color: white;
}

.admin-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}
</style>