<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonTextarea,
  IonSpinner,
  IonCheckbox,
  IonToggle,
  toastController,
} from '@ionic/vue'
import {
  checkmarkCircle,
  arrowForward,
  arrowBack,
  briefcase,
  location,
  person,
  camera,
  time,
} from 'ionicons/icons'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false,
})

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { post, getErrorMessage } = useApi()

// Toast helper
const showToast = async (message: string, color: 'success' | 'danger' = 'success') => {
  const toast = await toastController.create({
    message,
    duration: 3000,
    color,
    position: 'top',
  })
  await toast.present()
}

// Onboarding steps
const currentStep = ref(0)
const isSubmitting = ref(false)

// Form data
const formData = ref({
  // Personal info
  name: '',
  email: '',
  idNumber: '',
  bio: '',
  // Location
  township: '',
  city: '',
  serviceRadius: 10,
  // Services
  selectedServices: [] as string[],
  // Availability
  availability: {
    monday: { enabled: true, start: '08:00', end: '17:00' },
    tuesday: { enabled: true, start: '08:00', end: '17:00' },
    wednesday: { enabled: true, start: '08:00', end: '17:00' },
    thursday: { enabled: true, start: '08:00', end: '17:00' },
    friday: { enabled: true, start: '08:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '14:00' },
    sunday: { enabled: false, start: '09:00', end: '14:00' },
  },
})

// Mock services for selection
const availableServices = [
  { id: 'plumbing', name: 'Plumbing', icon: '🔧', basePrice: 150 },
  { id: 'electrical', name: 'Electrical', icon: '⚡', basePrice: 200 },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹', basePrice: 100 },
  { id: 'gardening', name: 'Gardening', icon: '🌱', basePrice: 120 },
  { id: 'painting', name: 'Painting', icon: '🎨', basePrice: 180 },
  { id: 'carpentry', name: 'Carpentry', icon: '🪚', basePrice: 200 },
  { id: 'appliance-repair', name: 'Appliance Repair', icon: '🔌', basePrice: 150 },
  { id: 'moving', name: 'Moving & Hauling', icon: '📦', basePrice: 300 },
]

const steps = [
  { id: 'welcome', title: 'Become a Provider', icon: '🛠️' },
  { id: 'profile', title: 'Your Profile', icon: '👤' },
  { id: 'services', title: 'Your Services', icon: '💼' },
  { id: 'location', title: 'Service Area', icon: '📍' },
  { id: 'availability', title: 'Availability', icon: '📅' },
  { id: 'complete', title: 'All Set!', icon: '🎉' },
]

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0:
      return true
    case 1:
      return formData.value.name.trim().length >= 2 && formData.value.idNumber.trim().length >= 6
    case 2:
      return formData.value.selectedServices.length > 0
    case 3:
      return formData.value.township.trim().length >= 2 && formData.value.city.trim().length >= 2
    case 4:
      return Object.values(formData.value.availability).some(day => day.enabled)
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

const toggleService = (serviceId: string) => {
  const index = formData.value.selectedServices.indexOf(serviceId)
  if (index === -1) {
    formData.value.selectedServices.push(serviceId)
  } else {
    formData.value.selectedServices.splice(index, 1)
  }
}

const isServiceSelected = (serviceId: string) => {
  return formData.value.selectedServices.includes(serviceId)
}

const selectedServicesDisplay = computed(() => {
  return availableServices
    .filter(s => formData.value.selectedServices.includes(s.id))
    .map(s => s.name)
    .join(', ')
})

const enabledDaysCount = computed(() => {
  return Object.values(formData.value.availability).filter(day => day.enabled).length
})

const completeOnboarding = async () => {
  isSubmitting.value = true

  try {
    // Build the provider onboarding payload (snake_case for API)
    const payload = {
      id_number: formData.value.idNumber,
      bio: formData.value.bio || undefined,
      location: {
        township: formData.value.township,
        city: formData.value.city,
      },
      service_radius_km: formData.value.serviceRadius,
      services: formData.value.selectedServices.map(serviceId => {
        const service = availableServices.find(s => s.id === serviceId)
        return {
          service_id: serviceId,
          price: service?.basePrice || 100,
          duration: 60, // Default 1 hour
        }
      }),
      availability: formData.value.availability,
    }

    // Submit to API
    const response = await post<{ provider: { id: string } }>('/provider/complete-onboarding', payload)

    // Update auth store with provider info
    authStore.completeOnboarding({
      name: formData.value.name,
      email: formData.value.email || undefined,
      providerId: response.provider.id,
    })

    await showToast(t('provider.registration_success') || 'Registration successful!', 'success')
    router.push('/provider-dashboard')
  } catch (error) {
    const message = getErrorMessage(error)
    await showToast(message || 'Failed to complete registration. Please try again.', 'danger')
  } finally {
    isSubmitting.value = false
  }
}

const skipOnboarding = () => {
  authStore.completeOnboarding({
    name: 'Service Provider',
  })
  router.push('/provider-dashboard')
}

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
const dayLabels: Record<typeof days[number], string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
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

        <!-- Step Indicator -->
        <div class="step-indicator">
          {{ currentStep + 1 }} / {{ steps.length }}
        </div>

        <!-- Step Content -->
        <div class="step-content">
          <!-- Step 0: Welcome -->
          <div v-if="currentStep === 0" class="step welcome-step">
            <div class="step-icon">🛠️</div>
            <h1>Become a Provider</h1>
            <p>Join Indlela and start earning by offering your services to your community.</p>

            <div class="features-list">
              <div class="feature">
                <span class="feature-icon">💰</span>
                <div>
                  <h3>Earn Money</h3>
                  <p>Set your own rates, keep 88% of earnings</p>
                </div>
              </div>
              <div class="feature">
                <span class="feature-icon">📱</span>
                <div>
                  <h3>Easy Bookings</h3>
                  <p>Manage jobs from your phone</p>
                </div>
              </div>
              <div class="feature">
                <span class="feature-icon">⭐</span>
                <div>
                  <h3>Build Reputation</h3>
                  <p>Grow through positive reviews</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 1: Profile -->
          <div v-if="currentStep === 1" class="step profile-step">
            <div class="step-icon">👤</div>
            <h1>Your Profile</h1>
            <p>Let customers know who you are.</p>

            <div class="form-group">
              <label>Full Name *</label>
              <IonInput
                v-model="formData.name"
                placeholder="Enter your full name"
                class="onboarding-input"
              />
            </div>

            <div class="form-group">
              <label>ID Number *</label>
              <IonInput
                v-model="formData.idNumber"
                placeholder="SA ID number"
                class="onboarding-input"
              />
              <span class="input-hint">Required for verification</span>
            </div>

            <div class="form-group">
              <label>Email (optional)</label>
              <IonInput
                v-model="formData.email"
                type="email"
                placeholder="your@email.com"
                class="onboarding-input"
              />
            </div>

            <div class="form-group">
              <label>Bio (optional)</label>
              <IonTextarea
                v-model="formData.bio"
                placeholder="Tell customers about yourself and your experience..."
                class="onboarding-input"
                :rows="3"
              />
            </div>
          </div>

          <!-- Step 2: Services -->
          <div v-if="currentStep === 2" class="step services-step">
            <div class="step-icon">💼</div>
            <h1>Your Services</h1>
            <p>Select the services you offer.</p>

            <div class="services-grid">
              <button
                v-for="service in availableServices"
                :key="service.id"
                class="service-option"
                :class="{ selected: isServiceSelected(service.id) }"
                @click="toggleService(service.id)"
              >
                <span class="service-icon">{{ service.icon }}</span>
                <span class="service-name">{{ service.name }}</span>
                <span class="service-price">From R{{ service.basePrice }}</span>
                <div v-if="isServiceSelected(service.id)" class="check-icon">
                  <IonIcon :icon="checkmarkCircle" />
                </div>
              </button>
            </div>

            <p class="selection-count">
              {{ formData.selectedServices.length }} service(s) selected
            </p>
          </div>

          <!-- Step 3: Location -->
          <div v-if="currentStep === 3" class="step location-step">
            <div class="step-icon">📍</div>
            <h1>Service Area</h1>
            <p>Where do you provide your services?</p>

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

            <div class="form-group">
              <label>Service Radius: {{ formData.serviceRadius }}km</label>
              <input
                v-model.number="formData.serviceRadius"
                type="range"
                min="1"
                max="50"
                class="radius-slider"
              />
              <div class="radius-labels">
                <span>1km</span>
                <span>50km</span>
              </div>
            </div>

            <button class="location-button">
              <IonIcon :icon="location" />
              Use my current location
            </button>
          </div>

          <!-- Step 4: Availability -->
          <div v-if="currentStep === 4" class="step availability-step">
            <div class="step-icon">📅</div>
            <h1>Your Availability</h1>
            <p>When are you available to work?</p>

            <div class="availability-list">
              <div
                v-for="day in days"
                :key="day"
                class="day-row"
                :class="{ disabled: !formData.availability[day].enabled }"
              >
                <div class="day-toggle">
                  <IonToggle
                    v-model="formData.availability[day].enabled"
                  />
                  <span class="day-name">{{ dayLabels[day] }}</span>
                </div>
                <div v-if="formData.availability[day].enabled" class="time-range">
                  <input
                    v-model="formData.availability[day].start"
                    type="time"
                    class="time-input"
                  />
                  <span>-</span>
                  <input
                    v-model="formData.availability[day].end"
                    type="time"
                    class="time-input"
                  />
                </div>
                <span v-else class="unavailable-text">Unavailable</span>
              </div>
            </div>
          </div>

          <!-- Step 5: Complete -->
          <div v-if="currentStep === 5" class="step complete-step">
            <div class="step-icon success">
              <IonIcon :icon="checkmarkCircle" />
            </div>
            <h1>You're Ready!</h1>
            <p>Your provider profile is set up. Start accepting jobs!</p>

            <div class="summary-card">
              <div class="summary-item">
                <span class="label">Name</span>
                <span class="value">{{ formData.name }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Services</span>
                <span class="value">{{ selectedServicesDisplay }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Location</span>
                <span class="value">{{ formData.township }}, {{ formData.city }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Service Radius</span>
                <span class="value">{{ formData.serviceRadius }}km</span>
              </div>
              <div class="summary-item">
                <span class="label">Available Days</span>
                <span class="value">{{ enabledDaysCount }} days/week</span>
              </div>
            </div>

            <div class="verification-notice">
              <IonIcon :icon="time" />
              <p>Your ID will be verified within 24-48 hours. You can start accepting jobs once verified.</p>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="nav-buttons">
          <IonButton
            v-if="currentStep > 0 && currentStep < 5"
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
            v-if="currentStep < 5"
            :disabled="!canProceed"
            @click="nextStep"
          >
            Continue
            <IonIcon :icon="arrowForward" slot="end" />
          </IonButton>

          <IonButton
            v-if="currentStep === 5"
            :disabled="isSubmitting"
            @click="completeOnboarding"
            class="complete-button"
          >
            <IonSpinner v-if="isSubmitting" name="crescent" />
            <span v-else>Go to Dashboard</span>
          </IonButton>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.onboarding-content {
  --background: linear-gradient(180deg, #2563EB 0%, #1D4ED8 100%);
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
  margin-bottom: 12px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.step-indicator {
  text-align: right;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  margin-bottom: 20px;
}

.step-content {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  padding: 16px 0;
}

.step {
  width: 100%;
  text-align: center;
  color: white;
}

.step-icon {
  font-size: 56px;
  margin-bottom: 20px;
}

.step-icon.success {
  font-size: 72px;
}

.step-icon.success ion-icon {
  color: white;
}

.step h1 {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 10px;
}

.step > p {
  font-size: 15px;
  opacity: 0.9;
  margin: 0 0 28px;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: left;
}

.feature {
  display: flex;
  gap: 14px;
  background: rgba(255, 255, 255, 0.15);
  padding: 14px;
  border-radius: 12px;
}

.feature-icon {
  font-size: 28px;
}

.feature h3 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
}

.feature p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

.form-group {
  margin-bottom: 18px;
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
  --padding-top: 12px;
  --padding-bottom: 12px;
  border-radius: 12px;
  font-size: 15px;
}

.input-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.8;
}

/* Services Grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.service-option {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 10px;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid transparent;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.service-option.selected {
  background: rgba(255, 255, 255, 0.25);
  border-color: white;
}

.service-icon {
  font-size: 28px;
}

.service-name {
  font-size: 13px;
  font-weight: 600;
}

.service-price {
  font-size: 11px;
  opacity: 0.8;
}

.check-icon {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 18px;
}

.selection-count {
  font-size: 13px;
  opacity: 0.9;
}

/* Location */
.radius-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  outline: none;
}

.radius-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
}

.radius-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  opacity: 0.8;
  margin-top: 6px;
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

/* Availability */
.availability-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
}

.day-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.15);
  padding: 12px 14px;
  border-radius: 10px;
}

.day-row.disabled {
  opacity: 0.6;
}

.day-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
}

.day-name {
  font-weight: 600;
  font-size: 14px;
  min-width: 40px;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.time-input {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  padding: 6px 8px;
  color: #333;
  font-size: 13px;
}

.unavailable-text {
  font-size: 13px;
  opacity: 0.7;
}

/* Summary */
.summary-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  padding: 18px;
  text-align: left;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item .label {
  opacity: 0.8;
  font-size: 13px;
}

.summary-item .value {
  font-weight: 600;
  font-size: 13px;
  text-align: right;
  max-width: 60%;
}

.verification-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  padding: 14px;
  border-radius: 10px;
  text-align: left;
}

.verification-notice ion-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.verification-notice p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

/* Navigation */
.nav-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
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
  --color: #2563EB;
  font-weight: 600;
}
</style>