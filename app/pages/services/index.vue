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
  IonChip,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
} from '@ionic/vue'
import { chevronForward } from 'ionicons/icons'
import {
  mockCategories,
  mockServices,
  mockProviders,
  mockDelay,
} from '~/utils/mock-data'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

// State
const searchQuery = ref((route.query.q as string) || '')
const selectedCategory = ref<string | null>(null)
const isLoading = ref(true)
const view = ref<'services' | 'providers'>('services')

// Computed
const filteredServices = computed(() => {
  let services = mockServices

  if (selectedCategory.value) {
    services = services.filter(s => s.categoryId === selectedCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    services = services.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query)
    )
  }

  return services
})

const filteredProviders = computed(() => {
  let providers = mockProviders

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    providers = providers.filter(p =>
      p.user?.name?.toLowerCase().includes(query) ||
      p.services?.some(s => s.service?.name.toLowerCase().includes(query))
    )
  }

  if (selectedCategory.value) {
    providers = providers.filter(p =>
      p.services?.some(s => {
        const service = mockServices.find(ms => ms.id === s.serviceId)
        return service?.categoryId === selectedCategory.value
      })
    )
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

const selectCategory = (categoryId: string | null) => {
  selectedCategory.value = selectedCategory.value === categoryId ? null : categoryId
}

const viewService = (serviceId: string) => {
  router.push(`/services/${serviceId}`)
}

const viewProvider = (providerId: string) => {
  router.push(`/providers/${providerId}`)
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
        <IonTitle>{{ t('services.title') }}</IonTitle>
      </IonToolbar>
      <IonToolbar color="primary">
        <IonSearchbar
          :value="searchQuery"
          :placeholder="t('common.search')"
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

      <!-- Category Tabs - Polished Design -->
      <div class="category-tabs-wrapper">
        <div class="category-tabs-scroll">
          <button
            v-for="category in mockCategories"
            :key="category.id"
            class="category-tab"
            :class="{ active: selectedCategory === category.id }"
            @click="selectCategory(category.id)"
            type="button"
          >
            <span class="category-tab-icon">{{ category.icon }}</span>
            <span class="category-tab-label">{{ category.name }}</span>
          </button>
        </div>
        <div class="category-tabs-fade-left" />
        <div class="category-tabs-fade-right" />
      </div>

      <!-- View Segment -->
      <IonSegment v-model="view" class="view-segment">
        <IonSegmentButton value="services">
          {{ t('services.title') }}
        </IonSegmentButton>
        <IonSegmentButton value="providers">
          {{ t('home.providers') }}
        </IonSegmentButton>
      </IonSegment>

      <!-- Services List -->
      <IonList v-if="view === 'services'" class="content-list">
        <template v-if="isLoading">
          <IonItem v-for="i in 6" :key="i">
            <div slot="start" class="service-icon-placeholder">
              <IonSkeletonText animated />
            </div>
            <IonLabel>
              <IonSkeletonText animated style="width: 60%" />
              <IonSkeletonText animated style="width: 80%" />
            </IonLabel>
          </IonItem>
        </template>
        <template v-else-if="filteredServices.length > 0">
          <IonItem
            v-for="service in filteredServices"
            :key="service.id"
            button
            detail
            @click="viewService(service.id)"
          >
            <div slot="start" class="service-icon">
              {{ service.icon }}
            </div>
            <IonLabel>
              <h2>{{ service.name }}</h2>
              <p>{{ service.description }}</p>
              <p class="price">From R{{ service.basePrice }}</p>
            </IonLabel>
          </IonItem>
        </template>
        <template v-else>
          <div class="empty-state">
            <p>{{ t('common.no_results') }}</p>
          </div>
        </template>
      </IonList>

      <!-- Providers List -->
      <IonList v-else class="content-list">
        <template v-if="isLoading">
          <IonItem v-for="i in 4" :key="i">
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
        <template v-else-if="filteredProviders.length > 0">
          <IonItem
            v-for="provider in filteredProviders"
            :key="provider.id"
            button
            detail
            @click="viewProvider(provider.id)"
          >
            <div slot="start" class="provider-avatar">
              {{ provider.user?.name?.charAt(0) || 'P' }}
            </div>
            <IonLabel>
              <h2>{{ provider.user?.name }}</h2>
              <p>{{ provider.services?.map(s => s.service?.name).join(', ') }}</p>
              <div class="provider-meta">
                <span class="rating">{{ provider.rating }} ({{ provider.totalReviews }} reviews)</span>
                <span class="jobs">{{ provider.totalJobs }} jobs</span>
              </div>
            </IonLabel>
          </IonItem>
        </template>
        <template v-else>
          <div class="empty-state">
            <p>{{ t('common.no_results') }}</p>
          </div>
        </template>
      </IonList>
    </IonContent>
  </IonPage>
</template>

<style scoped>
/* ==========================================================================
   CATEGORY TABS - POLISHED DESIGN
   Modern, accessible, touch-friendly category filtering
   ========================================================================== */

.category-tabs-wrapper {
  position: relative;
  padding: var(--space-4) 0;
  background: var(--color-neutral-0);
  border-bottom: 1px solid var(--color-neutral-200);
}

.category-tabs-scroll {
  display: flex;
  gap: var(--space-2);
  padding: 0 var(--space-4);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  scroll-behavior: smooth;
}

.category-tabs-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

/* Individual category tab button */
.category-tab {
  /* Accessibility - 44px minimum touch target */
  min-height: var(--touch-target-min);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);

  /* Typography */
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  white-space: nowrap;

  /* Visual design */
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
  border: 1.5px solid var(--color-neutral-200);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-xs);

  /* Remove default button styles */
  outline: none;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  /* Smooth transitions for all interactive states */
  transition: all var(--duration-normal) var(--ease-out);
}

/* Icon within tab */
.category-tab-icon {
  font-size: 1.25rem;
  line-height: 1;
  transition: transform var(--duration-normal) var(--ease-spring);
}

/* Label within tab */
.category-tab-label {
  line-height: 1;
}

/* Hover state (desktop/tablet) */
@media (hover: hover) {
  .category-tab:hover:not(.active) {
    background: var(--color-neutral-50);
    border-color: var(--color-neutral-300);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .category-tab:hover .category-tab-icon {
    transform: scale(1.1);
  }
}

/* Active/pressed state */
.category-tab:active:not(.active) {
  transform: scale(0.97);
  transition-duration: var(--duration-fast);
}

/* Selected/active state */
.category-tab.active {
  background: var(--color-primary-500);
  color: var(--color-neutral-0);
  border-color: var(--color-primary-600);
  box-shadow: var(--shadow-primary);
  font-weight: var(--font-semibold);
  transform: scale(1.02);
}

.category-tab.active .category-tab-icon {
  transform: scale(1.15);
}

/* Focus visible for accessibility (keyboard navigation) */
.category-tab:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Fade indicators for scrollable content */
.category-tabs-fade-left,
.category-tabs-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 24px;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.category-tabs-fade-left {
  left: 0;
  background: linear-gradient(to right, var(--color-neutral-0), transparent);
}

.category-tabs-fade-right {
  right: 0;
  background: linear-gradient(to left, var(--color-neutral-0), transparent);
}

/* Show fade indicators when content is scrollable */
.category-tabs-wrapper:has(.category-tabs-scroll:not(:hover)) .category-tabs-fade-right {
  opacity: 1;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .category-tabs-wrapper {
    background: var(--color-neutral-50);
    border-bottom-color: var(--color-neutral-200);
  }

  .category-tab {
    background: var(--color-neutral-100);
    color: var(--color-neutral-900);
    border-color: var(--color-neutral-200);
  }

  @media (hover: hover) {
    .category-tab:hover:not(.active) {
      background: var(--color-neutral-200);
      border-color: var(--color-neutral-300);
    }
  }

  .category-tabs-fade-left {
    background: linear-gradient(to right, var(--color-neutral-50), transparent);
  }

  .category-tabs-fade-right {
    background: linear-gradient(to left, var(--color-neutral-50), transparent);
  }
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .category-tab,
  .category-tab-icon,
  .category-tabs-fade-left,
  .category-tabs-fade-right {
    transition: none !important;
  }

  .category-tab.active .category-tab-icon {
    transform: none;
  }
}

.view-segment {
  margin: 0 16px 8px;
}

.content-list {
  padding: 0 8px;
}

.service-icon,
.service-icon-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--ion-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
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

.price {
  color: var(--ion-color-primary);
  font-weight: 600;
}

.provider-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-top: 4px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--ion-color-medium);
}
</style>