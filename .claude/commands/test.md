# Generate Tests

Generate tests for components, composables, or stores in Indlela.

## Instructions

When the user runs `/test <path>`, generate comprehensive tests for the target file.

## Test Framework

- **Unit Tests**: Vitest
- **Component Tests**: Vitest + Vue Test Utils
- **E2E Tests**: Playwright

## Test Location

Tests mirror the source structure in a `tests/` directory:
- `app/composables/useAuth.ts` → `tests/composables/useAuth.test.ts`
- `app/components/booking/BookingCard.vue` → `tests/components/booking/BookingCard.test.ts`
- `stores/auth.ts` → `tests/stores/auth.test.ts`

## Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'

describe('FeatureName', () => {
  beforeEach(() => {
    // Setup - reset state, mocks, etc.
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('methodName', () => {
    it('should do something when condition', async () => {
      // Arrange
      const input = { ... }

      // Act
      const result = await methodName(input)

      // Assert
      expect(result).toBe(expected)
    })

    it('should handle error case', async () => {
      // Test error scenarios
    })
  })
})
```

## Composable Test Example

```typescript
// tests/composables/useAuth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock the API
vi.mock('~/utils/api', () => ({
  $api: vi.fn(),
}))

describe('useAuth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('requestOtp', () => {
    it('should send OTP request for valid phone', async () => {
      const { $api } = await import('~/utils/api')
      vi.mocked($api).mockResolvedValueOnce({ message: 'OTP sent' })

      const { requestOtp, isLoading, error } = useAuth()

      await requestOtp('0821234567')

      expect($api).toHaveBeenCalledWith('/auth/request-otp', {
        method: 'POST',
        body: { phone: '0821234567' },
      })
      expect(isLoading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('should handle rate limit error', async () => {
      const { $api } = await import('~/utils/api')
      vi.mocked($api).mockRejectedValueOnce({
        data: { error: { code: 'RATE_LIMITED' } },
      })

      const { requestOtp, error } = useAuth()

      await requestOtp('0821234567')

      expect(error.value).toBe('RATE_LIMITED')
    })
  })

  describe('verifyOtp', () => {
    it('should authenticate user with valid OTP', async () => {
      // ... test implementation
    })

    it('should reject invalid OTP', async () => {
      // ... test implementation
    })
  })
})
```

## Component Test Example

```typescript
// tests/components/booking/BookingCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BookingCard from '~/components/booking/BookingCard.vue'

describe('BookingCard', () => {
  const mockBooking = {
    id: '123',
    status: 'pending',
    service: { name: 'Cleaning' },
    provider: { user: { name: 'Thandi' } },
    scheduledAt: '2025-01-15T09:00:00Z',
    quotedAmount: 450,
  }

  it('renders booking information', () => {
    const wrapper = mount(BookingCard, {
      props: { booking: mockBooking },
    })

    expect(wrapper.text()).toContain('Cleaning')
    expect(wrapper.text()).toContain('Thandi')
    expect(wrapper.text()).toContain('R450')
  })

  it('shows correct status badge', () => {
    const wrapper = mount(BookingCard, {
      props: { booking: mockBooking },
    })

    expect(wrapper.find('.status-badge').classes()).toContain('pending')
  })

  it('emits click event when tapped', async () => {
    const wrapper = mount(BookingCard, {
      props: { booking: mockBooking },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

## Test Categories

1. **Happy Path**: Normal successful operations
2. **Error Handling**: API errors, validation errors
3. **Edge Cases**: Empty data, null values, boundary conditions
4. **Offline Mode**: Actions when offline, sync behavior
5. **Loading States**: Correct loading indicators
6. **User Interactions**: Click, input, form submission

## What to Test

- **Composables**: State changes, API calls, error handling
- **Components**: Rendering, props, events, slots
- **Stores**: Actions, getters, state mutations
- **Utils**: Pure functions, formatters, validators

Now generate tests based on the user's input.