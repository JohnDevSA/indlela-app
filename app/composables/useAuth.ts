import type { User, AuthResponse } from '~/types'

/**
 * Composable for authentication operations
 * Handles OTP-based phone authentication
 */
export function useAuth() {
  const { post, get, patch, getErrorMessage, isApiError } = useApi()
  const authStore = useAuthStore()
  const { clearOfflineData } = useOffline()

  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const otpSent = ref(false)
  const otpPhone = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)

  /**
   * Normalize South African phone number
   * Converts 0XX to +27XX format
   */
  const normalizePhone = (phone: string): string => {
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '')

    // Convert 0XX to +27XX
    if (cleaned.startsWith('0')) {
      return '+27' + cleaned.substring(1)
    }

    // Add + if it starts with 27
    if (cleaned.startsWith('27')) {
      return '+' + cleaned
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

      await post('/auth/request-otp', { phone: normalized })

      otpSent.value = true
      otpPhone.value = normalized
      return true
    } catch (e) {
      if (isApiError(e) && e.error.code === 'RATE_LIMITED') {
        error.value = 'Too many OTP requests. Please wait a few minutes.'
      } else {
        error.value = getErrorMessage(e)
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Verify OTP and authenticate
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
      const response = await post<{ data: AuthResponse }>('/auth/verify-otp', {
        phone: otpPhone.value,
        otp,
      })

      authStore.setAuth(response.data)

      // Reset OTP state
      otpSent.value = false
      otpPhone.value = null

      return true
    } catch (e) {
      if (isApiError(e) && e.error.code === 'INVALID_OTP') {
        error.value = 'Invalid or expired OTP. Please try again.'
      } else {
        error.value = getErrorMessage(e)
      }
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
   * Fetch current user profile
   */
  const fetchUser = async (): Promise<User | null> => {
    if (!authStore.isAuthenticated) return null

    isLoading.value = true
    error.value = null

    try {
      const response = await get<{ data: User }>('/auth/me')
      authStore.setUser(response.data)
      return response.data
    } catch (e) {
      error.value = getErrorMessage(e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update user profile
   */
  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await patch<{ data: User }>('/auth/me', data)
      authStore.setUser(response.data)
      return true
    } catch (e) {
      error.value = getErrorMessage(e)
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
   */
  const logout = async (): Promise<void> => {
    isLoading.value = true

    try {
      // Call logout endpoint to revoke token
      if (authStore.isAuthenticated) {
        await post('/auth/logout')
      }
    } catch {
      // Ignore logout errors - we're logging out anyway
    } finally {
      // Clear local state
      authStore.logout()
      await clearOfflineData()
      isLoading.value = false

      // Redirect to login
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
    requestOtp,
    verifyOtp,
    resendOtp,
    fetchUser,
    updateProfile,
    updateLocale,
    logout,
    clearError,
    resetOtpFlow,
  }
}