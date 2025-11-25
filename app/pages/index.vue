<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonAvatar,
  IonChip,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/vue'
import { location, star, chevronForward } from 'ionicons/icons'
import {
  popularServices as mockPopularServices,
  nearbyProviders as mockNearbyProviders,
  mockDelay,
} from '~/utils/mock-data'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const router = useRouter()

// State
const searchQuery = ref('')
const isLoading = ref(true)

// Use mock data
const popularServices = ref(mockPopularServices)
const nearbyProviders = ref(mockNearbyProviders)

// Methods
const handleRefresh = async (event: any) => {
  // Simulate refresh
  await mockDelay(800)
  event.target?.complete()
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

// Simulate loading
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonTitle>{{ t('home.welcome') }}</IonTitle>
      </IonToolbar>
      <IonToolbar color="primary">
        <IonSearchbar
          v-model="searchQuery"
          :placeholder="t('home.search_placeholder')"
          @ionChange="searchProviders"
          show-cancel-button="focus"
          animated
        />
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
        <IonRefresherContent />
      </IonRefresher>

      <!-- Popular Services Section -->
      <section class="section">
        <h2 class="section-title">{{ t('home.popular_services') }}</h2>
        <div class="services-grid">
          <template v-if="isLoading">
            <div v-for="i in 6" :key="i" class="service-card skeleton">
              <IonSkeletonText animated style="width: 40px; height: 40px" />
              <IonSkeletonText animated style="width: 80%" />
            </div>
          </template>
          <template v-else>
            <div
              v-for="service in popularServices"
              :key="service.id"
              class="service-card"
              @click="viewService(service.id)"
            >
              <span class="service-icon">{{ service.icon }}</span>
              <span class="service-name">{{ t(`services.${service.name}`) }}</span>
              <span class="service-count">{{ service.count }} {{ t('home.providers') }}</span>
            </div>
          </template>
        </div>
      </section>

      <!-- Nearby Providers Section -->
      <section class="section">
        <h2 class="section-title">{{ t('home.nearby_providers') }}</h2>
        <IonList>
          <template v-if="isLoading">
            <IonItem v-for="i in 3" :key="i">
              <IonAvatar slot="start">
                <IonSkeletonText animated />
              </IonAvatar>
              <IonLabel>
                <IonSkeletonText animated style="width: 60%" />
                <IonSkeletonText animated style="width: 40%" />
              </IonLabel>
            </IonItem>
          </template>
          <template v-else>
            <IonItem
              v-for="provider in nearbyProviders"
              :key="provider.id"
              button
              detail
              @click="viewProvider(provider.id)"
            >
              <IonAvatar slot="start">
                <img
                  v-if="provider.avatar"
                  :src="provider.avatar"
                  :alt="provider.name"
                />
                <div v-else class="avatar-placeholder">
                  {{ provider.name.charAt(0) }}
                </div>
              </IonAvatar>
              <IonLabel>
                <h2>{{ provider.name }}</h2>
                <p>{{ provider.service }}</p>
                <div class="provider-meta">
                  <span class="rating">
                    <IonIcon :icon="star" color="warning" />
                    {{ provider.rating }} ({{ provider.reviews }})
                  </span>
                  <span class="distance">
                    <IonIcon :icon="location" />
                    {{ provider.distance }}
                  </span>
                </div>
              </IonLabel>
            </IonItem>
          </template>
        </IonList>
      </section>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.section {
  padding: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
  color: var(--ion-text-color);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.service-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  background: var(--ion-card-background, white);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.service-card:active {
  transform: scale(0.95);
}

.service-card.skeleton {
  height: 100px;
}

.service-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.service-name {
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: var(--ion-text-color);
}

.service-count {
  font-size: 10px;
  color: var(--ion-color-medium);
  margin-top: 4px;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ion-color-primary);
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.provider-meta {
  display: flex;
  gap: 16px;
  margin-top: 4px;
}

.rating,
.distance {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.rating ion-icon,
.distance ion-icon {
  font-size: 14px;
}
</style>