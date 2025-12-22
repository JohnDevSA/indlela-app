/**
 * useDataFreshness - Composable for tracking data cache age
 * Shows users when they're viewing potentially stale/cached data
 *
 * @example
 * const { isStale, relativeAge } = useDataFreshness(
 *   computed(() => cachedAt),
 *   FRESHNESS_THRESHOLDS.providers
 * )
 */

/**
 * Freshness thresholds in milliseconds
 * Different data types have different staleness tolerances
 */
export const FRESHNESS_THRESHOLDS = {
  /** Services catalog - rarely changes */
  services: 24 * 60 * 60 * 1000, // 24 hours

  /** Provider listings - availability changes moderately */
  providers: 6 * 60 * 60 * 1000, // 6 hours

  /** User bookings - real-time critical */
  bookings: 15 * 60 * 1000, // 15 minutes

  /** User profile - changes rarely */
  profile: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const

export type FreshnessDataType = keyof typeof FRESHNESS_THRESHOLDS

/**
 * Format a date as relative time (e.g., "2 hours ago", "yesterday")
 * Lightweight implementation without external dependencies
 */
function formatRelativeTime(date: Date, t: (key: string, params?: Record<string, unknown>) => string): string {
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 1) {
    return t('offline.just_now')
  }
  if (diffMin < 60) {
    return t('offline.minutes_ago', { count: diffMin })
  }
  if (diffHour < 24) {
    return t('offline.hours_ago', { count: diffHour })
  }
  if (diffDay === 1) {
    return t('offline.yesterday')
  }
  if (diffDay < 7) {
    return t('offline.days_ago', { count: diffDay })
  }

  // More than a week - show date
  return date.toLocaleDateString()
}

/**
 * Composable for tracking data freshness
 *
 * @param cachedAt - Ref to the cache timestamp
 * @param threshold - Staleness threshold in milliseconds
 */
export function useDataFreshness(
  cachedAt: Ref<Date | null> | ComputedRef<Date | null>,
  threshold: number
) {
  const { t } = useI18n()

  // Is data considered stale?
  const isStale = computed(() => {
    if (!cachedAt.value) return false
    const age = Date.now() - cachedAt.value.getTime()
    return age > threshold
  })

  // Human-readable relative age
  const relativeAge = computed(() => {
    if (!cachedAt.value) return null
    return formatRelativeTime(cachedAt.value, t)
  })

  // Age in milliseconds
  const ageMs = computed(() => {
    if (!cachedAt.value) return 0
    return Date.now() - cachedAt.value.getTime()
  })

  // Has data been cached at all?
  const hasCachedData = computed(() => cachedAt.value !== null)

  return {
    isStale,
    relativeAge,
    ageMs,
    hasCachedData,
    cachedAt,
  }
}