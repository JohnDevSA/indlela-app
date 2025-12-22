import type { User, AuthResponse } from '~/types'
import { useAuthStore, mockUsers, type MockUserType } from '~/stores/auth'

/**
 * Composable for authentication operations
 * In dev mode, uses mock data without API calls
 * In production, handles OTP-based phone authentication
 */
export function useAuth() {
  const authStore = useAuthStore()
  const isDev = process.dev

  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const otpSent = ref(false)
  const otpPhone = ref<string | null>(null)

  /**
   * Get the selected role from session storage (set during onboarding flow)
   */
  const getSelectedRole = (): 'customer' | 'provider' => {
    if (typeof window !== 'undefined') {
      const role = sessionStorage.getItem('indlela_selected_role')
      if (role === 'provider') return 'provider'
    }
    return 'customer'
  }

  /**
   * Clear the selected role from session storage
   */
  const clearSelectedRole = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('indlela_selected_role')
    }
  }

  // Computed
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)

  /**
   * Normalize South African phone number
   * Converts 0XX to +27XX format
   */
  const normalizePhone = (phone: string): string => {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '')

    // Convert 0XX to +27XX
    if (cleaned.startsWith('0')) {
      return '+27' + cleaned.substring(1)
    }

    // Add + if it starts with 27
    if (cleaned.startsWith('27')) {
      cleaned = '+' + cleaned
    }

    // Handle edge case: +270XX (country code + local format with leading 0)
    if (cleaned.startsWith('+270')) {
      return '+27' + cleaned.substring(4)
    }

    return cleaned
  }

  /**
   * Validate South African phone number
   */
  const isValidPhone = (phone: string): boolean => {
    const normalized = normalizePhone(phone)
    // SA mobile numbers: +27 6/7/8 X XXX XXXX
    return /^\+27[6-8][0-9]{8}$/.test(normalized)
  }

  /**
   * Request OTP for phone number
   * In dev mode: simulates OTP sent
   */
  const requestOtp = async (phone: string): Promise<boolean> => {
    error.value = null
    isLoading.value = true

    try {
      const normalized = normalizePhone(phone)

      if (!isValidPhone(normalized)) {
        error.value = 'Invalid phone number format'
        return false
      }

      if (isDev) {
        // Dev mode: simulate delay and success
        await new Promise(resolve => setTimeout(resolve, 500))
        otpSent.value = true
        otpPhone.value = normalized
        return true
      }

      // Production: make API call
      const { post } = useApi()
      await post('/auth/request-otp', { phone: normalized })

      otpSent.value = true
      otpPhone.value = normalized
      return true
    } catch (e) {
      error.value = 'Failed to send OTP. Please try again.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Verify OTP and authenticate
   * In dev mode: any 6-digit code works, logs in as customer
   */
  const verifyOtp = async (otp: string): Promise<boolean> => {
    error.value = null
    isLoading.value = true

    if (!otpPhone.value) {
      error.value = 'Please request OTP first'
      isLoading.value = false
      return false
    }

    try {
      if (isDev) {
        // Dev mode: simulate delay and login
        await new Promise(resolve => setTimeout(resolve, 500))

        // Any 6-digit OTP works in dev mode
        if (otp.length === 6) {
          // Use the role selected during onboarding, with fallback to phone-based detection
          const selectedRole = getSelectedRole()
          let userType: MockUserType = 'customer'

          // Admin detection via phone number (special case)
          if (otpPhone.value?.includes('801')) {
            userType = 'admin'
          } else if (selectedRole === 'provider') {
            // User selected provider role - create as new provider needing onboarding
            userType = 'newProvider'
          } else {
            // User selected customer role - create as new customer needing onboarding
            userType = 'newCustomer'
          }

          authStore.devLogin(userType)

          // Clear selected role after successful login
          clearSelectedRole()

          // Reset OTP state
          otpSent.value = false
          otpPhone.value = null

          return true
        } else {
          error.value = 'Invalid OTP'
          return false
        }
      }

      // Production: make API call
      const { post } = useApi()
      const response = await post<{ data: AuthResponse }>('/auth/verify-otp', {
        phone: otpPhone.value,
        otp,
        role: getSelectedRole(), // Send selected role to backend
      })

      authStore.setAuth(response.data)

      // Clear selected role after successful login
      clearSelectedRole()

      // Reset OTP state
      otpSent.value = false
      otpPhone.value = null

      return true
    } catch (e) {
      error.value = 'Invalid or expired OTP. Please try again.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Resend OTP to the same phone number
   */
  const resendOtp = async (): Promise<boolean> => {
    if (!otpPhone.value) {
      error.value = 'No phone number to resend OTP to'
      return false
    }

    return requestOtp(otpPhone.value)
  }

  /**
   * Dev login - directly login as a specific user type
   */
  const devLoginAs = (userType: MockUserType): User => {
    clearSelectedRole()
    return authStore.devLogin(userType) as User
  }

  /**
   * Fetch current user profile
   * In dev mode: returns current mock user
   */
  const fetchUser = async (): Promise<User | null> => {
    if (!authStore.isAuthenticated) return null

    if (isDev) {
      return authStore.user
    }

    isLoading.value = true
    error.value = null

    try {
      const { get } = useApi()
      const response = await get<{ data: User }>('/auth/me')
      authStore.setUser(response.data)
      return response.data
    } catch (e) {
      error.value = 'Failed to fetch user profile'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update user profile
   * In dev mode: updates local state only
   */
  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      if (isDev) {
        await new Promise(resolve => setTimeout(resolve, 300))
        if (authStore.user) {
          authStore.setUser({ ...authStore.user, ...data } as User)
        }
        return true
      }

      const { patch } = useApi()
      const response = await patch<{ data: User }>('/auth/me', data)
      authStore.setUser(response.data)
      return true
    } catch (e) {
      error.value = 'Failed to update profile'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update user locale preference
   */
  const updateLocale = async (locale: string): Promise<boolean> => {
    return updateProfile({ locale } as Partial<User>)
  }

  /**
   * Logout user
   * Clears offline data to protect user privacy on shared devices
   */
  const logout = async (): Promise<void> => {
    isLoading.value = true

    try {
      if (!isDev && authStore.isAuthenticated) {
        const { post } = useApi()
        await post('/auth/logout')
      }
    } catch {
      // Ignore logout errors
    } finally {
      // Clear offline data before logout (security: remove cached user data)
      try {
        const { clearOfflineData } = useOffline()
        await clearOfflineData()
      } catch {
        // Continue with logout even if cache clear fails
      }

      authStore.logout()
      isLoading.value = false
      navigateTo('/auth/login')
    }
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Reset OTP flow (for back button)
   */
  const resetOtpFlow = () => {
    otpSent.value = false
    otpPhone.value = null
    error.value = null
  }

  return {
    // State (readonly)
    isLoading: readonly(isLoading),
    error: readonly(error),
    otpSent: readonly(otpSent),
    otpPhone: readonly(otpPhone),

    // Computed
    isAuthenticated,
    user,

    // Methods
    normalizePhone,
    isValidPhone,
    getSelectedRole,
    clearSelectedRole,
    requestOtp,
    verifyOtp,
    resendOtp,
    devLoginAs,
    fetchUser,
    updateProfile,
    updateLocale,
    logout,
    clearError,
    resetOtpFlow,
  }
}