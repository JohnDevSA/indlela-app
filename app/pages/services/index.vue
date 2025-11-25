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

      <!-- Category Chips -->
      <div class="category-chips">
        <IonChip
          v-for="category in mockCategories"
          :key="category.id"
          :color="selectedCategory === category.id ? 'primary' : 'medium'"
          :outline="selectedCategory !== category.id"
          @click="selectCategory(category.id)"
        >
          <span class="chip-icon">{{ category.icon }}</span>
          {{ category.name }}
        </IonChip>
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
.category-chips {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.category-chips::-webkit-scrollbar {
  display: none;
}

.chip-icon {
  margin-right: 4px;
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