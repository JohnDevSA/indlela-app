<script setup lang="ts">
import {
  IonButton,
  IonIcon,
  IonInput,
  IonSpinner,
  IonItem,
  IonList,
  IonLabel,
} from '@ionic/vue'
import { location, search, alertCircle, checkmarkCircle } from 'ionicons/icons'
import type { GeocodingResult } from '~/composables/useReverseGeocode'

interface Props {
  modelTownship: string
  modelCity: string
}

interface Emits {
  (e: 'update:modelTownship', value: string): void
  (e: 'update:modelCity', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { getCurrentLocation, isLoading: geoLoading, error: geoError } = useGeolocation()
const { reverseGeocode, searchLocation, isLoading: geocodeLoading, error: geocodeError } = useReverseGeocode()

// Local state
const township = computed({
  get: () => props.modelTownship,
  set: (value) => emit('update:modelTownship', value),
})

const city = computed({
  get: () => props.modelCity,
  set: (value) => emit('update:modelCity', value),
})

const searchQuery = ref('')
const searchResults = ref<GeocodingResult[]>([])
const showSearchResults = ref(false)
const mode = ref<'manual' | 'search'>('manual')
const locationSuccess = ref(false)

// Computed
const isLoading = computed(() => geoLoading.value || geocodeLoading.value)
const hasError = computed(() => geoError.value || geocodeError.value)
const errorMessage = computed(() => geoError.value || geocodeError.value || '')

/**
 * Get current location using device GPS
 */
const useCurrentLocation = async () => {
  locationSuccess.value = false

  try {
    // Get coordinates
    const coords = await getCurrentLocation()
    if (!coords) {
      return
    }

    // Reverse geocode to get address
    const result = await reverseGeocode(coords)
    if (!result) {
      return
    }

    // Update form fields
    township.value = result.township || result.suburb || ''
    city.value = result.city

    locationSuccess.value = true

    // Reset success indicator after 3 seconds
    setTimeout(() => {
      locationSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('[LocationSelector] Failed to get location:', error)
  }
}

/**
 * Search for location by name
 */
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    showSearchResults.value = false
    return
  }

  const results = await searchLocation(searchQuery.value)
  searchResults.value = results
  showSearchResults.value = results.length > 0
}

/**
 * Select location from search results
 */
const selectLocation = (result: GeocodingResult) => {
  township.value = result.township || result.suburb || ''
  city.value = result.city
  searchQuery.value = ''
  showSearchResults.value = false
  mode.value = 'manual'
}

/**
 * Switch between manual and search modes
 */
const toggleMode = () => {
  mode.value = mode.value === 'manual' ? 'search' : 'manual'
  if (mode.value === 'search') {
    showSearchResults.value = false
    searchQuery.value = ''
  }
}

// Watch search query with debounce
const debouncedSearch = useDebounceFn(handleSearch, 500)
watch(searchQuery, () => {
  if (searchQuery.value.trim().length >= 3) {
    debouncedSearch()
  } else {
    showSearchResults.value = false
  }
})
</script>

<template>
  <div class="location-selector">
    <!-- Use Current Location Button -->
    <button
      class="location-button"
      :class="{ success: locationSuccess, loading: isLoading }"
      :disabled="isLoading"
      @click="useCurrentLocation"
    >
      <IonSpinner v-if="isLoading" name="crescent" class="spinner" />
      <IonIcon v-else-if="locationSuccess" :icon="checkmarkCircle" />
      <IonIcon v-else :icon="location" />
      <span>
        {{ isLoading ? t('booking.getting_location') : t('location.use_current') }}
      </span>
    </button>

    <!-- Error Display -->
    <div v-if="hasError" class="error-message">
      <IonIcon :icon="alertCircle" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Mode Toggle -->
    <div class="mode-toggle">
      <button
        class="mode-button"
        :class="{ active: mode === 'manual' }"
        @click="toggleMode"
      >
        {{ t('location.manual_entry') }}
      </button>
      <button
        class="mode-button"
        :class="{ active: mode === 'search' }"
        @click="toggleMode"
      >
        <IonIcon :icon="search" />
        {{ t('location.search') }}
      </button>
    </div>

    <!-- Manual Entry Mode -->
    <div v-if="mode === 'manual'" class="manual-inputs">
      <div class="form-group">
        <label>{{ t('location.township') }} *</label>
        <IonInput
          v-model="township"
          :placeholder="t('location.township_placeholder')"
          class="location-input"
        />
      </div>

      <div class="form-group">
        <label>{{ t('location.city') }} *</label>
        <IonInput
          v-model="city"
          :placeholder="t('location.city_placeholder')"
          class="location-input"
        />
      </div>
    </div>

    <!-- Search Mode -->
    <div v-else class="search-mode">
      <div class="search-input-wrapper">
        <IonInput
          v-model="searchQuery"
          :placeholder="t('location.search_placeholder')"
          class="location-input search-input"
        />
        <IonSpinner v-if="geocodeLoading" name="crescent" class="search-spinner" />
      </div>

      <!-- Search Results -->
      <IonList v-if="showSearchResults" class="search-results">
        <IonItem
          v-for="(result, index) in searchResults"
          :key="index"
          button
          @click="selectLocation(result)"
        >
          <IonLabel>
            <h3>{{ result.township || result.suburb }}</h3>
            <p>{{ result.city }}{{ result.province ? `, ${result.province}` : '' }}</p>
          </IonLabel>
        </IonItem>
      </IonList>

      <!-- Selected Location Display -->
      <div v-if="township && city" class="selected-location">
        <div class="form-group">
          <label>{{ t('location.township') }} *</label>
          <IonInput
            v-model="township"
            class="location-input"
          />
        </div>

        <div class="form-group">
          <label>{{ t('location.city') }} *</label>
          <IonInput
            v-model="city"
            class="location-input"
          />
        </div>
      </div>
    </div>

    <!-- Helper Text -->
    <p class="helper-text">
      {{ t('location.helper_text') }}
    </p>
  </div>
</template>

<style scoped>
.location-selector {
  width: 100%;
}

.location-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 44px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px dashed rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
}

.location-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.7);
}

.location-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.location-button.success {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.5);
}

.location-button ion-icon {
  font-size: 20px;
}

.location-button .spinner {
  --color: white;
  width: 20px;
  height: 20px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 13px;
  margin-bottom: 16px;
}

.error-message ion-icon {
  font-size: 18px;
  color: #ef4444;
  flex-shrink: 0;
}

.mode-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.mode-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.mode-button.active {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
}

.mode-button ion-icon {
  font-size: 16px;
}

.manual-inputs,
.search-mode {
  margin-bottom: 12px;
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
  color: white;
}

.location-input {
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

.search-input-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.search-spinner {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  --color: #666;
  width: 20px;
  height: 20px;
}

.search-results {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;
}

.search-results ion-item {
  --background: transparent;
  --min-height: 60px;
  cursor: pointer;
}

.search-results ion-item:hover {
  --background: rgba(0, 0, 0, 0.05);
}

.search-results h3 {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
}

.search-results p {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.selected-location {
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.helper-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
  margin: 0;
  padding: 0 4px;
}
</style>
