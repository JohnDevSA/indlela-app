import type { User, AuthResponse } from '~/types'
import { useAuthStore, mockUsers, type MockUserType } from '~/stores/auth'
import { getErrorMessage } from '~/utils/api'

/**
 * Transform API user response (snake_case) to User type (camelCase)
 */
function transformApiUser(apiUser: Record<string, unknown>): User {
  const role = (apiUser.role as 'customer' | 'provider' | 'admin') || 'customer'
  const hasName = !!(apiUser.name && String(apiUser.name).trim().length > 0 && String(apiUser.name) !== 'User')
  const provider = apiUser.provider as Record<string, unknown> | null
  const hasProviderId = !!(provider && provider.id)

  // Check if provider has completed their profile (not just a skeleton record)
  // A complete provider profile has: location AND availability set
  const providerOnboardingComplete = !!(
    provider &&
    provider.id &&
    provider.location &&
    provider.availability
  )

  // Determine onboarding status based on role:
  // - Providers: must have a COMPLETE provider profile (location + availability)
  // - Admins: always considered onboarded
  // - Customers: must have a real name (not default "User")
  let onboardingCompleted = false
  if (role === 'admin') {
    onboardingCompleted = true
  } else if (role === 'provider') {
    onboardingCompleted = providerOnboardingComplete
  } else {
    onboardingCompleted = hasName
  }

  return {
    id: String(apiUser.id),
    phone: String(apiUser.phone || ''),
    email: apiUser.email ? String(apiUser.email) : undefined,
    name: String(apiUser.name || ''),
    role,
    locale: (apiUser.locale as 'en' | 'zu' | 'xh' | 'af' | 'st' | 'tn') || 'en',
    avatar: apiUser.avatar ? String(apiUser.avatar) : undefined,
    phoneVerifiedAt: apiUser.phone_verified_at ? String(apiUser.phone_verified_at) : undefined,
    emailVerifiedAt: apiUser.email_verified_at ? String(apiUser.email_verified_at) : undefined,
    onboardingCompleted,
    providerId: hasProviderId ? String(provider!.id) : undefined,
    createdAt: String(apiUser.created_at || new Date().toISOString()),
    updatedAt: String(apiUser.updated_at || apiUser.created_at || new Date().toISOString()),
  }
}

/**
 * Transform API auth response to AuthResponse type
 */
function transformAuthResponse(apiResponse: Record<string, unknown>): AuthResponse {
  const user = transformApiUser(apiResponse.user as Record<string, unknown>)
  return {
    token: String(apiResponse.token || ''),
    user,
    isNewUser: !user.onboardingCompleted,
  }
}

/**
 * Composable for authentication operations
 * Uses mock data when useMockApi is enabled, otherwise makes real API calls
 * Set NUXT_PUBLIC_USE_MOCK_API=true to use mock mode
 */
export function useAuth() {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  // Use mock API only when explicitly enabled via NUXT_PUBLIC_USE_MOCK_API=true
  const useMock = config.public.useMockApi as boolean

  // State - use useState for shared state across components
  const isLoading = useState<boolean>('auth-loading', () => false)
  const error = useState<string | null>('auth-error', () => null)
  const otpSent = useState<boolean>('auth-otp-sent', () => false)
  const otpPhone = useState<string | null>('auth-otp-phone', () => null)

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

      if (useMock) {
        // Mock mode: simulate delay and success
        await new Promise(resolve => setTimeout(resolve, 500))
        otpSent.value = true
        otpPhone.value = normalized
        return true
      }

      // Real API call
      const { post } = useApi()
      await post('/auth/send-otp', { phone: normalized })

      otpSent.value = true
      otpPhone.value = normalized
      return true
    } catch (e) {
      console.error('[Auth] Send OTP error:', e)
      error.value = getErrorMessage(e) || 'Failed to send OTP. Please try again.'
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
      if (useMock) {
        // Mock mode: simulate delay and login
        await new Promise(resolve => setTimeout(resolve, 500))

        // Any 6-digit OTP works in mock mode
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

      // Real API call
      const { post } = useApi()
      const apiResponse = await post<Record<string, unknown>>('/auth/verify-otp', {
        phone: otpPhone.value,
        otp,
        role: getSelectedRole(), // Send selected role to backend
      })

      // Transform API response (snake_case) to our types (camelCase)
      const authData = transformAuthResponse(apiResponse)
      authStore.setAuth(authData)

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

    if (useMock) {
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
      if (useMock) {
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
      if (!useMock && authStore.isAuthenticated) {
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