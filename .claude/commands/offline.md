# Offline-First Review

Review and enhance code for offline-first compliance.

## Instructions

When the user runs `/offline <path>`, analyze the target file for offline-first patterns and suggest improvements.

## Offline-First Principles for Indlela

1. **Local First**: Data is stored locally first, then synced
2. **Optimistic UI**: Show changes immediately, reconcile later
3. **Queue Actions**: Failed network requests are queued for retry
4. **Conflict Resolution**: Handle sync conflicts gracefully
5. **Cache Everything**: Service worker caches API responses

## Checklist

### Data Fetching
- [ ] Uses local cache before API call
- [ ] Falls back to cached data on network failure
- [ ] Shows stale data with "offline" indicator
- [ ] Refreshes cache on successful API call

### Data Mutations
- [ ] Saves to IndexedDB immediately
- [ ] Queues API call for sync
- [ ] Shows optimistic UI update
- [ ] Has rollback on persistent failure

### UI Indicators
- [ ] Shows online/offline status
- [ ] Indicates pending sync count
- [ ] Shows "syncing" state during sync
- [ ] Indicates stale/cached data

### Error Handling
- [ ] Catches network errors gracefully
- [ ] Retries with exponential backoff
- [ ] Notifies user of persistent failures
- [ ] Preserves user data on error

## Pattern: Offline-Capable Composable

```typescript
export function useBooking() {
  const { isOnline } = useOffline()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Fetch with cache fallback
  const fetchBookings = async () => {
    isLoading.value = true
    error.value = null

    try {
      // Try to get from cache first for instant UI
      const cached = await db.bookings.toArray()
      if (cached.length > 0) {
        bookings.value = cached.map(b => b.data)
      }

      // If online, fetch fresh data
      if (isOnline.value) {
        const response = await $api<BookingsResponse>('/bookings')
        bookings.value = response.data

        // Update cache
        await db.bookings.clear()
        await db.bookings.bulkAdd(
          response.data.map(b => ({
            id: b.id,
            data: b,
            cachedAt: new Date(),
            synced: true,
          }))
        )
      }
    } catch (e) {
      // On error, we still have cached data
      if (bookings.value.length === 0) {
        error.value = 'Failed to load bookings'
      }
    } finally {
      isLoading.value = false
    }
  }

  // Create with offline support
  const createBooking = async (data: CreateBookingPayload) => {
    const localId = generateLocalId()

    // Optimistically add to local state
    const optimisticBooking: Booking = {
      id: localId,
      ...data,
      status: 'pending',
      synced: false,
    }
    bookings.value.unshift(optimisticBooking)

    // Save to IndexedDB
    await db.bookings.add({
      id: localId,
      localId,
      data: optimisticBooking,
      cachedAt: new Date(),
      synced: false,
    })

    // If online, sync immediately
    if (isOnline.value) {
      try {
        const response = await $api<BookingResponse>('/bookings', {
          method: 'POST',
          body: { ...data, offline_id: localId },
        })

        // Update with server response
        const index = bookings.value.findIndex(b => b.id === localId)
        if (index !== -1) {
          bookings.value[index] = { ...response.data, synced: true }
        }

        // Update IndexedDB
        await db.bookings.update(localId, {
          id: response.data.id,
          data: response.data,
          synced: true,
        })

        return response.data
      } catch (e) {
        // Queue for later sync
        await queueAction('CREATE_BOOKING', { ...data, localId })
        return optimisticBooking
      }
    } else {
      // Queue for later sync
      await queueAction('CREATE_BOOKING', { ...data, localId })
      return optimisticBooking
    }
  }

  return {
    bookings: readonly(bookings),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchBookings,
    createBooking,
  }
}
```

## Pattern: Service Worker Caching

```typescript
// nuxt.config.ts - PWA config
workbox: {
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.indlela\.co\.za\/api\/v1\/services/,
      handler: 'CacheFirst', // Services rarely change
      options: {
        cacheName: 'services-cache',
        expiration: { maxAgeSeconds: 86400 }, // 24 hours
      },
    },
    {
      urlPattern: /^https:\/\/api\.indlela\.co\.za\/api\/v1\/providers/,
      handler: 'NetworkFirst', // Providers need fresh data
      options: {
        cacheName: 'providers-cache',
        networkTimeoutSeconds: 10, // Fallback to cache after 10s
      },
    },
    {
      urlPattern: /^https:\/\/api\.indlela\.co\.za\/api\/v1\/bookings/,
      handler: 'NetworkFirst', // User's bookings need sync
      options: {
        cacheName: 'bookings-cache',
      },
    },
  ],
}
```

## Review Output Format

When reviewing, output:

1. **Current State**: What offline patterns exist
2. **Issues Found**: What's missing or broken
3. **Recommendations**: Specific code changes
4. **Priority**: High/Medium/Low for each issue

Now analyze the target file for offline-first compliance.