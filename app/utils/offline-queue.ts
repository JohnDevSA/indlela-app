import Dexie, { type Table } from 'dexie'
import type {
  QueuedAction,
  OfflineActionType,
  Booking,
  Provider,
  Service,
  SyncResult,
} from '~/types'

// ============================================
// Database Schema
// ============================================

interface CachedProvider {
  id: string
  data: Provider
  cachedAt: Date
}

interface CachedBooking {
  id: string
  localId?: string
  data: Booking
  cachedAt: Date
  synced: boolean
}

interface CachedService {
  id: string
  data: Service
  cachedAt: Date
}

// ============================================
// IndexedDB Database Class
// ============================================

class IndlelaDatabase extends Dexie {
  queue!: Table<QueuedAction>
  providers!: Table<CachedProvider>
  bookings!: Table<CachedBooking>
  services!: Table<CachedService>

  constructor() {
    super('IndlelaDB')

    this.version(1).stores({
      queue: '++id, type, localId, createdAt',
      providers: 'id, cachedAt',
      bookings: 'id, localId, synced, cachedAt',
      services: 'id, cachedAt',
    })
  }
}

// Export singleton database instance
export const db = new IndlelaDatabase()

// ============================================
// Queue Management Functions
// ============================================

/**
 * Generate a unique local ID for offline items
 */
export function generateLocalId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Add an action to the offline queue
 */
export async function queueAction(
  type: OfflineActionType,
  payload: Record<string, unknown>
): Promise<string> {
  const localId = payload.localId as string || generateLocalId()

  await db.queue.add({
    type,
    payload: { ...payload, localId },
    localId,
    createdAt: new Date(),
    retryCount: 0,
  })

  return localId
}

/**
 * Get count of pending actions
 */
export async function getPendingCount(): Promise<number> {
  return await db.queue.count()
}

/**
 * Get all pending actions
 */
export async function getPendingActions(): Promise<QueuedAction[]> {
  return await db.queue.toArray()
}

/**
 * Remove an action from the queue
 */
export async function removeAction(id: number): Promise<void> {
  await db.queue.delete(id)
}

/**
 * Update action retry count and error
 */
export async function updateActionRetry(
  id: number,
  retryCount: number,
  lastError?: string
): Promise<void> {
  await db.queue.update(id, {
    retryCount,
    lastError,
  })
}

// ============================================
// Sync Functions
// ============================================

/**
 * Process all queued actions
 * Returns array of sync results
 */
export async function processQueue(
  syncFn: (action: QueuedAction) => Promise<SyncResult>
): Promise<SyncResult[]> {
  const actions = await getPendingActions()
  const results: SyncResult[] = []

  for (const action of actions) {
    try {
      const result = await syncFn(action)
      results.push(result)

      if (result.status === 'synced' || result.status === 'already_synced') {
        await removeAction(action.id!)
      }
    } catch (error) {
      const newRetryCount = action.retryCount + 1
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      // Remove after max retries
      if (newRetryCount >= 5) {
        console.error('Action failed after 5 retries:', action)
        await removeAction(action.id!)
        results.push({
          localId: action.localId,
          status: 'failed',
          error: errorMessage,
        })
      } else {
        await updateActionRetry(action.id!, newRetryCount, errorMessage)
      }
    }
  }

  return results
}

// ============================================
// Cache Management Functions
// ============================================

/**
 * Cache providers locally
 */
export async function cacheProviders(providers: Provider[]): Promise<void> {
  const now = new Date()
  const items = providers.map(p => ({
    id: p.id,
    data: p,
    cachedAt: now,
  }))

  await db.providers.bulkPut(items)
}

/**
 * Get cached providers
 */
export async function getCachedProviders(): Promise<Provider[]> {
  const cached = await db.providers.toArray()
  return cached.map(c => c.data)
}

/**
 * Cache bookings locally
 */
export async function cacheBookings(bookings: Booking[]): Promise<void> {
  const now = new Date()
  const items = bookings.map(b => ({
    id: b.id,
    localId: b.offlineId,
    data: b,
    cachedAt: now,
    synced: true,
  }))

  await db.bookings.bulkPut(items)
}

/**
 * Get cached bookings
 */
export async function getCachedBookings(): Promise<Booking[]> {
  const cached = await db.bookings.toArray()
  return cached.map(c => c.data)
}

/**
 * Add a local booking (not yet synced)
 */
export async function addLocalBooking(booking: Booking, localId: string): Promise<void> {
  await db.bookings.add({
    id: localId,
    localId,
    data: booking,
    cachedAt: new Date(),
    synced: false,
  })
}

/**
 * Update booking after sync
 */
export async function updateSyncedBooking(
  localId: string,
  serverId: string,
  data: Booking
): Promise<void> {
  await db.bookings.where('localId').equals(localId).modify({
    id: serverId,
    data,
    synced: true,
  })
}

/**
 * Cache services locally
 */
export async function cacheServices(services: Service[]): Promise<void> {
  const now = new Date()
  const items = services.map(s => ({
    id: s.id,
    data: s,
    cachedAt: now,
  }))

  await db.services.bulkPut(items)
}

/**
 * Get cached services
 */
export async function getCachedServices(): Promise<Service[]> {
  const cached = await db.services.toArray()
  return cached.map(c => c.data)
}

// ============================================
// Cache Cleanup Functions
// ============================================

/**
 * Clear all cached data (for logout)
 */
export async function clearAllCache(): Promise<void> {
  await Promise.all([
    db.queue.clear(),
    db.providers.clear(),
    db.bookings.clear(),
    db.services.clear(),
  ])
}

/**
 * Clear expired cache items
 * @param maxAgeMs Maximum age in milliseconds
 */
export async function clearExpiredCache(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
  const cutoff = new Date(Date.now() - maxAgeMs)

  await Promise.all([
    db.providers.where('cachedAt').below(cutoff).delete(),
    db.services.where('cachedAt').below(cutoff).delete(),
  ])
}