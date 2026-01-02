<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonChip,
} from '@ionic/vue'
import { star, checkmarkCircle, locationOutline, flash } from 'ionicons/icons'
import {
  mockProviders,
  mockServices,
  mockDelay,
} from '~/utils/mock-data'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

// Distance filter options (in km)
const distanceOptions = [
  { value: 5, label: '5km' },
  { value: 10, label: '10km' },
  { value: 15, label: '15km' },
  { value: 20, label: '20+km' },
]

// State
const searchQuery = ref((route.query.q as string) || '')
const selectedDistance = ref<number>(10) // Default 10km per BUSINESS_RULES
const isLoading = ref(true)
const sortBy = ref<'distance' | 'rating' | 'reviews'>('distance')

// Computed: Process providers with mock distances
const providersWithDistance = computed(() => {
  return mockProviders.map((p, index) => {
    // Generate mock distance based on index (simulate proximity)
    const mockDistance = 0.5 + index * 1.2 + Math.random() * 2
    return {
      id: p.id,
      name: p.user?.name || 'Provider',
      services: p.services?.map(s => s.service?.name).filter(Boolean).join(', ') || 'Service',
      rating: p.rating,
      reviews: p.totalReviews,
      totalJobs: p.totalJobs,
      distance: mockDistance,
      distanceDisplay: mockDistance < 1 ? `${Math.round(mockDistance * 1000)}m` : `${mockDistance.toFixed(1)}km`,
      avatar: p.user?.avatar,
      verified: p.status === 'verified',
      autoAccept: p.preferences?.autoAcceptEnabled ?? false,
      available: true,
    }
  })
})

// Computed: Filter and sort providers
const filteredProviders = computed(() => {
  let providers = [...providersWithDistance.value]

  // Filter by distance
  if (selectedDistance.value < 20) {
    providers = providers.filter(p => p.distance <= selectedDistance.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    providers = providers.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.services.toLowerCase().includes(query)
    )
  }

  // Sort
  switch (sortBy.value) {
    case 'rating':
      providers.sort((a, b) => b.rating - a.rating)
      break
    case 'reviews':
      providers.sort((a, b) => b.reviews - a.reviews)
      break
    case 'distance':
    default:
      providers.sort((a, b) => a.distance - b.distance)
  }

  return providers
})

// Methods
const handleRefresh = async (event: any) => {
  await mockDelay(800)
  event.target?.complete()
}

const handleSearch = (event: CustomEvent) => {
  searchQuery.value = event.detail.value || ''
}

const selectDistance = (distance: number) => {
  selectedDistance.value = distance
}

const viewProvider = (providerId: string) => {
  router.push(`/providers/${providerId}`)
}

const expandSearch = () => {
  selectedDistance.value = 20
}

// Simulate loading
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 800)
})
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonTitle>{{ t('providers.title') }}</IonTitle>
      </IonToolbar>
      <IonToolbar color="primary">
        <IonSearchbar
          :value="searchQuery"
          :placeholder="t('providers.search_placeholder')"
          @ionInput="handleSearch"
          show-cancel-button="focus"
          animated
        />
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
        <IonRefresherContent />
      </IonRefresher>

      <!-- Distance Filter Tabs -->
      <div class="distance-tabs-wrapper">
        <div class="distance-tabs-scroll">
          <button
            v-for="option in distanceOptions"
            :key="option.value"
            class="distance-tab"
            :class="{ active: selectedDistance === option.value }"
            @click="selectDistance(option.value)"
            type="button"
          >
            <IonIcon :icon="locationOutline" class="distance-tab-icon" />
            <span class="distance-tab-label">{{ option.label }}</span>
          </button>
        </div>
        <div class="distance-tabs-fade-left" />
        <div class="distance-tabs-fade-right" />
      </div>

      <!-- Sort Segment -->
      <IonSegment v-model="sortBy" class="sort-segment">
        <IonSegmentButton value="distance">
          {{ t('providers.sort_distance') }}
        </IonSegmentButton>
        <IonSegmentButton value="rating">
          {{ t('providers.sort_rating') }}
        </IonSegmentButton>
        <IonSegmentButton value="reviews">
          {{ t('providers.sort_reviews') }}
        </IonSegmentButton>
      </IonSegment>

      <!-- Results Count -->
      <div v-if="!isLoading" class="results-info">
        <span class="results-count">
          {{ t('providers.results_count', { count: filteredProviders.length }, filteredProviders.length) }}
        </span>
        <span class="results-filter">
          {{ t('providers.within_distance', { distance: selectedDistance >= 20 ? '20+' : selectedDistance + 'km' }) }}
        </span>
      </div>

      <!-- Providers List -->
      <IonList class="providers-list">
        <!-- Loading Skeleton -->
        <template v-if="isLoading">
          <IonItem v-for="i in 5" :key="`skeleton-${i}`">
            <div slot="start" class="avatar-placeholder">
              <IonSkeletonText animated />
            </div>
            <IonLabel>
              <IonSkeletonText animated style="width: 50%" />
              <IonSkeletonText animated style="width: 70%" />
              <IonSkeletonText animated style="width: 40%" />
            </IonLabel>
          </IonItem>
        </template>

        <!-- Provider Items -->
        <template v-else-if="filteredProviders.length > 0">
          <IonItem
            v-for="provider in filteredProviders"
            :key="provider.id"
            button
            detail
            @click="viewProvider(provider.id)"
          >
            <div slot="start" class="provider-avatar">
              {{ provider.name.charAt(0) }}
            </div>
            <IonLabel>
              <div class="provider-header">
                <h2>{{ provider.name }}</h2>
                <IonChip v-if="provider.verified" class="verified-badge">
                  <IonIcon :icon="checkmarkCircle" />
                </IonChip>
                <IonChip v-if="provider.autoAccept" class="instant-badge">
                  <IonIcon :icon="flash" />
                  {{ t('provider.instant_badge') }}
                </IonChip>
              </div>
              <p class="provider-services">{{ provider.services }}</p>
              <div class="provider-meta">
                <span class="rating">
                  <IonIcon :icon="star" color="warning" />
                  {{ provider.rating }} ({{ provider.reviews }})
                </span>
                <span class="distance">
                  <IonIcon :icon="locationOutline" />
                  {{ provider.distanceDisplay }}
                </span>
                <span class="jobs">{{ provider.totalJobs }} {{ t('provider.jobs_completed') }}</span>
              </div>
            </IonLabel>
          </IonItem>
        </template>

        <!-- Empty State -->
        <template v-else>
          <div class="empty-state">
            <IonIcon :icon="locationOutline" class="empty-icon" />
            <h3>{{ t('providers.empty.title') }}</h3>
            <p>{{ t('providers.empty.message') }}</p>
            <button class="expand-search-btn" @click="expandSearch">
              {{ t('providers.empty.expand_search') }}
            </button>
          </div>
        </template>
      </IonList>
    </IonContent>
  </IonPage>
</template>

<style scoped>
/* ==========================================================================
   DISTANCE FILTER TABS
   ========================================================================== */

.distance-tabs-wrapper {
  position: relative;
  padding: var(--space-4) 0;
  background: var(--color-neutral-0);
  border-bottom: 1px solid var(--color-neutral-200);
}

.distance-tabs-scroll {
  display: flex;
  gap: var(--space-2);
  padding: 0 var(--space-4);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  scroll-behavior: smooth;
}

.distance-tabs-scroll::-webkit-scrollbar {
  display: none;
}

.distance-tab {
  min-height: var(--touch-target-min);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  white-space: nowrap;
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
  border: 1.5px solid var(--color-neutral-200);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-xs);
  outline: none;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: all var(--duration-normal) var(--ease-out);
}

.distance-tab-icon {
  font-size: 1rem;
  line-height: 1;
}

.distance-tab-label {
  line-height: 1;
}

@media (hover: hover) {
  .distance-tab:hover:not(.active) {
    background: var(--color-neutral-50);
    border-color: var(--color-neutral-300);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
}

.distance-tab:active:not(.active) {
  transform: scale(0.97);
  transition-duration: var(--duration-fast);
}

.distance-tab.active {
  background: var(--color-primary-500);
  color: var(--color-neutral-0);
  border-color: var(--color-primary-600);
  box-shadow: var(--shadow-primary);
  font-weight: var(--font-semibold);
  transform: scale(1.02);
}

.distance-tab:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.distance-tabs-fade-left,
.distance-tabs-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 24px;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.distance-tabs-fade-left {
  left: 0;
  background: linear-gradient(to right, var(--color-neutral-0), transparent);
}

.distance-tabs-fade-right {
  right: 0;
  background: linear-gradient(to left, var(--color-neutral-0), transparent);
}

/* ==========================================================================
   SORT SEGMENT & RESULTS INFO
   ========================================================================== */

.sort-segment {
  margin: 16px 16px 8px;
}

.results-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.results-count {
  font-weight: 600;
}

/* ==========================================================================
   PROVIDERS LIST
   ========================================================================== */

.providers-list {
  padding: 0 8px;
  padding-bottom: calc(var(--tab-bar-height, 60px) + env(safe-area-inset-bottom) + var(--space-4));
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

.provider-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.provider-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.verified-badge {
  --background: transparent;
  --color: var(--ion-color-success);
  --padding-start: 0;
  --padding-end: 0;
  height: 20px;
  margin: 0;
}

.verified-badge ion-icon {
  font-size: 16px;
}

.instant-badge {
  --background: rgba(255, 196, 9, 0.15);
  --color: var(--ion-color-warning-shade);
  --padding-start: 6px;
  --padding-end: 8px;
  height: 20px;
  margin: 0;
  font-size: 11px;
  font-weight: 600;
}

.instant-badge ion-icon {
  font-size: 12px;
  margin-right: 2px;
}

.provider-services {
  color: var(--ion-color-medium-shade);
  font-size: 14px;
  margin: 4px 0;
}

.provider-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-top: 4px;
}

.provider-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.provider-meta ion-icon {
  font-size: 14px;
}

.rating ion-icon {
  color: var(--ion-color-warning);
}

/* ==========================================================================
   EMPTY STATE
   ========================================================================== */

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--ion-color-medium);
}

.empty-icon {
  font-size: 64px;
  color: var(--ion-color-light-shade);
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-text-color);
}

.empty-state p {
  margin: 0 0 24px;
  font-size: 14px;
}

.expand-search-btn {
  background: var(--ion-color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.expand-search-btn:hover {
  background: var(--ion-color-primary-shade);
}

/* ==========================================================================
   DARK MODE
   ========================================================================== */

@media (prefers-color-scheme: dark) {
  .distance-tabs-wrapper {
    background: var(--color-neutral-50);
    border-bottom-color: var(--color-neutral-200);
  }

  .distance-tab {
    background: var(--color-neutral-100);
    color: var(--color-neutral-900);
    border-color: var(--color-neutral-200);
  }

  @media (hover: hover) {
    .distance-tab:hover:not(.active) {
      background: var(--color-neutral-200);
      border-color: var(--color-neutral-300);
    }
  }

  .distance-tabs-fade-left {
    background: linear-gradient(to right, var(--color-neutral-50), transparent);
  }

  .distance-tabs-fade-right {
    background: linear-gradient(to left, var(--color-neutral-50), transparent);
  }
}

/* ==========================================================================
   REDUCED MOTION
   ========================================================================== */

@media (prefers-reduced-motion: reduce) {
  .distance-tab,
  .distance-tabs-fade-left,
  .distance-tabs-fade-right {
    transition: none !important;
  }
}
</style>