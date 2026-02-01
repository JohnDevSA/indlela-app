import { defineStore } from 'pinia'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
  action?: {
    label: string
    handler: () => void
  }
}

interface Modal {
  id: string
  component: string
  props?: Record<string, unknown>
  onClose?: () => void
}

interface UIState {
  // Navigation
  isMenuOpen: boolean
  activeTab: string

  // Loading states
  isPageLoading: boolean
  loadingMessage: string | null

  // Toasts
  toasts: Toast[]

  // Modals
  activeModal: Modal | null
  modalStack: Modal[]

  // Search
  isSearchOpen: boolean
  searchQuery: string

  // Theme
  isDarkMode: boolean
  preferredLocale: string

  // App state
  isAppReady: boolean
  hasCompletedOnboarding: boolean
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    // Navigation
    isMenuOpen: false,
    activeTab: 'home',

    // Loading
    isPageLoading: false,
    loadingMessage: null,

    // Toasts
    toasts: [],

    // Modals
    activeModal: null,
    modalStack: [],

    // Search
    isSearchOpen: false,
    searchQuery: '',

    // Theme - default to system preference
    isDarkMode:
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false,
    preferredLocale: 'en',

    // App state
    isAppReady: false,
    hasCompletedOnboarding: false,
  }),

  getters: {
    /**
     * Check if any modal is open
     */
    hasActiveModal: (state): boolean => {
      return state.activeModal !== null
    },

    /**
     * Get toast count
     */
    toastCount: (state): number => {
      return state.toasts.length
    },

    /**
     * Check if app is in loading state
     */
    isLoading: (state): boolean => {
      return state.isPageLoading
    },
  },

  actions: {
    // ============================================
    // Navigation
    // ============================================

    /**
     * Toggle side menu
     */
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },

    /**
     * Open side menu
     */
    openMenu() {
      this.isMenuOpen = true
    },

    /**
     * Close side menu
     */
    closeMenu() {
      this.isMenuOpen = false
    },

    /**
     * Set active tab
     */
    setActiveTab(tab: string) {
      this.activeTab = tab
    },

    // ============================================
    // Loading States
    // ============================================

    /**
     * Start page loading
     */
    startLoading(message?: string) {
      this.isPageLoading = true
      this.loadingMessage = message || null
    },

    /**
     * Stop page loading
     */
    stopLoading() {
      this.isPageLoading = false
      this.loadingMessage = null
    },

    // ============================================
    // Toasts
    // ============================================

    /**
     * Show a toast notification
     */
    showToast(options: {
      type: ToastType
      message: string
      duration?: number
      action?: { label: string; handler: () => void }
    }) {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const toast: Toast = {
        id,
        type: options.type,
        message: options.message,
        duration: options.duration ?? 4000,
        action: options.action,
      }

      this.toasts.push(toast)

      // Auto-dismiss after duration
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => {
          this.dismissToast(id)
        }, toast.duration)
      }

      return id
    },

    /**
     * Show success toast
     */
    showSuccess(message: string, duration?: number) {
      return this.showToast({ type: 'success', message, duration })
    },

    /**
     * Show error toast
     */
    showError(message: string, duration?: number) {
      return this.showToast({ type: 'error', message, duration: duration ?? 6000 })
    },

    /**
     * Show warning toast
     */
    showWarning(message: string, duration?: number) {
      return this.showToast({ type: 'warning', message, duration })
    },

    /**
     * Show info toast
     */
    showInfo(message: string, duration?: number) {
      return this.showToast({ type: 'info', message, duration })
    },

    /**
     * Dismiss a specific toast
     */
    dismissToast(id: string) {
      const index = this.toasts.findIndex(t => t.id === id)
      if (index !== -1) {
        this.toasts.splice(index, 1)
      }
    },

    /**
     * Dismiss all toasts
     */
    clearToasts() {
      this.toasts = []
    },

    // ============================================
    // Modals
    // ============================================

    /**
     * Open a modal
     */
    openModal(options: {
      component: string
      props?: Record<string, unknown>
      onClose?: () => void
    }) {
      const id = `modal-${Date.now()}`
      const modal: Modal = {
        id,
        component: options.component,
        props: options.props,
        onClose: options.onClose,
      }

      // Push current modal to stack if exists
      if (this.activeModal) {
        this.modalStack.push(this.activeModal)
      }

      this.activeModal = modal
      return id
    },

    /**
     * Close the active modal
     */
    closeModal() {
      if (this.activeModal?.onClose) {
        this.activeModal.onClose()
      }

      // Restore previous modal from stack
      if (this.modalStack.length > 0) {
        this.activeModal = this.modalStack.pop() || null
      } else {
        this.activeModal = null
      }
    },

    /**
     * Close all modals
     */
    closeAllModals() {
      this.modalStack = []
      if (this.activeModal?.onClose) {
        this.activeModal.onClose()
      }
      this.activeModal = null
    },

    // ============================================
    // Search
    // ============================================

    /**
     * Open search
     */
    openSearch() {
      this.isSearchOpen = true
    },

    /**
     * Close search
     */
    closeSearch() {
      this.isSearchOpen = false
      this.searchQuery = ''
    },

    /**
     * Set search query
     */
    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    // ============================================
    // Theme
    // ============================================

    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      this.applyTheme()
    },

    /**
     * Set dark mode
     */
    setDarkMode(enabled: boolean) {
      this.isDarkMode = enabled
      this.applyTheme()
    },

    /**
     * Apply theme to document
     */
    applyTheme() {
      if (typeof document === 'undefined') return

      if (this.isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },

    /**
     * Set preferred locale
     */
    setLocale(locale: string) {
      this.preferredLocale = locale
    },

    // ============================================
    // App State
    // ============================================

    /**
     * Mark app as ready
     */
    setAppReady() {
      this.isAppReady = true
    },

    /**
     * Mark onboarding as completed
     */
    completeOnboarding() {
      this.hasCompletedOnboarding = true
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('indlela_onboarding_completed', 'true')
      }
    },

    /**
     * Check onboarding status from storage
     */
    checkOnboardingStatus() {
      if (typeof localStorage !== 'undefined') {
        this.hasCompletedOnboarding =
          localStorage.getItem('indlela_onboarding_completed') === 'true'
      }
    },

    /**
     * Initialize UI store
     */
    init() {
      this.checkOnboardingStatus()
      this.applyTheme()

      // Listen for system theme changes
      if (typeof window !== 'undefined') {
        window
          .matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', e => {
            this.isDarkMode = e.matches
            this.applyTheme()
          })
      }
    },

    /**
     * Reset store
     */
    $reset() {
      this.isMenuOpen = false
      this.activeTab = 'home'
      this.isPageLoading = false
      this.loadingMessage = null
      this.toasts = []
      this.activeModal = null
      this.modalStack = []
      this.isSearchOpen = false
      this.searchQuery = ''
    },
  },
})