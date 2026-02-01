<script setup lang="ts">
/**
 * PaymentForm - Payment form with Yoco integration
 * Handles card payments via Yoco's inline payment widget
 *
 * @example
 * <PaymentForm
 *   :booking-id="bookingId"
 *   :amount="122.00"
 *   @success="handlePaymentSuccess"
 *   @error="handlePaymentError"
 * />
 */

import type { Booking, Payment } from '~/types'
import { formatCurrency } from '~/utils/formatting'

interface Props {
  bookingId: string
  amount: number
  booking?: Booking
  returnUrl?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  success: [payment: Payment]
  error: [message: string]
  cancel: []
}>()

const { t } = useI18n()
const config = useRuntimeConfig()
const { haptic } = useAnimation()

// State
const isLoading = ref(false)
const isProcessing = ref(false)
const error = ref<string | null>(null)
const yocoInstance = ref<any>(null)
const cardElement = ref<HTMLElement | null>(null)

// Payment methods
type PaymentMethod = 'card' | 'eft' | 'cash'
const selectedMethod = ref<PaymentMethod>('card')

const paymentMethods = [
  { id: 'card' as const, label: 'Card', icon: 'heroicons:credit-card' },
  { id: 'eft' as const, label: 'EFT / Bank', icon: 'heroicons:building-library' },
  { id: 'cash' as const, label: 'Cash', icon: 'heroicons:banknotes' },
]

// Initialize Yoco SDK
async function initializeYoco() {
  if (typeof window === 'undefined') return

  isLoading.value = true

  try {
    // Check if Yoco SDK is already loaded
    if (!(window as any).YocoSDK) {
      // Load Yoco SDK script
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js'
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Yoco SDK'))
        document.head.appendChild(script)
      })
    }

    // Initialize Yoco instance
    const publicKey = config.public.yocoPublicKey
    if (!publicKey) {
      throw new Error('Yoco public key not configured')
    }

    yocoInstance.value = new (window as any).YocoSDK({
      publicKey,
    })

    // Mount inline card form
    if (cardElement.value) {
      yocoInstance.value.inline({
        layout: 'field',
        amountInCents: Math.round(props.amount * 100),
        currency: 'ZAR',
      }).mount(cardElement.value)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to initialize payment'
    console.error('Yoco initialization error:', e)
  } finally {
    isLoading.value = false
  }
}

// Process card payment
async function processCardPayment() {
  if (!yocoInstance.value) {
    error.value = 'Payment system not initialized'
    return
  }

  isProcessing.value = true
  error.value = null

  try {
    haptic('light')

    // Create payment token via Yoco
    const result = await yocoInstance.value.createToken()

    if (result.error) {
      throw new Error(result.error.message)
    }

    // Send token to backend to complete payment
    const { post } = useApi()
    const response = await post<{ data: Payment }>('/payments', {
      bookingId: props.bookingId,
      token: result.id,
      amountInCents: Math.round(props.amount * 100),
      currency: 'ZAR',
    })

    haptic('success')
    emit('success', response.data)
  } catch (e) {
    haptic('error')
    const message = e instanceof Error ? e.message : 'Payment failed'
    error.value = message
    emit('error', message)
  } finally {
    isProcessing.value = false
  }
}

// Process EFT payment (redirect to bank selection)
async function processEFTPayment() {
  isProcessing.value = true
  error.value = null

  try {
    haptic('light')

    // Get EFT checkout URL from backend (using Ozow or similar)
    const { post } = useApi()
    const response = await post<{ data: { redirectUrl: string } }>('/payments/eft', {
      bookingId: props.bookingId,
      amount: props.amount,
      returnUrl: props.returnUrl || window.location.href,
    })

    // Redirect to EFT payment page
    window.location.href = response.data.redirectUrl
  } catch (e) {
    haptic('error')
    const message = e instanceof Error ? e.message : 'Failed to initiate EFT payment'
    error.value = message
    emit('error', message)
    isProcessing.value = false
  }
}

// Process cash payment (mark as pending cash)
async function processCashPayment() {
  isProcessing.value = true
  error.value = null

  try {
    haptic('light')

    const { post } = useApi()
    const response = await post<{ data: Payment }>('/payments/cash', {
      bookingId: props.bookingId,
      amount: props.amount,
    })

    haptic('success')
    emit('success', response.data)
  } catch (e) {
    haptic('error')
    const message = e instanceof Error ? e.message : 'Failed to process payment'
    error.value = message
    emit('error', message)
  } finally {
    isProcessing.value = false
  }
}

// Handle form submission
function handleSubmit() {
  switch (selectedMethod.value) {
    case 'card':
      processCardPayment()
      break
    case 'eft':
      processEFTPayment()
      break
    case 'cash':
      processCashPayment()
      break
  }
}

// Handle cancel
function handleCancel() {
  haptic('light')
  emit('cancel')
}

// Initialize on mount
onMounted(() => {
  if (selectedMethod.value === 'card') {
    initializeYoco()
  }
})

// Re-initialize when switching to card
watch(selectedMethod, (method) => {
  if (method === 'card' && !yocoInstance.value) {
    nextTick(() => initializeYoco())
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (yocoInstance.value) {
    try {
      yocoInstance.value.unmount()
    } catch {
      // Ignore unmount errors
    }
  }
})
</script>

<template>
  <div class="payment-form">
    <!-- Amount Display -->
    <div class="payment-amount">
      <span class="payment-amount__label">{{ t('payment.total_amount') }}</span>
      <span class="payment-amount__value">{{ formatCurrency(amount) }}</span>
    </div>

    <!-- Booking Info (if provided) -->
    <div v-if="booking" class="payment-booking-info">
      <div class="booking-info-row">
        <span>{{ t('booking.service') }}</span>
        <span>{{ booking.service?.name }}</span>
      </div>
      <div class="booking-info-row">
        <span>{{ t('booking.provider') }}</span>
        <span>{{ booking.provider?.user?.name }}</span>
      </div>
    </div>

    <!-- Payment Method Selection -->
    <div class="payment-methods">
      <h4 class="payment-methods__title">{{ t('payment.select_method') }}</h4>
      <div class="payment-methods__grid">
        <button
          v-for="method in paymentMethods"
          :key="method.id"
          type="button"
          :class="[
            'payment-method',
            { 'payment-method--selected': selectedMethod === method.id },
          ]"
          @click="selectedMethod = method.id"
        >
          <Icon :name="method.icon" />
          <span>{{ method.label }}</span>
        </button>
      </div>
    </div>

    <!-- Card Payment Form -->
    <div v-if="selectedMethod === 'card'" class="payment-card">
      <!-- Loading state -->
      <div v-if="isLoading" class="payment-card__loading">
        <UiSpinner size="md" />
        <span>{{ t('payment.loading') }}</span>
      </div>

      <!-- Yoco card element container -->
      <div
        v-show="!isLoading"
        ref="cardElement"
        class="payment-card__element"
      />

      <!-- Card security note -->
      <p class="payment-card__note">
        <Icon name="heroicons:lock-closed" />
        {{ t('payment.secure_payment') }}
      </p>
    </div>

    <!-- EFT Payment Info -->
    <div v-else-if="selectedMethod === 'eft'" class="payment-eft">
      <div class="payment-eft__info">
        <Icon name="heroicons:information-circle" />
        <p>{{ t('payment.eft_info') }}</p>
      </div>
      <ul class="payment-eft__banks">
        <li>ABSA</li>
        <li>Capitec</li>
        <li>FNB</li>
        <li>Nedbank</li>
        <li>Standard Bank</li>
      </ul>
    </div>

    <!-- Cash Payment Info -->
    <div v-else-if="selectedMethod === 'cash'" class="payment-cash">
      <div class="payment-cash__info">
        <Icon name="heroicons:banknotes" />
        <div>
          <h5>{{ t('payment.cash_title') }}</h5>
          <p>{{ t('payment.cash_info') }}</p>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="payment-error">
      <Icon name="heroicons:exclamation-circle" />
      <span>{{ error }}</span>
    </div>

    <!-- Actions -->
    <div class="payment-actions">
      <UiButton
        type="button"
        variant="ghost"
        size="lg"
        :disabled="isProcessing"
        @click="handleCancel"
      >
        {{ t('common.cancel') }}
      </UiButton>

      <UiButton
        type="button"
        variant="primary"
        size="lg"
        :loading="isProcessing"
        :disabled="isLoading"
        @click="handleSubmit"
      >
        <template v-if="selectedMethod === 'card'">
          {{ t('payment.pay_now') }} {{ formatCurrency(amount) }}
        </template>
        <template v-else-if="selectedMethod === 'eft'">
          {{ t('payment.continue_to_bank') }}
        </template>
        <template v-else>
          {{ t('payment.confirm_cash') }}
        </template>
      </UiButton>
    </div>

    <!-- Powered by Yoco -->
    <p v-if="selectedMethod === 'card'" class="payment-powered">
      {{ t('payment.powered_by') }} <strong>Yoco</strong>
    </p>
  </div>
</template>

<style scoped>
.payment-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Amount display */
.payment-amount {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-6);
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  border-radius: var(--radius-xl);
  text-align: center;
}

.payment-amount__label {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.8);
}

.payment-amount__value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: white;
}

/* Booking info */
.payment-booking-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-lg);
}

.booking-info-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
}

.booking-info-row span:first-child {
  color: var(--color-neutral-500);
}

.booking-info-row span:last-child {
  font-weight: var(--font-medium);
  color: var(--color-neutral-900);
}

/* Payment methods */
.payment-methods {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.payment-methods__title {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-700);
}

.payment-methods__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.payment-method {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border: 2px solid transparent;
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.payment-method:hover {
  background: var(--color-neutral-100);
}

.payment-method--selected {
  background: var(--color-primary-50);
  border-color: var(--color-primary-500);
}

.payment-method :deep(svg) {
  width: 28px;
  height: 28px;
  color: var(--color-neutral-400);
}

.payment-method--selected :deep(svg) {
  color: var(--color-primary-500);
}

.payment-method span {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-600);
}

.payment-method--selected span {
  color: var(--color-primary-600);
}

/* Card payment */
.payment-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.payment-card__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-8);
  color: var(--color-neutral-500);
}

.payment-card__element {
  min-height: 48px;
  padding: var(--space-4);
  background: var(--color-neutral-0);
  border: 1.5px solid var(--color-neutral-300);
  border-radius: var(--radius-lg);
}

.payment-card__note {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
}

.payment-card__note :deep(svg) {
  width: 14px;
  height: 14px;
  color: var(--color-success-500);
}

/* EFT payment */
.payment-eft {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.payment-eft__info {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-info-50);
  border-radius: var(--radius-lg);
}

.payment-eft__info :deep(svg) {
  width: 24px;
  height: 24px;
  color: var(--color-info-500);
  flex-shrink: 0;
}

.payment-eft__info p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-info-700);
}

.payment-eft__banks {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.payment-eft__banks li {
  padding: var(--space-2) var(--space-3);
  background: var(--color-neutral-100);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--color-neutral-600);
}

/* Cash payment */
.payment-cash__info {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-warning-50);
  border-radius: var(--radius-lg);
}

.payment-cash__info :deep(svg) {
  width: 32px;
  height: 32px;
  color: var(--color-warning-500);
  flex-shrink: 0;
}

.payment-cash__info h5 {
  margin: 0 0 var(--space-1);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-warning-700);
}

.payment-cash__info p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-warning-600);
}

/* Error */
.payment-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-error-50);
  border-radius: var(--radius-lg);
  color: var(--color-error-600);
  font-size: var(--text-sm);
}

.payment-error :deep(svg) {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Actions */
.payment-actions {
  display: flex;
  gap: var(--space-3);
  padding-top: var(--space-4);
}

.payment-actions > *:last-child {
  flex: 2;
}

.payment-actions > *:first-child {
  flex: 1;
}

/* Powered by */
.payment-powered {
  margin: 0;
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-neutral-400);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .payment-booking-info {
    background: var(--color-neutral-800);
  }

  .booking-info-row span:last-child {
    color: var(--color-neutral-100);
  }

  .payment-methods__title {
    color: var(--color-neutral-300);
  }

  .payment-method {
    background: var(--color-neutral-800);
  }

  .payment-method:hover {
    background: var(--color-neutral-700);
  }

  .payment-method--selected {
    background: rgba(0, 168, 107, 0.1);
  }

  .payment-card__element {
    background: var(--color-neutral-900);
    border-color: var(--color-neutral-700);
  }

  .payment-eft__banks li {
    background: var(--color-neutral-800);
    color: var(--color-neutral-300);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .payment-method {
    transition: none;
  }
}
</style>