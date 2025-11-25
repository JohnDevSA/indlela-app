import {
  db,
  getPendingCount,
  processQueue,
  clearAllCache,
  clearExpiredCache,
} from '~/utils/offline-queue'
import type { QueuedAction, SyncResult } from '~/types'

/**
 * Composable for managing offline state and sync
 * Provides reactive online/offline status and sync utilities
 */
export function useOffline() {
  // State
  const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const isSyncing = ref(false)
  const pendingCount = ref(0)
  const lastSyncAt = ref<Date | null>(null)
  const syncError = ref<string | null>(null)

  // Update online status
  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine

    if (isOnline.value) {
      // Trigger sync when coming back online
      syncPendingActions()
    }
  }

  // Update pending count
  const updatePendingCount = async () => {
    pendingCount.value = await getPendingCount()
  }

  // Sync pending actions with the server
  const syncPendingActions = async (): Promise<SyncResult[]> => {
    if (isSyncing.value || !isOnline.value) {
      return []
    }

    isSyncing.value = true
    syncError.value = null

    try {
      const results = await processQueue(syncAction)
      await updatePendingCount()
      lastSyncAt.value = new Date()
      return results
    } catch (error) {
      syncError.value = error instanceof Error ? error.message : 'Sync failed'
      return []
    } finally {
      isSyncing.value = false
    }
  }

  // Sync a single action
  const syncAction = async (action: QueuedAction): Promise<SyncResult> => {
    const { post, put } = useApi()

    switch (action.type) {
      case 'CREATE_BOOKING': {
        const response = await post<{ data: { id: string } }>('/bookings', action.payload)
        return {
          localId: action.localId,
          serverId: response.data.id,
          status: 'synced',
          data: response.data,
        }
      }

      case 'UPDATE_BOOKING': {
        const bookingId = action.payload.id as string
        await put(`/bookings/${bookingId}`, action.payload)
        return {
          localId: action.localId,
          status: 'synced',
        }
      }

      case 'UPDATE_STATUS': {
        const bookingId = action.payload.id as string
        const status = action.payload.status as string
        await post(`/bookings/${bookingId}/${status}`)
        return {
          localId: action.localId,
          status: 'synced',
        }
      }

      case 'CREATE_REVIEW': {
        const bookingId = action.payload.bookingId as string
        await post(`/bookings/${bookingId}/review`, action.payload)
        return {
          localId: action.localId,
          status: 'synced',
        }
      }

      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  // Force sync (manual refresh)
  const forceSync = async (): Promise<SyncResult[]> => {
    if (!isOnline.value) {
      syncError.value = 'Cannot sync while offline'
      return []
    }
    return syncPendingActions()
  }

  // Clear offline data (for logout)
  const clearOfflineData = async (): Promise<void> => {
    await clearAllCache()
    pendingCount.value = 0
    lastSyncAt.value = null
  }

  // Clean up expired cache
  const cleanupCache = async (maxAgeMs?: number): Promise<void> => {
    await clearExpiredCache(maxAgeMs)
  }

  // Check if there are pending changes
  const hasPendingChanges = computed(() => pendingCount.value > 0)

  // Register event listeners on mount
  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', updateOnlineStatus)
      window.addEventListener('offline', updateOnlineStatus)

      // Initial count and sync
      updatePendingCount()

      if (isOnline.value) {
        // Sync on mount if online
        syncPendingActions()
        // Clean up old cache
        cleanupCache()
      }
    }
  })

  // Clean up event listeners on unmount
  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  })

  return {
    // State (readonly)
    isOnline: readonly(isOnline),
    isSyncing: readonly(isSyncing),
    pendingCount: readonly(pendingCount),
    lastSyncAt: readonly(lastSyncAt),
    syncError: readonly(syncError),
    hasPendingChanges,

    // Methods
    syncPendingActions,
    forceSync,
    clearOfflineData,
    cleanupCache,
    updatePendingCount,
  }
}