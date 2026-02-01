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
  IonChip,
  IonButton,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
  IonButtons,
} from '@ionic/vue'
import { calendar, time, location, checkmark, close, arrowBack } from 'ionicons/icons'
import { mockBookings, mockProviders, mockDelay } from '~/utils/mock-data'

definePageMeta({
  layout: 'provider',
  middleware: 'provider',
})

const { t } = useI18n()
const router = useRouter()

// Mock current provider (would come from auth in real app)
const currentProvider = mockProviders[0]

// State
const isLoading = ref(true)
const filter = ref<'pending' | 'upcoming' | 'completed'>('pending')
const jobs = ref<typeof mockBookings>([])
const showRescheduleModal = ref(false)
const selectedJobForReschedule = ref<typeof mockBookings[0] | null>(null)

// Computed
const filteredJobs = computed(() => {
  return jobs.value.filter(job => {
    if (filter.value === 'pending') {
      return job.status === 'pending'
    } else if (filter.value === 'upcoming') {
      return ['accepted', 'in_progress'].includes(job.status)
    } else {
      return ['completed', 'cancelled'].includes(job.status)
    }
  })
})

const pendingCount = computed(() => jobs.value.filter(j => j.status === 'pending').length)

// Load data
onMounted(async () => {
  await mockDelay(600)
  // Filter bookings for current provider
  jobs.value = mockBookings.filter(b => b.providerId === currentProvider.id)
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
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const acceptJob = (jobId: string) => {
  const job = jobs.value.find(j => j.id === jobId)
  if (job) {
    job.status = 'accepted'
  }
}

const declineJob = (jobId: string) => {
  const job = jobs.value.find(j => j.id === jobId)
  if (job) {
    job.status = 'cancelled'
  }
}

const rescheduleJob = (job: typeof mockBookings[0]) => {
  selectedJobForReschedule.value = job
  showRescheduleModal.value = true
}

const handleJobRescheduled = (updatedJob: typeof mockBookings[0]) => {
  const index = jobs.value.findIndex(j => j.id === updatedJob.id)
  if (index !== -1) {
    jobs.value[index] = updatedJob
  }
  selectedJobForReschedule.value = null
  showRescheduleModal.value = false
}

const viewJob = (jobId: string) => {
  router.push(`/provider-dashboard/jobs/${jobId}`)
}

const goBack = () => {
  router.push('/settings')
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    accepted: 'primary',
    in_progress: 'tertiary',
    completed: 'success',
    cancelled: 'danger',
  }
  return colors[status] || 'medium'
}
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonButtons slot="start">
          <IonButton @click="goBack">
            <IonIcon :icon="arrowBack" />
          </IonButton>
        </IonButtons>
        <IonTitle>{{ t('provider.nav.jobs') }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
        <IonRefresherContent />
      </IonRefresher>

      <!-- Stats Summary -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">New Requests</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ currentProvider.totalJobs }}</span>
          <span class="stat-label">Total Jobs</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ currentProvider.rating }}</span>
          <span class="stat-label">Rating</span>
        </div>
      </div>

      <!-- Filter Segment -->
      <IonSegment v-model="filter" class="filter-segment">
        <IonSegmentButton value="pending">
          New ({{ pendingCount }})
        </IonSegmentButton>
        <IonSegmentButton value="upcoming">Upcoming</IonSegmentButton>
        <IonSegmentButton value="completed">Past</IonSegmentButton>
      </IonSegment>

      <!-- Jobs List -->
      <IonList v-if="isLoading" class="jobs-list">
        <IonItem v-for="i in 3" :key="i">
          <IonLabel>
            <IonSkeletonText animated style="width: 60%" />
            <IonSkeletonText animated style="width: 40%" />
            <IonSkeletonText animated style="width: 50%" />
          </IonLabel>
        </IonItem>
      </IonList>

      <IonList v-else-if="filteredJobs.length > 0" class="jobs-list">
        <div v-for="job in filteredJobs" :key="job.id" class="job-card">
          <div class="job-header" @click="viewJob(job.id)">
            <div>
              <h3>{{ job.service?.name }}</h3>
              <IonChip :color="getStatusColor(job.status)" class="status-chip">
                {{ t(`booking.status.${job.status}`) }}
              </IonChip>
            </div>
            <span class="job-amount">R{{ job.quotedAmount }}</span>
          </div>

          <div class="job-details" @click="viewJob(job.id)">
            <div class="detail-row">
              <IonIcon :icon="calendar" />
              <span>{{ formatDate(job.scheduledAt) }} at {{ formatTime(job.scheduledAt) }}</span>
            </div>
            <div class="detail-row">
              <IonIcon :icon="location" />
              <span>{{ job.location?.township }}, {{ job.location?.city }}</span>
            </div>
          </div>

          <div v-if="job.customerNotes" class="job-notes">
            <strong>Notes:</strong> {{ job.customerNotes }}
          </div>

          <!-- Action Buttons for Pending Jobs -->
          <div v-if="job.status === 'pending'" class="job-actions">
            <IonButton fill="outline" color="danger" @click="declineJob(job.id)">
              <IonIcon :icon="close" slot="start" />
              Decline
            </IonButton>
            <IonButton fill="outline" @click="rescheduleJob(job)">
              <IonIcon :icon="calendar" slot="start" />
              {{ t('booking.actions.reschedule') }}
            </IonButton>
            <IonButton color="success" @click="acceptJob(job.id)">
              <IonIcon :icon="checkmark" slot="start" />
              Accept
            </IonButton>
          </div>

          <!-- Action Buttons for Accepted Jobs -->
          <div v-else-if="job.status === 'accepted'" class="job-actions">
            <IonButton fill="outline" @click="rescheduleJob(job)">
              <IonIcon :icon="calendar" slot="start" />
              {{ t('booking.actions.reschedule') }}
            </IonButton>
            <IonButton color="primary" @click="viewJob(job.id)">
              Start Job
            </IonButton>
          </div>
        </div>
      </IonList>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p v-if="filter === 'pending'">No new job requests</p>
        <p v-else-if="filter === 'upcoming'">No upcoming jobs</p>
        <p v-else>No past jobs</p>
      </div>

      <!-- Reschedule Modal -->
      <RescheduleModal
        v-if="selectedJobForReschedule"
        v-model="showRescheduleModal"
        :booking="selectedJobForReschedule"
        user-role="provider"
        @rescheduled="handleJobRescheduled"
      />
    </IonContent>
  </IonPage>
</template>

<style scoped>
.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background: linear-gradient(180deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
  color: white;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.filter-segment {
  margin: 16px;
}

.jobs-list {
  padding: 0 16px;
}

.job-card {
  background: var(--ion-card-background, white);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  cursor: pointer;
}

.job-header h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.status-chip {
  height: 24px;
  font-size: 11px;
}

.job-amount {
  font-size: 18px;
  font-weight: 700;
  color: var(--ion-color-primary);
}

.job-details {
  cursor: pointer;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--ion-color-medium-shade);
}

.detail-row ion-icon {
  font-size: 18px;
  color: var(--ion-color-medium);
}

.job-notes {
  background: var(--ion-color-light);
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 12px;
}

.job-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--ion-border-color);
}

.job-actions ion-button {
  flex: 1 1 auto;
  min-width: 80px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--ion-color-medium);
}
</style>