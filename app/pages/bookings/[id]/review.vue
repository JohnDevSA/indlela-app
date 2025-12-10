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
  IonTextarea,
  IonSpinner,
} from '@ionic/vue'
import { star, checkmarkCircle } from 'ionicons/icons'
import { mockBookings, mockDelay } from '~/utils/mock-data'

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
const booking = ref<typeof mockBookings[0] | null>(null)
const rating = ref(0)
const comment = ref('')

// Load data
onMounted(async () => {
  await mockDelay(400)
  const bookingId = route.params.id as string
  booking.value = mockBookings.find(b => b.id === bookingId) || null
  isLoading.value = false
})

// Methods
const setRating = (value: number) => {
  rating.value = value
}

const getRatingLabel = (value: number) => {
  const labels: Record<number, string> = {
    1: t('review.rating_labels.1'),
    2: t('review.rating_labels.2'),
    3: t('review.rating_labels.3'),
    4: t('review.rating_labels.4'),
    5: t('review.rating_labels.5'),
  }
  return labels[value] || ''
}

const canSubmit = computed(() => rating.value > 0)

const submitReview = async () => {
  if (!canSubmit.value) return

  isSubmitting.value = true
  await mockDelay(1500)
  isSubmitting.value = false
  showSuccess.value = true
}

const goToBookings = () => {
  router.push('/bookings')
}
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonButtons slot="start">
          <IonBackButton :default-href="`/bookings/${route.params.id}`" @click="goBack(`/bookings/${route.params.id}`, $event)" />
        </IonButtons>
        <IonTitle>{{ t('review.title') }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <!-- Success State -->
      <div v-if="showSuccess" class="success-state">
        <div class="success-icon">
          <IonIcon :icon="checkmarkCircle" color="success" />
        </div>
        <h1>{{ t('review.thank_you') }}</h1>
        <p>Your feedback helps other customers find great service providers.</p>

        <IonButton expand="block" @click="goToBookings">
          Back to Bookings
        </IonButton>
      </div>

      <!-- Review Form -->
      <template v-else-if="booking">
        <div class="review-form">
          <!-- Provider Info -->
          <div class="provider-info">
            <div class="provider-avatar">
              {{ booking.provider?.user?.name?.charAt(0) || 'P' }}
            </div>
            <div class="provider-details">
              <h2>{{ booking.provider?.user?.name }}</h2>
              <p>{{ booking.service?.name }}</p>
            </div>
          </div>

          <!-- Rating Section -->
          <div class="rating-section">
            <h3>{{ t('review.how_was_service') }}</h3>

            <div class="star-rating">
              <button
                v-for="i in 5"
                :key="i"
                class="star-button"
                :class="{ active: i <= rating }"
                @click="setRating(i)"
              >
                <IonIcon :icon="star" />
              </button>
            </div>

            <p v-if="rating > 0" class="rating-label">
              {{ getRatingLabel(rating) }}
            </p>
          </div>

          <!-- Comment Section -->
          <div class="comment-section">
            <label>{{ t('review.comment_label') }}</label>
            <IonTextarea
              v-model="comment"
              :placeholder="t('review.comment_placeholder')"
              :rows="4"
              class="comment-input"
            />
          </div>

          <!-- Submit Button -->
          <div class="submit-section">
            <IonButton
              expand="block"
              size="large"
              :disabled="!canSubmit || isSubmitting"
              @click="submitReview"
            >
              <IonSpinner v-if="isSubmitting" name="crescent" />
              <span v-else>{{ t('review.submit') }}</span>
            </IonButton>
          </div>
        </div>
      </template>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.review-form {
  padding: 24px;
}

.provider-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--ion-color-light);
  border-radius: 12px;
  margin-bottom: 32px;
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

.rating-section {
  text-align: center;
  margin-bottom: 32px;
}

.rating-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 24px;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.star-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.star-button ion-icon {
  font-size: 40px;
  color: var(--ion-color-medium-tint);
  transition: color 0.2s;
}

.star-button.active ion-icon {
  color: var(--ion-color-warning);
}

.star-button:active {
  transform: scale(1.2);
}

.rating-label {
  margin: 16px 0 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.comment-section {
  margin-bottom: 32px;
}

.comment-section label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.comment-input {
  --background: var(--ion-color-light);
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  border-radius: 12px;
}

.submit-section ion-button {
  --border-radius: 12px;
  height: 52px;
  font-weight: 600;
}

/* Success State */
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80%;
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
  max-width: 280px;
}

.success-state ion-button {
  width: 100%;
  max-width: 300px;
}
</style>