<script setup lang="ts">
import {
  IonSearchbar,
  IonIcon,
  IonChip,
} from '@ionic/vue'
import { person, ellipsisVertical, checkmarkCircle, closeCircle, mail, call } from 'ionicons/icons'

definePageMeta({
  layout: 'admin',
})

const searchQuery = ref('')

// Mock users data
const users = ref([
  { id: '1', name: 'Thabo Molefe', phone: '+27821234567', email: 'thabo@example.com', role: 'customer', status: 'active', joined: '2024-01-15' },
  { id: '2', name: 'Nomsa Dlamini', phone: '+27831234567', email: 'nomsa@example.com', role: 'provider', status: 'active', joined: '2024-01-10' },
  { id: '3', name: 'Sipho Ndlovu', phone: '+27841234567', email: 'sipho@example.com', role: 'customer', status: 'active', joined: '2024-01-08' },
  { id: '4', name: 'Lindiwe Khumalo', phone: '+27851234567', email: 'lindiwe@example.com', role: 'provider', status: 'pending', joined: '2024-01-20' },
  { id: '5', name: 'Bongani Zulu', phone: '+27861234567', email: 'bongani@example.com', role: 'customer', status: 'suspended', joined: '2024-01-05' },
])

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(u =>
    u.name.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query) ||
    u.phone.includes(query)
  )
})

const getRoleColor = (role: string) => {
  return role === 'provider' ? 'success' : 'primary'
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'success',
    pending: 'warning',
    suspended: 'danger',
  }
  return colors[status] || 'medium'
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
  <div class="admin-users">
    <div class="page-header">
      <h2>Users Management</h2>
      <span class="count">{{ users.length }} users</span>
    </div>

    <IonSearchbar
      v-model="searchQuery"
      placeholder="Search users..."
      class="search-bar"
    />

    <div class="users-list">
      <div v-for="user in filteredUsers" :key="user.id" class="user-card">
        <div class="user-avatar">
          {{ user.name.charAt(0) }}
        </div>
        <div class="user-info">
          <div class="user-header">
            <h3>{{ user.name }}</h3>
            <IonChip :color="getStatusColor(user.status)" class="status-chip">
              {{ user.status }}
            </IonChip>
          </div>
          <div class="user-details">
            <span class="detail">
              <IonIcon :icon="mail" />
              {{ user.email }}
            </span>
            <span class="detail">
              <IonIcon :icon="call" />
              {{ user.phone }}
            </span>
          </div>
          <div class="user-meta">
            <IonChip :color="getRoleColor(user.role)" class="role-chip">
              {{ user.role }}
            </IonChip>
            <span class="joined">Joined {{ formatDate(user.joined) }}</span>
          </div>
        </div>
        <button class="action-btn">
          <IonIcon :icon="ellipsisVertical" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-users h2 {
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
  margin-bottom: 16px;
  padding: 0;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  display: flex;
  gap: 12px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.user-avatar {
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
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.user-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.status-chip,
.role-chip {
  height: 22px;
  font-size: 10px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--ion-color-medium-shade);
}

.detail ion-icon {
  font-size: 14px;
  color: var(--ion-color-medium);
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.joined {
  font-size: 12px;
  color: var(--ion-color-medium);
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