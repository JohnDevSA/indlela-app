import { defineStore } from 'pinia'
import type { User, AuthResponse } from '~/types'
import { mockUser } from '~/utils/mock-data'

// Enable mock mode for UI development without backend
const MOCK_MODE = true

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(MOCK_MODE ? mockUser : null)
  const token = ref<string | null>(MOCK_MODE ? 'mock-token-12345' : null)
  const isLoading = ref(false)

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isProvider = computed(() => user.value?.role === 'provider')
  const isCustomer = computed(() => user.value?.role === 'customer')
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Hydrate from localStorage on init
  const hydrate = () => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('indlela_token')
      const storedUser = localStorage.getItem('indlela_user')

      if (storedToken) {
        token.value = storedToken
      }
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser)
        } catch {
          user.value = null
        }
      }
    }
  }

  // Persist to localStorage
  const persist = () => {
    if (typeof window !== 'undefined') {
      if (token.value) {
        localStorage.setItem('indlela_token', token.value)
      } else {
        localStorage.removeItem('indlela_token')
      }

      if (user.value) {
        localStorage.setItem('indlela_user', JSON.stringify(user.value))
      } else {
        localStorage.removeItem('indlela_user')
      }
    }
  }

  // Set auth data after login
  const setAuth = (authData: AuthResponse) => {
    token.value = authData.token
    user.value = authData.user
    persist()
  }

  // Update user data
  const setUser = (userData: User) => {
    user.value = userData
    persist()
  }

  // Clear auth state
  const logout = () => {
    token.value = null
    user.value = null
    persist()
  }

  // Initialize on store creation
  hydrate()

  return {
    // State
    user,
    token,
    isLoading,

    // Computed
    isAuthenticated,
    isProvider,
    isCustomer,
    isAdmin,

    // Actions
    setAuth,
    setUser,
    logout,
    hydrate,
  }
})