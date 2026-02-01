<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonSpinner,
} from '@ionic/vue'
import { checkmarkCircle, arrowForward, arrowBack, location, person } from 'ionicons/icons'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

// Onboarding steps
const currentStep = ref(0)
const isSubmitting = ref(false)

// Form data
const formData = ref({
  name: '',
  email: '',
  township: '',
  city: '',
})

const steps = [
  { id: 'welcome', title: 'Welcome to Indlela', icon: '👋' },
  { id: 'profile', title: 'Your Profile', icon: '👤' },
  { id: 'location', title: 'Your Location', icon: '📍' },
  { id: 'complete', title: 'All Set!', icon: '🎉' },
]

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0:
      return true
    case 1:
      return formData.value.name.trim().length >= 2
    case 2:
      return formData.value.township.trim().length >= 2 && formData.value.city.trim().length >= 2
    default:
      return true
  }
})

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const completeOnboarding = async () => {
  isSubmitting.value = true

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))

  authStore.completeOnboarding({
    name: formData.value.name,
    email: formData.value.email || undefined,
  })

  isSubmitting.value = false
  router.push('/')
}

const skipOnboarding = () => {
  authStore.completeOnboarding({
    name: 'Customer',
  })
  router.push('/')
}
</script>

<template>
  <IonPage>
    <IonContent class="onboarding-content" :fullscreen="true">
      <div class="onboarding-container">
        <!-- Progress Indicator -->
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${((currentStep + 1) / steps.length) * 100}%` }"
          />
        </div>

        <!-- Step Content -->
        <div class="step-content">
          <!-- Step 0: Welcome -->
          <div v-if="currentStep === 0" class="step welcome-step">
            <div class="step-icon">👋</div>
            <h1>Welcome to Indlela</h1>
            <p>Your gateway to trusted local service providers in your community.</p>

            <div class="features-list">
              <div class="feature">
                <span class="feature-icon">🔍</span>
                <div>
                  <h3>Find Services</h3>
                  <p>Discover trusted providers near you</p>
                </div>
              </div>
              <div class="feature">
                <span class="feature-icon">📅</span>
                <div>
                  <h3>Book Easily</h3>
                  <p>Schedule services at your convenience</p>
                </div>
              </div>
              <div class="feature">
                <span class="feature-icon">⭐</span>
                <div>
                  <h3>Rate & Review</h3>
                  <p>Help others find great service</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 1: Profile -->
          <div v-if="currentStep === 1" class="step profile-step">
            <div class="step-icon">👤</div>
            <h1>Tell us about yourself</h1>
            <p>This helps providers know who they're working with.</p>

            <div class="form-group">
              <label>Your Name *</label>
              <IonInput
                v-model="formData.name"
                placeholder="Enter your full name"
                class="onboarding-input"
              />
            </div>

            <div class="form-group">
              <label>Email (optional)</label>
              <IonInput
                v-model="formData.email"
                type="email"
                placeholder="your@email.com"
                class="onboarding-input"
              />
              <span class="input-hint">For booking confirmations</span>
            </div>
          </div>

          <!-- Step 2: Location -->
          <div v-if="currentStep === 2" class="step location-step">
            <div class="step-icon">📍</div>
            <h1>Where are you located?</h1>
            <p>This helps us find service providers near you.</p>

            <div class="form-group">
              <label>Township/Area *</label>
              <IonInput
                v-model="formData.township"
                placeholder="e.g., Soweto, Khayelitsha"
                class="onboarding-input"
              />
            </div>

            <div class="form-group">
              <label>City *</label>
              <IonInput
                v-model="formData.city"
                placeholder="e.g., Johannesburg, Cape Town"
                class="onboarding-input"
              />
            </div>

            <button class="location-button">
              <IonIcon :icon="location" />
              Use my current location
            </button>
          </div>

          <!-- Step 3: Complete -->
          <div v-if="currentStep === 3" class="step complete-step">
            <div class="step-icon success">
              <IonIcon :icon="checkmarkCircle" />
            </div>
            <h1>You're all set!</h1>
            <p>Start exploring services in your area.</p>

            <div class="summary-card">
              <div class="summary-item">
                <span class="label">Name</span>
                <span class="value">{{ formData.name }}</span>
              </div>
              <div v-if="formData.email" class="summary-item">
                <span class="label">Email</span>
                <span class="value">{{ formData.email }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Location</span>
                <span class="value">{{ formData.township }}, {{ formData.city }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="nav-buttons">
          <IonButton
            v-if="currentStep > 0 && currentStep < 3"
            fill="outline"
            @click="prevStep"
          >
            <IonIcon :icon="arrowBack" slot="start" />
            Back
          </IonButton>

          <IonButton
            v-if="currentStep === 0"
            fill="clear"
            color="medium"
            @click="skipOnboarding"
          >
            Skip for now
          </IonButton>

          <div class="spacer" />

          <IonButton
            v-if="currentStep < 3"
            :disabled="!canProceed"
            @click="nextStep"
          >
            Continue
            <IonIcon :icon="arrowForward" slot="end" />
          </IonButton>

          <IonButton
            v-if="currentStep === 3"
            :disabled="isSubmitting"
            @click="completeOnboarding"
            class="complete-button"
          >
            <IonSpinner v-if="isSubmitting" name="crescent" />
            <span v-else>Get Started</span>
          </IonButton>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.onboarding-content {
  --background: linear-gradient(180deg, #00A86B 0%, #008556 100%);
}

.onboarding-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 24px;
  padding-top: calc(24px + env(safe-area-inset-top));
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  margin-bottom: 32px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.step-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step {
  width: 100%;
  text-align: center;
  color: white;
}

.step-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.step-icon.success {
  font-size: 80px;
}

.step-icon.success ion-icon {
  color: white;
}

.step h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px;
}

.step > p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 32px;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

.feature {
  display: flex;
  gap: 16px;
  background: rgba(255, 255, 255, 0.15);
  padding: 16px;
  border-radius: 12px;
}

.feature-icon {
  font-size: 32px;
}

.feature h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
}

.feature p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.onboarding-input {
  --background: rgba(255, 255, 255, 0.95);
  --color: #333;
  --placeholder-color: #999;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  border-radius: 12px;
  font-size: 16px;
}

.input-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.8;
}

.location-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px dashed rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
}

.location-button ion-icon {
  font-size: 20px;
}

.summary-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 20px;
  text-align: left;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item .label {
  opacity: 0.8;
}

.summary-item .value {
  font-weight: 600;
}

.nav-buttons {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.nav-buttons .spacer {
  flex: 1;
}

.nav-buttons ion-button {
  --border-radius: 12px;
}

.complete-button {
  flex: 1;
  --background: white;
  --color: #00A86B;
  font-weight: 600;
}
</style>