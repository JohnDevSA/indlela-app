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
  IonNote,
  IonActionSheet,
} from '@ionic/vue'
import {
  personCircle,
  language,
  notifications,
  shield,
  document,
  helpCircle,
  informationCircle,
  chevronForward,
  logOut,
  briefcase,
} from 'ionicons/icons'
import { mockUser } from '~/utils/mock-data'

definePageMeta({
  layout: 'default',
})

const { t, locale, setLocale, locales } = useI18n()
const router = useRouter()
const config = useRuntimeConfig()

// State
const user = ref(mockUser)
const pushNotifications = ref(true)
const smsNotifications = ref(true)
const showLogoutSheet = ref(false)
const showLanguageSheet = ref(false)

// Methods
const editProfile = () => {
  router.push('/settings/profile')
}

const changeLanguage = () => {
  showLanguageSheet.value = true
}

const selectLanguage = (code: string) => {
  setLocale(code)
  showLanguageSheet.value = false
}

const becomeProvider = () => {
  router.push('/provider-dashboard')
}

const confirmLogout = () => {
  showLogoutSheet.value = true
}

const handleLogout = () => {
  // In real app, would clear auth state
  router.push('/auth/login')
}

const getCurrentLanguageName = () => {
  const current = (locales.value as Array<{ code: string; name: string }>).find(
    l => l.code === locale.value
  )
  return current?.name || 'English'
}

const languageButtons = computed(() => [
  ...(locales.value as Array<{ code: string; name: string }>).map(l => ({
    text: l.name,
    handler: () => selectLanguage(l.code),
  })),
  { text: t('common.cancel'), role: 'cancel' },
])

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
        <IonTitle>{{ t('settings.title') }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <!-- Profile Section -->
      <div class="profile-section">
        <div class="profile-avatar">
          {{ user.name?.charAt(0) || 'U' }}
        </div>
        <div class="profile-info">
          <h2>{{ user.name }}</h2>
          <p>{{ user.phone }}</p>
        </div>
      </div>

      <!-- Account Settings -->
      <IonList class="settings-list">
        <IonItem button detail @click="editProfile">
          <IonIcon :icon="personCircle" slot="start" color="primary" />
          <IonLabel>{{ t('settings.edit_profile') }}</IonLabel>
        </IonItem>

        <IonItem button detail @click="changeLanguage">
          <IonIcon :icon="language" slot="start" color="primary" />
          <IonLabel>{{ t('settings.language') }}</IonLabel>
          <IonNote slot="end">{{ getCurrentLanguageName() }}</IonNote>
        </IonItem>
      </IonList>

      <!-- Notifications -->
      <div class="section-header">{{ t('settings.notifications') }}</div>
      <IonList class="settings-list">
        <IonItem>
          <IonIcon :icon="notifications" slot="start" color="primary" />
          <IonLabel>{{ t('settings.push_notifications') }}</IonLabel>
          <IonToggle v-model="pushNotifications" slot="end" />
        </IonItem>

        <IonItem>
          <IonIcon :icon="notifications" slot="start" color="primary" />
          <IonLabel>{{ t('settings.sms_notifications') }}</IonLabel>
          <IonToggle v-model="smsNotifications" slot="end" />
        </IonItem>
      </IonList>

      <!-- Provider Section -->
      <div class="section-header">Provider</div>
      <IonList class="settings-list">
        <IonItem button detail @click="becomeProvider">
          <IonIcon :icon="briefcase" slot="start" color="success" />
          <IonLabel>
            <h2>{{ t('settings.switch_to_provider') }}</h2>
            <p>Manage your services and earnings</p>
          </IonLabel>
        </IonItem>
      </IonList>

      <!-- Legal & Support -->
      <div class="section-header">Support</div>
      <IonList class="settings-list">
        <IonItem button detail>
          <IonIcon :icon="shield" slot="start" color="primary" />
          <IonLabel>{{ t('settings.privacy') }}</IonLabel>
        </IonItem>

        <IonItem button detail>
          <IonIcon :icon="document" slot="start" color="primary" />
          <IonLabel>{{ t('settings.terms') }}</IonLabel>
        </IonItem>

        <IonItem button detail>
          <IonIcon :icon="helpCircle" slot="start" color="primary" />
          <IonLabel>{{ t('settings.help') }}</IonLabel>
        </IonItem>

        <IonItem>
          <IonIcon :icon="informationCircle" slot="start" color="primary" />
          <IonLabel>{{ t('settings.about') }}</IonLabel>
          <IonNote slot="end">{{ t('settings.version', { version: config.public.appVersion }) }}</IonNote>
        </IonItem>
      </IonList>

      <!-- Logout -->
      <IonList class="settings-list logout-section">
        <IonItem button @click="confirmLogout">
          <IonIcon :icon="logOut" slot="start" color="danger" />
          <IonLabel color="danger">{{ t('auth.logout') }}</IonLabel>
        </IonItem>
      </IonList>

      <!-- Language Action Sheet -->
      <IonActionSheet
        :is-open="showLanguageSheet"
        :header="t('settings.language')"
        :buttons="languageButtons"
        @didDismiss="showLanguageSheet = false"
      />

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
.profile-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(180deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
  color: white;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: white;
  color: var(--ion-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
}

.profile-info h2 {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 600;
}

.profile-info p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
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