<script setup lang="ts">
/**
 * AvailabilityCalendar - Date and time slot picker for booking
 * Displays provider's available time slots for selected date
 *
 * @example
 * <AvailabilityCalendar
 *   v-model:date="selectedDate"
 *   v-model:time="selectedTime"
 *   :provider-id="providerId"
 * />
 */

import { formatDate, isToday, isTomorrow } from '~/utils/formatting'
import { BUSINESS_RULES } from '~/types'

interface TimeSlot {
  time: string // HH:mm format
  available: boolean
}

interface Props {
  providerId: string
  date?: string
  time?: string
  minDate?: Date
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  'update:date': [value: string]
  'update:time': [value: string]
}>()

const { t } = useI18n()
const providerStore = useProviderStore()

// State
const selectedDate = ref(props.date || '')
const selectedTime = ref(props.time || '')
const availableSlots = ref<{ start: string; end: string }[]>([])
const isLoadingSlots = ref(false)

// Generate next 14 days for date selection
const availableDates = computed(() => {
  const dates: { date: Date; label: string; value: string }[] = []
  const now = new Date()
  const minBookingTime = new Date(
    now.getTime() + BUSINESS_RULES.MIN_BOOKING_ADVANCE_HOURS * 60 * 60 * 1000
  )

  for (let i = 0; i < 14; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    date.setHours(0, 0, 0, 0)

    // Skip dates before min booking time
    if (i === 0 && minBookingTime.getDate() !== date.getDate()) {
      continue
    }

    const value = date.toISOString().split('T')[0]
    let label = formatDate(date, { format: 'short' })

    if (isToday(date)) label = t('calendar.today')
    else if (isTomorrow(date)) label = t('calendar.tomorrow')

    dates.push({ date, label, value })
  }

  return dates
})

// Generate time slots for selected date
const timeSlots = computed((): TimeSlot[] => {
  if (!selectedDate.value || availableSlots.value.length === 0) {
    return []
  }

  const slots: TimeSlot[] = []
  const now = new Date()
  const selectedDateObj = new Date(selectedDate.value)
  const isSelectedToday = isToday(selectedDateObj)

  // Generate slots in 30-minute intervals from 6:00 to 21:00
  for (let hour = 6; hour < 21; hour++) {
    for (const minute of [0, 30]) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

      // Check if slot is in the past (for today)
      if (isSelectedToday) {
        const slotTime = new Date(selectedDate.value)
        slotTime.setHours(hour, minute, 0, 0)
        const minTime = new Date(
          now.getTime() + BUSINESS_RULES.MIN_BOOKING_ADVANCE_HOURS * 60 * 60 * 1000
        )
        if (slotTime <= minTime) {
          continue
        }
      }

      // Check if slot falls within available windows
      const isAvailable = availableSlots.value.some(slot => {
        const slotMinutes = hour * 60 + minute
        const startParts = slot.start.split(':').map(Number)
        const endParts = slot.end.split(':').map(Number)
        const startMinutes = startParts[0] * 60 + startParts[1]
        const endMinutes = endParts[0] * 60 + endParts[1]
        return slotMinutes >= startMinutes && slotMinutes < endMinutes
      })

      slots.push({ time: timeStr, available: isAvailable })
    }
  }

  return slots
})

// Group time slots by morning/afternoon/evening
const groupedSlots = computed(() => {
  const morning: TimeSlot[] = []
  const afternoon: TimeSlot[] = []
  const evening: TimeSlot[] = []

  for (const slot of timeSlots.value) {
    const hour = parseInt(slot.time.split(':')[0])
    if (hour < 12) morning.push(slot)
    else if (hour < 17) afternoon.push(slot)
    else evening.push(slot)
  }

  return { morning, afternoon, evening }
})

// Fetch availability when date changes
async function fetchAvailability() {
  if (!selectedDate.value || !props.providerId) return

  isLoadingSlots.value = true
  try {
    availableSlots.value = await providerStore.fetchAvailability(
      props.providerId,
      selectedDate.value
    )
  } finally {
    isLoadingSlots.value = false
  }
}

// Handle date selection
function selectDate(dateValue: string) {
  selectedDate.value = dateValue
  selectedTime.value = '' // Reset time when date changes
  emit('update:date', dateValue)
  fetchAvailability()
}

// Handle time selection
function selectTime(time: string) {
  selectedTime.value = time
  emit('update:time', time)
}

// Format time for display (12h format)
function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Watch for external changes
watch(() => props.date, (val) => {
  if (val && val !== selectedDate.value) {
    selectedDate.value = val
    fetchAvailability()
  }
})

watch(() => props.time, (val) => {
  if (val !== selectedTime.value) {
    selectedTime.value = val || ''
  }
})

// Initial load
onMounted(() => {
  if (selectedDate.value) {
    fetchAvailability()
  }
})
</script>

<template>
  <div class="availability-calendar">
    <!-- Date Selection -->
    <div class="calendar-section">
      <h4 class="calendar-section__title">
        <Icon name="heroicons:calendar" />
        {{ t('booking.select_date') }}
      </h4>

      <div class="date-scroll">
        <button
          v-for="dateItem in availableDates"
          :key="dateItem.value"
          type="button"
          :class="[
            'date-chip',
            { 'date-chip--selected': selectedDate === dateItem.value },
          ]"
          @click="selectDate(dateItem.value)"
        >
          <span class="date-chip__day">
            {{ dateItem.date.toLocaleDateString('en-ZA', { weekday: 'short' }) }}
          </span>
          <span class="date-chip__date">
            {{ dateItem.date.getDate() }}
          </span>
          <span class="date-chip__month">
            {{ dateItem.date.toLocaleDateString('en-ZA', { month: 'short' }) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Time Selection -->
    <div v-if="selectedDate" class="calendar-section">
      <h4 class="calendar-section__title">
        <Icon name="heroicons:clock" />
        {{ t('booking.select_time') }}
      </h4>

      <!-- Loading state -->
      <div v-if="isLoadingSlots || loading" class="time-loading">
        <UiSkeleton v-for="i in 6" :key="i" :width="70" :height="40" />
      </div>

      <!-- No slots available -->
      <div v-else-if="timeSlots.length === 0" class="time-empty">
        <Icon name="heroicons:calendar-days" />
        <p>{{ t('booking.no_slots_available') }}</p>
      </div>

      <!-- Time slots grouped by period -->
      <div v-else class="time-groups">
        <!-- Morning -->
        <div v-if="groupedSlots.morning.length > 0" class="time-group">
          <span class="time-group__label">{{ t('calendar.morning') }}</span>
          <div class="time-slots">
            <button
              v-for="slot in groupedSlots.morning"
              :key="slot.time"
              type="button"
              :class="[
                'time-chip',
                {
                  'time-chip--selected': selectedTime === slot.time,
                  'time-chip--disabled': !slot.available,
                },
              ]"
              :disabled="!slot.available"
              @click="selectTime(slot.time)"
            >
              {{ formatTimeDisplay(slot.time) }}
            </button>
          </div>
        </div>

        <!-- Afternoon -->
        <div v-if="groupedSlots.afternoon.length > 0" class="time-group">
          <span class="time-group__label">{{ t('calendar.afternoon') }}</span>
          <div class="time-slots">
            <button
              v-for="slot in groupedSlots.afternoon"
              :key="slot.time"
              type="button"
              :class="[
                'time-chip',
                {
                  'time-chip--selected': selectedTime === slot.time,
                  'time-chip--disabled': !slot.available,
                },
              ]"
              :disabled="!slot.available"
              @click="selectTime(slot.time)"
            >
              {{ formatTimeDisplay(slot.time) }}
            </button>
          </div>
        </div>

        <!-- Evening -->
        <div v-if="groupedSlots.evening.length > 0" class="time-group">
          <span class="time-group__label">{{ t('calendar.evening') }}</span>
          <div class="time-slots">
            <button
              v-for="slot in groupedSlots.evening"
              :key="slot.time"
              type="button"
              :class="[
                'time-chip',
                {
                  'time-chip--selected': selectedTime === slot.time,
                  'time-chip--disabled': !slot.available,
                },
              ]"
              :disabled="!slot.available"
              @click="selectTime(slot.time)"
            >
              {{ formatTimeDisplay(slot.time) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Selection Summary -->
    <div v-if="selectedDate && selectedTime" class="calendar-summary">
      <Icon name="heroicons:check-circle" class="calendar-summary__icon" />
      <span>
        {{ formatDate(selectedDate, { format: 'medium' }) }}
        {{ t('common.at') }}
        {{ formatTimeDisplay(selectedTime) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.availability-calendar {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Section */
.calendar-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.calendar-section__title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-700);
}

.calendar-section__title :deep(svg) {
  width: 18px;
  height: 18px;
  color: var(--color-primary-500);
}

/* Date scroll */
.date-scroll {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding: var(--space-1) 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.date-scroll::-webkit-scrollbar {
  display: none;
}

/* Date chip */
.date-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 60px;
  padding: var(--space-3);
  background: var(--color-neutral-50);
  border: 2px solid transparent;
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.date-chip:hover {
  background: var(--color-neutral-100);
}

.date-chip--selected {
  background: var(--color-primary-50);
  border-color: var(--color-primary-500);
}

.date-chip__day {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--color-neutral-500);
  text-transform: uppercase;
}

.date-chip--selected .date-chip__day {
  color: var(--color-primary-600);
}

.date-chip__date {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-neutral-900);
  line-height: 1;
}

.date-chip--selected .date-chip__date {
  color: var(--color-primary-600);
}

.date-chip__month {
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
}

/* Time loading */
.time-loading {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

/* Time empty */
.time-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-6);
  text-align: center;
  color: var(--color-neutral-500);
}

.time-empty :deep(svg) {
  width: 32px;
  height: 32px;
}

/* Time groups */
.time-groups {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.time-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.time-group__label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--color-neutral-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Time slots */
.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

/* Time chip */
.time-chip {
  padding: var(--space-2) var(--space-3);
  background: var(--color-neutral-50);
  border: 1.5px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-700);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  min-height: var(--touch-target-sm);
}

.time-chip:hover:not(:disabled) {
  background: var(--color-neutral-100);
  border-color: var(--color-neutral-300);
}

.time-chip--selected {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
  color: white;
}

.time-chip--selected:hover {
  background: var(--color-primary-600);
  border-color: var(--color-primary-600);
}

.time-chip--disabled {
  opacity: 0.4;
  cursor: not-allowed;
  text-decoration: line-through;
}

/* Summary */
.calendar-summary {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-success-50);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-success-700);
}

.calendar-summary__icon {
  width: 20px;
  height: 20px;
  color: var(--color-success-500);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .calendar-section__title {
    color: var(--color-neutral-300);
  }

  .date-chip {
    background: var(--color-neutral-800);
  }

  .date-chip:hover {
    background: var(--color-neutral-700);
  }

  .date-chip--selected {
    background: var(--color-primary-900);
    border-color: var(--color-primary-400);
  }

  .date-chip__day,
  .date-chip__month {
    color: var(--color-neutral-400);
  }

  .date-chip__date {
    color: var(--color-neutral-100);
  }

  .time-chip {
    background: var(--color-neutral-800);
    border-color: var(--color-neutral-700);
    color: var(--color-neutral-300);
  }

  .time-chip:hover:not(:disabled) {
    background: var(--color-neutral-700);
  }

  .calendar-summary {
    background: rgba(0, 168, 107, 0.1);
    color: var(--color-success-400);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .date-chip,
  .time-chip {
    transition: none;
  }
}
</style>