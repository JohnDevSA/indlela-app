<script setup lang="ts">
/**
 * Profile Edit Page - Edit user profile information
 * Allows users to update their name, email, and avatar
 */

import {
  IonPage,
  IonContent,
  IonInput,
} from '@ionic/vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { haptic } = useAnimation()
const { updateProfile, isLoading, error } = useAuth()

// Form state
const name = ref(authStore.user?.name || '')
const email = ref(authStore.user?.email || '')
const formError = ref<string | null>(null)
const isSaving = ref(false)
const saveSuccess = ref(false)

// Validation
const isValidEmail = (email: string): boolean => {
  if (!email) return true // Email is optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const canSave = computed(() => {
  return name.value.trim().length >= 2 && isValidEmail(email.value) && !isSaving.value
})

// Check if form has changes
const hasChanges = computed(() => {
  return name.value !== (authStore.user?.name || '') ||
         email.value !== (authStore.user?.email || '')
})

// Handle save
const handleSave = async () => {
  if (!canSave.value) return

  formError.value = null
  saveSuccess.value = false
  isSaving.value = true
  haptic('light')

  try {
    const success = await updateProfile({
      name: name.value.trim(),
      email: email.value.trim() || undefined,
    })

    if (success) {
      haptic('success')
      saveSuccess.value = true
      // Go back after short delay
      setTimeout(() => {
        router.back()
      }, 1000)
    } else {
      haptic('error')
      formError.value = error.value || t('errors.update_failed')
    }
  } catch (e) {
    haptic('error')
    formError.value = t('errors.update_failed')
  } finally {
    isSaving.value = false
  }
}

// Handle back navigation
const goBack = () => {
  haptic('light')
  router.back()
}
</script>

<template>
  <IonPage>
    <AppHeader
      :title="t('settings.edit_profile')"
      :show-back="true"
      default-href="/settings"
    >
      <template #actions>
        <button
          class="save-btn"
          :disabled="!canSave || !hasChanges"
          @click="handleSave"
        >
          {{ isSaving ? t('common.saving') : t('common.save') }}
        </button>
      </template>
    </AppHeader>

    <IonContent :fullscreen="true">
      <div class="profile-form">
        <!-- Avatar Section -->
        <div class="avatar-section">
          <UiAvatar
            :name="name || authStore.user?.name || 'User'"
            size="xl"
            class="profile-avatar"
          />
          <button class="change-avatar-btn">
            <Icon name="heroicons:camera" />
            <span>{{ t('settings.change_photo') }}</span>
          </button>
        </div>

        <!-- Form Fields -->
        <div class="form-fields">
          <!-- Name -->
          <div class="input-group">
            <label class="input-label">
              {{ t('profile.name') }}
              <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <Icon name="heroicons:user" class="input-icon" />
              <IonInput
                v-model="name"
                type="text"
                :placeholder="t('profile.name_placeholder')"
                :disabled="isSaving"
                class="form-input"
              />
            </div>
            <p v-if="name.length > 0 && name.length < 2" class="input-error">
              {{ t('validation.name_min') }}
            </p>
          </div>

          <!-- Email -->
          <div class="input-group">
            <label class="input-label">
              {{ t('profile.email') }}
              <span class="optional">({{ t('common.optional') }})</span>
            </label>
            <div class="input-wrapper">
              <Icon name="heroicons:envelope" class="input-icon" />
              <IonInput
                v-model="email"
                type="email"
                :placeholder="t('profile.email_placeholder')"
                :disabled="isSaving"
                class="form-input"
              />
            </div>
            <p v-if="email && !isValidEmail(email)" class="input-error">
              {{ t('validation.email_invalid') }}
            </p>
          </div>

          <!-- Phone (read-only) -->
          <div class="input-group">
            <label class="input-label">
              {{ t('profile.phone') }}
            </label>
            <div class="input-wrapper input-wrapper--readonly">
              <Icon name="heroicons:phone" class="input-icon" />
              <IonInput
                :value="authStore.user?.phone"
                type="tel"
                :disabled="true"
                class="form-input"
              />
              <Icon name="heroicons:lock-closed" class="input-lock" />
            </div>
            <p class="input-hint">
              {{ t('profile.phone_readonly_hint') }}
            </p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="formError" class="error-banner">
          <Icon name="heroicons:exclamation-circle" />
          <span>{{ formError }}</span>
        </div>

        <!-- Success Message -->
        <div v-if="saveSuccess" class="success-banner">
          <Icon name="heroicons:check-circle" />
          <span>{{ t('profile.update_success') }}</span>
        </div>

        <!-- Save Button (mobile) -->
        <div class="save-section">
          <UiButton
            variant="primary"
            size="lg"
            :loading="isSaving"
            :disabled="!canSave || !hasChanges"
            :full-width="true"
            @click="handleSave"
          >
            {{ t('common.save_changes') }}
          </UiButton>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.profile-form {
  padding: var(--space-6);
  max-width: 500px;
  margin: 0 auto;
}

/* Save button in header */
.save-btn {
  background: none;
  border: none;
  color: white;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  opacity: 1;
  transition: opacity var(--duration-fast);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Avatar Section */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.profile-avatar {
  width: 100px;
  height: 100px;
}

.change-avatar-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-neutral-100);
  border: none;
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-700);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.change-avatar-btn:hover {
  background: var(--color-neutral-200);
}

.change-avatar-btn :deep(svg) {
  width: 16px;
  height: 16px;
}

/* Form Fields */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.input-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-700);
}

.required {
  color: var(--color-error-500);
  margin-left: 2px;
}

.optional {
  font-weight: var(--font-normal);
  color: var(--color-neutral-400);
  margin-left: var(--space-1);
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: var(--color-neutral-0);
  border: 1.5px solid var(--color-neutral-300);
  border-radius: var(--radius-xl);
  padding: 0 var(--space-4);
  transition: all var(--duration-fast);
}

.input-wrapper:focus-within {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.input-wrapper--readonly {
  background: var(--color-neutral-50);
  border-color: var(--color-neutral-200);
}

.input-wrapper--readonly:focus-within {
  border-color: var(--color-neutral-200);
  box-shadow: none;
}

.input-icon {
  width: 20px;
  height: 20px;
  color: var(--color-neutral-400);
  flex-shrink: 0;
}

.input-lock {
  width: 16px;
  height: 16px;
  color: var(--color-neutral-400);
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  --padding-start: var(--space-3);
  --padding-end: 0;
  --padding-top: var(--space-3);
  --padding-bottom: var(--space-3);
  --background: transparent;
  font-size: var(--text-base);
}

.input-hint {
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
  margin: 0;
}

.input-error {
  font-size: var(--text-xs);
  color: var(--color-error-600);
  margin: 0;
}

/* Banners */
.error-banner,
.success-banner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  margin-top: var(--space-4);
  font-size: var(--text-sm);
}

.error-banner {
  background: var(--color-error-50);
  color: var(--color-error-700);
}

.error-banner :deep(svg) {
  width: 20px;
  height: 20px;
  color: var(--color-error-500);
  flex-shrink: 0;
}

.success-banner {
  background: var(--color-success-50);
  color: var(--color-success-700);
}

.success-banner :deep(svg) {
  width: 20px;
  height: 20px;
  color: var(--color-success-500);
  flex-shrink: 0;
}

/* Save Section */
.save-section {
  margin-top: var(--space-8);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .input-label {
    color: var(--color-neutral-300);
  }

  .input-wrapper {
    background: var(--color-neutral-900);
    border-color: var(--color-neutral-600);
  }

  .input-wrapper:focus-within {
    box-shadow: 0 0 0 3px rgba(0, 168, 107, 0.2);
  }

  .input-wrapper--readonly {
    background: var(--color-neutral-800);
    border-color: var(--color-neutral-700);
  }

  .change-avatar-btn {
    background: var(--color-neutral-800);
    color: var(--color-neutral-300);
  }

  .change-avatar-btn:hover {
    background: var(--color-neutral-700);
  }

  .error-banner {
    background: rgba(239, 68, 68, 0.1);
    color: var(--color-error-400);
  }

  .success-banner {
    background: rgba(16, 185, 129, 0.1);
    color: var(--color-success-400);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .input-wrapper,
  .change-avatar-btn,
  .save-btn {
    transition: none;
  }
}
</style>
