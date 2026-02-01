<script setup lang="ts">
/**
 * Home Page - Main landing page with services and providers
 * Refined to use Indlela design system components
 */

import {
  IonPage,
  IonContent,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/vue'
import {
  popularServices as mockPopularServices,
  nearbyProviders as mockNearbyProviders,
  mockDelay,
} from '~/utils/mock-data'
import { FRESHNESS_THRESHOLDS } from '~/composables/useDataFreshness'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const { t } = useI18n()
const router = useRouter()

// State
const searchQuery = ref('')
const isLoading = ref(true)

// Use mock data
const popularServices = ref(mockPopularServices)
const nearbyProviders = ref(mockNearbyProviders)

// Track when data was cached (for stale indicator)
const dataCachedAt = ref<Date | null>(null)

// Methods
const handleRefresh = async (event: any) => {
  await mockDelay(800)
  // Update cache timestamp on refresh
  dataCachedAt.value = new Date()
  event.target?.complete()
}

const handleStaleRefresh = () => {
  // Trigger a refresh when user taps "Refresh" on stale banner
  dataCachedAt.value = new Date()
}

const searchProviders = () => {
  if (searchQuery.value.trim()) {
    router.push(`/services?q=${encodeURIComponent(searchQuery.value)}`)
  }
}

const viewService = (serviceId: string) => {
  router.push(`/services/${serviceId}`)
}

const viewProvider = (providerId: string) => {
  router.push(`/providers/${providerId}`)
}

// Simulate loading and set initial cache timestamp
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
    // Set cache timestamp when data "loads"
    dataCachedAt.value = new Date()
  }, 1000)
})
</script>

<template>
  <IonPage>
    <!-- App Header with Logo -->
    <AppHeader :show-logo="true" :show-search="true">
      <template #below>
        <div class="search-wrapper">
          <IonSearchbar
            v-model="searchQuery"
            :placeholder="t('home.search_placeholder')"
            show-cancel-button="focus"
            animated
            class="search-bar"
            @ionChange="searchProviders"
          />
        </div>
      </template>
    </AppHeader>

    <IonContent :fullscreen="true">
      <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
        <IonRefresherContent />
      </IonRefresher>

      <!-- Stale Data Banner (shows when data is older than threshold) -->
      <StaleDataBanner
        :cached-at="dataCachedAt"
        :threshold="FRESHNESS_THRESHOLDS.providers"
        @refresh="handleStaleRefresh"
      />

      <!-- Popular Services Section -->
      <section class="section">
        <div class="section__header">
          <h2 class="section__title">{{ t('home.popular_services') }}</h2>
          <button class="section__link" @click="router.push('/services')">
            {{ t('common.view_all') }}
            <Icon name="heroicons:chevron-right" class="section__link-icon" />
          </button>
        </div>

        <div class="services-grid stagger-list">
          <ServiceCard
            v-for="(service, index) in isLoading ? 6 : popularServices"
            :key="isLoading ? `skeleton-${index}` : service.id"
            :id="service?.id || ''"
            :emoji="service?.icon"
            :name="service?.name ? t(`services.${service.name}`) : ''"
            :count="service?.count"
            :loading="isLoading"
            class="stagger-item"
            @click="viewService"
          />
        </div>
      </section>

      <!-- Nearby Providers Section -->
      <section class="section">
        <div class="section__header">
          <h2 class="section__title">{{ t('home.nearby_providers') }}</h2>
          <button class="section__link" @click="router.push('/providers')">
            {{ t('common.view_all') }}
            <Icon name="heroicons:chevron-right" class="section__link-icon" />
          </button>
        </div>

        <div class="providers-list">
          <ProviderCard
            v-for="(provider, index) in isLoading ? 3 : nearbyProviders"
            :key="isLoading ? `skeleton-${index}` : provider.id"
            :id="provider?.id || ''"
            :name="provider?.name || ''"
            :service="provider?.service || ''"
            :avatar="provider?.avatar"
            :rating="provider?.rating"
            :reviews="provider?.reviews"
            :distance="provider?.distance"
            :loading="isLoading"
            variant="list"
            @click="viewProvider"
          />

          <!-- Empty state -->
          <EmptyState
            v-if="!isLoading && nearbyProviders.length === 0"
            icon="heroicons:user-group"
            :title="t('home.no_providers')"
            :message="t('home.no_providers_message')"
            size="sm"
          />
        </div>
      </section>

      <!-- AI Assistant Prompt -->
      <section class="section ai-prompt-section">
        <UiCard variant="filled" padding="lg" class="ai-prompt-card">
          <div class="ai-prompt">
            <div class="ai-prompt__icon">
              <Icon name="ph:robot" />
            </div>
            <div class="ai-prompt__content">
              <h3 class="ai-prompt__title">{{ t('home.ai_assistant_title') }}</h3>
              <p class="ai-prompt__message">{{ t('home.ai_assistant_message') }}</p>
            </div>
          </div>
          <AiSuggestionChips
            :suggestions="[
              { label: t('home.suggestions.plumber'), icon: 'heroicons:wrench-screwdriver' },
              { label: t('home.suggestions.electrician'), icon: 'heroicons:bolt' },
              { label: t('home.suggestions.cleaner'), icon: 'heroicons:sparkles' },
            ]"
            class="ai-prompt__suggestions"
            @select="(s) => router.push(`/services?q=${s.label}`)"
          />
        </UiCard>
      </section>
    </IonContent>
  </IonPage>
</template>

<style scoped>
/* Section styling */
.section {
  padding: var(--space-4);
}

.section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.section__title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
}

.section__link {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0;
  background: transparent;
  border: none;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-primary-500);
  cursor: pointer;
}

.section__link:hover {
  color: var(--color-primary-600);
}

.section__link-icon {
  width: 16px;
  height: 16px;
}

/* Services grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

/* Providers list */
.providers-list {
  background: var(--color-neutral-0);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* AI Prompt section */
.ai-prompt-section {
  padding-bottom: calc(var(--tab-bar-height, 60px) + env(safe-area-inset-bottom) + var(--space-4));;
}

.ai-prompt-card {
  background: linear-gradient(
    135deg,
    var(--color-primary-50) 0%,
    var(--color-neutral-50) 100%
  );
}

.ai-prompt {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.ai-prompt__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--color-primary-100);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.ai-prompt__icon :deep(svg) {
  width: 24px;
  height: 24px;
  color: var(--color-primary-600);
}

.ai-prompt__content {
  flex: 1;
}

.ai-prompt__title {
  margin: 0 0 var(--space-1);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
}

.ai-prompt__message {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  line-height: var(--leading-relaxed);
}

.ai-prompt__suggestions {
  margin-top: var(--space-2);
}

/* Search wrapper */
.search-wrapper {
  padding: var(--space-2) var(--space-4);
  background: var(--color-primary-500);
}

/* Search bar customization */
.search-bar {
  --background: rgba(255, 255, 255, 0.15);
  --color: white;
  --placeholder-color: rgba(255, 255, 255, 0.7);
  --icon-color: rgba(255, 255, 255, 0.7);
  --clear-button-color: rgba(255, 255, 255, 0.7);
  margin: 0;
  padding: 0;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .section__title {
    color: var(--color-neutral-100);
  }

  .providers-list {
    background: var(--color-neutral-900);
  }

  .ai-prompt-card {
    background: linear-gradient(
      135deg,
      rgba(0, 168, 107, 0.1) 0%,
      var(--color-neutral-800) 100%
    );
  }

  .ai-prompt__icon {
    background: rgba(0, 168, 107, 0.15);
  }

  .ai-prompt__icon :deep(svg) {
    color: var(--color-primary-400);
  }

  .ai-prompt__title {
    color: var(--color-neutral-100);
  }

  .ai-prompt__message {
    color: var(--color-neutral-400);
  }
}

/* Responsive adjustments */
@media (max-width: 360px) {
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
