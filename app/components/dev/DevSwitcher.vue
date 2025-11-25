<script setup lang="ts">
import {
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
  IonChip,
} from '@ionic/vue'
import { code, person, briefcase, shield, home, settings, list, calendar, wallet } from 'ionicons/icons'

const router = useRouter()
const route = useRoute()

const isOpen = ref(false)

// Current mode based on route
const currentMode = computed(() => {
  if (route.path.startsWith('/provider-dashboard')) return 'provider'
  if (route.path.startsWith('/admin')) return 'admin'
  if (route.path.startsWith('/auth')) return 'auth'
  return 'customer'
})

const modeColors: Record<string, string> = {
  customer: 'primary',
  provider: 'success',
  admin: 'danger',
  auth: 'warning',
}

const quickLinks = [
  { label: 'Customer', icon: person, color: 'primary', links: [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Bookings', path: '/bookings' },
    { name: 'Settings', path: '/settings' },
  ]},
  { label: 'Provider', icon: briefcase, color: 'success', links: [
    { name: 'Jobs', path: '/provider-dashboard' },
    { name: 'Schedule', path: '/provider-dashboard/schedule' },
    { name: 'Earnings', path: '/provider-dashboard/earnings' },
    { name: 'Profile', path: '/provider-dashboard/profile' },
  ]},
  { label: 'Admin', icon: shield, color: 'danger', links: [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Providers', path: '/admin/providers' },
    { name: 'Bookings', path: '/admin/bookings' },
    { name: 'Reports', path: '/admin/reports' },
  ]},
  { label: 'Auth', icon: person, color: 'warning', links: [
    { name: 'Login', path: '/auth/login' },
    { name: 'Verify OTP', path: '/auth/verify-otp' },
  ]},
]

const navigate = (path: string) => {
  router.push(path)
  isOpen.value = false
}

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="dev-switcher">
    <!-- Floating Action Button -->
    <IonFab vertical="bottom" horizontal="start" slot="fixed">
      <IonFabButton size="small" :color="modeColors[currentMode]" @click="toggleOpen">
        <IonIcon :icon="code" />
      </IonFabButton>
    </IonFab>

    <!-- Dev Panel Overlay -->
    <Teleport to="body">
      <div v-if="isOpen" class="dev-overlay" @click="isOpen = false">
        <div class="dev-panel" @click.stop>
          <div class="dev-header">
            <h3>Developer Mode</h3>
            <IonChip :color="modeColors[currentMode]">
              {{ currentMode }}
            </IonChip>
          </div>

          <div class="dev-content">
            <div v-for="section in quickLinks" :key="section.label" class="dev-section">
              <h4>
                <IonIcon :icon="section.icon" :color="section.color" />
                {{ section.label }}
              </h4>
              <div class="dev-links">
                <button
                  v-for="link in section.links"
                  :key="link.path"
                  class="dev-link"
                  :class="{ active: route.path === link.path }"
                  @click="navigate(link.path)"
                >
                  {{ link.name }}
                </button>
              </div>
            </div>
          </div>

          <div class="dev-footer">
            <p>Current: <code>{{ route.path }}</code></p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.dev-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99999;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 16px;
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}

.dev-panel {
  background: var(--ion-background-color, #fff);
  border-radius: 16px;
  width: 320px;
  max-height: 70vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.dev-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--ion-border-color);
  background: var(--ion-color-light);
}

.dev-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.dev-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.dev-section {
  margin-bottom: 16px;
}

.dev-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  padding: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ion-color-medium-shade);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dev-section h4 ion-icon {
  font-size: 18px;
}

.dev-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 8px;
}

.dev-link {
  background: var(--ion-color-light);
  border: 1px solid var(--ion-border-color);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--ion-text-color);
  cursor: pointer;
  transition: all 0.2s;
}

.dev-link:hover {
  background: var(--ion-color-primary-tint);
  border-color: var(--ion-color-primary);
  color: var(--ion-color-primary);
}

.dev-link.active {
  background: var(--ion-color-primary);
  border-color: var(--ion-color-primary);
  color: white;
}

.dev-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--ion-border-color);
  background: var(--ion-color-light);
}

.dev-footer p {
  margin: 0;
  font-size: 11px;
  color: var(--ion-color-medium);
}

.dev-footer code {
  background: var(--ion-color-medium-tint);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}
</style>