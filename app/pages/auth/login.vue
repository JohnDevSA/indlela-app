<script setup lang="ts">
import {
  IonInput,
  IonButton,
  IonSpinner,
  IonText,
  IonNote,
} from '@ionic/vue'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { t } = useI18n()
const router = useRouter()
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

// Format phone for display
const formatPhone = (value: string): string => {
  // Remove non-digits
  const digits = value.replace(/\D/g, '')

  // Format as 0XX XXX XXXX
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

  // Get raw digits
  const rawPhone = phone.value.replace(/\D/g, '')

  // Validate length
  if (rawPhone.length < 10) {
    phoneError.value = t('validation.phone_format')
    return
  }

  // Validate SA number format
  const normalized = normalizePhone(rawPhone)
  if (!isValidPhone(normalized)) {
    phoneError.value = t('errors.invalid_phone')
    return
  }

  // Request OTP
  const success = await requestOtp(rawPhone)

  if (success) {
    router.push('/auth/verify-otp')
  }
}

// Watch for redirect if already sent OTP
watch(otpSent, (sent) => {
  if (sent) {
    router.push('/auth/verify-otp')
  }
})
</script>

<template>
  <div class="login-page">
    <h2 class="page-title">{{ t('auth.login_title') }}</h2>

    <form @submit.prevent="handleSubmit">
      <!-- Phone Input -->
      <div class="input-group">
        <label class="input-label">{{ t('auth.phone_label') }}</label>
        <IonInput
          type="tel"
          inputmode="numeric"
          :placeholder="t('auth.phone_placeholder')"
          :value="phone"
          @ionInput="handlePhoneInput"
          :disabled="isLoading"
          class="phone-input"
          :class="{ 'has-error': phoneError || error }"
        />
        <IonNote v-if="!phoneError && !error" class="input-hint">
          {{ t('auth.phone_hint') }}
        </IonNote>
        <IonText v-if="phoneError" color="danger" class="error-text">
          {{ phoneError }}
        </IonText>
        <IonText v-else-if="error" color="danger" class="error-text">
          {{ error }}
        </IonText>
      </div>

      <!-- Submit Button -->
      <IonButton
        type="submit"
        expand="block"
        size="large"
        :disabled="isLoading || phone.replace(/\D/g, '').length < 10"
        class="submit-button"
      >
        <IonSpinner v-if="isLoading" name="crescent" />
        <span v-else>{{ t('auth.request_otp') }}</span>
      </IonButton>
    </form>

    <!-- Language Selector -->
    <div class="language-selector">
      <LanguageSelector />
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 32px;
  color: var(--ion-text-color);
}

.input-group {
  margin-bottom: 24px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--ion-text-color);
}

.phone-input {
  --background: var(--ion-color-light);
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  border-radius: 12px;
  font-size: 18px;
  letter-spacing: 1px;
}

.phone-input.has-error {
  --background: rgba(235, 68, 90, 0.1);
}

.input-hint {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.error-text {
  display: block;
  margin-top: 8px;
  font-size: 12px;
}

.submit-button {
  margin-top: 16px;
  --border-radius: 12px;
  height: 52px;
  font-weight: 600;
}

.language-selector {
  margin-top: auto;
  padding-top: 24px;
  text-align: center;
}
</style>