<script setup lang="ts">
import {
  IonInput,
  IonButton,
  IonSpinner,
  IonText,
  IonIcon,
} from '@ionic/vue'
import { arrowBack } from 'ionicons/icons'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { t } = useI18n()
const router = useRouter()
const {
  verifyOtp,
  resendOtp,
  isLoading,
  error,
  otpPhone,
  resetOtpFlow,
  clearError,
} = useAuth()
const authStore = useAuthStore()

// Redirect if no phone set
onMounted(() => {
  if (!otpPhone.value) {
    router.replace('/auth/login')
  }
})

// State
const otp = ref('')
const otpInputs = ref<string[]>(['', '', '', '', '', ''])
const resendCountdown = ref(60)
const canResend = ref(false)
let countdownInterval: ReturnType<typeof setInterval> | null = null

// Format phone for display (mask middle digits)
const maskedPhone = computed(() => {
  if (!otpPhone.value) return ''
  const phone = otpPhone.value
  if (phone.length < 8) return phone
  return phone.slice(0, 5) + '****' + phone.slice(-3)
})

// Start countdown timer
const startCountdown = () => {
  resendCountdown.value = 60
  canResend.value = false

  if (countdownInterval) {
    clearInterval(countdownInterval)
  }

  countdownInterval = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0) {
      canResend.value = true
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    }
  }, 1000)
}

// Handle OTP input
const handleOtpInput = (index: number, event: CustomEvent) => {
  const value = event.detail.value || ''

  // Only allow digits
  const digit = value.replace(/\D/g, '').slice(-1)
  otpInputs.value[index] = digit

  // Auto-focus next input
  if (digit && index < 5) {
    const nextInput = document.querySelector(
      `[data-otp-index="${index + 1}"] input`
    ) as HTMLInputElement
    nextInput?.focus()
  }

  // Update combined OTP
  otp.value = otpInputs.value.join('')
  clearError()

  // Auto-submit when complete
  if (otp.value.length === 6) {
    handleSubmit()
  }
}

// Handle backspace
const handleKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !otpInputs.value[index] && index > 0) {
    const prevInput = document.querySelector(
      `[data-otp-index="${index - 1}"] input`
    ) as HTMLInputElement
    prevInput?.focus()
  }
}

// Handle paste
const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text') || ''
  const digits = pastedData.replace(/\D/g, '').slice(0, 6)

  digits.split('').forEach((digit, index) => {
    if (index < 6) {
      otpInputs.value[index] = digit
    }
  })

  otp.value = otpInputs.value.join('')

  // Focus last filled or first empty
  const focusIndex = Math.min(digits.length, 5)
  const input = document.querySelector(
    `[data-otp-index="${focusIndex}"] input`
  ) as HTMLInputElement
  input?.focus()

  // Auto-submit if complete
  if (otp.value.length === 6) {
    handleSubmit()
  }
}

// Submit OTP
const handleSubmit = async () => {
  if (otp.value.length !== 6 || isLoading.value) return

  const success = await verifyOtp(otp.value)

  if (success) {
    // Navigate based on user role
    if (authStore.isProvider) {
      router.replace('/provider-dashboard')
    } else {
      router.replace('/')
    }
  } else {
    // Clear inputs on error
    otpInputs.value = ['', '', '', '', '', '']
    otp.value = ''
    const firstInput = document.querySelector(
      '[data-otp-index="0"] input'
    ) as HTMLInputElement
    firstInput?.focus()
  }
}

// Resend OTP
const handleResend = async () => {
  if (!canResend.value || isLoading.value) return

  const success = await resendOtp()
  if (success) {
    startCountdown()
    otpInputs.value = ['', '', '', '', '', '']
    otp.value = ''
  }
}

// Go back to phone input
const goBack = () => {
  resetOtpFlow()
  router.replace('/auth/login')
}

// Start countdown on mount
onMounted(() => {
  startCountdown()
})

// Cleanup on unmount
onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<template>
  <div class="verify-page">
    <!-- Back Button -->
    <button class="back-button" @click="goBack" :disabled="isLoading">
      <IonIcon :icon="arrowBack" />
      {{ t('auth.wrong_number') }}
    </button>

    <h2 class="page-title">{{ t('auth.otp_title') }}</h2>
    <p class="subtitle">{{ t('auth.otp_subtitle', { phone: maskedPhone }) }}</p>

    <!-- OTP Input -->
    <div class="otp-container" @paste="handlePaste">
      <IonInput
        v-for="(_, index) in otpInputs"
        :key="index"
        :data-otp-index="index"
        type="tel"
        inputmode="numeric"
        maxlength="1"
        :value="otpInputs[index]"
        @ionInput="handleOtpInput(index, $event)"
        @keydown="handleKeydown(index, $event)"
        :disabled="isLoading"
        class="otp-input"
        :class="{ 'has-value': otpInputs[index], 'has-error': error }"
      />
    </div>

    <!-- Error Message -->
    <IonText v-if="error" color="danger" class="error-text">
      {{ error }}
    </IonText>

    <!-- Submit Button -->
    <IonButton
      expand="block"
      size="large"
      :disabled="otp.length !== 6 || isLoading"
      @click="handleSubmit"
      class="submit-button"
    >
      <IonSpinner v-if="isLoading" name="crescent" />
      <span v-else>{{ t('auth.verify_otp') }}</span>
    </IonButton>

    <!-- Resend OTP -->
    <div class="resend-section">
      <button
        v-if="canResend"
        class="resend-button"
        @click="handleResend"
        :disabled="isLoading"
      >
        {{ t('auth.resend_otp') }}
      </button>
      <span v-else class="resend-countdown">
        {{ t('auth.resend_in', { seconds: resendCountdown }) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.verify-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--ion-color-primary);
  font-size: 14px;
  font-weight: 500;
  padding: 0;
  margin-bottom: 24px;
  cursor: pointer;
}

.back-button ion-icon {
  font-size: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--ion-text-color);
}

.subtitle {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin: 0 0 32px;
}

.otp-container {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
}

.otp-input {
  width: 48px;
  height: 56px;
  --background: var(--ion-color-light);
  --padding-start: 0;
  --padding-end: 0;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  border-radius: 12px;
}

.otp-input.has-value {
  --background: rgba(0, 168, 107, 0.1);
}

.otp-input.has-error {
  --background: rgba(235, 68, 90, 0.1);
}

.otp-input::part(native) {
  text-align: center;
}

.error-text {
  display: block;
  text-align: center;
  font-size: 14px;
  margin-bottom: 16px;
}

.submit-button {
  --border-radius: 12px;
  height: 52px;
  font-weight: 600;
}

.resend-section {
  text-align: center;
  margin-top: 24px;
}

.resend-button {
  background: none;
  border: none;
  color: var(--ion-color-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.resend-countdown {
  font-size: 14px;
  color: var(--ion-color-medium);
}
</style>