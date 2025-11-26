# Offline-First Development Guide

> Building features that work without internet connectivity

## Why Offline-First?

In South African townships, internet connectivity is:
- **Expensive:** Data costs are high relative to income
- **Unreliable:** Network coverage can be spotty
- **Slow:** 3G is common, 4G/5G less so

Indlela must work offline to be truly accessible.

## Offline-First Principles

### 1. Local-First, Sync Later

Every critical operation should work locally first:

```typescript
// ✅ Offline-friendly approach
async function createBooking(data: BookingData) {
  // 1. Save locally immediately
  const localId = await saveToIndexedDB(data);

  // 2. Update UI optimistically
  bookings.value.push({ ...data, id: localId, synced: false });

  // 3. Queue for sync when online
  if (navigator.onLine) {
    await syncToServer(localId, data);
  } else {
    await queueForLaterSync(localId, data);
  }

  return localId;
}

// ❌ Online-only approach
async function createBooking(data: BookingData) {
  // Fails immediately if offline
  const response = await fetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}
```

### 2. Optimistic UI Updates

Show changes immediately, sync in the background:

```vue
<script setup lang="ts">
const { addFavorite } = useFavorites();

async function handleFavorite(providerId: string) {
  // Update UI immediately
  isFavorited.value = true;

  try {
    // Sync in background
    await addFavorite(providerId);
  } catch (error) {
    // Revert on error
    isFavorited.value = false;
    showToast('Failed to add favorite', 'error');
  }
}
</script>

<template>
  <button @click="handleFavorite(provider.id)">
    <ion-icon
      :icon="isFavorited ? heart : heartOutline"
      :class="{ 'text-red-500': isFavorited }"
    />
  </button>
</template>
```

### 3. Queue Failed Operations

Don't lose user actions when offline:

```typescript
// Queue system handles retry logic
await queueAction('CREATE_BOOKING', bookingData);
```

## IndexedDB with Dexie

### Database Schema

```typescript
// utils/db.ts
import Dexie, { Table } from 'dexie';

export interface QueuedAction {
  id?: number;
  type: 'CREATE_BOOKING' | 'UPDATE_BOOKING' | 'CANCEL_BOOKING';
  payload: Record<string, any>;
  localId: string;
  createdAt: Date;
  retryCount: number;
  lastError?: string;
}

export interface CachedProvider {
  id: string;
  data: Provider;
  cachedAt: Date;
}

export interface CachedBooking {
  id: string;
  localId?: string;
  data: Booking;
  cachedAt: Date;
  synced: boolean;
}

class IndlelaDB extends Dexie {
  queue!: Table<QueuedAction>;
  providers!: Table<CachedProvider>;
  bookings!: Table<CachedBooking>;

  constructor() {
    super('IndlelaDB');

    this.version(1).stores({
      queue: '++id, type, localId, createdAt',
      providers: 'id, cachedAt',
      bookings: 'id, localId, synced, cachedAt',
    });
  }
}

export const db = new IndlelaDB();
```

### Basic Operations

```typescript
// Create
await db.providers.add({
  id: provider.id,
  data: provider,
  cachedAt: new Date(),
});

// Read
const provider = await db.providers.get(providerId);

// Update
await db.providers.update(providerId, {
  data: updatedProvider,
  cachedAt: new Date(),
});

// Delete
await db.providers.delete(providerId);

// Query
const recentBookings = await db.bookings
  .where('cachedAt')
  .above(yesterday)
  .toArray();
```

## Offline Queue System

### Queue Actions

```typescript
// utils/offline-queue.ts
export async function queueAction(
  type: QueuedAction['type'],
  payload: Record<string, any>
): Promise<string> {
  const localId = `local-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

  await db.queue.add({
    type,
    payload: { ...payload, localId },
    localId,
    createdAt: new Date(),
    retryCount: 0,
  });

  return localId;
}
```

### Process Queue

```typescript
export async function processQueue(): Promise<void> {
  if (!navigator.onLine) return;

  const pendingActions = await db.queue.toArray();

  for (const action of pendingActions) {
    try {
      await syncAction(action);
      await db.queue.delete(action.id!);
    } catch (error) {
      await handleSyncError(action, error);
    }
  }
}

async function syncAction(action: QueuedAction): Promise<void> {
  const { $api } = useNuxtApp();

  switch (action.type) {
    case 'CREATE_BOOKING':
      const response = await $api('/bookings', {
        method: 'POST',
        body: action.payload,
      });

      // Update local booking with server ID
      await db.bookings.update(action.localId, {
        id: response.data.id,
        data: response.data,
        synced: true,
      });
      break;

    case 'UPDATE_BOOKING':
      await $api(`/bookings/${action.payload.id}`, {
        method: 'PUT',
        body: action.payload,
      });
      break;

    case 'CANCEL_BOOKING':
      await $api(`/bookings/${action.payload.id}/cancel`, {
        method: 'POST',
      });
      break;
  }
}

async function handleSyncError(action: QueuedAction, error: any): Promise<void> {
  const newRetryCount = action.retryCount + 1;

  if (newRetryCount >= 5) {
    // Max retries reached - notify user
    console.error('Action failed after 5 retries:', action);
    await db.queue.delete(action.id!);
    // TODO: Show user notification
  } else {
    // Update retry count
    await db.queue.update(action.id!, {
      retryCount: newRetryCount,
      lastError: error.message,
    });
  }
}
```

## Offline Composable

```typescript
// composables/useOffline.ts
export function useOffline() {
  const isOnline = ref(navigator.onLine);
  const isSyncing = ref(false);
  const pendingCount = ref(0);
  const syncError = ref<string | null>(null);

  // Update online status
  function updateOnlineStatus() {
    isOnline.value = navigator.onLine;

    if (isOnline.value) {
      syncPendingActions();
    }
  }

  // Count pending actions
  async function updatePendingCount() {
    pendingCount.value = await db.queue.count();
  }

  // Sync pending actions
  async function syncPendingActions() {
    if (isSyncing.value || !isOnline.value) return;

    isSyncing.value = true;
    syncError.value = null;

    try {
      await processQueue();
      await updatePendingCount();
    } catch (error) {
      syncError.value = error instanceof Error ? error.message : 'Sync failed';
    } finally {
      isSyncing.value = false;
    }
  }

  // Force sync
  async function forceSync() {
    if (!isOnline.value) {
      throw new Error('Cannot sync while offline');
    }
    await syncPendingActions();
  }

  // Register event listeners
  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updatePendingCount();

    // Sync on mount if online
    if (isOnline.value) {
      syncPendingActions();
    }
  });

  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  });

  return {
    isOnline: readonly(isOnline),
    isSyncing: readonly(isSyncing),
    pendingCount: readonly(pendingCount),
    syncError: readonly(syncError),
    syncPendingActions,
    forceSync,
  };
}
```

## Offline-Aware Components

### Offline Indicator

```vue
<!-- components/ui/OfflineIndicator.vue -->
<script setup lang="ts">
const { isOnline, isSyncing, pendingCount } = useOffline();
</script>

<template>
  <div
    v-if="!isOnline || pendingCount > 0"
    class="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2 text-sm"
  >
    <ion-icon
      :icon="isSyncing ? sync : cloudOffline"
      :class="{ 'animate-spin': isSyncing }"
    />

    <span v-if="!isOnline" class="text-amber-800">
      {{ t('offline.no_connection') }}
    </span>

    <span v-else-if="isSyncing" class="text-amber-800">
      {{ t('offline.syncing') }}
    </span>

    <span v-else class="text-amber-800">
      {{ t('offline.pending', { count: pendingCount }) }}
    </span>
  </div>
</template>
```

### Booking Creation (Offline-Aware)

```vue
<!-- components/booking/BookingForm.vue -->
<script setup lang="ts">
const { createBooking } = useBooking();
const { isOnline } = useOffline();
const { showToast } = useToast();

async function handleSubmit() {
  try {
    const booking = await createBooking(formData);

    if (!isOnline.value) {
      showToast(
        t('booking.created_offline'),
        'info'
      );
    } else {
      showToast(
        t('booking.created_success'),
        'success'
      );
    }

    navigateTo(`/bookings/${booking.id}`);
  } catch (error) {
    showToast(
      t('booking.create_failed'),
      'error'
    );
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <!-- Form fields -->

    <!-- Offline warning -->
    <div
      v-if="!isOnline"
      class="rounded-md bg-blue-50 p-4 text-sm text-blue-800"
    >
      {{ t('offline.create_booking_warning') }}
    </div>

    <button type="submit">
      {{ t('booking.create') }}
    </button>
  </form>
</template>
```

## Caching Strategy

### Cache Providers

```typescript
// composables/useProvider.ts
export function useProvider(providerId: string) {
  const provider = ref<Provider | null>(null);
  const isLoading = ref(false);

  async function fetchProvider() {
    isLoading.value = true;

    try {
      // 1. Try cache first
      const cached = await db.providers.get(providerId);

      if (cached && isRecentlyFetched(cached.cachedAt)) {
        provider.value = cached.data;
        isLoading.value = false;
        return;
      }

      // 2. Fetch from API if online
      if (navigator.onLine) {
        const response = await $api(`/providers/${providerId}`);
        provider.value = response.data;

        // 3. Update cache
        await db.providers.put({
          id: providerId,
          data: response.data,
          cachedAt: new Date(),
        });
      } else if (cached) {
        // 4. Use stale cache if offline
        provider.value = cached.data;
      } else {
        throw new Error('Provider not available offline');
      }
    } finally {
      isLoading.value = false;
    }
  }

  onMounted(() => {
    fetchProvider();
  });

  return {
    provider: readonly(provider),
    isLoading: readonly(isLoading),
    refetch: fetchProvider,
  };
}

function isRecentlyFetched(date: Date): boolean {
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  return Date.now() - date.getTime() < CACHE_DURATION;
}
```

### Clear Stale Cache

```typescript
// utils/cache.ts
export async function clearStaleCache() {
  const ONE_WEEK_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Remove old providers
  await db.providers
    .where('cachedAt')
    .below(ONE_WEEK_AGO)
    .delete();

  // Keep bookings forever (user data)
}
```

## Testing Offline Features

### Simulating Offline State

```typescript
// tests/composables/useBooking.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBooking } from '~/composables/useBooking';

describe('useBooking (offline)', () => {
  beforeEach(() => {
    // Simulate offline
    vi.stubGlobal('navigator', { onLine: false });
  });

  it('queues booking when offline', async () => {
    const { createBooking } = useBooking();

    const localId = await createBooking({
      serviceId: 'service-1',
      providerId: 'provider-1',
      scheduledAt: new Date().toISOString(),
    });

    // Should return local ID
    expect(localId).toMatch(/^local-/);

    // Should be in queue
    const queuedActions = await db.queue.toArray();
    expect(queuedActions).toHaveLength(1);
    expect(queuedActions[0].type).toBe('CREATE_BOOKING');
  });

  it('syncs when back online', async () => {
    // Create booking while offline
    const { createBooking } = useBooking();
    const localId = await createBooking({});

    // Go online
    vi.stubGlobal('navigator', { onLine: true });

    // Process queue
    await processQueue();

    // Should be synced
    const booking = await db.bookings.get(localId);
    expect(booking?.synced).toBe(true);
  });
});
```

## Best Practices

### Do's

- ✅ Always check `navigator.onLine` before API calls
- ✅ Cache all GET requests in IndexedDB
- ✅ Queue all mutations (POST, PUT, DELETE)
- ✅ Show offline indicator to users
- ✅ Provide offline-friendly error messages
- ✅ Test offline scenarios explicitly

### Don'ts

- ❌ Don't assume network is always available
- ❌ Don't show generic "network error" messages
- ❌ Don't lose user data when offline
- ❌ Don't block UI while syncing
- ❌ Don't retry forever without user intervention

## Troubleshooting

### Queue Not Processing

Check if online event listener is registered:

```typescript
// Add logging
window.addEventListener('online', () => {
  console.log('Online event fired');
  updateOnlineStatus();
});
```

### IndexedDB Quota Exceeded

Clear old data periodically:

```typescript
// Run on app startup
await clearStaleCache();
```

### Sync Conflicts

Implement conflict resolution:

```typescript
async function handleConflict(local: Booking, server: Booking) {
  // Server wins for status
  if (server.status !== local.status) {
    return server;
  }

  // Last update wins for other fields
  return server.updatedAt > local.updatedAt ? server : local;
}
```

## Next Steps

- Review [API Integration Guide](./api-integration.md)
- Explore [State Management](../standards/state-management.md)
- Check [Testing Guide](./testing.md)
