<script setup lang="ts">
import {
  IonIcon,
  IonButton,
} from '@ionic/vue'
import { download, calendar, trendingUp, people, cash, documentText } from 'ionicons/icons'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const selectedPeriod = ref('month')

const periods = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
]

const reports = [
  {
    id: 'revenue',
    title: 'Revenue Report',
    description: 'Detailed breakdown of platform revenue, commissions, and payouts',
    icon: cash,
    color: 'success',
  },
  {
    id: 'users',
    title: 'User Growth Report',
    description: 'New registrations, active users, and retention metrics',
    icon: people,
    color: 'primary',
  },
  {
    id: 'bookings',
    title: 'Bookings Report',
    description: 'Booking volume, completion rates, and popular services',
    icon: calendar,
    color: 'tertiary',
  },
  {
    id: 'providers',
    title: 'Provider Performance',
    description: 'Provider ratings, job completion, and earnings',
    icon: trendingUp,
    color: 'warning',
  },
]

const recentReports = ref([
  { name: 'Revenue Report - January 2024', date: '2024-01-31', size: '245 KB' },
  { name: 'User Growth Report - Q4 2023', date: '2024-01-05', size: '189 KB' },
  { name: 'Bookings Report - December 2023', date: '2023-12-31', size: '312 KB' },
])

const generateReport = (reportId: string) => {
  alert(`Generating ${reportId} report for ${selectedPeriod.value}...`)
}

const downloadReport = (reportName: string) => {
  alert(`Downloading ${reportName}...`)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="admin-reports">
    <div class="page-header">
      <h2>Reports</h2>
    </div>

    <!-- Period Selector -->
    <div class="period-selector">
      <span class="period-label">Report Period:</span>
      <div class="period-options">
        <button
          v-for="period in periods"
          :key="period.value"
          class="period-option"
          :class="{ active: selectedPeriod === period.value }"
          @click="selectedPeriod = period.value"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <!-- Report Types -->
    <div class="reports-section">
      <h3>Generate Report</h3>
      <div class="reports-grid">
        <div v-for="report in reports" :key="report.id" class="report-card">
          <div class="report-icon" :class="report.color">
            <IonIcon :icon="report.icon" />
          </div>
          <div class="report-info">
            <h4>{{ report.title }}</h4>
            <p>{{ report.description }}</p>
          </div>
          <IonButton size="small" fill="outline" @click="generateReport(report.id)">
            Generate
          </IonButton>
        </div>
      </div>
    </div>

    <!-- Recent Reports -->
    <div class="recent-section">
      <h3>Recent Reports</h3>
      <div class="recent-list">
        <div v-for="report in recentReports" :key="report.name" class="recent-item">
          <div class="recent-icon">
            <IonIcon :icon="documentText" />
          </div>
          <div class="recent-info">
            <h4>{{ report.name }}</h4>
            <span class="recent-meta">{{ formatDate(report.date) }} · {{ report.size }}</span>
          </div>
          <button class="download-btn" @click="downloadReport(report.name)">
            <IonIcon :icon="download" />
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="stats-section">
      <h3>Quick Stats</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">R125,400</span>
          <span class="stat-label">Total Revenue</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">R15,048</span>
          <span class="stat-label">Commission Earned</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">159</span>
          <span class="stat-label">Total Bookings</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">94%</span>
          <span class="stat-label">Completion Rate</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-reports h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.page-header {
  margin-bottom: 16px;
}

.period-selector {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.period-label {
  display: block;
  font-size: 13px;
  color: var(--ion-color-medium);
  margin-bottom: 12px;
}

.period-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.period-option {
  padding: 8px 16px;
  background: var(--ion-color-light);
  border: 1px solid var(--ion-border-color);
  border-radius: 20px;
  font-size: 13px;
  color: var(--ion-color-medium-shade);
  cursor: pointer;
  transition: all 0.2s;
}

.period-option.active {
  background: var(--ion-color-danger);
  border-color: var(--ion-color-danger);
  color: white;
}

.reports-section,
.recent-section,
.stats-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.reports-section h3,
.recent-section h3,
.stats-section h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
}

.reports-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--ion-color-light);
  border-radius: 12px;
}

.report-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.report-icon ion-icon {
  font-size: 22px;
  color: white;
}

.report-icon.success { background: var(--ion-color-success); }
.report-icon.primary { background: var(--ion-color-primary); }
.report-icon.tertiary { background: var(--ion-color-tertiary); }
.report-icon.warning { background: var(--ion-color-warning); }

.report-info {
  flex: 1;
  min-width: 0;
}

.report-info h4 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
}

.report-info p {
  margin: 0;
  font-size: 12px;
  color: var(--ion-color-medium);
  line-height: 1.3;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recent-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--ion-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.recent-icon ion-icon {
  font-size: 20px;
  color: var(--ion-color-medium);
}

.recent-info {
  flex: 1;
}

.recent-info h4 {
  margin: 0 0 2px;
  font-size: 14px;
  font-weight: 500;
}

.recent-meta {
  font-size: 12px;
  color: var(--ion-color-medium);
}

.download-btn {
  background: var(--ion-color-primary);
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.download-btn ion-icon {
  font-size: 18px;
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  background: var(--ion-color-light);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: var(--ion-text-color);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--ion-color-medium);
}
</style>