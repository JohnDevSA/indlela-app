<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonToggle,
  IonChip,
  IonButton,
  IonActionSheet,
} from '@ionic/vue'
import {
  personCircle,
  construct,
  location,
  star,
  checkmarkCircle,
  notifications,
  helpCircle,
  logOut,
  home,
} from 'ionicons/icons'
import { mockProviders } from '~/utils/mock-data'

definePageMeta({
  layout: 'provider',
})

const { t } = useI18n()
const router = useRouter()

// Mock current provider
const currentProvider = mockProviders[0]

// State
const isAvailable = ref(true)
const showLogoutSheet = ref(false)

// Methods
const editProfile = () => {
  router.push('/provider-dashboard/edit-profile')
}

const manageServices = () => {
  router.push('/provider-dashboard/services')
}

const switchToCustomer = () => {
  router.push('/')
}

const confirmLogout = () => {
  showLogoutSheet.value = true
}

const handleLogout = () => {
  router.push('/auth/login')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-ZA', {
    month: 'long',
    year: 'numeric',
  })
}

const logoutButtons = [
  {
    text: t('auth.logout'),
    role: 'destructive',
    handler: handleLogout,
  },
  {
    text: t('common.cancel'),
    role: 'cancel',
  },
]
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonTitle>{{ t('provider.nav.settings') }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar">
          {{ currentProvider.user?.name?.charAt(0) || 'P' }}
        </div>
        <h2 class="profile-name">{{ currentProvider.user?.name }}</h2>
        <div class="profile-badges">
          <IonChip v-if="currentProvider.status === 'verified'" color="success">
            <IonIcon :icon="checkmarkCircle" />
            {{ t('provider.verified') }}
          </IonChip>
        </div>
        <div class="profile-stats">
          <div class="stat">
            <IonIcon :icon="star" color="warning" />
            <span>{{ currentProvider.rating }} ({{ currentProvider.totalReviews }})</span>
          </div>
          <div class="stat">
            <span>{{ currentProvider.totalJobs }} jobs</span>
          </div>
        </div>
      </div>

      <!-- Availability Toggle -->
      <IonList class="settings-list">
        <IonItem>
          <IonIcon :icon="checkmarkCircle" slot="start" color="success" />
          <IonLabel>
            <h2>Available for Work</h2>
            <p>Toggle off to stop receiving new job requests</p>
          </IonLabel>
          <IonToggle v-model="isAvailable" slot="end" color="success" />
        </IonItem>
      </IonList>

      <!-- Profile Settings -->
      <div class="section-header">Profile</div>
      <IonList class="settings-list">
        <IonItem button detail @click="editProfile">
          <IonIcon :icon="personCircle" slot="start" color="primary" />
          <IonLabel>
            <h2>Edit Profile</h2>
            <p>Update your bio, photo, and contact info</p>
          </IonLabel>
        </IonItem>

        <IonItem button detail @click="manageServices">
          <IonIcon :icon="construct" slot="start" color="primary" />
          <IonLabel>
            <h2>Manage Services</h2>
            <p>{{ currentProvider.services?.length || 0 }} services listed</p>
          </IonLabel>
        </IonItem>

        <IonItem>
          <IonIcon :icon="location" slot="start" color="primary" />
          <IonLabel>
            <h2>Service Area</h2>
            <p>{{ currentProvider.serviceRadiusKm }}km radius</p>
          </IonLabel>
        </IonItem>
      </IonList>

      <!-- Account Info -->
      <div class="section-header">Account</div>
      <IonList class="settings-list">
        <IonItem>
          <IonLabel>
            <h2>Member Since</h2>
            <p>{{ formatDate(currentProvider.createdAt) }}</p>
          </IonLabel>
        </IonItem>

        <IonItem button detail>
          <IonIcon :icon="notifications" slot="start" color="primary" />
          <IonLabel>Notifications</IonLabel>
        </IonItem>

        <IonItem button detail>
          <IonIcon :icon="helpCircle" slot="start" color="primary" />
          <IonLabel>Help & Support</IonLabel>
        </IonItem>
      </IonList>

      <!-- Switch Mode -->
      <div class="section-header">Mode</div>
      <IonList class="settings-list">
        <IonItem button detail @click="switchToCustomer">
          <IonIcon :icon="home" slot="start" color="tertiary" />
          <IonLabel>
            <h2>Switch to Customer Mode</h2>
            <p>Browse and book services</p>
          </IonLabel>
        </IonItem>
      </IonList>

      <!-- Logout -->
      <IonList class="settings-list logout-section">
        <IonItem button @click="confirmLogout">
          <IonIcon :icon="logOut" slot="start" color="danger" />
          <IonLabel color="danger">{{ t('auth.logout') }}</IonLabel>
        </IonItem>
      </IonList>

      <!-- Logout Confirmation -->
      <IonActionSheet
        :is-open="showLogoutSheet"
        :header="t('auth.logout_confirm')"
        :buttons="logoutButtons"
        @didDismiss="showLogoutSheet = false"
      />
    </IonContent>
  </IonPage>
</template>

<style scoped>
.profile-header {
  text-align: center;
  padding: 32px 24px;
  background: linear-gradient(180deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
  color: white;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
  color: var(--ion-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  margin: 0 auto 16px;
}

.profile-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
}

.profile-badges {
  margin-bottom: 12px;
}

.profile-badges ion-chip {
  --background: rgba(255, 255, 255, 0.2);
  --color: white;
}

.profile-stats {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.stat ion-icon {
  font-size: 16px;
}

.section-header {
  padding: 24px 16px 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ion-color-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.settings-list {
  margin: 0 16px;
  border-radius: 12px;
  overflow: hidden;
}

.settings-list ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
}

.settings-list ion-icon {
  font-size: 22px;
}

.logout-section {
  margin-top: 24px;
  margin-bottom: calc(24px + env(safe-area-inset-bottom));
}
</style>