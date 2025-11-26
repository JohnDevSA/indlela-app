<script setup lang="ts">
/**
 * Verify OTP Page - 6-digit OTP verification
 * Refined to use Indlela design system
 */

import { IonInput } from '@ionic/vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { t } = useI18n()
const router = useRouter()
const { haptic } = useAnimation()
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
    haptic('light')
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
    haptic('medium')
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
    haptic('medium')
    handleSubmit()
  }
}

// Submit OTP
const handleSubmit = async () => {
  if (otp.value.length !== 6 || isLoading.value) return

  const success = await verifyOtp(otp.value)

  if (success) {
    haptic('success')
    // Navigate based on user status
    const user = authStore.user
    if (user && !user.onboardingCompleted) {
      router.replace(user.role === 'provider' ? '/onboarding/provider' : '/onboarding/customer')
    } else if (authStore.isProvider) {
      router.replace('/provider-dashboard')
    } else if (authStore.isAdmin) {
      router.replace('/admin')
    } else {
      router.replace('/')
    }
  } else {
    haptic('error')
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

  haptic('light')
  const success = await resendOtp()
  if (success) {
    haptic('success')
    startCountdown()
    otpInputs.value = ['', '', '', '', '', '']
    otp.value = ''
  } else {
    haptic('error')
  }
}

// Go back to phone input
const goBack = () => {
  haptic('light')
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

const canSubmit = computed(() => otp.value.length === 6 && !isLoading.value)
</script>

<template>
  <div class="verify-page">
    <!-- Back Button -->
    <button class="back-button" :disabled="isLoading" @click="goBack">
      <Icon name="heroicons:arrow-left" />
      {{ t('auth.wrong_number') }}
    </button>

    <h2 class="page-title">{{ t('auth.otp_title') }}</h2>
    <p class="subtitle">{{ t('auth.otp_subtitle', { phone: maskedPhone }) }}</p>

    <!-- OTP Input -->
    <div class="otp-container" @paste="handlePaste">
      <div
        v-for="(_, index) in otpInputs"
        :key="index"
        :class="[
          'otp-input-wrapper',
          { 'otp-input-wrapper--filled': otpInputs[index] },
          { 'otp-input-wrapper--error': error },
        ]"
      >
        <IonInput
          :data-otp-index="index"
          type="tel"
          inputmode="numeric"
          maxlength="1"
          :value="otpInputs[index]"
          :disabled="isLoading"
          class="otp-input"
          @ionInput="handleOtpInput(index, $event)"
          @keydown="handleKeydown(index, $event)"
        />
      </div>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="error-text">
      <Icon name="heroicons:exclamation-circle" />
      {{ error }}
    </p>

    <!-- Submit Button -->
    <UiButton
      variant="primary"
      size="lg"
      :loading="isLoading"
      :disabled="!canSubmit"
      :full-width="true"
      @click="handleSubmit"
    >
      {{ t('auth.verify_otp') }}
    </UiButton>

    <!-- Resend OTP -->
    <div class="resend-section">
      <button
        v-if="canResend"
        class="resend-button"
        :disabled="isLoading"
        @click="handleResend"
      >
        <Icon name="heroicons:arrow-path" />
        {{ t('auth.resend_otp') }}
      </button>
      <div v-else class="resend-countdown">
        <Icon name="heroicons:clock" />
        <span>{{ t('auth.resend_in', { seconds: resendCountdown }) }}</span>
      </div>
    </div>

    <!-- Help link -->
    <div class="help-section">
      <p class="help-text">{{ t('auth.otp_help_text') }}</p>
    </div>
  </div>
</template>

<style scoped>
.verify-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

/* Back Button */
.back-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: none;
  border: none;
  color: var(--color-primary-600);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  padding: 0;
  margin-bottom: var(--space-6);
  cursor: pointer;
  transition: color var(--duration-fast);
}

.back-button:hover:not(:disabled) {
  color: var(--color-primary-700);
}

.back-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.back-button :deep(svg) {
  width: 20px;
  height: 20px;
}

/* Title */
.page-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-2);
  color: var(--color-neutral-900);
}

.subtitle {
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
  margin: 0 0 var(--space-8);
  line-height: var(--leading-relaxed);
}

/* OTP Container */
.otp-container {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
  margin-bottom: var(--space-4);
}

.otp-input-wrapper {
  width: 48px;
  height: 56px;
  background: var(--color-neutral-50);
  border: 1.5px solid var(--color-neutral-300);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--ease-out);
  overflow: hidden;
}

.otp-input-wrapper:focus-within {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.otp-input-wrapper--filled {
  background: var(--color-primary-50);
  border-color: var(--color-primary-400);
}

.otp-input-wrapper--error {
  background: var(--color-error-50);
  border-color: var(--color-error-500);
}

.otp-input-wrapper--error:focus-within {
  box-shadow: 0 0 0 3px var(--color-error-50);
}

.otp-input {
  width: 100%;
  height: 100%;
  --background: transparent;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  text-align: center;
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-neutral-900);
}

.otp-input::part(native) {
  text-align: center;
}

/* Error Text */
.error-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-error-600);
  margin: 0 0 var(--space-4);
  text-align: center;
}

.error-text :deep(svg) {
  width: 16px;
  height: 16px;
}

/* Resend Section */
.resend-section {
  text-align: center;
  margin-top: var(--space-6);
}

.resend-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: none;
  border: none;
  color: var(--color-primary-600);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast);
}

.resend-button:hover:not(:disabled) {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
}

.resend-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.resend-button :deep(svg) {
  width: 16px;
  height: 16px;
}

.resend-countdown {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
  padding: var(--space-2) var(--space-4);
}

.resend-countdown :deep(svg) {
  width: 16px;
  height: 16px;
}

/* Help Section */
.help-section {
  margin-top: auto;
  padding-top: var(--space-8);
  text-align: center;
}

.help-text {
  font-size: var(--text-xs);
  color: var(--color-neutral-400);
  margin: 0;
  line-height: var(--leading-relaxed);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .back-button {
    color: var(--color-primary-400);
  }

  .back-button:hover:not(:disabled) {
    color: var(--color-primary-300);
  }

  .page-title {
    color: var(--color-neutral-100);
  }

  .subtitle {
    color: var(--color-neutral-400);
  }

  .otp-input-wrapper {
    background: var(--color-neutral-800);
    border-color: var(--color-neutral-600);
  }

  .otp-input-wrapper:focus-within {
    box-shadow: 0 0 0 3px rgba(0, 168, 107, 0.2);
  }

  .otp-input-wrapper--filled {
    background: rgba(0, 168, 107, 0.15);
    border-color: var(--color-primary-500);
  }

  .otp-input-wrapper--error {
    background: rgba(239, 68, 68, 0.1);
  }

  .otp-input {
    color: var(--color-neutral-100);
  }

  .resend-button {
    color: var(--color-primary-400);
  }

  .resend-button:hover:not(:disabled) {
    background: rgba(0, 168, 107, 0.1);
    color: var(--color-primary-300);
  }

  .resend-countdown {
    color: var(--color-neutral-500);
  }

  .help-text {
    color: var(--color-neutral-500);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .back-button,
  .otp-input-wrapper,
  .resend-button {
    transition: none;
  }
}

/* Responsive adjustments for small screens */
@media (max-width: 360px) {
  .otp-container {
    gap: var(--space-1);
  }

  .otp-input-wrapper {
    width: 44px;
    height: 52px;
  }

  .otp-input {
    font-size: var(--text-xl);
  }
}
</style>
