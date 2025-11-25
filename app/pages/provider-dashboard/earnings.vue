<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/vue'
import { wallet, trendingUp, calendar, cashOutline } from 'ionicons/icons'
import { mockBookings, mockProviders, mockDelay } from '~/utils/mock-data'

definePageMeta({
  layout: 'provider',
})

const { t } = useI18n()

// Mock current provider
const currentProvider = mockProviders[0]

// State
const isLoading = ref(true)
const period = ref<'week' | 'month' | 'year'>('week')
const transactions = ref<typeof mockBookings>([])

// Computed earnings
const completedJobs = computed(() =>
  transactions.value.filter(t => t.status === 'completed')
)

const totalEarnings = computed(() =>
  completedJobs.value.reduce((sum, job) => sum + (job.providerPayout || 0), 0)
)

const totalJobs = computed(() => completedJobs.value.length)

const averagePerJob = computed(() =>
  totalJobs.value > 0 ? Math.round(totalEarnings.value / totalJobs.value) : 0
)

const pendingPayout = computed(() =>
  transactions.value
    .filter(t => t.status === 'completed' && !t.paidOut)
    .reduce((sum, job) => sum + (job.providerPayout || 0), 0)
)

// Load data
onMounted(async () => {
  await mockDelay(600)
  transactions.value = mockBookings.filter(b => b.providerId === currentProvider.id)
  isLoading.value = false
})

// Methods
const handleRefresh = async (event: any) => {
  await mockDelay(800)
  event.target?.complete()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
  })
}

const requestPayout = () => {
  // In real app, would trigger payout request
  alert('Payout requested! You will receive your funds within 24 hours.')
}
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonTitle>{{ t('provider.nav.earnings') }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
        <IonRefresherContent />
      </IonRefresher>

      <!-- Earnings Summary -->
      <div class="earnings-header">
        <div class="balance-card">
          <span class="balance-label">Available Balance</span>
          <span class="balance-amount">R{{ pendingPayout }}</span>
          <IonButton
            v-if="pendingPayout > 0"
            size="small"
            fill="outline"
            class="payout-button"
            @click="requestPayout"
          >
            <IonIcon :icon="cashOutline" slot="start" />
            Request Payout
          </IonButton>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <IonIcon :icon="wallet" color="primary" />
          <span class="stat-value">R{{ totalEarnings }}</span>
          <span class="stat-label">Total Earnings</span>
        </div>
        <div class="stat-card">
          <IonIcon :icon="trendingUp" color="success" />
          <span class="stat-value">{{ totalJobs }}</span>
          <span class="stat-label">Jobs Completed</span>
        </div>
        <div class="stat-card">
          <IonIcon :icon="calendar" color="tertiary" />
          <span class="stat-value">R{{ averagePerJob }}</span>
          <span class="stat-label">Avg per Job</span>
        </div>
      </div>

      <!-- Period Filter -->
      <IonSegment v-model="period" class="period-segment">
        <IonSegmentButton value="week">This Week</IonSegmentButton>
        <IonSegmentButton value="month">This Month</IonSegmentButton>
        <IonSegmentButton value="year">This Year</IonSegmentButton>
      </IonSegment>

      <!-- Transactions List -->
      <div class="transactions-section">
        <h3>Recent Transactions</h3>

        <IonList v-if="isLoading">
          <IonItem v-for="i in 3" :key="i">
            <IonLabel>
              <IonSkeletonText animated style="width: 60%" />
              <IonSkeletonText animated style="width: 40%" />
            </IonLabel>
          </IonItem>
        </IonList>

        <IonList v-else-if="completedJobs.length > 0">
          <IonItem v-for="job in completedJobs" :key="job.id">
            <div slot="start" class="transaction-icon">
              <IonIcon :icon="wallet" color="success" />
            </div>
            <IonLabel>
              <h2>{{ job.service?.name }}</h2>
              <p>{{ formatDate(job.completedAt || job.scheduledAt) }}</p>
            </IonLabel>
            <div slot="end" class="transaction-amount">
              <span class="amount">+R{{ job.providerPayout }}</span>
              <span class="commission">-R{{ job.commissionAmount }} commission</span>
            </div>
          </IonItem>
        </IonList>

        <div v-else class="empty-state">
          <p>No transactions yet</p>
        </div>
      </div>

      <!-- Commission Info -->
      <div class="commission-info">
        <IonIcon :icon="informationCircle" />
        <p>
          Indlela charges a 12% commission on each booking. This is paid by customers
          and helps us maintain the platform.
        </p>
      </div>
    </IonContent>
  </IonPage>
</template>

<script lang="ts">
import { informationCircle } from 'ionicons/icons'
export default {
  data() {
    return { informationCircle }
  }
}
</script>

<style scoped>
.earnings-header {
  background: linear-gradient(180deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
  padding: 24px;
}

.balance-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  color: white;
}

.balance-label {
  display: block;
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.balance-amount {
  display: block;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
}

.payout-button {
  --color: white;
  --border-color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px;
  margin-top: -20px;
}

.stat-card {
  background: var(--ion-card-background, white);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stat-card ion-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.stat-card .stat-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--ion-text-color);
}

.stat-card .stat-label {
  font-size: 11px;
  color: var(--ion-color-medium);
}

.period-segment {
  margin: 0 16px 16px;
}

.transactions-section {
  padding: 0 16px;
}

.transactions-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(45, 211, 111, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.transaction-icon ion-icon {
  font-size: 20px;
}

.transaction-amount {
  text-align: right;
}

.amount {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-color-success);
}

.commission {
  font-size: 11px;
  color: var(--ion-color-medium);
}

.commission-info {
  display: flex;
  gap: 12px;
  margin: 24px 16px;
  padding: 16px;
  background: var(--ion-color-light);
  border-radius: 12px;
}

.commission-info ion-icon {
  font-size: 24px;
  color: var(--ion-color-medium);
  flex-shrink: 0;
}

.commission-info p {
  margin: 0;
  font-size: 13px;
  color: var(--ion-color-medium-shade);
  line-height: 1.5;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--ion-color-medium);
}
</style>