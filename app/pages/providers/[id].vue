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
  IonChip,
  IonList,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
} from '@ionic/vue'
import { star, checkmarkCircle, call, shareSocial, location, time } from 'ionicons/icons'
import { mockProviders, mockReviews, mockDelay } from '~/utils/mock-data'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const { goBack, router } = useAppNavigation()
const route = useRoute()

// State
const isLoading = ref(true)
const provider = ref<typeof mockProviders[0] | null>(null)
const reviews = ref<typeof mockReviews>([])
const activeTab = ref<'about' | 'services' | 'reviews'>('about')

// Load data
onMounted(async () => {
  await mockDelay(600)

  const providerId = route.params.id as string
  provider.value = mockProviders.find(p => p.id === providerId) || null

  if (provider.value) {
    reviews.value = mockReviews.filter(r => r.providerId === providerId)
  }

  isLoading.value = false
})

const bookProvider = (serviceId?: string) => {
  const query = serviceId ? `?service=${serviceId}` : ''
  router.push(`/book/${route.params.id}${query}`)
}

const contactProvider = () => {
  if (provider.value?.user?.phone) {
    window.location.href = `tel:${provider.value.user.phone}`
  }
}

const shareProvider = async () => {
  if (navigator.share && provider.value) {
    try {
      await navigator.share({
        title: provider.value.user?.name,
        text: `Check out ${provider.value.user?.name} on Indlela!`,
        url: window.location.href,
      })
    } catch (err) {
      // User cancelled or error
    }
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
  })
}
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonButtons slot="start">
          <IonBackButton default-href="/services" @click="goBack('/services', $event)" />
        </IonButtons>
        <IonTitle>{{ t('provider.title') }}</IonTitle>
        <IonButtons slot="end">
          <IonButton @click="shareProvider">
            <IonIcon :icon="shareSocial" />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <!-- Provider Header -->
      <div class="provider-header">
        <template v-if="isLoading">
          <IonSkeletonText animated class="avatar-skeleton" />
          <IonSkeletonText animated style="width: 60%; height: 24px" />
          <IonSkeletonText animated style="width: 40%; height: 16px" />
        </template>
        <template v-else-if="provider">
          <div class="provider-avatar">
            {{ provider.user?.name?.charAt(0) || 'P' }}
          </div>
          <h1 class="provider-name">{{ provider.user?.name }}</h1>
          <div class="provider-badges">
            <IonChip v-if="provider.status === 'verified'" color="success">
              <IonIcon :icon="checkmarkCircle" />
              {{ t('provider.verified') }}
            </IonChip>
          </div>
          <div class="provider-stats">
            <div class="stat">
              <IonIcon :icon="star" color="warning" />
              <span class="stat-value">{{ provider.rating }}</span>
              <span class="stat-label">({{ provider.totalReviews }})</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ provider.totalJobs }}</span>
              <span class="stat-label">{{ t('provider.jobs_completed') }}</span>
            </div>
          </div>
        </template>
      </div>

      <!-- Tab Navigation -->
      <IonSegment v-model="activeTab" class="tab-segment">
        <IonSegmentButton value="about">{{ t('provider.about') }}</IonSegmentButton>
        <IonSegmentButton value="services">{{ t('provider.services') }}</IonSegmentButton>
        <IonSegmentButton value="reviews">{{ t('provider.reviews') }}</IonSegmentButton>
      </IonSegment>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- About Tab -->
        <div v-if="activeTab === 'about'" class="tab-panel">
          <template v-if="isLoading">
            <IonSkeletonText animated style="width: 100%; height: 80px" />
          </template>
          <template v-else-if="provider">
            <div class="about-section">
              <h3>{{ t('provider.about') }}</h3>
              <p>{{ provider.bio }}</p>
            </div>

            <div class="info-section">
              <div class="info-item">
                <IonIcon :icon="location" />
                <span>Service area: {{ provider.serviceRadiusKm }}km radius</span>
              </div>
              <div class="info-item">
                <IonIcon :icon="time" />
                <span>{{ t('provider.member_since') }} {{ formatDate(provider.createdAt) }}</span>
              </div>
            </div>
          </template>
        </div>

        <!-- Services Tab -->
        <div v-if="activeTab === 'services'" class="tab-panel">
          <IonList v-if="!isLoading && provider?.services">
            <IonItem
              v-for="ps in provider.services"
              :key="ps.id"
              button
              @click="bookProvider(ps.serviceId)"
            >
              <div slot="start" class="service-icon">
                {{ ps.service?.icon }}
              </div>
              <IonLabel>
                <h2>{{ ps.service?.name }}</h2>
                <p>{{ ps.duration }} min</p>
              </IonLabel>
              <div slot="end" class="service-price">
                R{{ ps.price }}
              </div>
            </IonItem>
          </IonList>
        </div>

        <!-- Reviews Tab -->
        <div v-if="activeTab === 'reviews'" class="tab-panel">
          <template v-if="isLoading">
            <div v-for="i in 3" :key="i" class="review-skeleton">
              <IonSkeletonText animated style="width: 100%; height: 60px" />
            </div>
          </template>
          <template v-else-if="reviews.length > 0">
            <div v-for="review in reviews" :key="review.id" class="review-card">
              <div class="review-header">
                <div class="review-rating">
                  <IonIcon v-for="i in 5" :key="i" :icon="star" :color="i <= review.rating ? 'warning' : 'medium'" />
                </div>
                <span class="review-date">{{ formatDate(review.createdAt) }}</span>
              </div>
              <p class="review-comment">{{ review.comment }}</p>
              <div v-if="review.response" class="review-response">
                <strong>Response:</strong> {{ review.response }}
              </div>
            </div>
          </template>
          <template v-else>
            <div class="empty-state">
              <p>No reviews yet</p>
            </div>
          </template>
        </div>
      </div>

      <!-- Fixed Bottom Actions -->
      <div class="bottom-actions">
        <IonButton expand="block" color="medium" fill="outline" @click="contactProvider">
          <IonIcon :icon="call" slot="start" />
          {{ t('provider.contact') }}
        </IonButton>
        <IonButton expand="block" color="primary" @click="bookProvider()">
          {{ t('provider.book_now') }}
        </IonButton>
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.provider-header {
  text-align: center;
  padding: 32px 24px;
  background: linear-gradient(180deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
  color: white;
}

.provider-avatar,
.avatar-skeleton {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
  color: var(--ion-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  margin: 0 auto 16px;
}

.provider-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
}

.provider-badges {
  margin-bottom: 12px;
}

.provider-badges ion-chip {
  --background: rgba(255, 255, 255, 0.2);
  --color: white;
}

.provider-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-weight: 600;
}

.stat-label {
  opacity: 0.8;
  font-size: 12px;
}

.tab-segment {
  margin: 16px;
}

.tab-content {
  padding-bottom: 120px;
}

.tab-panel {
  padding: 0 16px;
}

.about-section {
  margin-bottom: 24px;
}

.about-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
}

.about-section p {
  color: var(--ion-color-medium-shade);
  line-height: 1.6;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--ion-color-medium);
}

.info-item ion-icon {
  font-size: 20px;
}

.service-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--ion-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.service-price {
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.review-card {
  background: var(--ion-card-background, white);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.review-rating ion-icon {
  font-size: 16px;
}

.review-date {
  font-size: 12px;
  color: var(--ion-color-medium);
}

.review-comment {
  margin: 0 0 8px;
  line-height: 1.5;
}

.review-response {
  background: var(--ion-color-light);
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--ion-color-medium-shade);
}

.review-skeleton {
  margin-bottom: 12px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--ion-color-medium);
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: var(--ion-background-color, white);
  border-top: 1px solid var(--ion-border-color);
}

.bottom-actions ion-button {
  flex: 1;
}
</style>