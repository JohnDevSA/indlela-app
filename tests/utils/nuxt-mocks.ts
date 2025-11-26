/**
 * Reusable mock utilities for Nuxt/Vue testing
 * Provides factory functions for common mocks
 */
import { vi } from 'vitest'
import { ref, computed, readonly, reactive, watch, watchEffect, nextTick } from 'vue'

// ============================================
// Vue Composition API Mocks
// ============================================

/**
 * Make Vue Composition API available globally for Nuxt auto-imports
 */
export function setupVueGlobals() {
  const g = globalThis as any

  // Vue reactivity
  g.ref = ref
  g.computed = computed
  g.readonly = readonly
  g.reactive = reactive
  g.watch = watch
  g.watchEffect = watchEffect
  g.nextTick = nextTick

  // Lifecycle hooks (no-op in tests)
  g.onMounted = vi.fn((cb) => cb())
  g.onUnmounted = vi.fn()
  g.onBeforeMount = vi.fn((cb) => cb())
  g.onBeforeUnmount = vi.fn()
}

// ============================================
// Nuxt Composable Mocks
// ============================================

/**
 * Create mock useRuntimeConfig
 */
export function createMockRuntimeConfig(overrides = {}) {
  return vi.fn(() => ({
    public: {
      apiUrl: 'http://localhost:8000',
      appName: 'Indlela',
      appVersion: '1.0.0',
      ...overrides,
    },
  }))
}

/**
 * Create mock useRouter
 */
export function createMockRouter() {
  const currentRoute = ref({
    path: '/',
    name: 'index',
    params: {},
    query: {},
    hash: '',
    fullPath: '/',
    matched: [],
    meta: {},
  })

  return vi.fn(() => ({
    push: vi.fn().mockResolvedValue(undefined),
    replace: vi.fn().mockResolvedValue(undefined),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute,
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
    options: { history: { state: {} } },
  }))
}

/**
 * Create mock useRoute
 */
export function createMockRoute(overrides = {}) {
  return vi.fn(() => ({
    path: '/',
    name: 'index',
    params: {},
    query: {},
    hash: '',
    fullPath: '/',
    matched: [],
    meta: {},
    ...overrides,
  }))
}

/**
 * Create mock navigateTo
 */
export function createMockNavigateTo() {
  return vi.fn().mockResolvedValue(undefined)
}

/**
 * Create mock useCookie
 */
export function createMockCookie(defaultValue = 'en') {
  return vi.fn((name: string) => ref(defaultValue))
}

/**
 * Create mock useNuxtApp
 */
export function createMockNuxtApp() {
  return vi.fn(() => ({
    $i18n: {
      locale: ref('en'),
      setLocale: vi.fn(),
    },
    provide: vi.fn(),
    vueApp: {
      config: {
        globalProperties: {},
      },
    },
  }))
}

/**
 * Create mock useAsyncData
 */
export function createMockAsyncData(defaultData: any = null) {
  return vi.fn((key: string, handler: () => Promise<any>) => ({
    data: ref(defaultData),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn().mockResolvedValue(undefined),
    execute: vi.fn().mockResolvedValue(undefined),
  }))
}

/**
 * Create mock useFetch
 */
export function createMockFetch(defaultData: any = null) {
  return vi.fn((url: string, options?: any) => ({
    data: ref(defaultData),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn().mockResolvedValue(undefined),
    execute: vi.fn().mockResolvedValue(undefined),
  }))
}

/**
 * Create mock useApi composable (project-specific)
 */
export function createMockApi() {
  return {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    getErrorMessage: vi.fn((e: any) => e?.message || 'Error'),
  }
}

// ============================================
// Browser API Mocks
// ============================================

/**
 * Create mock navigator.geolocation
 */
export function createMockGeolocation(defaultPosition = {
  coords: {
    latitude: -26.2041,
    longitude: 28.0473,
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: Date.now(),
}) {
  return {
    getCurrentPosition: vi.fn((success, error, options) => {
      success(defaultPosition)
    }),
    watchPosition: vi.fn((success, error, options) => {
      success(defaultPosition)
      return 1 // watch ID
    }),
    clearWatch: vi.fn(),
  }
}

/**
 * Create mock navigator.permissions
 */
export function createMockPermissions(defaultState: 'granted' | 'denied' | 'prompt' = 'granted') {
  return {
    query: vi.fn().mockResolvedValue({
      state: defaultState,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  }
}

/**
 * Create mock navigator.onLine
 */
export function setupOnlineStatus(isOnline = true) {
  Object.defineProperty(globalThis.navigator || {}, 'onLine', {
    value: isOnline,
    writable: true,
    configurable: true,
  })
}

// ============================================
// Storage Mocks
// ============================================

/**
 * Create mock localStorage
 */
export function createMockLocalStorage() {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  }
}

// ============================================
// Setup All Nuxt Globals
// ============================================

/**
 * Setup all Nuxt-related global mocks
 */
export function setupNuxtGlobals() {
  const g = globalThis as any

  // Vue composition API
  setupVueGlobals()

  // Nuxt composables
  g.useRuntimeConfig = createMockRuntimeConfig()
  g.useRouter = createMockRouter()
  g.useRoute = createMockRoute()
  g.navigateTo = createMockNavigateTo()
  g.useCookie = createMockCookie()
  g.useNuxtApp = createMockNuxtApp()
  g.useAsyncData = createMockAsyncData()
  g.useFetch = createMockFetch()
  g.abortNavigation = vi.fn()
  g.defineNuxtRouteMiddleware = vi.fn((fn) => fn)
  g.defineNuxtConfig = vi.fn()
  g.defineNuxtPlugin = vi.fn()
  g.definePageMeta = vi.fn()

  // process.dev for dev mode checks
  g.process = {
    ...g.process,
    dev: true, // Default to dev mode for testing
    env: {
      NODE_ENV: 'test',
    },
  }
}

/**
 * Setup browser API mocks
 */
export function setupBrowserAPIs() {
  const g = globalThis as any

  // Create navigator if it doesn't exist
  if (!g.navigator) {
    g.navigator = {}
  }

  // Geolocation - use defineProperty to override readonly
  Object.defineProperty(g.navigator, 'geolocation', {
    value: createMockGeolocation(),
    writable: true,
    configurable: true,
  })

  // Permissions - use defineProperty to override readonly
  Object.defineProperty(g.navigator, 'permissions', {
    value: createMockPermissions(),
    writable: true,
    configurable: true,
  })

  // Online status
  Object.defineProperty(g.navigator, 'onLine', {
    value: true,
    writable: true,
    configurable: true,
  })

  // localStorage
  if (!g.localStorage) {
    g.localStorage = createMockLocalStorage()
  }
}

// ============================================
// Test Helpers
// ============================================

/**
 * Wait for all pending promises to resolve
 */
export async function flushPromises() {
  await new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Create a deferred promise for controlled async testing
 */
export function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: any) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}
