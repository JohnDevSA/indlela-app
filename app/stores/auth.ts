import { defineStore } from 'pinia'
import type { User, AuthResponse } from '~/types'

// Mock users for dev simulation
export const mockUsers = {
  customer: {
    id: 'dev-customer-001',
    phone: '+27821234567',
    email: 'thabo@example.com',
    name: 'Thabo Molefe',
    role: 'customer' as const,
    locale: 'en',
    avatar: undefined,
    phoneVerifiedAt: '2024-01-15T10:00:00Z',
    onboardingCompleted: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  provider: {
    id: 'dev-provider-001',
    phone: '+27831234567',
    email: 'thandi@example.com',
    name: 'Thandi Mokoena',
    role: 'provider' as const,
    locale: 'en',
    avatar: undefined,
    phoneVerifiedAt: '2023-06-01T00:00:00Z',
    onboardingCompleted: true,
    providerId: 'prov-1',
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  admin: {
    id: 'dev-admin-001',
    phone: '+27801234567',
    email: 'admin@indlela.co.za',
    name: 'Admin User',
    role: 'admin' as const,
    locale: 'en',
    avatar: undefined,
    phoneVerifiedAt: '2023-01-01T00:00:00Z',
    onboardingCompleted: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  newCustomer: {
    id: 'dev-new-customer-001',
    phone: '+27821111111',
    email: '',
    name: '',
    role: 'customer' as const,
    locale: 'en',
    avatar: undefined,
    phoneVerifiedAt: new Date().toISOString(),
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  newProvider: {
    id: 'dev-new-provider-001',
    phone: '+27832222222',
    email: '',
    name: '',
    role: 'provider' as const,
    locale: 'en',
    avatar: undefined,
    phoneVerifiedAt: new Date().toISOString(),
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
}

export type MockUserType = keyof typeof mockUsers

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const devMode = ref(process.dev)

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isProvider = computed(() => user.value?.role === 'provider')
  const isCustomer = computed(() => user.value?.role === 'customer')
  const isAdmin = computed(() => user.value?.role === 'admin')
  const needsOnboarding = computed(() => user.value && !user.value.onboardingCompleted)

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

  // === Dev Simulation Methods ===

  // Simulate login as a specific user type
  const devLogin = (userType: MockUserType) => {
    const mockUser = { ...mockUsers[userType] }
    token.value = `dev-token-${userType}-${Date.now()}`
    user.value = mockUser as User
    persist()
    return mockUser
  }

  // Simulate logout
  const devLogout = () => {
    logout()
  }

  // Complete onboarding for current user
  const completeOnboarding = (profileData: Partial<User>) => {
    if (user.value) {
      user.value = {
        ...user.value,
        ...profileData,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      }
      persist()
    }
  }

  // Switch user role (for dev)
  const devSwitchRole = (role: 'customer' | 'provider' | 'admin') => {
    if (role === 'customer') {
      devLogin('customer')
    } else if (role === 'provider') {
      devLogin('provider')
    } else if (role === 'admin') {
      devLogin('admin')
    }
  }

  // Initialize on store creation
  hydrate()

  return {
    // State
    user,
    token,
    isLoading,
    devMode,

    // Computed
    isAuthenticated,
    isProvider,
    isCustomer,
    isAdmin,
    needsOnboarding,

    // Actions
    setAuth,
    setUser,
    logout,
    hydrate,

    // Dev Actions
    devLogin,
    devLogout,
    devSwitchRole,
    completeOnboarding,
  }
})