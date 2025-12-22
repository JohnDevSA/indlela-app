<script setup lang="ts">
/**
 * Bookings Page - List of user bookings with filtering
 * Refined to use Indlela design system components
 */

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/vue'
import { mockBookings, mockDelay } from '~/utils/mock-data'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const router = useRouter()
const { haptic } = useAnimation()

// State
const isLoading = ref(true)
const filter = ref<'upcoming' | 'past'>('upcoming')
const bookings = ref<typeof mockBookings>([])

// Computed
const filteredBookings = computed(() => {
  const now = new Date()
  return bookings.value.filter(booking => {
    const scheduledDate = new Date(booking.scheduledAt)
    if (filter.value === 'upcoming') {
      return scheduledDate >= now || ['pending', 'accepted', 'in_progress'].includes(booking.status)
    } else {
      return scheduledDate < now && ['completed', 'cancelled'].includes(booking.status)
    }
  })
})

// Load data
onMounted(async () => {
  await mockDelay(600)
  bookings.value = mockBookings
  isLoading.value = false
})

// Methods
const handleRefresh = async (event: any) => {
  await mockDelay(800)
  event.target?.complete()
}

const viewBooking = (bookingId: string) => {
  haptic('light')
  router.push(`/bookings/${bookingId}`)
}

const setFilter = (value: 'upcoming' | 'past') => {
  if (filter.value !== value) {
    haptic('light')
    filter.value = value
  }
}
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonTitle>{{ t('nav.bookings') }}</IonTitle>
      </IonToolbar>
      <!-- Unified Offline/Sync Status Bar -->
      <OfflineHeaderBar />
    </IonHeader>

    <IonContent :fullscreen="true">
      <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
        <IonRefresherContent />
      </IonRefresher>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button
          :class="['filter-tab', { 'filter-tab--active': filter === 'upcoming' }]"
          @click="setFilter('upcoming')"
        >
          <Icon name="heroicons:calendar" class="filter-tab__icon" />
          {{ t('booking.filter.upcoming') }}
        </button>
        <button
          :class="['filter-tab', { 'filter-tab--active': filter === 'past' }]"
          @click="setFilter('past')"
        >
          <Icon name="heroicons:clock" class="filter-tab__icon" />
          {{ t('booking.filter.past') }}
        </button>
      </div>

      <!-- Bookings List -->
      <section class="bookings-section">
        <!-- Loading State -->
        <div v-if="isLoading" class="bookings-list">
          <BookingCard
            v-for="i in 3"
            :key="`skeleton-${i}`"
            :booking="{ id: '', status: 'pending', scheduledAt: '' }"
            :loading="true"
          />
        </div>

        <!-- Bookings List -->
        <div v-else-if="filteredBookings.length > 0" class="bookings-list">
          <BookingCard
            v-for="booking in filteredBookings"
            :key="booking.id"
            :booking="booking"
            @click="viewBooking"
          />
        </div>

        <!-- Empty State -->
        <EmptyState
          v-else
          icon="heroicons:calendar"
          :title="filter === 'upcoming' ? t('booking.empty.upcoming_title') : t('booking.empty.past_title')"
          :message="filter === 'upcoming' ? t('booking.empty.upcoming_message') : t('booking.empty.past_message')"
          :action-label="filter === 'upcoming' ? t('booking.empty.browse_services') : undefined"
          @action="router.push('/services')"
        />
      </section>

      <!-- Quick Action FAB -->
      <button
        v-if="!isLoading && filter === 'upcoming'"
        class="fab-button"
        @click="router.push('/services')"
      >
        <Icon name="heroicons:plus" />
      </button>
    </IonContent>
  </IonPage>
</template>

<style scoped>
/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--color-neutral-0);
  border-bottom: 1px solid var(--color-neutral-100);
}

.filter-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-neutral-50);
  border: 1.5px solid var(--color-neutral-200);
  border-radius: var(--radius-xl);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-600);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}

.filter-tab:hover {
  background: var(--color-neutral-100);
}

.filter-tab:active {
  transform: scale(0.98);
}

.filter-tab--active {
  background: var(--color-primary-50);
  border-color: var(--color-primary-500);
  color: var(--color-primary-700);
}

.filter-tab--active:hover {
  background: var(--color-primary-100);
}

.filter-tab__icon {
  width: 18px;
  height: 18px;
}

/* Bookings Section */
.bookings-section {
  padding: var(--space-4);
}

.bookings-list {
  background: var(--color-neutral-0);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* FAB Button */
.fab-button {
  position: fixed;
  bottom: calc(var(--space-20) + var(--safe-area-bottom, 0px));
  right: var(--space-4);
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-500);
  border: none;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg), var(--shadow-primary);
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-out),
              box-shadow var(--duration-normal) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
  z-index: var(--z-sticky);
}

.fab-button:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-xl), var(--shadow-primary);
}

.fab-button:active {
  transform: scale(0.95);
}

.fab-button :deep(svg) {
  width: 24px;
  height: 24px;
  color: white;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .filter-tabs {
    background: var(--color-neutral-900);
    border-bottom-color: var(--color-neutral-800);
  }

  .filter-tab {
    background: var(--color-neutral-800);
    border-color: var(--color-neutral-700);
    color: var(--color-neutral-400);
  }

  .filter-tab:hover {
    background: var(--color-neutral-700);
  }

  .filter-tab--active {
    background: rgba(0, 168, 107, 0.15);
    border-color: var(--color-primary-500);
    color: var(--color-primary-400);
  }

  .filter-tab--active:hover {
    background: rgba(0, 168, 107, 0.2);
  }

  .bookings-list {
    background: var(--color-neutral-900);
  }

  .fab-button {
    background: var(--color-primary-600);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .filter-tab,
  .fab-button {
    transition: none;
  }
}
</style>
