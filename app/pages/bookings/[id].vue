<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonChip,
  IonList,
  IonItem,
  IonLabel,
  IonSkeletonText,
  IonActionSheet,
} from '@ionic/vue'
import { calendar, time, location, call, chatbubble, star, close, checkmark } from 'ionicons/icons'
import { mockBookings, mockDelay } from '~/utils/mock-data'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

// State
const isLoading = ref(true)
const booking = ref<typeof mockBookings[0] | null>(null)
const showCancelSheet = ref(false)

// Load data
onMounted(async () => {
  await mockDelay(600)
  const bookingId = route.params.id as string
  booking.value = mockBookings.find(b => b.id === bookingId) || null
  isLoading.value = false
})

// Methods
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
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const contactProvider = () => {
  if (booking.value?.provider?.user?.phone) {
    window.location.href = `tel:${booking.value.provider.user.phone}`
  }
}

const viewProvider = () => {
  if (booking.value?.providerId) {
    router.push(`/providers/${booking.value.providerId}`)
  }
}

const cancelBooking = () => {
  showCancelSheet.value = true
}

const confirmCancel = () => {
  // In real app, would call API
  if (booking.value) {
    booking.value.status = 'cancelled'
  }
  showCancelSheet.value = false
}

const rateService = () => {
  router.push(`/bookings/${route.params.id}/review`)
}

const canCancel = computed(() => {
  return booking.value && ['pending', 'accepted'].includes(booking.value.status)
})

const canRate = computed(() => {
  return booking.value?.status === 'completed'
})

const cancelSheetButtons = [
  {
    text: t('common.confirm'),
    role: 'destructive',
    handler: confirmCancel,
  },
  {
    text: t('common.cancel'),
    role: 'cancel',
  },
]
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonButtons slot="start">
          <IonBackButton default-href="/bookings" />
        </IonButtons>
        <IonTitle>{{ t('booking.title') }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <template v-if="isLoading">
        <div class="booking-header">
          <IonSkeletonText animated style="width: 60%; height: 24px" />
          <IonSkeletonText animated style="width: 40%; height: 32px" />
        </div>
      </template>

      <template v-else-if="booking">
        <!-- Status Header -->
        <div class="booking-header" :class="`status-${booking.status}`">
          <IonChip :color="getStatusColor(booking.status)" class="status-chip">
            {{ t(`booking.status.${booking.status}`) }}
          </IonChip>
          <h1 class="service-name">{{ booking.service?.name }}</h1>
          <p class="booking-ref">{{ t('booking.booking_ref', { ref: booking.id.toUpperCase() }) }}</p>
        </div>

        <!-- Provider Info -->
        <div class="section">
          <h2 class="section-title">{{ t('provider.title') }}</h2>
          <IonItem button @click="viewProvider" detail>
            <div slot="start" class="provider-avatar">
              {{ booking.provider?.user?.name?.charAt(0) || 'P' }}
            </div>
            <IonLabel>
              <h2>{{ booking.provider?.user?.name }}</h2>
              <div class="provider-rating">
                <IonIcon :icon="star" color="warning" />
                {{ booking.provider?.rating }} ({{ booking.provider?.totalReviews }} reviews)
              </div>
            </IonLabel>
          </IonItem>
        </div>

        <!-- Schedule Info -->
        <div class="section">
          <h2 class="section-title">{{ t('provider.availability') }}</h2>
          <div class="info-card">
            <div class="info-row">
              <IonIcon :icon="calendar" />
              <span>{{ formatDate(booking.scheduledAt) }}</span>
            </div>
            <div class="info-row">
              <IonIcon :icon="time" />
              <span>{{ formatTime(booking.scheduledAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Location Info -->
        <div class="section">
          <h2 class="section-title">{{ t('booking.location') }}</h2>
          <div class="info-card">
            <div class="info-row">
              <IonIcon :icon="location" />
              <div>
                <p class="address">{{ booking.location?.address }}</p>
                <p class="area">{{ booking.location?.township }}, {{ booking.location?.city }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="booking.customerNotes" class="section">
          <h2 class="section-title">{{ t('booking.add_notes') }}</h2>
          <div class="info-card">
            <p class="notes">{{ booking.customerNotes }}</p>
          </div>
        </div>

        <!-- Payment Summary -->
        <div class="section">
          <h2 class="section-title">{{ t('booking.summary') }}</h2>
          <div class="info-card">
            <div class="summary-row">
              <span>{{ t('booking.service_fee') }}</span>
              <span>R{{ booking.quotedAmount }}</span>
            </div>
            <div class="summary-row">
              <span>{{ t('booking.booking_fee') }}</span>
              <span>R15</span>
            </div>
            <div class="summary-row total">
              <span>{{ t('booking.total') }}</span>
              <span>R{{ (booking.quotedAmount || 0) + 15 }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-section">
          <IonButton expand="block" fill="outline" @click="contactProvider">
            <IonIcon :icon="call" slot="start" />
            {{ t('booking.actions.contact_provider') }}
          </IonButton>

          <IonButton v-if="canRate" expand="block" color="success" @click="rateService">
            <IonIcon :icon="star" slot="start" />
            {{ t('booking.actions.rate') }}
          </IonButton>

          <IonButton v-if="canCancel" expand="block" color="danger" fill="outline" @click="cancelBooking">
            <IonIcon :icon="close" slot="start" />
            {{ t('booking.actions.cancel') }}
          </IonButton>
        </div>
      </template>

      <!-- Not Found -->
      <template v-else>
        <div class="empty-state">
          <p>Booking not found</p>
        </div>
      </template>

      <!-- Cancel Confirmation Sheet -->
      <IonActionSheet
        :is-open="showCancelSheet"
        :header="t('booking.cancel_confirm')"
        :buttons="cancelSheetButtons"
        @didDismiss="showCancelSheet = false"
      />
    </IonContent>
  </IonPage>
</template>

<style scoped>
.booking-header {
  text-align: center;
  padding: 32px 24px;
  background: var(--ion-color-light);
}

.booking-header.status-completed {
  background: linear-gradient(180deg, rgba(45, 211, 111, 0.1) 0%, rgba(45, 211, 111, 0.05) 100%);
}

.booking-header.status-pending {
  background: linear-gradient(180deg, rgba(255, 196, 9, 0.1) 0%, rgba(255, 196, 9, 0.05) 100%);
}

.booking-header.status-cancelled {
  background: linear-gradient(180deg, rgba(235, 68, 90, 0.1) 0%, rgba(235, 68, 90, 0.05) 100%);
}

.status-chip {
  margin-bottom: 12px;
}

.service-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--ion-text-color);
}

.booking-ref {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin: 0;
}

.section {
  padding: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-color-medium);
  margin: 0 0 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.provider-avatar {
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

.provider-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.provider-rating ion-icon {
  font-size: 14px;
}

.info-card {
  background: var(--ion-card-background, white);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row ion-icon {
  font-size: 20px;
  color: var(--ion-color-primary);
  margin-top: 2px;
}

.address {
  margin: 0;
  font-weight: 500;
}

.area {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--ion-color-medium);
}

.notes {
  margin: 0;
  line-height: 1.5;
  color: var(--ion-color-medium-shade);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--ion-border-color);
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row.total {
  font-weight: 600;
  font-size: 16px;
  padding-top: 12px;
  border-top: 2px solid var(--ion-border-color);
  border-bottom: none;
}

.actions-section {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: calc(32px + env(safe-area-inset-bottom));
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--ion-color-medium);
}
</style>