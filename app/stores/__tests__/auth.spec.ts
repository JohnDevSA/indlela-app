import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore, mockUsers } from '../auth'
import type { AuthResponse, User } from '~/types'

/**
 * Tests for auth store (Pinia)
 * Tests state management, authentication persistence, and role-based access
 */
describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('crucial logic - initial state', () => {
    it('should initialize with null user and token', () => {
      const store = useAuthStore()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should set devMode based on process.dev', () => {
      const store = useAuthStore()

      expect(store.devMode).toBeDefined()
    })
  })

  describe('crucial logic - authentication state', () => {
    it('should set auth data correctly', () => {
      const store = useAuthStore()
      const authData: AuthResponse = {
        token: 'test-token-123',
        user: mockUsers.customer as User,
        isNewUser: false,
      }

      store.setAuth(authData)

      expect(store.token).toBe('test-token-123')
      expect(store.user).toEqual(mockUsers.customer)
      expect(store.isAuthenticated).toBe(true)
    })

    it('should update user data', () => {
      const store = useAuthStore()
      const updatedUser: User = {
        ...mockUsers.customer as User,
        name: 'Updated Name',
        locale: 'zu',
      }

      store.setAuth({
        token: 'token',
        user: mockUsers.customer as User,
        isNewUser: false,
      })

      store.setUser(updatedUser)

      expect(store.user?.name).toBe('Updated Name')
      expect(store.user?.locale).toBe('zu')
    })

    it('should clear auth state on logout', () => {
      const store = useAuthStore()

      store.setAuth({
        token: 'token',
        user: mockUsers.customer as User,
        isNewUser: false,
      })

      expect(store.isAuthenticated).toBe(true)

      store.logout()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('crucial logic - role-based computed properties', () => {
    it('should identify customer role correctly', () => {
      const store = useAuthStore()

      store.setAuth({
        token: 'token',
        user: mockUsers.customer as User,
        isNewUser: false,
      })

      expect(store.isCustomer).toBe(true)
      expect(store.isProvider).toBe(false)
      expect(store.isAdmin).toBe(false)
    })

    it('should identify provider role correctly', () => {
      const store = useAuthStore()

      store.setAuth({
        token: 'token',
        user: mockUsers.provider as User,
        isNewUser: false,
      })

      expect(store.isProvider).toBe(true)
      expect(store.isCustomer).toBe(false)
      expect(store.isAdmin).toBe(false)
    })

    it('should identify admin role correctly', () => {
      const store = useAuthStore()

      store.setAuth({
        token: 'token',
        user: mockUsers.admin as User,
        isNewUser: false,
      })

      expect(store.isAdmin).toBe(true)
      expect(store.isCustomer).toBe(false)
      expect(store.isProvider).toBe(false)
    })
  })

  describe('crucial logic - onboarding state', () => {
    it('should detect when user needs onboarding', () => {
      const store = useAuthStore()

      store.setAuth({
        token: 'token',
        user: mockUsers.newCustomer as User,
        isNewUser: true,
      })

      expect(store.needsOnboarding).toBe(true)
    })

    it('should detect when onboarding is complete', () => {
      const store = useAuthStore()

      store.setAuth({
        token: 'token',
        user: mockUsers.customer as User,
        isNewUser: false,
      })

      expect(store.needsOnboarding).toBe(false)
    })

    it('should complete onboarding', () => {
      const store = useAuthStore()

      store.setAuth({
        token: 'token',
        user: mockUsers.newCustomer as User,
        isNewUser: true,
      })

      expect(store.needsOnboarding).toBe(true)

      store.completeOnboarding({
        name: 'John Doe',
        email: 'john@example.com',
      })

      expect(store.needsOnboarding).toBe(false)
      expect(store.user?.name).toBe('John Doe')
      expect(store.user?.email).toBe('john@example.com')
      expect(store.user?.onboardingCompleted).toBe(true)
    })
  })

  describe('crucial logic - persistence (localStorage)', () => {
    it('should persist token to localStorage on setAuth', () => {
      const store = useAuthStore()

      store.setAuth({
        token: 'test-token',
        user: mockUsers.customer as User,
        isNewUser: false,
      })

      expect(localStorage.setItem).toHaveBeenCalledWith('indlela_token', 'test-token')
    })

    it('should persist user to localStorage on setAuth', () => {
      const store = useAuthStore()

      store.setAuth({
        token: 'test-token',
        user: mockUsers.customer as User,
        isNewUser: false,
      })

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'indlela_user',
        JSON.stringify(mockUsers.customer)
      )
    })

    it('should remove data from localStorage on logout', () => {
      const store = useAuthStore()

      store.setAuth({
        token: 'token',
        user: mockUsers.customer as User,
        isNewUser: false,
      })

      store.logout()

      expect(localStorage.removeItem).toHaveBeenCalledWith('indlela_token')
      expect(localStorage.removeItem).toHaveBeenCalledWith('indlela_user')
    })

    it('should hydrate from localStorage on initialization', () => {
      const storedUser = mockUsers.customer
      ;(localStorage.getItem as any).mockImplementation((key: string) => {
        if (key === 'indlela_token') return 'stored-token'
        if (key === 'indlela_user') return JSON.stringify(storedUser)
        return null
      })

      const store = useAuthStore()
      store.hydrate()

      expect(store.token).toBe('stored-token')
      expect(store.user).toEqual(storedUser)
      expect(store.isAuthenticated).toBe(true)
    })

    it('should handle corrupted localStorage data gracefully', () => {
      ;(localStorage.getItem as any).mockImplementation((key: string) => {
        if (key === 'indlela_token') return 'stored-token'
        if (key === 'indlela_user') return 'invalid-json-{'
        return null
      })

      const store = useAuthStore()
      store.hydrate()

      expect(store.token).toBe('stored-token')
      expect(store.user).toBeNull()
    })
  })

  describe('dev mode functionality', () => {
    it('should login as customer in dev mode', () => {
      const store = useAuthStore()

      const user = store.devLogin('customer')

      expect(user.role).toBe('customer')
      expect(store.isCustomer).toBe(true)
      expect(store.token).toContain('dev-token-customer')
    })

    it('should login as provider in dev mode', () => {
      const store = useAuthStore()

      const user = store.devLogin('provider')

      expect(user.role).toBe('provider')
      expect(store.isProvider).toBe(true)
      expect(store.token).toContain('dev-token-provider')
    })

    it('should login as admin in dev mode', () => {
      const store = useAuthStore()

      const user = store.devLogin('admin')

      expect(user.role).toBe('admin')
      expect(store.isAdmin).toBe(true)
      expect(store.token).toContain('dev-token-admin')
    })

    it('should switch roles in dev mode', () => {
      const store = useAuthStore()

      store.devSwitchRole('customer')
      expect(store.isCustomer).toBe(true)

      store.devSwitchRole('provider')
      expect(store.isProvider).toBe(true)

      store.devSwitchRole('admin')
      expect(store.isAdmin).toBe(true)
    })

    it('should logout in dev mode', () => {
      const store = useAuthStore()

      store.devLogin('customer')
      expect(store.isAuthenticated).toBe(true)

      store.devLogout()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should generate unique tokens for each dev login', async () => {
      const store = useAuthStore()

      store.devLogin('customer')
      const token1 = store.token

      // Add small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 5))

      store.devLogin('customer')
      const token2 = store.token

      expect(token1).not.toBe(token2)
    })
  })

  describe('edge cases', () => {
    it('should handle null user in needsOnboarding', () => {
      const store = useAuthStore()

      // needsOnboarding returns null or false when user is null - both are falsy
      expect(store.needsOnboarding).toBeFalsy()
    })

    it('should handle multiple rapid setAuth calls', () => {
      const store = useAuthStore()

      store.setAuth({
        token: 'token1',
        user: mockUsers.customer as User,
        isNewUser: false,
      })

      store.setAuth({
        token: 'token2',
        user: mockUsers.provider as User,
        isNewUser: false,
      })

      expect(store.token).toBe('token2')
      expect(store.user?.role).toBe('provider')
    })

    it('should handle completing onboarding without user', () => {
      const store = useAuthStore()

      // Should not crash when user is null
      store.completeOnboarding({ name: 'Test' })

      expect(store.user).toBeNull()
    })

    it('should preserve providerId for provider users', () => {
      const store = useAuthStore()

      store.setAuth({
        token: 'token',
        user: mockUsers.provider as User,
        isNewUser: false,
      })

      expect(store.user?.providerId).toBe('prov-1')
    })
  })

  describe('mock users validation', () => {
    it('should have valid customer mock user', () => {
      expect(mockUsers.customer.role).toBe('customer')
      expect(mockUsers.customer.phone).toMatch(/^\+27/)
      expect(mockUsers.customer.onboardingCompleted).toBe(true)
    })

    it('should have valid provider mock user', () => {
      expect(mockUsers.provider.role).toBe('provider')
      expect(mockUsers.provider.phone).toMatch(/^\+27/)
      expect(mockUsers.provider.providerId).toBeDefined()
      expect(mockUsers.provider.onboardingCompleted).toBe(true)
    })

    it('should have valid admin mock user', () => {
      expect(mockUsers.admin.role).toBe('admin')
      expect(mockUsers.admin.phone).toMatch(/^\+27/)
      expect(mockUsers.admin.onboardingCompleted).toBe(true)
    })

    it('should have new users without completed onboarding', () => {
      expect(mockUsers.newCustomer.onboardingCompleted).toBe(false)
      expect(mockUsers.newProvider.onboardingCompleted).toBe(false)
    })
  })
})
