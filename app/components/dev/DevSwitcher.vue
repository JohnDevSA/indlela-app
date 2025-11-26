<script setup lang="ts">
import {
  IonFab,
  IonFabButton,
  IonIcon,
  IonChip,
} from '@ionic/vue'
import { code, person, briefcase, shield, logIn, logOut, personAdd } from 'ionicons/icons'
import { useAuthStore, mockUsers, type MockUserType } from '~/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isOpen = ref(false)

// Current mode based on route
const currentMode = computed(() => {
  if (route.path.startsWith('/provider-dashboard')) return 'provider'
  if (route.path.startsWith('/admin')) return 'admin'
  if (route.path.startsWith('/auth')) return 'auth'
  if (route.path.startsWith('/onboarding')) return 'onboarding'
  return 'customer'
})

const modeColors: Record<string, string> = {
  customer: 'primary',
  provider: 'success',
  admin: 'danger',
  auth: 'warning',
  onboarding: 'tertiary',
}

// Account simulation options
const accountTypes: { key: MockUserType; label: string; icon: string; color: string; description: string }[] = [
  { key: 'customer', label: 'Customer', icon: person, color: 'primary', description: 'Thabo Molefe (verified)' },
  { key: 'provider', label: 'Provider', icon: briefcase, color: 'success', description: 'Thandi Mokoena (verified)' },
  { key: 'admin', label: 'Admin', icon: shield, color: 'danger', description: 'Admin User' },
  { key: 'newCustomer', label: 'New Customer', icon: personAdd, color: 'tertiary', description: 'Needs onboarding' },
  { key: 'newProvider', label: 'New Provider', icon: personAdd, color: 'tertiary', description: 'Needs onboarding' },
]

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
  ]},
  { label: 'Onboarding', icon: personAdd, color: 'tertiary', links: [
    { name: 'Customer', path: '/onboarding/customer' },
    { name: 'Provider', path: '/onboarding/provider' },
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

const loginAs = (userType: MockUserType) => {
  const user = authStore.devLogin(userType)

  // Navigate based on user type and onboarding status
  if (!user.onboardingCompleted) {
    if (user.role === 'provider') {
      router.push('/onboarding/provider')
    } else {
      router.push('/onboarding/customer')
    }
  } else if (user.role === 'provider') {
    router.push('/provider-dashboard')
  } else if (user.role === 'admin') {
    router.push('/admin')
  } else {
    router.push('/')
  }
  isOpen.value = false
}

const logout = () => {
  authStore.devLogout()
  router.push('/auth/login')
  isOpen.value = false
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
            <!-- Account Simulation Section -->
            <div class="dev-section account-section">
              <h4>
                <IonIcon :icon="logIn" color="primary" />
                Simulate Account
              </h4>

              <!-- Current User Status -->
              <div class="current-user">
                <div v-if="authStore.isAuthenticated" class="user-info">
                  <div class="user-details">
                    <span class="user-name">{{ authStore.user?.name || 'Unknown' }}</span>
                    <span class="user-role">{{ authStore.user?.role }}</span>
                    <span v-if="!authStore.user?.onboardingCompleted" class="needs-onboarding">
                      (needs onboarding)
                    </span>
                  </div>
                  <button class="logout-btn" @click="logout">
                    <IonIcon :icon="logOut" />
                    Logout
                  </button>
                </div>
                <div v-else class="not-logged-in">
                  Not logged in
                </div>
              </div>

              <!-- Quick Login Buttons -->
              <div class="account-buttons">
                <button
                  v-for="account in accountTypes"
                  :key="account.key"
                  class="account-btn"
                  :class="{ active: authStore.user?.id === mockUsers[account.key].id }"
                  @click="loginAs(account.key)"
                >
                  <IonIcon :icon="account.icon" :color="account.color" />
                  <div class="account-info">
                    <span class="account-label">{{ account.label }}</span>
                    <span class="account-desc">{{ account.description }}</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Navigation Links -->
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
  width: 340px;
  max-height: 80vh;
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

/* Account Simulation Styles */
.account-section {
  background: var(--ion-color-light-tint);
  border-radius: 12px;
  padding: 8px;
  margin: 8px;
}

.current-user {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
}

.user-role {
  font-size: 12px;
  color: var(--ion-color-medium);
  text-transform: capitalize;
}

.needs-onboarding {
  font-size: 11px;
  color: var(--ion-color-warning-shade);
}

.not-logged-in {
  color: var(--ion-color-medium);
  font-style: italic;
  font-size: 13px;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--ion-color-danger-tint);
  color: var(--ion-color-danger);
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
}

.account-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.account-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px;
  background: white;
  border: 1px solid var(--ion-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.account-btn:hover {
  border-color: var(--ion-color-primary);
  background: var(--ion-color-primary-tint);
}

.account-btn.active {
  border-color: var(--ion-color-primary);
  background: var(--ion-color-primary-tint);
}

.account-btn ion-icon {
  font-size: 22px;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.account-label {
  font-weight: 600;
  font-size: 13px;
}

.account-desc {
  font-size: 11px;
  color: var(--ion-color-medium);
}

/* Navigation Links */
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