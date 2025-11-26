/**
 * Vitest Global Test Setup
 * Configures mocks for Nuxt 4, Vue 3, IndexedDB, and browser APIs
 */
import 'fake-indexeddb/auto' // Must be first - provides IndexedDB API for Dexie
import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import {
  setupNuxtGlobals,
  setupBrowserAPIs,
  createMockLocalStorage,
} from './utils/nuxt-mocks'

// ============================================
// Setup Nuxt/Vue Globals
// ============================================
setupNuxtGlobals()
setupBrowserAPIs()

// ============================================
// Mock Project Composables (auto-imported by Nuxt)
// ============================================
const g = globalThis as any

// Mock useApi composable
g.useApi = vi.fn(() => ({
  get: vi.fn().mockResolvedValue({ data: [] }),
  post: vi.fn().mockResolvedValue({ data: {} }),
  put: vi.fn().mockResolvedValue({ data: {} }),
  patch: vi.fn().mockResolvedValue({ data: {} }),
  delete: vi.fn().mockResolvedValue({ data: {} }),
  getErrorMessage: vi.fn((e: any) => e?.message || 'Error'),
}))

// Mock useOffline composable
g.useOffline = vi.fn(() => ({
  isOnline: { value: true },
  checkOnlineStatus: vi.fn(),
}))

// ============================================
// localStorage Mock with persistence
// ============================================
const mockLocalStorage = createMockLocalStorage()
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// ============================================
// Vue Test Utils Configuration
// ============================================
config.global.stubs = {
  // Teleport handling
  teleport: true,

  // Ionic components
  'ion-page': true,
  'ion-header': true,
  'ion-toolbar': true,
  'ion-title': true,
  'ion-content': true,
  'ion-button': true,
  'ion-input': true,
  'ion-item': true,
  'ion-label': true,
  'ion-list': true,
  'ion-icon': true,
  'ion-card': true,
  'ion-card-header': true,
  'ion-card-title': true,
  'ion-card-subtitle': true,
  'ion-card-content': true,
  'ion-fab': true,
  'ion-fab-button': true,
  'ion-avatar': true,
  'ion-badge': true,
  'ion-spinner': true,
  'ion-refresher': true,
  'ion-refresher-content': true,
  'ion-skeleton-text': true,
  'ion-textarea': true,
  'ion-select': true,
  'ion-select-option': true,
  'ion-toggle': true,
  'ion-checkbox': true,
  'ion-radio': true,
  'ion-radio-group': true,
  'ion-range': true,
  'ion-segment': true,
  'ion-segment-button': true,
  'ion-searchbar': true,
  'ion-chip': true,
  'ion-note': true,
  'ion-text': true,
  'ion-row': true,
  'ion-col': true,
  'ion-grid': true,
  'ion-footer': true,
  'ion-buttons': true,
  'ion-back-button': true,
  'ion-menu-button': true,
  'ion-modal': true,
  'ion-popover': true,
  'ion-action-sheet': true,
  'ion-alert': true,
  'ion-toast': true,
  'ion-loading': true,
  'ion-tabs': true,
  'ion-tab-bar': true,
  'ion-tab-button': true,
  'ion-router-outlet': true,
  'ion-nav': true,
  'ion-split-pane': true,
  'ion-menu': true,
  'ion-accordion': true,
  'ion-accordion-group': true,
  'ion-datetime': true,
  'ion-picker': true,
  'ion-reorder': true,
  'ion-reorder-group': true,
  'ion-img': true,
  'ion-thumbnail': true,
  'ion-progress-bar': true,
  'ion-infinite-scroll': true,
  'ion-infinite-scroll-content': true,
  'ion-virtual-scroll': true,
  'ion-item-sliding': true,
  'ion-item-options': true,
  'ion-item-option': true,

  // Nuxt components
  'nuxt-link': true,
  'nuxt-page': true,
  NuxtLink: true,
  NuxtPage: true,

  // i18n
  'i18n-t': true,
}

// Global mocks for Vue Test Utils
config.global.mocks = {
  $t: (key: string) => key,
  $i18n: {
    locale: 'en',
    setLocale: vi.fn(),
  },
}

// ============================================
// Console Filtering (reduce test noise)
// ============================================
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

console.warn = (...args) => {
  // Filter out Vue/Ionic warnings in tests
  const message = args[0]?.toString() || ''
  if (
    message.includes('[Vue warn]') ||
    message.includes('[Ionic Warning]') ||
    message.includes('Ionic:')
  ) {
    return
  }
  originalConsoleWarn.apply(console, args)
}

console.error = (...args) => {
  // Filter out expected errors in tests
  const message = args[0]?.toString() || ''
  if (
    message.includes('[Vue warn]') ||
    message.includes('Unhandled error')
  ) {
    return
  }
  originalConsoleError.apply(console, args)
}

// ============================================
// Additional Browser API Mocks
// ============================================

// matchMedia mock for responsive tests
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// ResizeObserver mock
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
})

// IntersectionObserver mock
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
})

// requestAnimationFrame mock
Object.defineProperty(globalThis, 'requestAnimationFrame', {
  writable: true,
  value: vi.fn((cb: FrameRequestCallback) => {
    setTimeout(cb, 16)
    return 1
  }),
})

Object.defineProperty(globalThis, 'cancelAnimationFrame', {
  writable: true,
  value: vi.fn(),
})

// URL.createObjectURL mock
if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  URL.revokeObjectURL = vi.fn()
}

// ============================================
// Cleanup between tests
// ============================================
import { beforeEach, afterEach } from 'vitest'

beforeEach(() => {
  // Clear localStorage between tests
  mockLocalStorage.clear()

  // Reset process.dev to true (default for testing)
  ;(globalThis as any).process.dev = true
})

afterEach(() => {
  // Clear all mocks
  vi.clearAllMocks()
})
