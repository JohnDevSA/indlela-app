/**
 * Formatting utilities for Indlela app
 * Provides consistent formatting for currency, dates, phone numbers, etc.
 *
 * All formatters are locale-aware and use South African conventions by default.
 */

import { BUSINESS_RULES } from '~/types'

// ============================================
// Currency Formatting
// ============================================

/**
 * Format amount as South African Rand
 * @example formatCurrency(150) => "R150.00"
 * @example formatCurrency(1500.5) => "R1,500.50"
 */
export function formatCurrency(
  amount: number,
  options?: {
    showCents?: boolean
    showSymbol?: boolean
  }
): string {
  const { showCents = true, showSymbol = true } = options || {}

  const formatted = amount.toLocaleString('en-ZA', {
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  })

  return showSymbol ? `R${formatted}` : formatted
}

/**
 * Format amount as compact currency (for large amounts)
 * @example formatCurrencyCompact(15000) => "R15K"
 * @example formatCurrencyCompact(1500000) => "R1.5M"
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `R${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `R${(amount / 1_000).toFixed(amount >= 10_000 ? 0 : 1)}K`
  }
  return formatCurrency(amount, { showCents: false })
}

/**
 * Calculate booking total with commission
 * @example calculateBookingTotal(100) => { base: 100, commission: 12, bookingFee: 10, total: 122 }
 */
export function calculateBookingTotal(baseAmount: number): {
  base: number
  commission: number
  bookingFee: number
  total: number
} {
  const commission = Math.round(baseAmount * BUSINESS_RULES.COMMISSION_RATE * 100) / 100
  const bookingFee = baseAmount > 100 ? BUSINESS_RULES.BOOKING_FEE_MAX : BUSINESS_RULES.BOOKING_FEE_MIN
  const total = baseAmount + commission + bookingFee

  return {
    base: baseAmount,
    commission,
    bookingFee,
    total: Math.round(total * 100) / 100,
  }
}

// ============================================
// Date & Time Formatting
// ============================================

/**
 * Format date for display
 * @example formatDate(new Date()) => "Mon, 22 Dec"
 */
export function formatDate(
  date: Date | string,
  options?: {
    format?: 'short' | 'medium' | 'long' | 'full'
    includeYear?: boolean
  }
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const { format = 'short', includeYear = false } = options || {}

  const formats: Record<string, Intl.DateTimeFormatOptions> = {
    short: { weekday: 'short', day: 'numeric', month: 'short' },
    medium: { weekday: 'long', day: 'numeric', month: 'short' },
    long: { weekday: 'long', day: 'numeric', month: 'long' },
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  }

  const formatOptions = { ...formats[format] }
  if (includeYear && format !== 'full') {
    formatOptions.year = 'numeric'
  }

  return d.toLocaleDateString('en-ZA', formatOptions)
}

/**
 * Format time for display
 * @example formatTime(new Date()) => "14:30"
 */
export function formatTime(
  date: Date | string,
  options?: {
    format?: '12h' | '24h'
  }
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const { format = '24h' } = options || {}

  return d.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: format === '12h',
  })
}

/**
 * Format date and time together
 * @example formatDateTime(new Date()) => "Mon, 22 Dec at 14:30"
 */
export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} at ${formatTime(date)}`
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * @example formatRelativeTime(pastDate) => "2 hours ago"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffMins = Math.round(diffMs / 60000)
  const diffHours = Math.round(diffMs / 3600000)
  const diffDays = Math.round(diffMs / 86400000)

  // Past
  if (diffMs < 0) {
    if (diffMins > -60) return `${Math.abs(diffMins)} min ago`
    if (diffHours > -24) return `${Math.abs(diffHours)} hours ago`
    if (diffDays > -7) return `${Math.abs(diffDays)} days ago`
    return formatDate(d, { includeYear: d.getFullYear() !== now.getFullYear() })
  }

  // Future
  if (diffMins < 60) return `in ${diffMins} min`
  if (diffHours < 24) return `in ${diffHours} hours`
  if (diffDays < 7) return `in ${diffDays} days`
  return formatDate(d, { includeYear: d.getFullYear() !== now.getFullYear() })
}

/**
 * Format duration in minutes to human-readable string
 * @example formatDuration(90) => "1h 30min"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if date is tomorrow
 */
export function isTomorrow(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  )
}

// ============================================
// Phone Number Formatting
// ============================================

/**
 * Format South African phone number for display
 * @example formatPhoneDisplay("+27821234567") => "082 123 4567"
 */
export function formatPhoneDisplay(phone: string): string {
  // Remove all non-digits except +
  const cleaned = phone.replace(/[^\d+]/g, '')

  // Handle +27 prefix
  if (cleaned.startsWith('+27')) {
    const localNumber = cleaned.slice(3)
    if (localNumber.length === 9) {
      return `0${localNumber.slice(0, 2)} ${localNumber.slice(2, 5)} ${localNumber.slice(5)}`
    }
  }

  // Handle 27 prefix
  if (cleaned.startsWith('27') && cleaned.length === 11) {
    const localNumber = cleaned.slice(2)
    return `0${localNumber.slice(0, 2)} ${localNumber.slice(2, 5)} ${localNumber.slice(5)}`
  }

  // Handle 0 prefix
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }

  return phone
}

/**
 * Mask phone number for privacy
 * @example maskPhone("+27821234567") => "082 *** 4567"
 */
export function maskPhone(phone: string): string {
  const formatted = formatPhoneDisplay(phone)
  const parts = formatted.split(' ')
  if (parts.length === 3) {
    return `${parts[0]} *** ${parts[2]}`
  }
  // Fallback: mask middle portion
  if (formatted.length > 6) {
    return `${formatted.slice(0, 3)}***${formatted.slice(-4)}`
  }
  return formatted
}

// ============================================
// Distance & Location Formatting
// ============================================

/**
 * Format distance in kilometers
 * @example formatDistance(0.5) => "500m"
 * @example formatDistance(2.5) => "2.5km"
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  if (km < 10) {
    return `${km.toFixed(1)}km`
  }
  return `${Math.round(km)}km`
}

/**
 * Format address for compact display
 * @example formatAddressCompact("123 Main Street, Soweto, Johannesburg") => "Soweto, Johannesburg"
 */
export function formatAddressCompact(address: string): string {
  const parts = address.split(',').map(p => p.trim())
  if (parts.length >= 2) {
    // Return last two meaningful parts (usually suburb, city)
    return parts.slice(-2).join(', ')
  }
  return address
}

// ============================================
// Rating Formatting
// ============================================

/**
 * Format rating for display
 * @example formatRating(4.567) => "4.6"
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

/**
 * Format review count
 * @example formatReviewCount(1234) => "1.2K reviews"
 */
export function formatReviewCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K reviews`
  }
  return `${count} ${count === 1 ? 'review' : 'reviews'}`
}

// ============================================
// Name Formatting
// ============================================

/**
 * Get initials from name
 * @example getInitials("John Doe") => "JD"
 */
export function getInitials(name: string, maxLength = 2): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, maxLength)
    .join('')
}

/**
 * Format name for display (capitalize first letter of each word)
 * @example formatName("john doe") => "John Doe"
 */
export function formatName(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// ============================================
// Status Formatting
// ============================================

type BookingStatusDisplay = {
  label: string
  color: 'warning' | 'primary' | 'info' | 'success' | 'error'
  icon: string
}

/**
 * Get display properties for booking status
 */
export function getBookingStatusDisplay(
  status: string
): BookingStatusDisplay {
  const statusMap: Record<string, BookingStatusDisplay> = {
    pending: { label: 'Pending', color: 'warning', icon: 'heroicons:clock' },
    accepted: { label: 'Accepted', color: 'primary', icon: 'heroicons:check' },
    in_progress: { label: 'In Progress', color: 'info', icon: 'heroicons:play' },
    completed: { label: 'Completed', color: 'success', icon: 'heroicons:check-circle' },
    cancelled: { label: 'Cancelled', color: 'error', icon: 'heroicons:x-circle' },
    disputed: { label: 'Disputed', color: 'error', icon: 'heroicons:exclamation-triangle' },
  }

  return statusMap[status] || { label: status, color: 'info', icon: 'heroicons:question-mark-circle' }
}

// ============================================
// Number Formatting
// ============================================

/**
 * Format number with thousands separator
 * @example formatNumber(1234567) => "1,234,567"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-ZA')
}

/**
 * Format percentage
 * @example formatPercentage(0.125) => "12.5%"
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}