/**
 * usePageState - Composable for managing page loading, error, and empty states
 * Simplifies state management across different page scenarios
 *
 * @example
 * // Basic usage
 * const { state, setState, isLoading, isError, isEmpty } = usePageState()
 *
 * async function fetchData() {
 *   setState('loading')
 *   try {
 *     const data = await api.get('/services')
 *     if (data.length === 0) {
 *       setState('empty', { preset: 'no-services' })
 *     } else {
 *       setState('success')
 *     }
 *   } catch (error) {
 *     setState('error', { preset: 'network' })
 *   }
 * }
 */

export type PageStateType = 'idle' | 'loading' | 'success' | 'error' | 'empty' | 'offline'

export interface PageStateConfig {
  preset?: string
  title?: string
  message?: string
  icon?: string
  actionLabel?: string
  retryLabel?: string
  count?: number
}

export interface PageState {
  type: PageStateType
  config?: PageStateConfig
}

export function usePageState(initialState: PageStateType = 'idle') {
  const state = ref<PageState>({
    type: initialState,
    config: undefined,
  })

  // Computed state checks
  const isIdle = computed(() => state.value.type === 'idle')
  const isLoading = computed(() => state.value.type === 'loading')
  const isSuccess = computed(() => state.value.type === 'success')
  const isError = computed(() => state.value.type === 'error')
  const isEmpty = computed(() => state.value.type === 'empty')
  const isOffline = computed(() => state.value.type === 'offline')

  /**
   * Set the page state
   */
  function setState(type: PageStateType, config?: PageStateConfig) {
    state.value = { type, config }
  }

  /**
   * Set loading state with optional message
   */
  function setLoading(message?: string, config?: PageStateConfig) {
    setState('loading', { ...config, message })
  }

  /**
   * Set error state with preset or custom config
   */
  function setError(preset: 'network' | 'server' | 'not-found' | 'forbidden' | 'timeout' | 'generic' = 'generic', config?: PageStateConfig) {
    setState('error', { ...config, preset })
  }

  /**
   * Set empty state with preset or custom config
   */
  function setEmpty(config?: PageStateConfig) {
    setState('empty', config)
  }

  /**
   * Set offline state with preset or custom config
   */
  function setOffline(preset: 'no-connection' | 'sync-pending' | 'syncing' | 'limited-connection' = 'no-connection', config?: PageStateConfig) {
    setState('offline', { ...config, preset })
  }

  /**
   * Set success state (data loaded successfully)
   */
  function setSuccess() {
    setState('success')
  }

  /**
   * Reset to idle state
   */
  function reset() {
    setState('idle')
  }

  return {
    state: readonly(state),
    isIdle,
    isLoading,
    isSuccess,
    isError,
    isEmpty,
    isOffline,
    setState,
    setLoading,
    setError,
    setEmpty,
    setOffline,
    setSuccess,
    reset,
  }
}

/**
 * Common empty state presets for different page types
 */
export const emptyStatePresets = {
  'no-services': {
    icon: 'heroicons:wrench-screwdriver',
    title: 'No services found',
    message: 'Try adjusting your search or filters',
  },
  'no-bookings': {
    icon: 'heroicons:calendar',
    title: 'No bookings yet',
    message: 'Your bookings will appear here',
    actionLabel: 'Find Services',
  },
  'no-providers': {
    icon: 'heroicons:users',
    title: 'No providers found',
    message: 'Try searching in a different area',
  },
  'no-favorites': {
    icon: 'heroicons:heart',
    title: 'No favorites yet',
    message: 'Save providers you like for quick access',
    actionLabel: 'Browse Services',
  },
  'no-search-results': {
    icon: 'heroicons:magnifying-glass',
    title: 'No results found',
    message: 'Try different keywords or check your spelling',
  },
  'no-messages': {
    icon: 'heroicons:chat-bubble-left-right',
    title: 'No messages',
    message: 'Your conversations will appear here',
  },
  'no-notifications': {
    icon: 'heroicons:bell',
    title: 'No notifications',
    message: 'You\'re all caught up!',
  },
}

/**
 * Helper to get empty state preset
 */
export function getEmptyStatePreset(preset: keyof typeof emptyStatePresets) {
  return emptyStatePresets[preset] || emptyStatePresets['no-services']
}

/**
 * useAsyncState - Wrapper for async operations with automatic state management
 *
 * @example
 * const { execute, isLoading, isError, error } = useAsyncState(
 *   async () => {
 *     const data = await api.get('/services')
 *     return data
 *   },
 *   {
 *     onSuccess: (data) => console.log('Success', data),
 *     onError: (err) => console.error('Error', err),
 *   }
 * )
 */
export interface UseAsyncStateOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  onFinally?: () => void
}

export function useAsyncState<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncStateOptions<T> = {}
) {
  const { immediate = false, onSuccess, onError, onFinally } = options

  const isLoading = ref(false)
  const isError = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<T | null>(null)

  async function execute() {
    isLoading.value = true
    isError.value = false
    error.value = null

    try {
      const result = await asyncFn()
      data.value = result
      onSuccess?.(result)
      return result
    } catch (err) {
      isError.value = true
      error.value = err instanceof Error ? err : new Error(String(err))
      onError?.(error.value)
      throw error.value
    } finally {
      isLoading.value = false
      onFinally?.()
    }
  }

  if (immediate) {
    execute()
  }

  return {
    data: readonly(data),
    isLoading: readonly(isLoading),
    isError: readonly(isError),
    error: readonly(error),
    execute,
  }
}