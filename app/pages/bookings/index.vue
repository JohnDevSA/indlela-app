<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonChip,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/vue'
import { calendar, time, location, chevronForward } from 'ionicons/icons'
import { mockBookings, mockDelay } from '~/utils/mock-data'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const router = useRouter()

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
  router.push(`/bookings/${bookingId}`)
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    accepted: 'primary',
    in_progress: 'tertiary',
    completed: 'success',
    cancelled: 'danger',
    disputed: 'danger',
  }
  return colors[status] || 'medium'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonTitle>{{ t('nav.bookings') }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
        <IonRefresherContent />
      </IonRefresher>

      <!-- Filter Segment -->
      <IonSegment v-model="filter" class="filter-segment">
        <IonSegmentButton value="upcoming">Upcoming</IonSegmentButton>
        <IonSegmentButton value="past">Past</IonSegmentButton>
      </IonSegment>

      <!-- Bookings List -->
      <IonList v-if="isLoading" class="bookings-list">
        <IonItem v-for="i in 3" :key="i">
          <div slot="start" class="avatar-placeholder">
            <IonSkeletonText animated />
          </div>
          <IonLabel>
            <IonSkeletonText animated style="width: 60%" />
            <IonSkeletonText animated style="width: 40%" />
            <IonSkeletonText animated style="width: 50%" />
          </IonLabel>
        </IonItem>
      </IonList>

      <IonList v-else-if="filteredBookings.length > 0" class="bookings-list">
        <IonItem
          v-for="booking in filteredBookings"
          :key="booking.id"
          button
          detail
          @click="viewBooking(booking.id)"
        >
          <div slot="start" class="provider-avatar">
            {{ booking.provider?.user?.name?.charAt(0) || 'P' }}
          </div>
          <IonLabel>
            <h2>{{ booking.service?.name }}</h2>
            <p class="provider-name">{{ booking.provider?.user?.name }}</p>
            <div class="booking-meta">
              <span class="booking-date">
                <IonIcon :icon="calendar" />
                {{ formatDate(booking.scheduledAt) }}
              </span>
              <span class="booking-time">
                <IonIcon :icon="time" />
                {{ formatTime(booking.scheduledAt) }}
              </span>
            </div>
          </IonLabel>
          <div slot="end" class="booking-end">
            <IonChip :color="getStatusColor(booking.status)" class="status-chip">
              {{ t(`booking.status.${booking.status}`) }}
            </IonChip>
            <span class="booking-amount">R{{ booking.quotedAmount }}</span>
          </div>
        </IonItem>
      </IonList>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <IonIcon :icon="calendar" class="empty-icon" />
        <h3>{{ t('booking.empty.title') }}</h3>
        <p>{{ t('booking.empty.message') }}</p>
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.filter-segment {
  margin: 16px;
}

.bookings-list {
  padding: 0 8px;
}

.provider-avatar,
.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--ion-color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
}

.avatar-placeholder {
  background: var(--ion-color-light);
}

.provider-name {
  color: var(--ion-color-medium);
}

.booking-meta {
  display: flex;
  gap: 16px;
  margin-top: 4px;
}

.booking-date,
.booking-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.booking-date ion-icon,
.booking-time ion-icon {
  font-size: 14px;
}

.booking-end {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.status-chip {
  height: 24px;
  font-size: 11px;
}

.booking-amount {
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-text-color);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--ion-text-color);
}

.empty-state p {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin: 0;
}
</style>