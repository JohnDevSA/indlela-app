<script setup lang="ts">
import {
  IonSearchbar,
  IonIcon,
  IonChip,
} from '@ionic/vue'
import { calendar, time, location, ellipsisVertical } from 'ionicons/icons'
import { mockBookings } from '~/utils/mock-data'

definePageMeta({
  layout: 'admin',
})

const searchQuery = ref('')
const filter = ref<'all' | 'pending' | 'active' | 'completed'>('all')

// Extend mock bookings for admin view
const bookings = ref([
  ...mockBookings,
  {
    id: 'book-admin-1',
    customerId: 'cust-002',
    customerName: 'John Doe',
    providerId: 'prov-2',
    providerName: 'Sipho Ndlovu',
    serviceId: 'srv-4',
    serviceName: 'Plumbing',
    status: 'in_progress',
    scheduledAt: new Date().toISOString(),
    quotedAmount: 450,
    location: { township: 'Soweto', city: 'Johannesburg' },
  },
  {
    id: 'book-admin-2',
    customerId: 'cust-003',
    customerName: 'Jane Smith',
    providerId: 'prov-3',
    providerName: 'Nomsa Dlamini',
    serviceId: 'srv-5',
    serviceName: 'Electrical',
    status: 'pending',
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    quotedAmount: 500,
    location: { township: 'Orlando', city: 'Johannesburg' },
  },
])

const filteredBookings = computed(() => {
  let result = bookings.value

  if (filter.value !== 'all') {
    if (filter.value === 'active') {
      result = result.filter(b => ['accepted', 'in_progress'].includes(b.status))
    } else {
      result = result.filter(b => b.status === filter.value)
    }
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(b =>
      b.id.toLowerCase().includes(query) ||
      (b.provider?.user?.name || b.providerName || '').toLowerCase().includes(query) ||
      (b.service?.name || b.serviceName || '').toLowerCase().includes(query)
    )
  }

  return result
})

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getServiceName = (booking: any) => {
  return booking.service?.name || booking.serviceName || 'Unknown Service'
}

const getProviderName = (booking: any) => {
  return booking.provider?.user?.name || booking.providerName || 'Unknown Provider'
}

const getLocation = (booking: any) => {
  if (booking.location) {
    return `${booking.location.township}, ${booking.location.city}`
  }
  return 'Unknown Location'
}
</script>

<template>
  <div class="admin-bookings">
    <div class="page-header">
      <h2>Bookings Management</h2>
      <span class="count">{{ bookings.length }} total</span>
    </div>

    <IonSearchbar
      v-model="searchQuery"
      placeholder="Search bookings..."
      class="search-bar"
    />

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button
        class="filter-tab"
        :class="{ active: filter === 'all' }"
        @click="filter = 'all'"
      >
        All
      </button>
      <button
        class="filter-tab"
        :class="{ active: filter === 'pending' }"
        @click="filter = 'pending'"
      >
        Pending
      </button>
      <button
        class="filter-tab"
        :class="{ active: filter === 'active' }"
        @click="filter = 'active'"
      >
        Active
      </button>
      <button
        class="filter-tab"
        :class="{ active: filter === 'completed' }"
        @click="filter = 'completed'"
      >
        Completed
      </button>
    </div>

    <!-- Bookings List -->
    <div class="bookings-list">
      <div v-for="booking in filteredBookings" :key="booking.id" class="booking-card">
        <div class="booking-header">
          <div>
            <h3>{{ getServiceName(booking) }}</h3>
            <span class="booking-id">#{{ booking.id.toUpperCase() }}</span>
          </div>
          <IonChip :color="getStatusColor(booking.status)" class="status-chip">
            {{ booking.status }}
          </IonChip>
        </div>

        <div class="booking-parties">
          <div class="party">
            <span class="party-label">Provider</span>
            <span class="party-name">{{ getProviderName(booking) }}</span>
          </div>
          <div class="party">
            <span class="party-label">Customer</span>
            <span class="party-name">{{ booking.customerName || 'Customer' }}</span>
          </div>
        </div>

        <div class="booking-details">
          <span class="detail">
            <IonIcon :icon="calendar" />
            {{ formatDate(booking.scheduledAt) }}
          </span>
          <span class="detail">
            <IonIcon :icon="time" />
            {{ formatTime(booking.scheduledAt) }}
          </span>
          <span class="detail">
            <IonIcon :icon="location" />
            {{ getLocation(booking) }}
          </span>
        </div>

        <div class="booking-footer">
          <span class="amount">R{{ booking.quotedAmount }}</span>
          <button class="action-btn">
            <IonIcon :icon="ellipsisVertical" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-bookings h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.count {
  font-size: 14px;
  color: var(--ion-color-medium);
}

.search-bar {
  --background: white;
  --border-radius: 12px;
  margin-bottom: 12px;
  padding: 0;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tab {
  padding: 8px 16px;
  background: white;
  border: 1px solid var(--ion-border-color);
  border-radius: 20px;
  font-size: 13px;
  color: var(--ion-color-medium-shade);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-tab.active {
  background: var(--ion-color-danger);
  border-color: var(--ion-color-danger);
  color: white;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.booking-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.booking-header h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
}

.booking-id {
  font-size: 12px;
  color: var(--ion-color-medium);
  font-family: monospace;
}

.status-chip {
  height: 22px;
  font-size: 10px;
}

.booking-parties {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--ion-border-color);
}

.party {
  display: flex;
  flex-direction: column;
}

.party-label {
  font-size: 11px;
  color: var(--ion-color-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.party-name {
  font-size: 14px;
  font-weight: 500;
}

.booking-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.detail {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--ion-color-medium-shade);
}

.detail ion-icon {
  font-size: 16px;
  color: var(--ion-color-medium);
}

.booking-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--ion-border-color);
}

.amount {
  font-size: 18px;
  font-weight: 700;
  color: var(--ion-color-primary);
}

.action-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: var(--ion-color-medium);
}

.action-btn ion-icon {
  font-size: 20px;
}
</style>