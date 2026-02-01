import { defineStore } from 'pinia'
import type { SyncResult, QueuedAction } from '~/types'
import {
  getPendingCount,
  getPendingActions,
  clearAllCache,
  clearExpiredCache,
} from '~/utils/offline-queue'
import { offlineLogger } from '~/utils/logger'

interface OfflineState {
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  lastSyncAt: Date | null
  syncError: string | null
  pendingActions: QueuedAction[]
}

export const useOfflineStore = defineStore('offline', {
  state: (): OfflineState => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncAt: null,
    syncError: null,
    pendingActions: [],
  }),

  getters: {
    /**
     * Check if there are pending changes to sync
     */
    hasPendingChanges: (state): boolean => {
      return state.pendingCount > 0
    },

    /**
     * Check if data is synced
     */
    isSynced: (state): boolean => {
      return state.pendingCount === 0 && !state.syncError
    },

    /**
     * Get sync status message
     */
    syncStatusMessage: (state): string => {
      if (state.isSyncing) return 'Syncing...'
      if (state.syncError) return state.syncError
      if (state.pendingCount > 0) return `${state.pendingCount} pending changes`
      if (!state.isOnline) return 'Offline'
      return 'All synced'
    },

    /**
     * Time since last sync
     */
    timeSinceLastSync: (state): string | null => {
      if (!state.lastSyncAt) return null
      const diffMs = Date.now() - state.lastSyncAt.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      const diffHours = Math.floor(diffMins / 60)
      return `${diffHours}h ago`
    },
  },

  actions: {
    /**
     * Initialize online/offline listeners
     */
    init() {
      if (typeof window === 'undefined') return

      this.isOnline = navigator.onLine

      window.addEventListener('online', this.handleOnline.bind(this))
      window.addEventListener('offline', this.handleOffline.bind(this))

      // Initial pending count update
      this.updatePendingCount()

      offlineLogger.debug('Offline store initialized', { isOnline: this.isOnline })
    },

    /**
     * Cleanup listeners
     */
    destroy() {
      if (typeof window === 'undefined') return

      window.removeEventListener('online', this.handleOnline.bind(this))
      window.removeEventListener('offline', this.handleOffline.bind(this))
    },

    /**
     * Handle coming online
     */
    handleOnline() {
      offlineLogger.info('Device came online')
      this.isOnline = true
      this.syncError = null
      // Auto-sync when coming online
      this.syncPendingActions()
    },

    /**
     * Handle going offline
     */
    handleOffline() {
      offlineLogger.info('Device went offline')
      this.isOnline = false
    },

    /**
     * Update pending count from IndexedDB
     */
    async updatePendingCount() {
      try {
        this.pendingCount = await getPendingCount()
        this.pendingActions = await getPendingActions()
      } catch (e) {
        offlineLogger.error('Failed to update pending count', e)
      }
    },

    /**
     * Sync pending actions to server
     */
    async syncPendingActions(): Promise<SyncResult[]> {
      if (this.isSyncing) {
        offlineLogger.debug('Sync already in progress')
        return []
      }

      if (!this.isOnline) {
        this.syncError = 'Cannot sync while offline'
        return []
      }

      this.isSyncing = true
      this.syncError = null

      try {
        const { syncPendingActions: sync } = useOffline()
        const results = await sync()

        this.lastSyncAt = new Date()
        await this.updatePendingCount()

        const failed = results.filter(r => r.status === 'failed')
        if (failed.length > 0) {
          this.syncError = `${failed.length} action(s) failed to sync`
        }

        offlineLogger.info('Sync completed', {
          total: results.length,
          synced: results.filter(r => r.status === 'synced').length,
          failed: failed.length,
        })

        return results
      } catch (e) {
        this.syncError = e instanceof Error ? e.message : 'Sync failed'
        offlineLogger.error('Sync failed', e)
        return []
      } finally {
        this.isSyncing = false
      }
    },

    /**
     * Force sync (even when we think we're offline)
     */
    async forceSync(): Promise<SyncResult[]> {
      // Check actual online status
      this.isOnline = navigator.onLine

      if (!this.isOnline) {
        this.syncError = 'Cannot sync while offline'
        return []
      }

      return this.syncPendingActions()
    },

    /**
     * Clear all offline data (for logout)
     */
    async clearAllData() {
      try {
        await clearAllCache()
        this.pendingCount = 0
        this.pendingActions = []
        this.lastSyncAt = null
        this.syncError = null
        offlineLogger.info('All offline data cleared')
      } catch (e) {
        offlineLogger.error('Failed to clear offline data', e)
        throw e
      }
    },

    /**
     * Clean up expired cache
     */
    async cleanupCache(maxAgeMs?: number) {
      try {
        await clearExpiredCache(maxAgeMs)
        offlineLogger.debug('Cache cleanup completed')
      } catch (e) {
        offlineLogger.warn('Cache cleanup failed', { error: e })
      }
    },

    /**
     * Clear sync error
     */
    clearError() {
      this.syncError = null
    },

    /**
     * Reset store
     */
    $reset() {
      this.isOnline = navigator?.onLine ?? true
      this.isSyncing = false
      this.pendingCount = 0
      this.lastSyncAt = null
      this.syncError = null
      this.pendingActions = []
    },
  },
})