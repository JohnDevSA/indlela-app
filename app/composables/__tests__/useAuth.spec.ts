import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuth } from '../useAuth'
import { useAuthStore } from '~/stores/auth'

// Mock useApi composable
vi.mock('../useApi', () => ({
  useApi: () => ({
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  }),
}))

/**
 * Tests for useAuth composable
 * Covers phone number validation, OTP flow, and authentication logic
 */
describe('useAuth Composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('crucial logic - phone number validation', () => {
    it('should normalize South African phone numbers starting with 0', () => {
      const { normalizePhone } = useAuth()

      expect(normalizePhone('0821234567')).toBe('+27821234567')
      expect(normalizePhone('0711234567')).toBe('+27711234567')
      expect(normalizePhone('0601234567')).toBe('+27601234567')
    })

    it('should normalize phone numbers starting with 27', () => {
      const { normalizePhone } = useAuth()

      expect(normalizePhone('27821234567')).toBe('+27821234567')
      expect(normalizePhone('27711234567')).toBe('+27711234567')
    })

    it('should keep properly formatted numbers unchanged', () => {
      const { normalizePhone } = useAuth()

      expect(normalizePhone('+27821234567')).toBe('+27821234567')
    })

    it('should remove non-digit characters except +', () => {
      const { normalizePhone } = useAuth()

      expect(normalizePhone('082 123 4567')).toBe('+27821234567')
      expect(normalizePhone('082-123-4567')).toBe('+27821234567')
      expect(normalizePhone('(082) 123-4567')).toBe('+27821234567')
    })

    it('should validate correct SA mobile numbers', () => {
      const { isValidPhone } = useAuth()

      // Valid SA mobile prefixes: 6, 7, 8
      expect(isValidPhone('+27821234567')).toBe(true) // MTN
      expect(isValidPhone('+27711234567')).toBe(true) // Vodacom
      expect(isValidPhone('+27601234567')).toBe(true) // Cell C
      expect(isValidPhone('0821234567')).toBe(true) // Should normalize first
    })

    it('should reject invalid SA mobile numbers', () => {
      const { isValidPhone } = useAuth()

      expect(isValidPhone('+27521234567')).toBe(false) // Invalid prefix
      expect(isValidPhone('+27921234567')).toBe(false) // Invalid prefix
      expect(isValidPhone('+2782123456')).toBe(false) // Too short
      expect(isValidPhone('+278212345678')).toBe(false) // Too long
      expect(isValidPhone('+1234567890')).toBe(false) // Wrong country
      expect(isValidPhone('12345')).toBe(false) // Too short
      expect(isValidPhone('')).toBe(false) // Empty
    })

    it('should handle edge cases in phone validation', () => {
      const { isValidPhone } = useAuth()

      expect(isValidPhone('not a phone')).toBe(false)
      expect(isValidPhone('++27821234567')).toBe(false)
      expect(isValidPhone('27 82 123 4567')).toBe(true) // Should normalize
    })
  })

  describe('crucial logic - OTP request flow', () => {
    it('should successfully request OTP in dev mode', async () => {
      // Set dev mode
      process.dev = true

      const { requestOtp, otpSent, otpPhone, isLoading, error } = useAuth()

      const result = await requestOtp('0821234567')

      expect(result).toBe(true)
      expect(otpSent.value).toBe(true)
      expect(otpPhone.value).toBe('+27821234567')
      expect(isLoading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('should reject invalid phone numbers', async () => {
      process.dev = true

      const { requestOtp, error, otpSent } = useAuth()

      const result = await requestOtp('12345')

      expect(result).toBe(false)
      expect(otpSent.value).toBe(false)
      expect(error.value).toBe('Invalid phone number format')
    })

    it('should set loading state during OTP request', async () => {
      process.dev = true

      const { requestOtp, isLoading } = useAuth()

      const promise = requestOtp('0821234567')
      expect(isLoading.value).toBe(true)

      await promise
      expect(isLoading.value).toBe(false)
    })
  })

  describe('crucial logic - OTP verification', () => {
    it('should verify valid OTP in dev mode', async () => {
      process.dev = true

      const { requestOtp, verifyOtp, isAuthenticated } = useAuth()
      const authStore = useAuthStore()

      // First request OTP
      await requestOtp('0821234567')

      // Then verify with any 6-digit code in dev mode
      const result = await verifyOtp('123456')

      expect(result).toBe(true)
      expect(isAuthenticated.value).toBe(true)
      expect(authStore.user).not.toBeNull()
      expect(authStore.token).not.toBeNull()
    })

    it('should reject invalid OTP length', async () => {
      process.dev = true

      const { requestOtp, verifyOtp, error } = useAuth()

      await requestOtp('0821234567')

      const result = await verifyOtp('123') // Too short

      expect(result).toBe(false)
      expect(error.value).toBe('Invalid OTP')
    })

    it('should require OTP request before verification', async () => {
      process.dev = true

      const { verifyOtp, error } = useAuth()

      const result = await verifyOtp('123456')

      expect(result).toBe(false)
      expect(error.value).toBe('Please request OTP first')
    })

    it('should login as provider when phone contains 831', async () => {
      process.dev = true

      const { requestOtp, verifyOtp } = useAuth()
      const authStore = useAuthStore()

      await requestOtp('0831234567') // Provider number
      await verifyOtp('123456')

      expect(authStore.user?.role).toBe('provider')
      expect(authStore.isProvider).toBe(true)
    })

    it('should login as admin when phone contains 801', async () => {
      process.dev = true

      const { requestOtp, verifyOtp } = useAuth()
      const authStore = useAuthStore()

      await requestOtp('0801234567') // Admin number
      await verifyOtp('123456')

      expect(authStore.user?.role).toBe('admin')
      expect(authStore.isAdmin).toBe(true)
    })

    it('should login as customer for regular numbers', async () => {
      process.dev = true

      const { requestOtp, verifyOtp } = useAuth()
      const authStore = useAuthStore()

      await requestOtp('0821234567') // Regular customer number
      await verifyOtp('123456')

      expect(authStore.user?.role).toBe('customer')
      expect(authStore.isCustomer).toBe(true)
    })

    it('should reset OTP state after successful verification', async () => {
      process.dev = true

      const { requestOtp, verifyOtp, otpSent, otpPhone } = useAuth()

      await requestOtp('0821234567')
      expect(otpSent.value).toBe(true)
      expect(otpPhone.value).toBe('+27821234567')

      await verifyOtp('123456')

      expect(otpSent.value).toBe(false)
      expect(otpPhone.value).toBeNull()
    })
  })

  describe('usability - OTP resend functionality', () => {
    it('should resend OTP to same phone number', async () => {
      process.dev = true

      const { requestOtp, resendOtp, otpPhone } = useAuth()

      await requestOtp('0821234567')
      const originalPhone = otpPhone.value

      const result = await resendOtp()

      expect(result).toBe(true)
      expect(otpPhone.value).toBe(originalPhone)
    })

    it('should fail to resend without initial OTP request', async () => {
      process.dev = true

      const { resendOtp, error } = useAuth()

      const result = await resendOtp()

      expect(result).toBe(false)
      expect(error.value).toBe('No phone number to resend OTP to')
    })
  })

  describe('usability - OTP flow reset', () => {
    it('should reset OTP flow completely', async () => {
      process.dev = true

      const { requestOtp, resetOtpFlow, otpSent, otpPhone, error } = useAuth()

      await requestOtp('0821234567')
      expect(otpSent.value).toBe(true)

      resetOtpFlow()

      expect(otpSent.value).toBe(false)
      expect(otpPhone.value).toBeNull()
      expect(error.value).toBeNull()
    })
  })

  describe('crucial logic - user profile management', () => {
    it('should fetch user profile when authenticated', async () => {
      process.dev = true

      const { requestOtp, verifyOtp, fetchUser, user } = useAuth()

      await requestOtp('0821234567')
      await verifyOtp('123456')

      const fetchedUser = await fetchUser()

      expect(fetchedUser).not.toBeNull()
      expect(fetchedUser?.phone).toBe('+27821234567')
      expect(user.value).toBe(fetchedUser)
    })

    it('should return null when fetching user without authentication', async () => {
      const { fetchUser } = useAuth()

      const result = await fetchUser()

      expect(result).toBeNull()
    })

    it('should update user profile in dev mode', async () => {
      process.dev = true

      const { requestOtp, verifyOtp, updateProfile, user } = useAuth()

      await requestOtp('0821234567')
      await verifyOtp('123456')

      const result = await updateProfile({ name: 'Updated Name' })

      expect(result).toBe(true)
      expect(user.value?.name).toBe('Updated Name')
    })

    it('should update user locale', async () => {
      process.dev = true

      const { requestOtp, verifyOtp, updateLocale, user } = useAuth()

      await requestOtp('0821234567')
      await verifyOtp('123456')

      await updateLocale('zu')

      expect(user.value?.locale).toBe('zu')
    })
  })

  describe('crucial logic - logout', () => {
    it('should clear auth state on logout', async () => {
      process.dev = true

      const { requestOtp, verifyOtp, logout, isAuthenticated } = useAuth()
      const authStore = useAuthStore()

      await requestOtp('0821234567')
      await verifyOtp('123456')
      expect(isAuthenticated.value).toBe(true)

      await logout()

      expect(isAuthenticated.value).toBe(false)
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
    })
  })

  describe('usability - error handling', () => {
    it('should clear error state', async () => {
      process.dev = true

      const { requestOtp, error, clearError } = useAuth()

      await requestOtp('invalid')
      expect(error.value).not.toBeNull()

      clearError()
      expect(error.value).toBeNull()
    })

    it('should set error on invalid operations', async () => {
      process.dev = true

      const { verifyOtp, error } = useAuth()

      await verifyOtp('123456') // Without requesting first

      expect(error.value).toBe('Please request OTP first')
    })
  })

  describe('dev mode helpers', () => {
    it('should allow direct dev login as any user type', () => {
      process.dev = true

      const { devLoginAs } = useAuth()
      const authStore = useAuthStore()

      const customerUser = devLoginAs('customer')
      expect(customerUser.role).toBe('customer')
      expect(authStore.isCustomer).toBe(true)

      const providerUser = devLoginAs('provider')
      expect(providerUser.role).toBe('provider')
      expect(authStore.isProvider).toBe(true)

      const adminUser = devLoginAs('admin')
      expect(adminUser.role).toBe('admin')
      expect(authStore.isAdmin).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle concurrent OTP requests', async () => {
      process.dev = true

      const { requestOtp, otpPhone } = useAuth()

      const promise1 = requestOtp('0821111111')
      const promise2 = requestOtp('0822222222')

      await Promise.all([promise1, promise2])

      // Last request should win
      expect(otpPhone.value).toBe('+27822222222')
    })

    it('should handle special characters in phone numbers', () => {
      const { normalizePhone, isValidPhone } = useAuth()

      const messyPhone = '+27 (082) 123-4567'
      const normalized = normalizePhone(messyPhone)

      expect(normalized).toBe('+27821234567')
      expect(isValidPhone(messyPhone)).toBe(true)
    })

    it('should handle empty string phone numbers', () => {
      const { isValidPhone, normalizePhone } = useAuth()

      expect(isValidPhone('')).toBe(false)
      expect(normalizePhone('')).toBe('')
    })
  })
})
