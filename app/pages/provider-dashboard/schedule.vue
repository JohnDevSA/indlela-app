<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonChip,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/vue'
import { calendar, time, location, person } from 'ionicons/icons'
import { mockBookings, mockProviders, mockDelay } from '~/utils/mock-data'

definePageMeta({
  layout: 'provider',
})

const { t } = useI18n()
const router = useRouter()

// Mock current provider
const currentProvider = mockProviders[0]

// State
const isLoading = ref(true)
const jobs = ref<typeof mockBookings>([])

// Computed - group jobs by date
const upcomingJobs = computed(() => {
  return jobs.value
    .filter(job => ['accepted', 'in_progress'].includes(job.status))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
})

const jobsByDate = computed(() => {
  const grouped: Record<string, typeof mockBookings> = {}

  upcomingJobs.value.forEach(job => {
    const dateKey = new Date(job.scheduledAt).toLocaleDateString('en-ZA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })

    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(job)
  })

  return grouped
})

// Load data
onMounted(async () => {
  await mockDelay(600)
  jobs.value = mockBookings.filter(b => b.providerId === currentProvider.id)
  isLoading.value = false
})

// Methods
const handleRefresh = async (event: any) => {
  await mockDelay(800)
  event.target?.complete()
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const viewJob = (jobId: string) => {
  router.push(`/provider-dashboard/jobs/${jobId}`)
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    accepted: 'primary',
    in_progress: 'tertiary',
  }
  return colors[status] || 'medium'
}

const isToday = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonTitle>{{ t('provider.nav.schedule') }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
        <IonRefresherContent />
      </IonRefresher>

      <!-- Calendar Overview -->
      <div class="schedule-header">
        <IonIcon :icon="calendar" />
        <span>{{ upcomingJobs.length }} upcoming jobs</span>
      </div>

      <!-- Loading State -->
      <template v-if="isLoading">
        <div class="date-section" v-for="i in 2" :key="i">
          <IonSkeletonText animated style="width: 40%; height: 20px; margin: 16px" />
          <IonItem v-for="j in 2" :key="j">
            <IonLabel>
              <IonSkeletonText animated style="width: 60%" />
              <IonSkeletonText animated style="width: 40%" />
            </IonLabel>
          </IonItem>
        </div>
      </template>

      <!-- Jobs by Date -->
      <template v-else-if="Object.keys(jobsByDate).length > 0">
        <div
          v-for="(dateJobs, dateKey) in jobsByDate"
          :key="dateKey"
          class="date-section"
        >
          <h3 class="date-header">
            {{ dateKey }}
            <IonChip v-if="isToday(dateJobs[0].scheduledAt)" color="primary" class="today-chip">
              Today
            </IonChip>
          </h3>

          <div
            v-for="job in dateJobs"
            :key="job.id"
            class="schedule-card"
            @click="viewJob(job.id)"
          >
            <div class="time-slot">
              <IonIcon :icon="time" />
              <span>{{ formatTime(job.scheduledAt) }}</span>
            </div>

            <div class="job-info">
              <div class="job-header">
                <h4>{{ job.service?.name }}</h4>
                <IonChip :color="getStatusColor(job.status)" class="status-chip">
                  {{ t(`booking.status.${job.status}`) }}
                </IonChip>
              </div>

              <div class="job-details">
                <div class="detail-item">
                  <IonIcon :icon="location" />
                  <span>{{ job.location?.township }}, {{ job.location?.city }}</span>
                </div>
              </div>

              <div class="job-footer">
                <span class="job-amount">R{{ job.quotedAmount }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <IonIcon :icon="calendar" class="empty-icon" />
        <h3>No Upcoming Jobs</h3>
        <p>Your schedule is clear. Accept some job requests to fill it up!</p>
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.schedule-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  background: linear-gradient(180deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
  color: white;
  font-size: 16px;
}

.schedule-header ion-icon {
  font-size: 24px;
}

.date-section {
  padding: 0 16px;
}

.date-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 12px;
  color: var(--ion-text-color);
}

.today-chip {
  height: 24px;
  font-size: 11px;
}

.schedule-card {
  display: flex;
  gap: 16px;
  background: var(--ion-card-background, white);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.time-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 12px;
  background: var(--ion-color-primary);
  color: white;
  border-radius: 8px;
}

.time-slot ion-icon {
  font-size: 16px;
  margin-bottom: 4px;
}

.time-slot span {
  font-size: 14px;
  font-weight: 600;
}

.job-info {
  flex: 1;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.job-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.status-chip {
  height: 22px;
  font-size: 10px;
}

.job-details {
  margin-bottom: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--ion-color-medium-shade);
}

.detail-item ion-icon {
  font-size: 16px;
  color: var(--ion-color-medium);
}

.job-footer {
  display: flex;
  justify-content: flex-end;
}

.job-amount {
  font-size: 16px;
  font-weight: 700;
  color: var(--ion-color-primary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
}

.empty-state p {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin: 0;
}
</style>