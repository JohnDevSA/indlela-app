<script setup lang="ts">
import {
  IonIcon,
} from '@ionic/vue'
import { people, briefcase, calendar, cash, trendingUp, trendingDown } from 'ionicons/icons'
import { mockProviders, mockBookings, mockUser } from '~/utils/mock-data'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

// Mock admin stats
const stats = ref({
  totalUsers: 1247,
  totalProviders: mockProviders.length + 42,
  totalBookings: mockBookings.length + 156,
  revenue: 125400,
  growth: {
    users: 12.5,
    providers: 8.3,
    bookings: 23.1,
    revenue: 15.7,
  },
})

const recentActivity = ref([
  { type: 'user', message: 'New user registered: Thabo M.', time: '2 min ago' },
  { type: 'booking', message: 'Booking #1234 completed', time: '5 min ago' },
  { type: 'provider', message: 'Provider Thandi M. verified', time: '12 min ago' },
  { type: 'booking', message: 'New booking #1235 created', time: '18 min ago' },
  { type: 'user', message: 'User Sipho N. updated profile', time: '25 min ago' },
])

const getActivityIcon = (type: string) => {
  const icons: Record<string, any> = {
    user: people,
    provider: briefcase,
    booking: calendar,
  }
  return icons[type] || people
}
</script>

<template>
  <div class="admin-dashboard">
    <h2>Dashboard Overview</h2>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon users">
          <IonIcon :icon="people" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalUsers.toLocaleString() }}</span>
          <span class="stat-label">Total Users</span>
          <span class="stat-growth positive">
            <IonIcon :icon="trendingUp" />
            {{ stats.growth.users }}%
          </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon providers">
          <IonIcon :icon="briefcase" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalProviders }}</span>
          <span class="stat-label">Providers</span>
          <span class="stat-growth positive">
            <IonIcon :icon="trendingUp" />
            {{ stats.growth.providers }}%
          </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bookings">
          <IonIcon :icon="calendar" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalBookings }}</span>
          <span class="stat-label">Bookings</span>
          <span class="stat-growth positive">
            <IonIcon :icon="trendingUp" />
            {{ stats.growth.bookings }}%
          </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon revenue">
          <IonIcon :icon="cash" />
        </div>
        <div class="stat-info">
          <span class="stat-value">R{{ stats.revenue.toLocaleString() }}</span>
          <span class="stat-label">Revenue</span>
          <span class="stat-growth positive">
            <IonIcon :icon="trendingUp" />
            {{ stats.growth.revenue }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="activity-section">
      <h3>Recent Activity</h3>
      <div class="activity-list">
        <div v-for="(activity, index) in recentActivity" :key="index" class="activity-item">
          <div class="activity-icon" :class="activity.type">
            <IonIcon :icon="getActivityIcon(activity.type)" />
          </div>
          <div class="activity-content">
            <p class="activity-message">{{ activity.message }}</p>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h3>Quick Actions</h3>
      <div class="actions-grid">
        <button class="action-button" @click="$router.push('/admin/users')">
          <IonIcon :icon="people" />
          <span>Manage Users</span>
        </button>
        <button class="action-button" @click="$router.push('/admin/providers')">
          <IonIcon :icon="briefcase" />
          <span>Review Providers</span>
        </button>
        <button class="action-button" @click="$router.push('/admin/bookings')">
          <IonIcon :icon="calendar" />
          <span>View Bookings</span>
        </button>
        <button class="action-button" @click="$router.push('/admin/reports')">
          <IonIcon :icon="trendingUp" />
          <span>Generate Report</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard h2 {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon ion-icon {
  font-size: 24px;
  color: white;
}

.stat-icon.users { background: var(--ion-color-primary); }
.stat-icon.providers { background: var(--ion-color-success); }
.stat-icon.bookings { background: var(--ion-color-tertiary); }
.stat-icon.revenue { background: var(--ion-color-warning); }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--ion-text-color);
}

.stat-label {
  font-size: 12px;
  color: var(--ion-color-medium);
}

.stat-growth {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  margin-top: 4px;
}

.stat-growth.positive {
  color: var(--ion-color-success);
}

.stat-growth.negative {
  color: var(--ion-color-danger);
}

.stat-growth ion-icon {
  font-size: 12px;
}

.activity-section,
.quick-actions {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.activity-section h3,
.quick-actions h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon ion-icon {
  font-size: 16px;
  color: white;
}

.activity-icon.user { background: var(--ion-color-primary); }
.activity-icon.provider { background: var(--ion-color-success); }
.activity-icon.booking { background: var(--ion-color-tertiary); }

.activity-content {
  flex: 1;
}

.activity-message {
  margin: 0;
  font-size: 14px;
  color: var(--ion-text-color);
}

.activity-time {
  font-size: 12px;
  color: var(--ion-color-medium);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: var(--ion-color-light);
  border: 1px solid var(--ion-border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button ion-icon {
  font-size: 24px;
  color: var(--ion-color-danger);
}

.action-button span {
  font-size: 12px;
  font-weight: 500;
  color: var(--ion-text-color);
}

.action-button:active {
  transform: scale(0.98);
}
</style>