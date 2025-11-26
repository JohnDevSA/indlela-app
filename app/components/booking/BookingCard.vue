<script setup lang="ts">
/**
 * BookingCard - Card displaying a booking summary
 * Used on bookings list and dashboard
 *
 * @example
 * <BookingCard
 *   :booking="booking"
 *   @click="viewBooking"
 * />
 */

interface Booking {
  id: string
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
  scheduledAt: string
  quotedAmount?: number
  service?: {
    name: string
  }
  provider?: {
    user?: {
      name: string
      avatar?: string
    }
  }
}

interface Props {
  booking: Booking
  loading?: boolean
  variant?: 'list' | 'card'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  variant: 'list',
})

const emit = defineEmits<{
  click: [id: string]
}>()

const { t } = useI18n()
const { haptic } = useAnimation()

function handleClick() {
  if (!props.loading) {
    haptic('light')
    emit('click', props.booking.id)
  }
}

// Status badge variant mapping
const statusVariant = computed(() => {
  const variants: Record<string, 'warning' | 'primary' | 'info' | 'success' | 'error'> = {
    pending: 'warning',
    accepted: 'primary',
    in_progress: 'info',
    completed: 'success',
    cancelled: 'error',
    disputed: 'error',
  }
  return variants[props.booking.status] || 'default'
})

// Format date
const formattedDate = computed(() => {
  const date = new Date(props.booking.scheduledAt)
  return date.toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
})

// Format time
const formattedTime = computed(() => {
  const date = new Date(props.booking.scheduledAt)
  return date.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
  })
})

// Provider initial
const providerInitial = computed(() => {
  return props.booking.provider?.user?.name?.charAt(0) || 'P'
})

// Format amount
const formattedAmount = computed(() => {
  if (!props.booking.quotedAmount) return null
  return `R${props.booking.quotedAmount}`
})
</script>

<template>
  <button
    type="button"
    :class="[
      'booking-card',
      `booking-card--${variant}`,
      { 'booking-card--loading': loading },
    ]"
    :disabled="loading"
    @click="handleClick"
  >
    <!-- Loading skeleton -->
    <template v-if="loading">
      <UiSkeleton variant="circle" size="md" />
      <div class="booking-card__content">
        <UiSkeleton :width="'60%'" :height="16" />
        <UiSkeleton :width="'40%'" :height="14" />
        <UiSkeleton :width="'50%'" :height="12" />
      </div>
      <div class="booking-card__end">
        <UiSkeleton :width="70" :height="24" />
        <UiSkeleton :width="50" :height="16" />
      </div>
    </template>

    <!-- Content -->
    <template v-else>
      <!-- Provider Avatar -->
      <UiAvatar
        :src="booking.provider?.user?.avatar"
        :name="booking.provider?.user?.name || 'Provider'"
        size="md"
      />

      <!-- Booking Info -->
      <div class="booking-card__content">
        <h3 class="booking-card__service">{{ booking.service?.name }}</h3>
        <p class="booking-card__provider">{{ booking.provider?.user?.name }}</p>
        <div class="booking-card__meta">
          <span class="booking-card__date">
            <Icon name="heroicons:calendar" />
            {{ formattedDate }}
          </span>
          <span class="booking-card__time">
            <Icon name="heroicons:clock" />
            {{ formattedTime }}
          </span>
        </div>
      </div>

      <!-- End section -->
      <div class="booking-card__end">
        <UiBadge :variant="statusVariant" size="sm" :dot="true">
          {{ t(`booking.status.${booking.status}`) }}
        </UiBadge>
        <span v-if="formattedAmount" class="booking-card__amount">
          {{ formattedAmount }}
        </span>
      </div>

      <!-- Chevron -->
      <Icon
        v-if="variant === 'list'"
        name="heroicons:chevron-right"
        class="booking-card__chevron"
      />
    </template>
  </button>
</template>

<style scoped>
.booking-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  text-align: left;
  background: var(--color-neutral-0);
  border: none;
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}

.booking-card:disabled {
  cursor: default;
}

/* List variant */
.booking-card--list {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-neutral-100);
}

.booking-card--list:hover:not(:disabled) {
  background: var(--color-neutral-50);
}

.booking-card--list:active:not(:disabled) {
  background: var(--color-neutral-100);
}

/* Card variant */
.booking-card--card {
  flex-direction: column;
  align-items: flex-start;
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

/* Content */
.booking-card__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Service name */
.booking-card__service {
  margin: 0;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
  line-height: var(--leading-tight);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Provider name */
.booking-card__provider {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
}

/* Meta row */
.booking-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-1);
}

.booking-card__date,
.booking-card__time {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
}

.booking-card__date :deep(svg),
.booking-card__time :deep(svg) {
  width: 14px;
  height: 14px;
}

/* End section */
.booking-card__end {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);
  flex-shrink: 0;
}

/* Amount */
.booking-card__amount {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
}

/* Chevron */
.booking-card__chevron {
  width: 20px;
  height: 20px;
  color: var(--color-neutral-400);
  flex-shrink: 0;
  margin-left: var(--space-2);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .booking-card {
    background: var(--color-neutral-900);
  }

  .booking-card--list {
    border-bottom-color: var(--color-neutral-800);
  }

  .booking-card--list:hover:not(:disabled) {
    background: var(--color-neutral-850);
  }

  .booking-card__service {
    color: var(--color-neutral-100);
  }

  .booking-card__provider {
    color: var(--color-neutral-400);
  }

  .booking-card__amount {
    color: var(--color-neutral-100);
  }

  .booking-card__chevron {
    color: var(--color-neutral-500);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .booking-card {
    transition: none;
  }
}
</style>
