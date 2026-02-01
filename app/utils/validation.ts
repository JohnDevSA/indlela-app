/**
 * Validation utilities for Indlela app
 * Provides form validation rules and helpers using Zod schemas
 *
 * These validators are designed for South African context:
 * - Phone numbers (+27 format)
 * - ID numbers (13 digits with Luhn check)
 * - Currency (ZAR)
 */

import { z } from 'zod'
import { BUSINESS_RULES } from '~/types'

// ============================================
// Phone Number Validation
// ============================================

/**
 * South African phone number regex
 * Accepts: +27XXXXXXXXX, 27XXXXXXXXX, 0XXXXXXXXX
 * Must start with 6, 7, or 8 after country code
 */
const SA_PHONE_REGEX = /^(?:\+?27|0)[678]\d{8}$/

/**
 * Validate South African phone number
 */
export function isValidSAPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '')
  return SA_PHONE_REGEX.test(cleaned)
}

/**
 * Normalize phone to +27 format
 */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '')

  if (cleaned.startsWith('+27')) {
    return cleaned
  }
  if (cleaned.startsWith('27')) {
    return `+${cleaned}`
  }
  if (cleaned.startsWith('0')) {
    return `+27${cleaned.slice(1)}`
  }
  return cleaned
}

// ============================================
// SA ID Number Validation
// ============================================

/**
 * Validate South African ID number
 * 13 digits: YYMMDD SSSS C A Z
 * - YYMMDD: Date of birth
 * - SSSS: Sequence number (5000+ for males, 0-4999 for females)
 * - C: Citizenship (0 = SA citizen, 1 = permanent resident)
 * - A: Usually 8 (was used for race classification, now deprecated)
 * - Z: Checksum digit (Luhn algorithm)
 */
export function isValidSAIdNumber(idNumber: string): boolean {
  // Must be exactly 13 digits
  if (!/^\d{13}$/.test(idNumber)) {
    return false
  }

  // Validate date portion
  const year = parseInt(idNumber.slice(0, 2))
  const month = parseInt(idNumber.slice(2, 4))
  const day = parseInt(idNumber.slice(4, 6))

  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false

  // Luhn checksum validation
  let sum = 0
  for (let i = 0; i < 12; i++) {
    let digit = parseInt(idNumber[i])
    if (i % 2 === 1) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }

  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit === parseInt(idNumber[12])
}

/**
 * Extract info from SA ID number
 */
export function parseIdNumber(idNumber: string): {
  dateOfBirth: Date | null
  gender: 'male' | 'female' | null
  isCitizen: boolean | null
} | null {
  if (!isValidSAIdNumber(idNumber)) {
    return null
  }

  const year = parseInt(idNumber.slice(0, 2))
  const month = parseInt(idNumber.slice(2, 4))
  const day = parseInt(idNumber.slice(4, 6))
  const sequence = parseInt(idNumber.slice(6, 10))
  const citizenship = parseInt(idNumber[10])

  // Determine century (born before 2000 or after)
  const fullYear = year > 30 ? 1900 + year : 2000 + year

  return {
    dateOfBirth: new Date(fullYear, month - 1, day),
    gender: sequence >= 5000 ? 'male' : 'female',
    isCitizen: citizenship === 0,
  }
}

// ============================================
// Email Validation
// ============================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

// ============================================
// OTP Validation
// ============================================

/**
 * Validate OTP format (6 digits)
 */
export function isValidOtp(otp: string): boolean {
  return /^\d{6}$/.test(otp)
}

// ============================================
// Booking Validation
// ============================================

/**
 * Check if booking time is valid (at least 2 hours in advance)
 */
export function isValidBookingTime(scheduledAt: Date | string): boolean {
  const date = typeof scheduledAt === 'string' ? new Date(scheduledAt) : scheduledAt
  const now = new Date()
  const minTime = new Date(now.getTime() + BUSINESS_RULES.MIN_BOOKING_ADVANCE_HOURS * 60 * 60 * 1000)

  return date >= minTime
}

/**
 * Check if booking time is within business hours (6am - 9pm)
 */
export function isWithinBusinessHours(scheduledAt: Date | string): boolean {
  const date = typeof scheduledAt === 'string' ? new Date(scheduledAt) : scheduledAt
  const hour = date.getHours()

  return hour >= 6 && hour < 21
}

// ============================================
// Currency/Amount Validation
// ============================================

/**
 * Check if amount is valid (positive number, max 2 decimal places)
 */
export function isValidAmount(amount: number): boolean {
  if (amount <= 0) return false
  if (!Number.isFinite(amount)) return false

  // Check max 2 decimal places
  const decimalPart = amount.toString().split('.')[1]
  if (decimalPart && decimalPart.length > 2) return false

  return true
}

// ============================================
// Location Validation
// ============================================

/**
 * Validate coordinates are within South Africa bounds
 * Approximate bounds: lat -22 to -35, lng 16 to 33
 */
export function isValidSACoordinates(lat: number, lng: number): boolean {
  return lat >= -35 && lat <= -22 && lng >= 16 && lng <= 33
}

// ============================================
// Zod Schemas
// ============================================

/**
 * South African phone number schema
 */
export const phoneSchema = z
  .string()
  .min(10, 'Phone number is required')
  .refine(isValidSAPhone, 'Please enter a valid SA mobile number')

/**
 * OTP schema
 */
export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d+$/, 'OTP must contain only numbers')

/**
 * Email schema (optional)
 */
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .optional()
  .or(z.literal(''))

/**
 * SA ID number schema
 */
export const idNumberSchema = z
  .string()
  .length(13, 'ID number must be 13 digits')
  .regex(/^\d+$/, 'ID number must contain only numbers')
  .refine(isValidSAIdNumber, 'Please enter a valid SA ID number')

/**
 * Name schema
 */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')

/**
 * Location input schema
 */
export const locationSchema = z.object({
  lat: z.number().refine(lat => lat >= -35 && lat <= -22, 'Invalid latitude'),
  lng: z.number().refine(lng => lng >= 16 && lng <= 33, 'Invalid longitude'),
  address: z.string().min(5, 'Address is required'),
})

/**
 * Booking creation schema
 */
export const createBookingSchema = z.object({
  serviceId: z.string().uuid('Invalid service'),
  providerId: z.string().uuid('Invalid provider'),
  location: locationSchema,
  scheduledAt: z
    .string()
    .datetime()
    .refine(isValidBookingTime, `Booking must be at least ${BUSINESS_RULES.MIN_BOOKING_ADVANCE_HOURS} hours in advance`),
  notes: z.string().max(500, 'Notes are too long').optional(),
})

/**
 * Review creation schema
 */
export const createReviewSchema = z.object({
  bookingId: z.string().uuid('Invalid booking'),
  rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be 1-5'),
  comment: z.string().max(1000, 'Review is too long').optional(),
})

/**
 * Provider profile schema
 */
export const providerProfileSchema = z.object({
  bio: z.string().max(500, 'Bio is too long').optional(),
  idNumber: idNumberSchema.optional(),
  serviceRadiusKm: z
    .number()
    .min(1, 'Service radius must be at least 1km')
    .max(50, 'Service radius cannot exceed 50km'),
})

/**
 * Payment amount schema
 */
export const paymentAmountSchema = z
  .number()
  .positive('Amount must be greater than 0')
  .refine(isValidAmount, 'Invalid amount')

// ============================================
// Form Error Helpers
// ============================================

/**
 * Extract first error message from Zod validation result
 */
export function getFirstError(result: z.SafeParseReturnType<unknown, unknown>): string | null {
  if (result.success) return null
  return result.error.errors[0]?.message || 'Validation failed'
}

/**
 * Extract all errors as a record (field -> message)
 */
export function getAllErrors(
  result: z.SafeParseReturnType<unknown, unknown>
): Record<string, string> {
  if (result.success) return {}

  const errors: Record<string, string> = {}
  for (const error of result.error.errors) {
    const field = error.path.join('.')
    if (!errors[field]) {
      errors[field] = error.message
    }
  }
  return errors
}

// ============================================
// Validation Helper Hook
// ============================================

/**
 * Create a validation helper for a Zod schema
 * @example
 * const { validate, errors, isValid } = useValidation(createBookingSchema)
 * const result = validate(formData)
 */
export function createValidator<T extends z.ZodType>(schema: T) {
  const errors = ref<Record<string, string>>({})
  const isValid = ref(true)

  function validate(data: unknown): z.infer<T> | null {
    const result = schema.safeParse(data)

    if (result.success) {
      errors.value = {}
      isValid.value = true
      return result.data
    }

    errors.value = getAllErrors(result)
    isValid.value = false
    return null
  }

  function validateField(field: string, value: unknown): string | null {
    // Create a partial schema for single field validation
    try {
      const fieldSchema = (schema as z.ZodObject<Record<string, z.ZodType>>).shape[field]
      if (!fieldSchema) return null

      const result = fieldSchema.safeParse(value)
      if (result.success) {
        delete errors.value[field]
        return null
      }

      const error = result.error.errors[0]?.message || 'Invalid'
      errors.value[field] = error
      return error
    } catch {
      return null
    }
  }

  function clearErrors() {
    errors.value = {}
    isValid.value = true
  }

  return {
    validate,
    validateField,
    clearErrors,
    errors: readonly(errors),
    isValid: readonly(isValid),
  }
}