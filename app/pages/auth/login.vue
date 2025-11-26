<script setup lang="ts">
/**
 * Login Page - Phone-based authentication with OTP
 * Refined to use Indlela design system
 */

import { IonInput } from '@ionic/vue'
import { useAuthStore, type MockUserType } from '~/stores/auth'

definePageMeta({
  layout: 'auth',
})

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const isDev = process.dev
const { haptic } = useAnimation()

const {
  requestOtp,
  isLoading,
  error,
  otpSent,
  clearError,
  normalizePhone,
  isValidPhone,
} = useAuth()

// State
const phone = ref('')
const phoneError = ref<string | null>(null)

// Dev simulation account types
const devAccountTypes: { key: MockUserType; label: string; icon: string; color: 'primary' | 'success' | 'error' | 'warning' | 'info'; description: string }[] = [
  { key: 'customer', label: 'Customer', icon: 'heroicons:user', color: 'primary', description: 'Thabo Molefe (verified)' },
  { key: 'provider', label: 'Provider', icon: 'heroicons:briefcase', color: 'success', description: 'Thandi Mokoena (verified)' },
  { key: 'admin', label: 'Admin', icon: 'heroicons:shield-check', color: 'error', description: 'Admin User' },
  { key: 'newCustomer', label: 'New Customer', icon: 'heroicons:user-plus', color: 'info', description: 'Needs onboarding' },
  { key: 'newProvider', label: 'New Provider', icon: 'heroicons:user-plus', color: 'info', description: 'Needs onboarding' },
]

// Format phone for display
const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`
}

// Handle phone input
const handlePhoneInput = (event: CustomEvent) => {
  const value = event.detail.value || ''
  phone.value = formatPhone(value)
  phoneError.value = null
  clearError()
}

// Validate and submit
const handleSubmit = async () => {
  phoneError.value = null
  const rawPhone = phone.value.replace(/\D/g, '')

  if (rawPhone.length < 10) {
    phoneError.value = t('validation.phone_format')
    haptic('warning')
    return
  }

  const normalized = normalizePhone(rawPhone)
  if (!isValidPhone(normalized)) {
    phoneError.value = t('errors.invalid_phone')
    haptic('error')
    return
  }

  const success = await requestOtp(rawPhone)
  if (success) {
    haptic('success')
    router.push('/auth/verify-otp')
  } else {
    haptic('error')
  }
}

// Dev login handler
const devLoginAs = (userType: MockUserType) => {
  haptic('light')
  const user = authStore.devLogin(userType)

  if (!user.onboardingCompleted) {
    router.push(user.role === 'provider' ? '/onboarding/provider' : '/onboarding/customer')
  } else if (user.role === 'provider') {
    router.push('/provider-dashboard')
  } else if (user.role === 'admin') {
    router.push('/admin')
  } else {
    router.push('/')
  }
}

// Watch for redirect if already sent OTP
watch(otpSent, (sent) => {
  if (sent) router.push('/auth/verify-otp')
})

const canSubmit = computed(() => !isLoading.value && phone.value.replace(/\D/g, '').length >= 10)
</script>

<template>
  <div class="login-page">
    <h2 class="page-title">{{ t('auth.login_title') }}</h2>

    <!-- Dev Mode Quick Login -->
    <div v-if="isDev" class="dev-section">
      <div class="dev-header">
        <UiBadge variant="warning" size="sm">DEV MODE</UiBadge>
        <span class="dev-subtitle">Quick login as:</span>
      </div>

      <div class="dev-accounts">
        <button
          v-for="account in devAccountTypes"
          :key="account.key"
          class="dev-account-btn"
          @click="devLoginAs(account.key)"
        >
          <div :class="['dev-account-icon', `dev-account-icon--${account.color}`]">
            <Icon :name="account.icon" />
          </div>
          <div class="dev-account-info">
            <span class="dev-account-label">{{ account.label }}</span>
            <span class="dev-account-desc">{{ account.description }}</span>
          </div>
          <Icon name="heroicons:chevron-right" class="dev-account-chevron" />
        </button>
      </div>

      <div class="dev-divider">
        <span>or login with phone</span>
      </div>
    </div>

    <!-- Login Form -->
    <form class="login-form" @submit.prevent="handleSubmit">
      <div class="input-group">
        <label class="input-label">
          {{ t('auth.phone_label') }}
          <span class="input-required">*</span>
        </label>

        <div :class="['phone-input-wrapper', { 'phone-input-wrapper--error': phoneError || error }]">
          <Icon name="heroicons:phone" class="phone-input-icon" />
          <IonInput
            type="tel"
            inputmode="numeric"
            :placeholder="t('auth.phone_placeholder')"
            :value="phone"
            :disabled="isLoading"
            class="phone-input"
            @ionInput="handlePhoneInput"
          />
        </div>

        <p v-if="phoneError" class="input-error">
          <Icon name="heroicons:exclamation-circle" />
          {{ phoneError }}
        </p>
        <p v-else-if="error" class="input-error">
          <Icon name="heroicons:exclamation-circle" />
          {{ error }}
        </p>
        <p v-else class="input-hint">
          {{ t('auth.phone_hint') }}
        </p>
      </div>

      <UiButton
        type="submit"
        variant="primary"
        size="lg"
        :loading="isLoading"
        :disabled="!canSubmit"
        :full-width="true"
      >
        {{ t('auth.request_otp') }}
      </UiButton>
    </form>

    <!-- Language Selector -->
    <div class="footer">
      <LanguageSelector variant="button" />
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.page-title {
  margin: 0 0 var(--space-6);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-neutral-900);
}

/* Dev Section */
.dev-section {
  padding: var(--space-4);
  margin-bottom: var(--space-6);
  background: var(--color-neutral-50);
  border: 2px dashed var(--color-neutral-300);
  border-radius: var(--radius-xl);
}

.dev-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.dev-subtitle {
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
}

.dev-accounts {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.dev-account-btn {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3);
  background: var(--color-neutral-0);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  text-align: left;
  transition: all var(--duration-fast) var(--ease-out);
}

.dev-account-btn:hover {
  border-color: var(--color-primary-300);
  background: var(--color-primary-50);
}

.dev-account-btn:active {
  transform: scale(0.98);
}

.dev-account-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.dev-account-icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.dev-account-icon--primary {
  background: var(--color-primary-100);
  color: var(--color-primary-600);
}

.dev-account-icon--success {
  background: var(--color-success-50);
  color: var(--color-success-600);
}

.dev-account-icon--error {
  background: var(--color-error-50);
  color: var(--color-error-600);
}

.dev-account-icon--warning {
  background: var(--color-warning-50);
  color: var(--color-warning-600);
}

.dev-account-icon--info {
  background: var(--color-info-50);
  color: var(--color-info-600);
}

.dev-account-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dev-account-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
}

.dev-account-desc {
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
}

.dev-account-chevron {
  width: 16px;
  height: 16px;
  color: var(--color-neutral-400);
}

.dev-divider {
  display: flex;
  align-items: center;
  margin-top: var(--space-4);
}

.dev-divider::before,
.dev-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-neutral-300);
}

.dev-divider span {
  padding: 0 var(--space-3);
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
}

/* Form */
.login-form {
  flex: 1;
}

.input-group {
  margin-bottom: var(--space-6);
}

.input-label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-700);
}

.input-required {
  color: var(--color-error-500);
  margin-left: 2px;
}

.phone-input-wrapper {
  display: flex;
  align-items: center;
  padding: 0 var(--space-4);
  background: var(--color-neutral-0);
  border: 1.5px solid var(--color-neutral-300);
  border-radius: var(--radius-xl);
  transition: border-color var(--duration-normal), box-shadow var(--duration-normal);
}

.phone-input-wrapper:focus-within {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.phone-input-wrapper--error {
  border-color: var(--color-error-500);
  background: var(--color-error-50);
}

.phone-input-wrapper--error:focus-within {
  box-shadow: 0 0 0 3px var(--color-error-50);
}

.phone-input-icon {
  width: 20px;
  height: 20px;
  color: var(--color-neutral-400);
  flex-shrink: 0;
}

.phone-input {
  flex: 1;
  --padding-start: var(--space-3);
  --padding-end: 0;
  --padding-top: var(--space-3);
  --padding-bottom: var(--space-3);
  --background: transparent;
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  letter-spacing: 0.5px;
}

.input-hint {
  margin: var(--space-2) 0 0;
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
}

.input-error {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin: var(--space-2) 0 0;
  font-size: var(--text-xs);
  color: var(--color-error-600);
}

.input-error :deep(svg) {
  width: 14px;
  height: 14px;
}

/* Footer */
.footer {
  margin-top: auto;
  padding-top: var(--space-6);
  display: flex;
  justify-content: center;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .page-title {
    color: var(--color-neutral-100);
  }

  .dev-section {
    background: var(--color-neutral-800);
    border-color: var(--color-neutral-600);
  }

  .dev-subtitle {
    color: var(--color-neutral-400);
  }

  .dev-account-btn {
    background: var(--color-neutral-900);
    border-color: var(--color-neutral-700);
  }

  .dev-account-btn:hover {
    background: var(--color-neutral-800);
  }

  .dev-account-label {
    color: var(--color-neutral-100);
  }

  .dev-divider::before,
  .dev-divider::after {
    background: var(--color-neutral-600);
  }

  .input-label {
    color: var(--color-neutral-300);
  }

  .phone-input-wrapper {
    background: var(--color-neutral-900);
    border-color: var(--color-neutral-600);
  }

  .phone-input-wrapper:focus-within {
    box-shadow: 0 0 0 3px rgba(0, 168, 107, 0.2);
  }

  .phone-input-wrapper--error {
    background: rgba(239, 68, 68, 0.1);
  }
}
</style>
