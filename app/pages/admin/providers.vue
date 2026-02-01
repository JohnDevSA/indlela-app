<script setup lang="ts">
import {
  IonSearchbar,
  IonIcon,
  IonChip,
  IonButton,
} from '@ionic/vue'
import { star, checkmarkCircle, time, ellipsisVertical } from 'ionicons/icons'
import { mockProviders } from '~/utils/mock-data'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const searchQuery = ref('')
const filter = ref<'all' | 'pending' | 'verified'>('all')

// Add some pending providers for demo
const providers = ref([
  ...mockProviders,
  {
    id: 'prov-pending-1',
    userId: 'user-pending-1',
    user: { id: 'user-pending-1', phone: '+27891234567', name: 'New Provider 1', role: 'provider', locale: 'en', createdAt: '2024-01-22T00:00:00Z', updatedAt: '2024-01-22T00:00:00Z' },
    bio: 'Experienced house painter looking to join Indlela.',
    rating: 0,
    totalReviews: 0,
    totalJobs: 0,
    status: 'pending',
    serviceRadiusKm: 10,
    services: [],
    createdAt: '2024-01-22T00:00:00Z',
    updatedAt: '2024-01-22T00:00:00Z',
  },
  {
    id: 'prov-pending-2',
    userId: 'user-pending-2',
    user: { id: 'user-pending-2', phone: '+27892234567', name: 'New Provider 2', role: 'provider', locale: 'zu', createdAt: '2024-01-21T00:00:00Z', updatedAt: '2024-01-21T00:00:00Z' },
    bio: 'Professional tutor with teaching degree.',
    rating: 0,
    totalReviews: 0,
    totalJobs: 0,
    status: 'pending',
    serviceRadiusKm: 8,
    services: [],
    createdAt: '2024-01-21T00:00:00Z',
    updatedAt: '2024-01-21T00:00:00Z',
  },
])

const filteredProviders = computed(() => {
  let result = providers.value

  if (filter.value !== 'all') {
    result = result.filter(p => p.status === filter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.user?.name?.toLowerCase().includes(query) ||
      p.bio?.toLowerCase().includes(query)
    )
  }

  return result
})

const pendingCount = computed(() =>
  providers.value.filter(p => p.status === 'pending').length
)

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    verified: 'success',
    pending: 'warning',
    rejected: 'danger',
  }
  return colors[status] || 'medium'
}

const getStatusIcon = (status: string) => {
  return status === 'verified' ? checkmarkCircle : time
}

const approveProvider = (providerId: string) => {
  const provider = providers.value.find(p => p.id === providerId)
  if (provider) {
    provider.status = 'verified'
    provider.verifiedAt = new Date().toISOString()
  }
}

const rejectProvider = (providerId: string) => {
  const provider = providers.value.find(p => p.id === providerId)
  if (provider) {
    provider.status = 'rejected'
  }
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
  <div class="admin-providers">
    <div class="page-header">
      <h2>Providers Management</h2>
      <IonChip v-if="pendingCount > 0" color="warning">
        {{ pendingCount }} pending
      </IonChip>
    </div>

    <IonSearchbar
      v-model="searchQuery"
      placeholder="Search providers..."
      class="search-bar"
    />

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button
        class="filter-tab"
        :class="{ active: filter === 'all' }"
        @click="filter = 'all'"
      >
        All ({{ providers.length }})
      </button>
      <button
        class="filter-tab"
        :class="{ active: filter === 'pending' }"
        @click="filter = 'pending'"
      >
        Pending ({{ pendingCount }})
      </button>
      <button
        class="filter-tab"
        :class="{ active: filter === 'verified' }"
        @click="filter = 'verified'"
      >
        Verified
      </button>
    </div>

    <!-- Providers List -->
    <div class="providers-list">
      <div v-for="provider in filteredProviders" :key="provider.id" class="provider-card">
        <div class="provider-header">
          <div class="provider-avatar">
            {{ provider.user?.name?.charAt(0) || 'P' }}
          </div>
          <div class="provider-info">
            <h3>{{ provider.user?.name }}</h3>
            <div class="provider-status">
              <IonChip :color="getStatusColor(provider.status)" class="status-chip">
                <IonIcon :icon="getStatusIcon(provider.status)" />
                {{ provider.status }}
              </IonChip>
              <span v-if="provider.rating > 0" class="rating">
                <IonIcon :icon="star" color="warning" />
                {{ provider.rating }}
              </span>
            </div>
          </div>
        </div>

        <p class="provider-bio">{{ provider.bio }}</p>

        <div class="provider-meta">
          <span>{{ provider.totalJobs }} jobs</span>
          <span>{{ provider.totalReviews }} reviews</span>
          <span>{{ provider.serviceRadiusKm }}km radius</span>
        </div>

        <div class="provider-footer">
          <span class="joined">Applied {{ formatDate(provider.createdAt) }}</span>

          <div v-if="provider.status === 'pending'" class="action-buttons">
            <IonButton size="small" color="danger" fill="outline" @click="rejectProvider(provider.id)">
              Reject
            </IonButton>
            <IonButton size="small" color="success" @click="approveProvider(provider.id)">
              Approve
            </IonButton>
          </div>
          <button v-else class="action-btn">
            <IonIcon :icon="ellipsisVertical" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-providers h2 {
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
}

.filter-tab.active {
  background: var(--ion-color-danger);
  border-color: var(--ion-color-danger);
  color: white;
}

.providers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.provider-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.provider-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.provider-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--ion-color-success);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  flex-shrink: 0;
}

.provider-info {
  flex: 1;
}

.provider-info h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
}

.provider-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-chip {
  height: 22px;
  font-size: 10px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--ion-text-color);
}

.rating ion-icon {
  font-size: 14px;
}

.provider-bio {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--ion-color-medium-shade);
  line-height: 1.4;
}

.provider-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-bottom: 12px;
}

.provider-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--ion-border-color);
}

.joined {
  font-size: 12px;
  color: var(--ion-color-medium);
}

.action-buttons {
  display: flex;
  gap: 8px;
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