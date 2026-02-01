<script setup lang="ts">
/**
 * Settings Page - User preferences and account settings
 * Refined to use Indlela design system
 */

import {
  IonPage,
  IonContent,
  IonToggle,
} from '@ionic/vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const { t, locale, setLocale, locales } = useI18n()
const router = useRouter()
const config = useRuntimeConfig()
const authStore = useAuthStore()
const { haptic } = useAnimation()

// State
const user = computed(() => authStore.user || { name: 'Guest', phone: '' })
const pushNotifications = ref(true)
const smsNotifications = ref(true)
const showLanguageModal = ref(false)
const showLogoutModal = ref(false)

// Methods
const editProfile = () => {
  haptic('light')
  router.push('/settings/profile')
}

const changeLanguage = () => {
  haptic('light')
  showLanguageModal.value = true
}

const selectLanguage = (code: string) => {
  haptic('light')
  setLocale(code)
  showLanguageModal.value = false
}

const becomeProvider = () => {
  haptic('light')
  router.push('/provider-dashboard')
}

const confirmLogout = () => {
  haptic('warning')
  showLogoutModal.value = true
}

const handleLogout = () => {
  haptic('medium')
  showLogoutModal.value = false
  authStore.devLogout()
  router.push('/auth/login')
}

const getCurrentLanguageName = () => {
  const current = (locales.value as Array<{ code: string; name: string }>).find(
    l => l.code === locale.value
  )
  return current?.name || 'English'
}

const togglePush = () => {
  haptic('light')
  pushNotifications.value = !pushNotifications.value
}

const toggleSms = () => {
  haptic('light')
  smsNotifications.value = !smsNotifications.value
}

// Settings items organized by section
const accountItems = [
  {
    icon: 'heroicons:user-circle',
    label: 'settings.edit_profile',
    action: editProfile,
    chevron: true,
  },
  {
    icon: 'heroicons:language',
    label: 'settings.language',
    value: getCurrentLanguageName,
    action: changeLanguage,
    chevron: true,
  },
]

const supportItems = [
  {
    icon: 'heroicons:shield-check',
    label: 'settings.privacy',
    action: () => haptic('light'),
    chevron: true,
  },
  {
    icon: 'heroicons:document-text',
    label: 'settings.terms',
    action: () => haptic('light'),
    chevron: true,
  },
  {
    icon: 'heroicons:question-mark-circle',
    label: 'settings.help',
    action: () => haptic('light'),
    chevron: true,
  },
]
</script>

<template>
  <IonPage>
    <!-- App Header -->
    <AppHeader :title="t('settings.title')" :show-offline-bar="false" />

    <IonContent :fullscreen="true">
      <!-- Profile Header -->
      <div class="profile-header">
        <UiAvatar
          :name="user.name || 'User'"
          size="lg"
          class="profile-avatar"
        />
        <div class="profile-info">
          <h2 class="profile-name">{{ user.name }}</h2>
          <p class="profile-phone">{{ user.phone }}</p>
          <UiBadge
            v-if="authStore.isProvider"
            variant="success"
            size="sm"
          >
            {{ t('settings.verified_provider') }}
          </UiBadge>
        </div>
        <button class="profile-edit-btn" @click="editProfile">
          <Icon name="heroicons:pencil" />
        </button>
      </div>

      <!-- Account Section -->
      <section class="settings-section">
        <h3 class="section-title">{{ t('settings.account') }}</h3>
        <div class="settings-list">
          <button
            v-for="item in accountItems"
            :key="item.label"
            class="settings-item"
            @click="item.action"
          >
            <div class="settings-item__icon">
              <Icon :name="item.icon" />
            </div>
            <span class="settings-item__label">{{ t(item.label) }}</span>
            <span v-if="item.value" class="settings-item__value">
              {{ typeof item.value === 'function' ? item.value() : item.value }}
            </span>
            <Icon
              v-if="item.chevron"
              name="heroicons:chevron-right"
              class="settings-item__chevron"
            />
          </button>
        </div>
      </section>

      <!-- Notifications Section -->
      <section class="settings-section">
        <h3 class="section-title">{{ t('settings.notifications') }}</h3>
        <div class="settings-list">
          <div class="settings-item settings-item--toggle">
            <div class="settings-item__icon">
              <Icon name="heroicons:bell" />
            </div>
            <span class="settings-item__label">{{ t('settings.push_notifications') }}</span>
            <IonToggle
              :checked="pushNotifications"
              class="settings-toggle"
              @ionChange="togglePush"
            />
          </div>

          <div class="settings-item settings-item--toggle">
            <div class="settings-item__icon">
              <Icon name="heroicons:chat-bubble-left-ellipsis" />
            </div>
            <span class="settings-item__label">{{ t('settings.sms_notifications') }}</span>
            <IonToggle
              :checked="smsNotifications"
              class="settings-toggle"
              @ionChange="toggleSms"
            />
          </div>
        </div>
      </section>

      <!-- Provider Section (for customers) -->
      <section v-if="!authStore.isProvider" class="settings-section">
        <h3 class="section-title">{{ t('settings.provider_section') }}</h3>
        <div class="settings-list">
          <button class="settings-item settings-item--highlight" @click="becomeProvider">
            <div class="settings-item__icon settings-item__icon--success">
              <Icon name="heroicons:briefcase" />
            </div>
            <div class="settings-item__content">
              <span class="settings-item__label">{{ t('settings.switch_to_provider') }}</span>
              <span class="settings-item__description">{{ t('settings.provider_description') }}</span>
            </div>
            <Icon name="heroicons:chevron-right" class="settings-item__chevron" />
          </button>
        </div>
      </section>

      <!-- Support Section -->
      <section class="settings-section">
        <h3 class="section-title">{{ t('settings.support') }}</h3>
        <div class="settings-list">
          <button
            v-for="item in supportItems"
            :key="item.label"
            class="settings-item"
            @click="item.action"
          >
            <div class="settings-item__icon">
              <Icon :name="item.icon" />
            </div>
            <span class="settings-item__label">{{ t(item.label) }}</span>
            <Icon
              v-if="item.chevron"
              name="heroicons:chevron-right"
              class="settings-item__chevron"
            />
          </button>

          <!-- About/Version -->
          <div class="settings-item">
            <div class="settings-item__icon">
              <Icon name="heroicons:information-circle" />
            </div>
            <span class="settings-item__label">{{ t('settings.about') }}</span>
            <span class="settings-item__value">
              {{ t('settings.version', { version: config.public.appVersion || '1.0.0' }) }}
            </span>
          </div>
        </div>
      </section>

      <!-- Logout Section -->
      <section class="settings-section settings-section--last">
        <div class="settings-list">
          <button class="settings-item settings-item--danger" @click="confirmLogout">
            <div class="settings-item__icon settings-item__icon--danger">
              <Icon name="heroicons:arrow-right-on-rectangle" />
            </div>
            <span class="settings-item__label">{{ t('auth.logout') }}</span>
          </button>
        </div>
      </section>

      <!-- Language Modal -->
      <UiModal
        v-model="showLanguageModal"
        :title="t('settings.select_language')"
      >
        <div class="language-list">
          <button
            v-for="lang in (locales as Array<{ code: string; name: string }>)"
            :key="lang.code"
            :class="['language-item', { 'language-item--active': locale === lang.code }]"
            @click="selectLanguage(lang.code)"
          >
            <span class="language-name">{{ lang.name }}</span>
            <Icon
              v-if="locale === lang.code"
              name="heroicons:check"
              class="language-check"
            />
          </button>
        </div>
      </UiModal>

      <!-- Logout Confirmation Modal -->
      <UiModal
        v-model="showLogoutModal"
        :title="t('auth.logout_confirm')"
      >
        <p class="logout-message">{{ t('auth.logout_message') }}</p>
        <div class="logout-actions">
          <UiButton
            variant="outline"
            @click="showLogoutModal = false"
          >
            {{ t('common.cancel') }}
          </UiButton>
          <UiButton
            variant="danger"
            @click="handleLogout"
          >
            {{ t('auth.logout') }}
          </UiButton>
        </div>
      </UiModal>
    </IonContent>
  </IonPage>
</template>

<style scoped>
/* Profile Header */
.profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: white;
}

.profile-avatar {
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  margin: 0 0 var(--space-1);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: white;
}

.profile-phone {
  margin: 0 0 var(--space-2);
  font-size: var(--text-sm);
  opacity: 0.9;
}

.profile-edit-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background var(--duration-fast);
}

.profile-edit-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.profile-edit-btn :deep(svg) {
  width: 20px;
  height: 20px;
  color: white;
}

/* Sections */
.settings-section {
  padding: var(--space-4);
  padding-bottom: 0;
}

.settings-section--last {
  padding-bottom: calc(var(--space-8) + var(--safe-area-bottom, 20px));
}

.section-title {
  margin: 0 0 var(--space-3);
  padding-left: var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Settings List */
.settings-list {
  background: var(--color-neutral-0);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* Settings Item */
.settings-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-4);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-neutral-100);
  text-align: left;
  cursor: pointer;
  transition: background var(--duration-fast);
  -webkit-tap-highlight-color: transparent;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item:hover {
  background: var(--color-neutral-50);
}

.settings-item:active {
  background: var(--color-neutral-100);
}

.settings-item--toggle {
  cursor: default;
}

.settings-item--toggle:hover {
  background: transparent;
}

.settings-item--highlight {
  background: var(--color-success-50);
}

.settings-item--highlight:hover {
  background: var(--color-success-100);
}

.settings-item--danger .settings-item__label {
  color: var(--color-error-600);
}

/* Item Icon */
.settings-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--color-primary-50);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.settings-item__icon :deep(svg) {
  width: 20px;
  height: 20px;
  color: var(--color-primary-600);
}

.settings-item__icon--success {
  background: var(--color-success-50);
}

.settings-item__icon--success :deep(svg) {
  color: var(--color-success-600);
}

.settings-item__icon--danger {
  background: var(--color-error-50);
}

.settings-item__icon--danger :deep(svg) {
  color: var(--color-error-600);
}

/* Item Content */
.settings-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.settings-item__label {
  flex: 1;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-neutral-900);
}

.settings-item__description {
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
}

.settings-item__value {
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
}

.settings-item__chevron {
  width: 20px;
  height: 20px;
  color: var(--color-neutral-400);
  flex-shrink: 0;
}

/* Toggle */
.settings-toggle {
  --background: var(--color-neutral-200);
  --background-checked: var(--color-primary-500);
  --handle-background: white;
  --handle-background-checked: white;
}

/* Language Modal */
.language-list {
  display: flex;
  flex-direction: column;
}

.language-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--space-4);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-neutral-100);
  text-align: left;
  cursor: pointer;
  transition: background var(--duration-fast);
}

.language-item:last-child {
  border-bottom: none;
}

.language-item:hover {
  background: var(--color-neutral-50);
}

.language-item--active {
  background: var(--color-primary-50);
}

.language-item--active:hover {
  background: var(--color-primary-100);
}

.language-name {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-neutral-900);
}

.language-item--active .language-name {
  color: var(--color-primary-700);
}

.language-check {
  width: 20px;
  height: 20px;
  color: var(--color-primary-600);
}

/* Logout Modal */
.logout-message {
  margin: 0 0 var(--space-6);
  font-size: var(--text-base);
  color: var(--color-neutral-600);
  text-align: center;
}

.logout-actions {
  display: flex;
  gap: var(--space-3);
}

.logout-actions > * {
  flex: 1;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .profile-header {
    background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-700) 100%);
  }

  .section-title {
    color: var(--color-neutral-400);
  }

  .settings-list {
    background: var(--color-neutral-900);
  }

  .settings-item {
    border-bottom-color: var(--color-neutral-800);
  }

  .settings-item:hover {
    background: var(--color-neutral-850);
  }

  .settings-item:active {
    background: var(--color-neutral-800);
  }

  .settings-item--highlight {
    background: rgba(16, 185, 129, 0.1);
  }

  .settings-item--highlight:hover {
    background: rgba(16, 185, 129, 0.15);
  }

  .settings-item__icon {
    background: rgba(0, 168, 107, 0.15);
  }

  .settings-item__icon :deep(svg) {
    color: var(--color-primary-400);
  }

  .settings-item__icon--success {
    background: rgba(16, 185, 129, 0.15);
  }

  .settings-item__icon--success :deep(svg) {
    color: var(--color-success-400);
  }

  .settings-item__icon--danger {
    background: rgba(239, 68, 68, 0.15);
  }

  .settings-item__icon--danger :deep(svg) {
    color: var(--color-error-400);
  }

  .settings-item__label {
    color: var(--color-neutral-100);
  }

  .settings-item--danger .settings-item__label {
    color: var(--color-error-400);
  }

  .settings-item__value {
    color: var(--color-neutral-400);
  }

  .settings-item__chevron {
    color: var(--color-neutral-500);
  }

  .settings-toggle {
    --background: var(--color-neutral-700);
  }

  .language-item {
    border-bottom-color: var(--color-neutral-800);
  }

  .language-item:hover {
    background: var(--color-neutral-850);
  }

  .language-item--active {
    background: rgba(0, 168, 107, 0.15);
  }

  .language-name {
    color: var(--color-neutral-100);
  }

  .language-item--active .language-name {
    color: var(--color-primary-400);
  }

  .logout-message {
    color: var(--color-neutral-400);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .profile-edit-btn,
  .settings-item,
  .language-item {
    transition: none;
  }
}
</style>
