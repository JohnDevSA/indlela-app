<script setup lang="ts">
/**
 * AppHeader - Reusable app header component using Ionic
 * Provides consistent header experience across all pages
 *
 * @example
 * <AppHeader title="My Bookings" />
 *
 * @example
 * <AppHeader
 *   title="Provider Profile"
 *   :show-back="true"
 *   :show-search="true"
 *   @search="handleSearch"
 * />
 */

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonBackButton,
  IonIcon,
} from '@ionic/vue'
import { arrowBack, search, notifications, chevronBack } from 'ionicons/icons'
import { useUIStore } from '~/stores/ui'

interface Props {
  // Header title (uses app name if not provided)
  title?: string
  // Subtitle displayed below title
  subtitle?: string
  // Show back button
  showBack?: boolean
  // Show search button
  showSearch?: boolean
  // Show notifications button
  showNotifications?: boolean
  // Show language selector
  showLanguage?: boolean
  // Show offline status bar
  showOfflineBar?: boolean
  // Custom back path (defaults to router.back())
  backPath?: string
  // Make header transparent (for hero images)
  transparent?: boolean
  // Show logo instead of title
  showLogo?: boolean
  // Default href for back button
  defaultHref?: string
}

const props = withDefaults(defineProps<Props>(), {
  showBack: false,
  showSearch: false,
  showNotifications: false,
  showLanguage: false,
  showOfflineBar: true,
  transparent: false,
  showLogo: false,
  defaultHref: '/',
})

const emit = defineEmits<{
  back: []
  search: []
  notifications: []
}>()

const { t } = useI18n()
const router = useRouter()
const uiStore = useUIStore()

// Notification count (placeholder - connect to real data)
const notificationCount = ref(0)

// Handle back navigation
function handleBack(event?: Event) {
  if (props.backPath) {
    event?.preventDefault()
    router.push(props.backPath)
  }
  emit('back')
}

// Handle search click
function handleSearch() {
  uiStore.openSearch()
  emit('search')
}

// Handle notifications click
function handleNotifications() {
  router.push('/notifications')
  emit('notifications')
}
</script>

<template>
  <IonHeader :class="{ 'header-transparent': transparent }">
    <IonToolbar color="primary">
      <!-- Left slot - Back button or Logo -->
      <IonButtons slot="start">
        <!-- Back button -->
        <IonBackButton
          v-if="showBack"
          :default-href="defaultHref"
          :text="''"
          @click="handleBack"
        />

        <!-- Logo (when showLogo and not showing back) -->
        <div v-if="showLogo && !showBack" class="header-logo">
          <img
            src="/icons/logo.svg"
            alt="Indlela"
            class="header-logo__img"
            width="28"
            height="28"
          />
          <span class="header-logo__text">Indlela</span>
        </div>
      </IonButtons>

      <!-- Title -->
      <IonTitle v-if="title && !showLogo">
        <span class="header-title">{{ title }}</span>
        <span v-if="subtitle" class="header-subtitle">{{ subtitle }}</span>
      </IonTitle>

      <!-- Right slot - Actions -->
      <IonButtons slot="end">
        <!-- Search button -->
        <IonButton v-if="showSearch" @click="handleSearch">
          <IonIcon slot="icon-only" :icon="search" />
        </IonButton>

        <!-- Notifications button -->
        <IonButton
          v-if="showNotifications"
          class="notifications-btn"
          @click="handleNotifications"
        >
          <IonIcon slot="icon-only" :icon="notifications" />
          <span v-if="notificationCount > 0" class="notification-badge">
            {{ notificationCount > 9 ? '9+' : notificationCount }}
          </span>
        </IonButton>

        <!-- Language selector -->
        <UiLanguageSelector v-if="showLanguage" variant="minimal" />

        <!-- Custom actions slot -->
        <slot name="actions" />
      </IonButtons>
    </IonToolbar>

    <!-- Offline status bar -->
    <UiOfflineHeaderBar v-if="showOfflineBar" />

    <!-- Custom content below header (e.g., search bar) -->
    <slot name="below" />
  </IonHeader>
</template>

<style scoped>
/* Logo styles */
.header-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 8px;
}

.header-logo__img {
  width: 28px;
  height: 28px;
}

.header-logo__text {
  font-size: 18px;
  font-weight: 700;
  color: white;
}

/* Title with subtitle */
.header-title {
  display: block;
}

.header-subtitle {
  display: block;
  font-size: 12px;
  font-weight: 400;
  opacity: 0.8;
  margin-top: 2px;
}

/* Notification badge */
.notifications-btn {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--ion-color-danger, #eb445a);
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* Transparent header mode */
.header-transparent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.header-transparent ion-toolbar {
  --background: transparent;
  --border-width: 0;
}
</style>