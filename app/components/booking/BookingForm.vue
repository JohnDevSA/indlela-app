<script setup lang="ts">
/**
 * BookingForm - Complete booking creation form
 * Includes service selection, date/time picker, location, and price breakdown
 *
 * @example
 * <BookingForm
 *   :provider-id="providerId"
 *   :service-id="serviceId"
 *   @submit="handleBookingCreated"
 * />
 */

import type { Provider, Service, CreateBookingPayload, LocationInput } from '~/types'
import { calculateBookingTotal, formatCurrency } from '~/utils/formatting'
import { createBookingSchema, createValidator } from '~/utils/validation'
import { BUSINESS_RULES } from '~/types'

interface Props {
  providerId?: string
  serviceId?: string
  provider?: Provider
  service?: Service
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [booking: CreateBookingPayload]
  cancel: []
}>()

const { t } = useI18n()
const bookingStore = useBookingStore()
const { position, getCurrentPosition, isLoading: isGeoLoading } = useGeolocation()
const { haptic } = useAnimation()

// Form state
const selectedDate = ref('')
const selectedTime = ref('')
const notes = ref('')
const location = ref<LocationInput | null>(null)
const useCurrentLocation = ref(true)

// Validation
const { validate, errors, isValid } = createValidator(createBookingSchema)

// Loading states
const isSubmitting = ref(false)
const isLoadingLocation = ref(false)

// Computed: full scheduled datetime
const scheduledAt = computed(() => {
  if (!selectedDate.value || !selectedTime.value) return null
  return `${selectedDate.value}T${selectedTime.value}:00`
})

// Computed: price breakdown
const priceBreakdown = computed(() => {
  const basePrice = props.service?.basePrice || 0
  return calculateBookingTotal(basePrice)
})

// Computed: form validity
const canSubmit = computed(() => {
  return (
    props.providerId &&
    props.serviceId &&
    selectedDate.value &&
    selectedTime.value &&
    location.value &&
    !isSubmitting.value
  )
})

// Get current location
async function fetchCurrentLocation() {
  if (!useCurrentLocation.value) return

  isLoadingLocation.value = true
  try {
    await getCurrentPosition()

    if (position.value) {
      // Reverse geocode to get address
      location.value = {
        lat: position.value.lat,
        lng: position.value.lng,
        address: await reverseGeocode(position.value.lat, position.value.lng),
      }
    }
  } catch (e) {
    // Fallback to manual entry
    useCurrentLocation.value = false
  } finally {
    isLoadingLocation.value = false
  }
}

// Simple reverse geocoding (in production, use a proper geocoding service)
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // This is a placeholder - in production, use Google Maps, Mapbox, or similar
  try {
    const { get } = useApi()
    const response = await get<{ data: { address: string } }>('/geocode/reverse', {
      lat,
      lng,
    })
    return response.data.address
  } catch {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
}

// Handle manual address input
function handleAddressInput(address: string) {
  if (location.value) {
    location.value.address = address
  } else {
    // For manual entry without geolocation, we'd need a geocoding service
    // For now, create a placeholder location
    location.value = {
      lat: 0,
      lng: 0,
      address,
    }
  }
}

// Submit booking
async function handleSubmit() {
  if (!canSubmit.value || !scheduledAt.value || !location.value) return

  haptic('light')
  isSubmitting.value = true

  const payload: CreateBookingPayload = {
    serviceId: props.serviceId!,
    providerId: props.providerId!,
    location: location.value,
    scheduledAt: scheduledAt.value,
    notes: notes.value || undefined,
  }

  // Validate
  const validated = validate(payload)
  if (!validated) {
    isSubmitting.value = false
    return
  }

  try {
    const booking = await bookingStore.createBooking(payload)

    if (booking) {
      haptic('success')
      emit('submit', payload)
    } else {
      haptic('error')
    }
  } finally {
    isSubmitting.value = false
  }
}

// Cancel booking
function handleCancel() {
  haptic('light')
  emit('cancel')
}

// Initialize location on mount
onMounted(() => {
  if (useCurrentLocation.value) {
    fetchCurrentLocation()
  }
})
</script>

<template>
  <form class="booking-form" @submit.prevent="handleSubmit">
    <!-- Provider Info (if provided) -->
    <div v-if="provider" class="booking-form__provider">
      <UiAvatar
        :src="provider.user?.avatar"
        :name="provider.user?.name || 'Provider'"
        size="lg"
      />
      <div class="booking-form__provider-info">
        <h3>{{ provider.user?.name }}</h3>
        <div class="booking-form__provider-rating">
          <StarRating :rating="provider.rating" size="sm" />
          <span>({{ provider.totalReviews }})</span>
        </div>
      </div>
    </div>

    <!-- Service Info (if provided) -->
    <div v-if="service" class="booking-form__service">
      <Icon :name="service.icon || 'heroicons:wrench-screwdriver'" />
      <div>
        <h4>{{ service.name }}</h4>
        <p v-if="service.description">{{ service.description }}</p>
      </div>
    </div>

    <!-- Date & Time Selection -->
    <section class="booking-form__section">
      <h3 class="booking-form__section-title">
        {{ t('booking.when') }}
      </h3>

      <AvailabilityCalendar
        v-model:date="selectedDate"
        v-model:time="selectedTime"
        :provider-id="providerId || ''"
      />

      <p v-if="errors.scheduledAt" class="booking-form__error">
        {{ errors.scheduledAt }}
      </p>
    </section>

    <!-- Location -->
    <section class="booking-form__section">
      <h3 class="booking-form__section-title">
        {{ t('booking.where') }}
      </h3>

      <!-- Location toggle -->
      <div class="booking-form__location-toggle">
        <button
          type="button"
          :class="['location-btn', { 'location-btn--active': useCurrentLocation }]"
          @click="useCurrentLocation = true; fetchCurrentLocation()"
        >
          <Icon name="heroicons:map-pin" />
          {{ t('booking.use_current_location') }}
        </button>
        <button
          type="button"
          :class="['location-btn', { 'location-btn--active': !useCurrentLocation }]"
          @click="useCurrentLocation = false"
        >
          <Icon name="heroicons:pencil" />
          {{ t('booking.enter_address') }}
        </button>
      </div>

      <!-- Current location display -->
      <div v-if="useCurrentLocation" class="booking-form__location">
        <div v-if="isLoadingLocation || isGeoLoading" class="location-loading">
          <UiSpinner size="sm" />
          <span>{{ t('booking.getting_location') }}</span>
        </div>
        <div v-else-if="location" class="location-display">
          <Icon name="heroicons:map-pin" class="location-display__icon" />
          <span>{{ location.address }}</span>
        </div>
        <div v-else class="location-error">
          <Icon name="heroicons:exclamation-triangle" />
          <span>{{ t('booking.location_unavailable') }}</span>
          <UiButton size="sm" variant="ghost" @click="useCurrentLocation = false">
            {{ t('booking.enter_manually') }}
          </UiButton>
        </div>
      </div>

      <!-- Manual address input -->
      <div v-else class="booking-form__address-input">
        <UiInput
          :model-value="location?.address || ''"
          :label="t('booking.address')"
          :placeholder="t('booking.address_placeholder')"
          icon="heroicons:map-pin"
          @update:model-value="handleAddressInput"
        />
      </div>

      <p v-if="errors.location" class="booking-form__error">
        {{ errors.location }}
      </p>
    </section>

    <!-- Notes -->
    <section class="booking-form__section">
      <h3 class="booking-form__section-title">
        {{ t('booking.notes_optional') }}
      </h3>

      <UiTextarea
        v-model="notes"
        :placeholder="t('booking.notes_placeholder')"
        :maxlength="500"
        rows="3"
      />
    </section>

    <!-- Price Breakdown -->
    <section class="booking-form__pricing">
      <h3 class="booking-form__section-title">
        {{ t('booking.price_breakdown') }}
      </h3>

      <div class="price-breakdown">
        <div class="price-row">
          <span>{{ t('booking.service_fee') }}</span>
          <span>{{ formatCurrency(priceBreakdown.base) }}</span>
        </div>
        <div class="price-row">
          <span>
            {{ t('booking.platform_fee') }}
            <span class="price-hint">({{ (BUSINESS_RULES.COMMISSION_RATE * 100).toFixed(0) }}%)</span>
          </span>
          <span>{{ formatCurrency(priceBreakdown.commission) }}</span>
        </div>
        <div class="price-row">
          <span>{{ t('booking.booking_fee') }}</span>
          <span>{{ formatCurrency(priceBreakdown.bookingFee) }}</span>
        </div>
        <div class="price-row price-row--total">
          <span>{{ t('booking.total') }}</span>
          <span>{{ formatCurrency(priceBreakdown.total) }}</span>
        </div>
      </div>
    </section>

    <!-- Error display -->
    <div v-if="bookingStore.error" class="booking-form__error-banner">
      <Icon name="heroicons:exclamation-circle" />
      <span>{{ bookingStore.error }}</span>
    </div>

    <!-- Actions -->
    <div class="booking-form__actions">
      <UiButton
        type="button"
        variant="ghost"
        size="lg"
        :disabled="isSubmitting"
        @click="handleCancel"
      >
        {{ t('common.cancel') }}
      </UiButton>

      <UiButton
        type="submit"
        variant="primary"
        size="lg"
        :loading="isSubmitting"
        :disabled="!canSubmit"
      >
        {{ t('booking.confirm_booking') }}
      </UiButton>
    </div>
  </form>
</template>

<style scoped>
.booking-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Provider info */
.booking-form__provider {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-xl);
}

.booking-form__provider-info h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
}

.booking-form__provider-rating {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
}

/* Service info */
.booking-form__service {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-primary-50);
  border-radius: var(--radius-lg);
}

.booking-form__service :deep(svg) {
  width: 24px;
  height: 24px;
  color: var(--color-primary-500);
  flex-shrink: 0;
}

.booking-form__service h4 {
  margin: 0;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
}

.booking-form__service p {
  margin: var(--space-1) 0 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
}

/* Section */
.booking-form__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.booking-form__section-title {
  margin: 0;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
}

/* Location toggle */
.booking-form__location-toggle {
  display: flex;
  gap: var(--space-2);
}

.location-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-neutral-50);
  border: 1.5px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-600);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.location-btn:hover {
  background: var(--color-neutral-100);
}

.location-btn--active {
  background: var(--color-primary-50);
  border-color: var(--color-primary-500);
  color: var(--color-primary-600);
}

.location-btn :deep(svg) {
  width: 18px;
  height: 18px;
}

/* Location display */
.booking-form__location {
  padding: var(--space-3);
  background: var(--color-neutral-50);
  border-radius: var(--radius-lg);
}

.location-loading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-neutral-500);
  font-size: var(--text-sm);
}

.location-display {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
}

.location-display__icon {
  width: 18px;
  height: 18px;
  color: var(--color-primary-500);
  flex-shrink: 0;
  margin-top: 2px;
}

.location-error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-warning-600);
  font-size: var(--text-sm);
}

.location-error :deep(svg) {
  width: 18px;
  height: 18px;
}

/* Price breakdown */
.booking-form__pricing {
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-xl);
}

.price-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
}

.price-hint {
  font-size: var(--text-xs);
  color: var(--color-neutral-400);
}

.price-row--total {
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-neutral-200);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
}

/* Error */
.booking-form__error {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-error-500);
}

.booking-form__error-banner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-error-50);
  border-radius: var(--radius-lg);
  color: var(--color-error-600);
  font-size: var(--text-sm);
}

.booking-form__error-banner :deep(svg) {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Actions */
.booking-form__actions {
  display: flex;
  gap: var(--space-3);
  padding-top: var(--space-4);
}

.booking-form__actions > * {
  flex: 1;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .booking-form__provider,
  .booking-form__location,
  .booking-form__pricing {
    background: var(--color-neutral-800);
  }

  .booking-form__service {
    background: rgba(0, 168, 107, 0.1);
  }

  .booking-form__section-title,
  .booking-form__provider-info h3 {
    color: var(--color-neutral-100);
  }

  .location-btn {
    background: var(--color-neutral-800);
    border-color: var(--color-neutral-700);
    color: var(--color-neutral-300);
  }

  .location-btn:hover {
    background: var(--color-neutral-700);
  }

  .location-btn--active {
    background: rgba(0, 168, 107, 0.1);
  }

  .price-row--total {
    border-top-color: var(--color-neutral-700);
    color: var(--color-neutral-100);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .location-btn {
    transition: none;
  }
}
</style>