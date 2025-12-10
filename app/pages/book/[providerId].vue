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
  IonList,
  IonItem,
  IonLabel,
  IonRadio,
  IonRadioGroup,
  IonTextarea,
  IonDatetime,
  IonModal,
  IonSpinner,
} from '@ionic/vue'
import { calendar, time, location, checkmarkCircle } from 'ionicons/icons'
import { mockProviders, mockDelay } from '~/utils/mock-data'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const { goBack, router } = useAppNavigation()
const route = useRoute()

// State
const isLoading = ref(true)
const isSubmitting = ref(false)
const showSuccess = ref(false)
const provider = ref<typeof mockProviders[0] | null>(null)

const selectedServiceId = ref<string | null>(null)
const selectedDate = ref<string | null>(null)
const selectedTime = ref<string | null>(null)
const notes = ref('')

// Modal state
const showDatePicker = ref(false)
const showTimePicker = ref(false)

// Load data
onMounted(async () => {
  await mockDelay(400)
  const providerId = route.params.providerId as string
  provider.value = mockProviders.find(p => p.id === providerId) || null

  // Pre-select service if passed in query
  const serviceParam = route.query.service as string
  if (serviceParam && provider.value?.services) {
    const hasService = provider.value.services.some(s => s.serviceId === serviceParam)
    if (hasService) {
      selectedServiceId.value = serviceParam
    }
  }

  isLoading.value = false
})

// Computed
const selectedService = computed(() => {
  if (!selectedServiceId.value || !provider.value?.services) return null
  return provider.value.services.find(s => s.serviceId === selectedServiceId.value)
})

const servicePrice = computed(() => selectedService.value?.price || 0)
const bookingFee = 15
const totalAmount = computed(() => servicePrice.value + bookingFee)

const canSubmit = computed(() => {
  return selectedServiceId.value && selectedDate.value && selectedTime.value
})

const formattedDate = computed(() => {
  if (!selectedDate.value) return null
  return new Date(selectedDate.value).toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
})

const formattedTime = computed(() => {
  if (!selectedTime.value) return null
  const [hours, minutes] = selectedTime.value.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes))
  return date.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
  })
})

// Methods
const handleDateChange = (event: CustomEvent) => {
  selectedDate.value = event.detail.value.split('T')[0]
  showDatePicker.value = false
}

const handleTimeChange = (event: CustomEvent) => {
  selectedTime.value = event.detail.value
  showTimePicker.value = false
}

const submitBooking = async () => {
  if (!canSubmit.value) return

  isSubmitting.value = true
  await mockDelay(1500)
  isSubmitting.value = false
  showSuccess.value = true
}

const goToBookings = () => {
  router.push('/bookings')
}

const goHome = () => {
  router.push('/')
}

// Get min date (today) - format as YYYY-MM-DD for IonDatetime
const minDate = new Date().toISOString().split('T')[0]
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonButtons slot="start">
          <IonBackButton :default-href="`/providers/${route.params.providerId}`" @click="goBack(`/providers/${route.params.providerId}`, $event)" />
        </IonButtons>
        <IonTitle>{{ t('booking.new_booking') }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <!-- Success State -->
      <div v-if="showSuccess" class="success-state">
        <div class="success-icon">
          <IonIcon :icon="checkmarkCircle" color="success" />
        </div>
        <h1>{{ t('booking.booking_confirmed') }}</h1>
        <p>{{ t('booking.provider_notified') }}</p>

        <div class="success-summary">
          <p><strong>{{ selectedService?.service?.name }}</strong></p>
          <p>{{ provider?.user?.name }}</p>
          <p>{{ formattedDate }} at {{ formattedTime }}</p>
          <p class="total">Total: R{{ totalAmount }}</p>
        </div>

        <PageActions>
          <IonButton expand="block" @click="goToBookings">
            View Bookings
          </IonButton>
          <IonButton expand="block" fill="outline" @click="goHome">
            Back to Home
          </IonButton>
        </PageActions>
      </div>

      <!-- Booking Form -->
      <template v-else-if="provider">
        <!-- Provider Info -->
        <div class="provider-info">
          <div class="provider-avatar">
            {{ provider.user?.name?.charAt(0) || 'P' }}
          </div>
          <div class="provider-details">
            <h2>{{ provider.user?.name }}</h2>
            <p>{{ provider.rating }} rating - {{ provider.totalJobs }} jobs</p>
          </div>
        </div>

        <!-- Service Selection -->
        <div class="section">
          <h3 class="section-title">{{ t('booking.select_service') }}</h3>
          <IonRadioGroup v-model="selectedServiceId">
            <IonList>
              <IonItem v-for="ps in provider.services" :key="ps.id">
                <IonRadio slot="start" :value="ps.serviceId" />
                <IonLabel>
                  <h2>{{ ps.service?.name }}</h2>
                  <p>{{ ps.duration }} minutes</p>
                </IonLabel>
                <span slot="end" class="service-price">R{{ ps.price }}</span>
              </IonItem>
            </IonList>
          </IonRadioGroup>
        </div>

        <!-- Date Selection -->
        <div class="section">
          <h3 class="section-title">{{ t('booking.select_date') }}</h3>
          <IonItem button detail @click="showDatePicker = true">
            <IonIcon :icon="calendar" slot="start" color="primary" />
            <IonLabel>
              <span v-if="formattedDate">{{ formattedDate }}</span>
              <span v-else class="placeholder">Choose a date</span>
            </IonLabel>
          </IonItem>
        </div>

        <!-- Time Selection -->
        <div class="section">
          <h3 class="section-title">{{ t('booking.select_time') }}</h3>
          <IonItem button detail @click="showTimePicker = true">
            <IonIcon :icon="time" slot="start" color="primary" />
            <IonLabel>
              <span v-if="formattedTime">{{ formattedTime }}</span>
              <span v-else class="placeholder">Choose a time</span>
            </IonLabel>
          </IonItem>
        </div>

        <!-- Notes -->
        <div class="section">
          <h3 class="section-title">{{ t('booking.add_notes') }}</h3>
          <IonTextarea
            v-model="notes"
            :placeholder="t('booking.notes_placeholder')"
            :rows="3"
            class="notes-input"
          />
        </div>

        <!-- Summary -->
        <div v-if="selectedService" class="section summary-section">
          <h3 class="section-title">{{ t('booking.summary') }}</h3>
          <div class="summary-card">
            <div class="summary-row">
              <span>{{ t('booking.service_fee') }}</span>
              <span>R{{ servicePrice }}</span>
            </div>
            <div class="summary-row">
              <span>{{ t('booking.booking_fee') }}</span>
              <span>R{{ bookingFee }}</span>
            </div>
            <div class="summary-row total">
              <span>{{ t('booking.total') }}</span>
              <span>R{{ totalAmount }}</span>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <PageActions>
          <IonButton
            expand="block"
            size="large"
            :disabled="!canSubmit || isSubmitting"
            @click="submitBooking"
          >
            <IonSpinner v-if="isSubmitting" name="crescent" />
            <span v-else>{{ t('booking.confirm_booking') }}</span>
          </IonButton>
        </PageActions>
      </template>

      <!-- Date Picker Modal -->
      <IonModal :is-open="showDatePicker" @didDismiss="showDatePicker = false">
        <IonHeader>
          <IonToolbar>
            <IonTitle>{{ t('booking.select_date') }}</IonTitle>
            <IonButtons slot="end">
              <IonButton @click="showDatePicker = false">{{ t('common.done') }}</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent class="datetime-content">
          <IonDatetime
            id="date-picker"
            class="calendar-datetime"
            presentation="date"
            :min="minDate"
            :value="selectedDate || undefined"
            @ionChange="handleDateChange"
          />
        </IonContent>
      </IonModal>

      <!-- Time Picker Modal -->
      <IonModal :is-open="showTimePicker" @didDismiss="showTimePicker = false">
        <IonHeader>
          <IonToolbar>
            <IonTitle>{{ t('booking.select_time') }}</IonTitle>
            <IonButtons slot="end">
              <IonButton @click="showTimePicker = false">{{ t('common.done') }}</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonDatetime
            presentation="time"
            :value="selectedTime || undefined"
            @ionChange="handleTimeChange"
            hour-cycle="h23"
          />
        </IonContent>
      </IonModal>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.provider-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--ion-color-light);
}

.provider-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--ion-color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
}

.provider-details h2 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.provider-details p {
  margin: 0;
  font-size: 14px;
  color: var(--ion-color-medium);
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

.service-price {
  font-weight: 600;
  color: var(--ion-color-primary);
}

.placeholder {
  color: var(--ion-color-medium);
}

.notes-input {
  --background: var(--ion-color-light);
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  border-radius: 12px;
}

.summary-section {
  padding-bottom: 0;
}

.summary-card {
  background: var(--ion-card-background, white);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  font-size: 18px;
  padding-top: 12px;
  border-top: 2px solid var(--ion-border-color);
  border-bottom: none;
  color: var(--ion-color-primary);
}

/* Success State */
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 32px;
  text-align: center;
}

.success-icon ion-icon {
  font-size: 80px;
}

.success-state h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 24px 0 8px;
}

.success-state > p {
  color: var(--ion-color-medium);
  margin: 0 0 32px;
}

.success-summary {
  background: var(--ion-color-light);
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  margin-bottom: 32px;
}

.success-summary p {
  margin: 8px 0;
}

.success-summary .total {
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-color-primary);
  margin-top: 16px;
}

/* Date/Time picker modal styles */
.datetime-modal-content {
  --padding-top: 16px;
  --padding-start: 16px;
  --padding-end: 16px;
}

.datetime-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ion-border-color);
  margin-bottom: 16px;
}

.datetime-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

/* Calendar datetime styling */
.calendar-datetime {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  --background: #ffffff;
}

/* Force calendar day visibility - pierce shadow DOM */
.datetime-content :deep(ion-datetime) {
  --background: #ffffff;
}

.datetime-content :deep(ion-datetime)::part(calendar-day) {
  color: #000000;
}

.datetime-content :deep(ion-datetime)::part(calendar-day today) {
  color: var(--ion-color-primary);
  font-weight: 600;
}

.datetime-content :deep(ion-datetime)::part(calendar-day active) {
  background: var(--ion-color-primary);
  color: #ffffff;
}

.datetime-content :deep(ion-datetime)::part(calendar-day disabled) {
  color: #cccccc;
}

/* Target calendar body directly */
.datetime-content :deep(.calendar-body),
.datetime-content :deep(.calendar-month-grid) {
  color: #000000;
}

.datetime-content :deep(button.calendar-day) {
  color: #000000 !important;
}
</style>

<style>
/* Global (non-scoped) styles for IonDatetime Shadow DOM */
ion-datetime {
  --background: #ffffff;
  --background-rgb: 255, 255, 255;
}

ion-datetime::part(calendar-day) {
  color: #1f2937 !important;
  font-size: 14px;
}

ion-datetime::part(calendar-day today) {
  color: var(--ion-color-primary, #00A86B) !important;
  font-weight: 600;
}

ion-datetime::part(calendar-day active) {
  background: var(--ion-color-primary, #00A86B) !important;
  color: #ffffff !important;
}

ion-datetime::part(calendar-day disabled) {
  color: #d1d5db !important;
  opacity: 0.5;
}

/* Ensure month grid is visible */
ion-datetime::part(month-year-button) {
  color: #1f2937;
}

ion-datetime::part(wheel-item) {
  color: #1f2937;
}

ion-datetime::part(wheel-item active) {
  color: var(--ion-color-primary, #00A86B);
}
</style>