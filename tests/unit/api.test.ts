/**
 * Unit Tests for app/utils/api.ts
 *
 * Tests the API error handling utilities including:
 * - isApiError type guard (validates full ApiError structure)
 * - getErrorMessage (extracts error messages from various error types)
 * - getValidationErrors (extracts validation details)
 */
import { describe, it, expect } from 'vitest'
import { isApiError, getErrorMessage, getValidationErrors } from '~/utils/api'
import type { ApiError } from '~/types'

describe('app/utils/api', () => {
  describe('isApiError - Crucial Logic', () => {
    it('should validate complete ApiError structure with all required fields', () => {
      const validApiError: ApiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input provided',
          details: {
            email: ['Email is required', 'Email must be valid'],
          },
        },
      }

      expect(isApiError(validApiError)).toBe(true)
    })

    it('should validate ApiError without optional details field', () => {
      const validApiError: ApiError = {
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
      }

      expect(isApiError(validApiError)).toBe(true)
    })

    it('should reject null values', () => {
      expect(isApiError(null)).toBe(false)
    })

    it('should reject undefined values', () => {
      expect(isApiError(undefined)).toBe(false)
    })

    it('should reject non-object values', () => {
      expect(isApiError('error string')).toBe(false)
      expect(isApiError(123)).toBe(false)
      expect(isApiError(true)).toBe(false)
    })

    it('should reject objects without "error" property', () => {
      const invalidError = {
        message: 'Something went wrong',
      }

      expect(isApiError(invalidError)).toBe(false)
    })

    it('should reject objects with non-object "error" property', () => {
      const invalidError = {
        error: 'string error',
      }

      expect(isApiError(invalidError)).toBe(false)
    })

    it('should reject objects with null "error" property', () => {
      const invalidError = {
        error: null,
      }

      expect(isApiError(invalidError)).toBe(false)
    })

    it('should reject error object missing "message" field', () => {
      const invalidError = {
        error: {
          code: 'ERROR',
        },
      }

      expect(isApiError(invalidError)).toBe(false)
    })

    it('should reject error object with non-string "message" field', () => {
      const invalidError = {
        error: {
          code: 'ERROR',
          message: 123,
        },
      }

      expect(isApiError(invalidError)).toBe(false)
    })

    it('should reject empty objects', () => {
      expect(isApiError({})).toBe(false)
    })

    it('should reject arrays', () => {
      expect(isApiError([])).toBe(false)
      expect(isApiError([{ error: { message: 'test' } }])).toBe(false)
    })

    it('should handle edge case: error object with empty string message (valid)', () => {
      const edgeCaseError = {
        error: {
          code: 'UNKNOWN',
          message: '',
        },
      }

      // Empty string is still a valid string
      expect(isApiError(edgeCaseError)).toBe(true)
    })
  })

  describe('getErrorMessage - Crucial Logic', () => {
    it('should extract message from valid ApiError', () => {
      const apiError: ApiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid phone number format',
        },
      }

      expect(getErrorMessage(apiError)).toBe('Invalid phone number format')
    })

    it('should extract message from Error instance', () => {
      const error = new Error('Network connection failed')

      expect(getErrorMessage(error)).toBe('Network connection failed')
    })

    it('should extract message from TypeError (network errors)', () => {
      const error = new TypeError('Failed to fetch')

      expect(getErrorMessage(error)).toBe('Failed to fetch')
    })

    it('should return default message for null error', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred')
    })

    it('should return default message for undefined error', () => {
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred')
    })

    it('should return default message for string error', () => {
      expect(getErrorMessage('string error')).toBe('An unexpected error occurred')
    })

    it('should return default message for number error', () => {
      expect(getErrorMessage(404)).toBe('An unexpected error occurred')
    })

    it('should return default message for empty object', () => {
      expect(getErrorMessage({})).toBe('An unexpected error occurred')
    })

    it('should handle ApiError with empty string message', () => {
      const apiError: ApiError = {
        error: {
          code: 'UNKNOWN',
          message: '',
        },
      }

      // Empty string should be returned as-is from valid ApiError
      expect(getErrorMessage(apiError)).toBe('')
    })

    it('should handle Error with empty message', () => {
      const error = new Error('')

      // Empty string should be returned as-is from Error
      expect(getErrorMessage(error)).toBe('')
    })

    it('should handle malformed ApiError structure', () => {
      const malformedError = {
        error: {
          code: 'ERROR',
          // Missing message field
        },
      }

      expect(getErrorMessage(malformedError)).toBe('An unexpected error occurred')
    })

    it('should prioritize ApiError over Error properties', () => {
      // Object that has both ApiError structure and Error-like properties
      const mixedError = {
        error: {
          code: 'API_ERROR',
          message: 'API error message',
        },
        message: 'Generic error message',
      }

      expect(getErrorMessage(mixedError)).toBe('API error message')
    })
  })

  describe('getValidationErrors - Usability Logic', () => {
    it('should extract validation details from ApiError', () => {
      const apiError: ApiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            phone: ['Phone number is required', 'Phone must be valid SA number'],
            email: ['Email format is invalid'],
          },
        },
      }

      const validationErrors = getValidationErrors(apiError)

      expect(validationErrors).toEqual({
        phone: ['Phone number is required', 'Phone must be valid SA number'],
        email: ['Email format is invalid'],
      })
    })

    it('should return empty object when details field is missing', () => {
      const apiError: ApiError = {
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error',
        },
      }

      expect(getValidationErrors(apiError)).toEqual({})
    })

    it('should return empty object for non-ApiError values', () => {
      expect(getValidationErrors(null)).toEqual({})
      expect(getValidationErrors(undefined)).toEqual({})
      expect(getValidationErrors('error')).toEqual({})
      expect(getValidationErrors(new Error('error'))).toEqual({})
    })

    it('should return empty object when error is not an ApiError', () => {
      const invalidError = {
        error: 'not an object',
      }

      expect(getValidationErrors(invalidError)).toEqual({})
    })

    it('should handle empty details object', () => {
      const apiError: ApiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {},
        },
      }

      expect(getValidationErrors(apiError)).toEqual({})
    })

    it('should handle single validation error per field', () => {
      const apiError: ApiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            name: ['Name is required'],
          },
        },
      }

      expect(getValidationErrors(apiError)).toEqual({
        name: ['Name is required'],
      })
    })

    it('should handle multiple validation errors per field', () => {
      const apiError: ApiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            password: [
              'Password is required',
              'Password must be at least 8 characters',
              'Password must contain a number',
              'Password must contain a special character',
            ],
          },
        },
      }

      const validationErrors = getValidationErrors(apiError)
      expect(validationErrors.password).toHaveLength(4)
    })

    it('should preserve details object reference type', () => {
      const details = {
        field1: ['error1'],
        field2: ['error2', 'error3'],
      }

      const apiError: ApiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details,
        },
      }

      expect(getValidationErrors(apiError)).toBe(details)
    })
  })

  describe('Edge Cases & Business Rules', () => {
    it('should handle OTP expiry error messages correctly', () => {
      // Business rule: OTP expires after 5 minutes
      const otpExpiredError: ApiError = {
        error: {
          code: 'OTP_EXPIRED',
          message: 'OTP has expired. Please request a new one.',
        },
      }

      expect(getErrorMessage(otpExpiredError)).toBe('OTP has expired. Please request a new one.')
    })

    it('should handle commission-related validation errors', () => {
      // Business rule: 12% commission charged to customers
      const commissionError: ApiError = {
        error: {
          code: 'PAYMENT_ERROR',
          message: 'Payment calculation failed',
          details: {
            commission: ['Commission rate must be 12%'],
          },
        },
      }

      const errors = getValidationErrors(commissionError)
      expect(errors.commission).toContain('Commission rate must be 12%')
    })

    it('should handle network timeout errors', () => {
      const timeoutError = new TypeError('Network request failed')

      expect(getErrorMessage(timeoutError)).toBe('Network request failed')
      expect(isApiError(timeoutError)).toBe(false)
    })

    it('should handle fetch abort errors', () => {
      const abortError = new Error('The operation was aborted')

      expect(getErrorMessage(abortError)).toBe('The operation was aborted')
    })

    it('should handle deeply nested error structures gracefully', () => {
      const deepError = {
        error: {
          nested: {
            deep: {
              message: 'deeply nested',
            },
          },
        },
      }

      // Should not throw, should return default message
      expect(getErrorMessage(deepError)).toBe('An unexpected error occurred')
      expect(isApiError(deepError)).toBe(false)
    })

    it('should handle errors with circular references', () => {
      const circularError: any = {
        error: {
          code: 'CIRCULAR',
          message: 'test',
        },
      }
      circularError.error.self = circularError

      // Should not throw despite circular reference
      expect(isApiError(circularError)).toBe(true)
      expect(getErrorMessage(circularError)).toBe('test')
    })
  })
})
