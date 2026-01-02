<script setup lang="ts">
/**
 * RescheduleModal - Modal for rescheduling bookings
 * Used by both customers and service providers
 *
 * @example
 * <RescheduleModal
 *   v-model="showModal"
 *   :booking="currentBooking"
 *   user-role="customer"
 *   @rescheduled="handleRescheduled"
 * />
 */

import type { Booking } from '~/types'
import { formatDate, formatTime } from '~/utils/formatting'

interface Props {
  modelValue: boolean
  booking: Booking
  userRole: 'customer' | 'provider'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  rescheduled: [booking: Booking]
}>()

const { t } = useI18n()
const bookingStore = useBookingStore()

// State
const selectedDate = ref('')
const selectedTime = ref('')
const isSubmitting = ref(false)
const error = ref<string | null>(null)

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const currentSchedule = computed(() => {
  if (!props.booking?.scheduledAt) return null
  const date = new Date(props.booking.scheduledAt)
  return {
    date: formatDate(date, { format: 'full' }),
    time: formatTime(date),
  }
})

const newSchedule = computed(() => {
  if (!selectedDate.value || !selectedTime.value) return null
  const dateTime = new Date(`${selectedDate.value}T${selectedTime.value}`)
  return {
    date: formatDate(dateTime, { format: 'full' }),
    time: formatTime(dateTime),
  }
})

const hasChanges = computed(() => {
  if (!selectedDate.value || !selectedTime.value) return false
  const originalDate = new Date(props.booking.scheduledAt)
  const newDate = new Date(`${selectedDate.value}T${selectedTime.value}`)
  return originalDate.getTime() !== newDate.getTime()
})

const canSubmit = computed(() => {
  return hasChanges.value && !isSubmitting.value
})

// Initialize with current booking date/time when modal opens
watch(isOpen, (open) => {
  if (open && props.booking?.scheduledAt) {
    const date = new Date(props.booking.scheduledAt)
    selectedDate.value = date.toISOString().split('T')[0]
    selectedTime.value = date.toTimeString().slice(0, 5)
    error.value = null
  }
})

// Methods
const close = () => {
  isOpen.value = false
}

const handleSubmit = async () => {
  if (!canSubmit.value) return

  isSubmitting.value = true
  error.value = null

  try {
    const newScheduledAt = new Date(`${selectedDate.value}T${selectedTime.value}`).toISOString()
    const result = await bookingStore.rescheduleBooking(
      props.booking.id,
      newScheduledAt,
      props.userRole
    )

    if (result) {
      emit('rescheduled', result)
      close()
    } else {
      error.value = bookingStore.error || t('booking.reschedule_error')
    }
  } catch (e) {
    error.value = t('booking.reschedule_error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UiModal
    v-model="isOpen"
    :title="t('booking.reschedule_title')"
    size="lg"
  >
    <div class="reschedule-content">
      <!-- Error message -->
      <div v-if="error" class="reschedule-error">
        <Icon name="heroicons:exclamation-circle" />
        <span>{{ error }}</span>
      </div>

      <!-- Booking info -->
      <div class="booking-info">
        <div class="info-row">
          <Icon name="heroicons:clipboard-document-list" />
          <span>{{ t('booking.booking_ref', { ref: booking.id.slice(-8).toUpperCase() }) }}</span>
        </div>
      </div>

      <!-- Current schedule -->
      <div class="schedule-section">
        <h4 class="section-label">{{ t('booking.current_schedule') }}</h4>
        <div v-if="currentSchedule" class="schedule-display schedule-display--current">
          <div class="schedule-item">
            <Icon name="heroicons:calendar" />
            <span>{{ currentSchedule.date }}</span>
          </div>
          <div class="schedule-item">
            <Icon name="heroicons:clock" />
            <span>{{ currentSchedule.time }}</span>
          </div>
        </div>
      </div>

      <!-- Date/time picker -->
      <div class="schedule-section">
        <h4 class="section-label">{{ t('booking.new_schedule') }}</h4>

        <!-- For customers: use AvailabilityCalendar with provider availability -->
        <AvailabilityCalendar
          v-if="userRole === 'customer' && booking.providerId"
          v-model:date="selectedDate"
          v-model:time="selectedTime"
          :provider-id="booking.providerId"
        />

        <!-- For providers: simple date/time inputs (they know their own schedule) -->
        <div v-else class="simple-picker">
          <div class="picker-field">
            <label>{{ t('booking.select_date') }}</label>
            <input
              v-model="selectedDate"
              type="date"
              class="date-input"
              :min="new Date().toISOString().split('T')[0]"
            />
          </div>
          <div class="picker-field">
            <label>{{ t('booking.select_time') }}</label>
            <input
              v-model="selectedTime"
              type="time"
              class="time-input"
              min="06:00"
              max="21:00"
            />
          </div>
        </div>
      </div>

      <!-- New schedule preview -->
      <div v-if="newSchedule && hasChanges" class="schedule-section">
        <h4 class="section-label">{{ t('booking.new_schedule') }}</h4>
        <div class="schedule-display schedule-display--new">
          <div class="schedule-item">
            <Icon name="heroicons:calendar" />
            <span>{{ newSchedule.date }}</span>
          </div>
          <div class="schedule-item">
            <Icon name="heroicons:clock" />
            <span>{{ newSchedule.time }}</span>
          </div>
        </div>
      </div>

      <!-- Notification notice -->
      <div class="notification-notice">
        <Icon name="heroicons:bell" />
        <span>
          {{ userRole === 'customer'
            ? t('booking.provider_will_be_notified')
            : t('booking.customer_will_be_notified')
          }}
        </span>
      </div>
    </div>

    <!-- Footer actions -->
    <template #footer>
      <div class="reschedule-actions">
        <UiButton variant="outline" @click="close">
          {{ t('common.cancel') }}
        </UiButton>
        <UiButton
          variant="primary"
          :loading="isSubmitting"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          {{ t('booking.confirm_reschedule') }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>

<style scoped>
.reschedule-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.reschedule-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-error-50);
  border-radius: var(--radius-lg);
  color: var(--color-error-600);
  font-size: var(--text-sm);
}

.reschedule-error :deep(svg) {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.booking-info {
  padding: var(--space-3);
  background: var(--color-neutral-50);
  border-radius: var(--radius-lg);
}

.info-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-neutral-600);
  font-size: var(--text-sm);
}

.info-row :deep(svg) {
  width: 18px;
  height: 18px;
  color: var(--color-neutral-400);
}

.schedule-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.section-label {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.schedule-display {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
}

.schedule-display--current {
  background: var(--color-neutral-100);
}

.schedule-display--new {
  background: var(--color-primary-50);
  border: 2px solid var(--color-primary-200);
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-neutral-900);
}

.schedule-item :deep(svg) {
  width: 20px;
  height: 20px;
  color: var(--color-neutral-500);
}

.schedule-display--new .schedule-item {
  color: var(--color-primary-700);
}

.schedule-display--new .schedule-item :deep(svg) {
  color: var(--color-primary-500);
}

/* Simple picker for providers */
.simple-picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.picker-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.picker-field label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-700);
}

.date-input,
.time-input {
  width: 100%;
  height: var(--touch-target-min);
  padding: 0 var(--space-4);
  border: 1.5px solid var(--color-neutral-300);
  border-radius: var(--radius-input);
  font-size: var(--text-base);
  color: var(--color-neutral-900);
  background: var(--color-neutral-0);
  transition: border-color var(--duration-fast);
}

.date-input:focus,
.time-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.notification-notice {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-info-50);
  border-radius: var(--radius-lg);
  color: var(--color-info-600);
  font-size: var(--text-sm);
}

.notification-notice :deep(svg) {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.reschedule-actions {
  display: flex;
  gap: var(--space-3);
  width: 100%;
}

.reschedule-actions > * {
  flex: 1;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .reschedule-error {
    background: rgba(239, 68, 68, 0.1);
  }

  .booking-info {
    background: var(--color-neutral-800);
  }

  .schedule-display--current {
    background: var(--color-neutral-800);
  }

  .schedule-display--new {
    background: rgba(0, 168, 107, 0.1);
    border-color: var(--color-primary-700);
  }

  .schedule-item {
    color: var(--color-neutral-100);
  }

  .schedule-display--new .schedule-item {
    color: var(--color-primary-400);
  }

  .picker-field label {
    color: var(--color-neutral-300);
  }

  .date-input,
  .time-input {
    background: var(--color-neutral-800);
    border-color: var(--color-neutral-600);
    color: var(--color-neutral-100);
  }

  .notification-notice {
    background: rgba(59, 130, 246, 0.1);
  }
}
</style>
