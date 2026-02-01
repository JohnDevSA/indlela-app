# Indlela Unit Tests

Comprehensive unit tests for critical composables and utilities in the Indlela application.

## Test Files

### 1. `api.test.ts` - API Error Handling (39 tests)

Tests the API utility functions for proper error detection and message extraction.

**Crucial Logic:**
- `isApiError()` type guard - validates complete ApiError structure
- Rejects null, undefined, and malformed error objects
- Handles edge cases (empty messages, circular references)

**Usability Logic:**
- `getErrorMessage()` - extracts user-friendly error messages
- `getValidationErrors()` - parses field-specific validation errors
- Supports multiple error formats (ApiError, Error, TypeError)

**Business Rules Covered:**
- OTP expiry error messages (5-minute rule)
- Commission validation errors (12% rule)
- Network timeout handling

### 2. `offline-queue.test.ts` - Offline Queue Management (44 tests)

Tests the IndexedDB-based offline queue system with retry logic.

**Crucial Logic:**
- **LocalId Generation:** Unique IDs with timestamp and random components
- **LocalId Validation:** Handles empty strings, whitespace, undefined
- **Retry Logic:** 5 max retries, distinguishes 4xx vs 5xx errors
  - 4xx (except 408, 429): Fail immediately (non-retriable)
  - 408 Timeout, 429 Rate Limit: Retry (retriable 4xx)
  - 5xx Server Errors: Retry
  - Network errors (TypeError): Retry
- **Queue Operations:** Add, remove, update retry count, get pending actions

**Usability Logic:**
- Cache management (providers, bookings, services)
- Cache expiration (24-hour default, custom max age)
- Clear all cache on logout (privacy protection)

**Business Rules Covered:**
- Commission calculation in booking payloads (12%)
- Provider payout calculation (quoted amount - commission)
- Offline booking workflow with localId tracking

### 3. `useAuth.test.ts` - Authentication Composable (40+ tests)

Tests the authentication composable including phone validation, OTP flow, and privacy protection.

**Crucial Logic:**
- **Phone Validation:** SA mobile format (+27 6/7/8 X XXX XXXX)
  - Validates country code, mobile prefix (6/7/8), length (11 digits)
  - Rejects landlines, international numbers, invalid lengths
- **Phone Normalization:** Converts 0XX to +27XX
  - Handles whitespace, hyphens, parentheses
  - Edge case: +270XX -> +27XX
- **OTP Flow:** Request, verify, resend
  - 6-digit OTP requirement
  - Request before verify validation
- **Logout:** Clears offline data (privacy on shared devices)

**Usability Logic:**
- Role selection (customer vs provider)
- OTP resend functionality
- Error state management
- Dev mode helpers (devLoginAs)

**Business Rules Covered:**
- OTP expiry (5 minutes) - tested via error messages
- Admin phone detection (contains '801')
- New user onboarding flag

### 4. `useOffline.test.ts` - Offline State Management (50+ tests)

Tests the offline state management composable with sync locking and debounced status changes.

**Crucial Logic:**
- **Sync Locking:** Prevents concurrent sync operations
  - Returns same promise for concurrent calls
  - Releases lock after completion or failure
- **Debounced Online Status:** 500ms debounce to prevent rapid-fire syncs
  - Cancels pending debounce on rapid changes
  - Triggers sync after coming back online
- **Action Validation:**
  - Fails on missing/invalid payloads
  - Validates required fields per action type
  - CREATE_BOOKING: requires serviceId, providerId
  - UPDATE_BOOKING: requires id
  - UPDATE_STATUS: requires id and status
  - CREATE_REVIEW: requires bookingId
- **clearOfflineData():** Privacy protection on logout

**Usability Logic:**
- Pending count tracking
- Last sync timestamp
- Sync error messages
- Force sync (manual refresh)
- Cache cleanup with configurable max age

**Business Rules Covered:**
- Commission calculation in CREATE_BOOKING (12%)
- Booking status workflow (pending -> accepted -> completed)
- Review submission tied to booking ID

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/unit/api.test.ts

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test -- --watch
```

## Test Coverage Goals

We focus on two categories:

1. **Crucial Logic** (business rules, calculations, data integrity)
   - Auth: Phone validation, OTP flow
   - Queue: Retry logic, localId validation
   - Sync: Locking, action validation
   - API: Error detection, message extraction

2. **Usability Logic** (UX, validation, error recovery)
   - Form validation and normalization
   - User-friendly error messages
   - Offline state indicators
   - Multi-language support readiness

## Business Rules Tested

- **Commission Rate:** 12% charged to customers (not providers)
- **Booking Fee:** R10-15 flat fee (tested in payloads)
- **OTP Expiry:** 5 minutes (tested via error messages)
- **Service Radius:** Default 10km (tested in cache data)
- **Max Retries:** 5 attempts for retriable errors
- **Phone Format:** SA mobile numbers only (+27 6/7/8)

## Edge Cases Covered

- **Empty/Null Values:** Phone numbers, localIds, payloads
- **Whitespace:** Phone normalization, localId trimming
- **Network Errors:** Timeouts, fetch failures, server errors
- **Circular References:** ApiError with self-referencing fields
- **Concurrent Operations:** Multiple OTP requests, sync locking
- **Rapid State Changes:** Debounced online/offline flicker

## Technology Stack

- **Test Runner:** Vitest 4.0.14
- **Component Testing:** @vue/test-utils 2.4.6
- **State Testing:** @pinia/testing 1.0.3
- **IndexedDB Mocking:** fake-indexeddb 6.2.5
- **DOM Environment:** happy-dom 20.0.10

## Test Utilities

Located in `tests/utils/nuxt-mocks.ts`:

- `setupNuxtGlobals()` - Mocks Nuxt composables
- `setupBrowserAPIs()` - Mocks navigator, localStorage, etc.
- `flushPromises()` - Wait for all pending promises
- `createDeferred()` - Controlled async testing

## Test Setup

Global setup in `tests/setup.ts`:

- Fake IndexedDB for Dexie
- Mocked Nuxt composables (useRouter, useCookie, etc.)
- Mocked Ionic components
- Console filtering (reduces test noise)
- Browser API mocks (ResizeObserver, IntersectionObserver)

## Continuous Integration

Tests run automatically on:
- Pre-commit hooks (if configured)
- Pull request validation
- Main branch commits

## Contributing

When adding new features:

1. Add tests for crucial business logic
2. Add tests for user-facing validation
3. Test edge cases (null, empty, concurrent)
4. Update this README if adding new test files
5. Ensure tests pass before committing

## Test Patterns

### Arrange-Act-Assert

```typescript
it('should normalize phone numbers', () => {
  // Arrange
  const { normalizePhone } = useAuth()

  // Act
  const result = normalizePhone('0821234567')

  // Assert
  expect(result).toBe('+27821234567')
})
```

### Async Testing

```typescript
it('should sync pending actions', async () => {
  // Setup
  await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

  // Act
  const { syncPendingActions } = useOffline()
  const results = await syncPendingActions()

  // Assert
  expect(results).toHaveLength(1)
  expect(results[0].status).toBe('synced')
})
```

### Error Testing

```typescript
it('should handle network errors', async () => {
  mockPost.mockRejectedValue(new Error('Network error'))

  const { requestOtp, error } = useAuth()
  const result = await requestOtp('0821234567')

  expect(result).toBe(false)
  expect(error.value).toContain('Failed to send OTP')
})
```

## Known Limitations

- **Production Mode Testing:** Tests run in dev mode by default. Testing production-specific behavior requires more complex mock setup.
- **Real API Integration:** Tests use mocked API responses. Integration tests would require a test backend.
- **Time-Based Tests:** OTP expiry testing relies on error messages, not actual time-based expiration.

## Future Improvements

- [ ] Add integration tests with test backend
- [ ] Add E2E tests with Playwright/Cypress
- [ ] Add visual regression testing
- [ ] Increase coverage to 90%+ for critical paths
- [ ] Add performance benchmarks for queue processing

---

**Last Updated:** December 2025
**Test Count:** 170+ tests across 4 files
**Coverage:** Focuses on critical business logic and user-facing functionality