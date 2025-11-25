<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonSkeletonText,
} from '@ionic/vue'
import { star, location, chevronForward } from 'ionicons/icons'
import { mockServices, mockProviders, mockDelay } from '~/utils/mock-data'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

// State
const isLoading = ref(true)
const service = ref<typeof mockServices[0] | null>(null)
const providers = ref<typeof mockProviders>([])

// Load data
onMounted(async () => {
  await mockDelay(600)

  const serviceId = route.params.id as string
  service.value = mockServices.find(s => s.id === serviceId) || null

  // Find providers offering this service
  if (service.value) {
    providers.value = mockProviders.filter(p =>
      p.services?.some(s => s.serviceId === serviceId)
    )
  }

  isLoading.value = false
})

const viewProvider = (providerId: string) => {
  router.push(`/providers/${providerId}`)
}

const bookProvider = (providerId: string) => {
  router.push(`/book/${providerId}?service=${route.params.id}`)
}
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonButtons slot="start">
          <IonBackButton default-href="/services" />
        </IonButtons>
        <IonTitle>{{ service?.name || t('services.title') }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <!-- Service Header -->
      <div class="service-header">
        <template v-if="isLoading">
          <IonSkeletonText animated style="width: 64px; height: 64px; border-radius: 16px" />
          <IonSkeletonText animated style="width: 60%; height: 24px" />
          <IonSkeletonText animated style="width: 80%; height: 16px" />
        </template>
        <template v-else-if="service">
          <div class="service-icon">{{ service.icon }}</div>
          <h1 class="service-name">{{ service.name }}</h1>
          <p class="service-description">{{ service.description }}</p>
          <p class="service-price">{{ t('booking.service_fee') }}: From R{{ service.basePrice }}</p>
        </template>
      </div>

      <!-- Providers Section -->
      <section class="providers-section">
        <h2 class="section-title">Available Providers</h2>

        <IonList v-if="isLoading">
          <IonItem v-for="i in 3" :key="i">
            <div slot="start" class="avatar-placeholder">
              <IonSkeletonText animated />
            </div>
            <IonLabel>
              <IonSkeletonText animated style="width: 50%" />
              <IonSkeletonText animated style="width: 70%" />
            </IonLabel>
          </IonItem>
        </IonList>

        <IonList v-else-if="providers.length > 0">
          <IonItem
            v-for="provider in providers"
            :key="provider.id"
            class="provider-item"
          >
            <div slot="start" class="provider-avatar" @click="viewProvider(provider.id)">
              {{ provider.user?.name?.charAt(0) || 'P' }}
            </div>
            <IonLabel @click="viewProvider(provider.id)">
              <h2>{{ provider.user?.name }}</h2>
              <div class="provider-stats">
                <span class="rating">
                  <IonIcon :icon="star" color="warning" />
                  {{ provider.rating }} ({{ provider.totalReviews }})
                </span>
                <span class="jobs">{{ provider.totalJobs }} jobs</span>
              </div>
              <p class="provider-price">
                R{{ provider.services?.find(s => s.serviceId === service?.id)?.price || service?.basePrice }}
              </p>
            </IonLabel>
            <IonButton
              slot="end"
              color="primary"
              @click="bookProvider(provider.id)"
            >
              {{ t('provider.book_now') }}
            </IonButton>
          </IonItem>
        </IonList>

        <div v-else class="empty-state">
          <p>No providers available for this service yet.</p>
        </div>
      </section>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.service-header {
  text-align: center;
  padding: 32px 24px;
  background: linear-gradient(180deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
  color: white;
}

.service-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.service-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
}

.service-description {
  font-size: 14px;
  opacity: 0.9;
  margin: 0 0 12px;
}

.service-price {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.providers-section {
  padding: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
  color: var(--ion-text-color);
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
  cursor: pointer;
}

.avatar-placeholder {
  background: var(--ion-color-light);
}

.provider-item ion-label {
  cursor: pointer;
}

.provider-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--ion-color-medium);
  margin: 4px 0;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating ion-icon {
  font-size: 14px;
}

.provider-price {
  color: var(--ion-color-primary);
  font-weight: 600;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--ion-color-medium);
}
</style>