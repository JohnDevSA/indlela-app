# API Integration Guide

> Patterns for integrating with the Laravel backend API

## API Client Setup

### Base Configuration

```typescript
// plugins/api.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const api = $fetch.create({
    baseURL: config.public.apiUrl,

    async onRequest({ options }) {
      // Add auth token if available
      const token = authStore.token;
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      // Add locale header
      const { locale } = useI18n();
      options.headers = {
        ...options.headers,
        'Accept-Language': locale.value,
      };
    },

    async onResponseError({ response }) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        authStore.logout();
        navigateTo('/auth/login');
      }
    },
  });

  return {
    provide: {
      api,
    },
  };
});
```

### useApi Composable

```typescript
// composables/useApi.ts
export function useApi<T = any>(
  url: string,
  options: any = {}
) {
  const { $api } = useNuxtApp();
  const { isOnline } = useOffline();

  return useFetch<T>(url, {
    ...options,
    $fetch: $api,

    // Retry on network errors
    retry: isOnline.value ? 3 : 0,
    retryDelay: 1000,
  });
}
```

## Authentication Flow

### Request OTP

```typescript
// composables/useAuth.ts
export function useAuth() {
  const authStore = useAuthStore();
  const { showToast } = useToast();

  async function requestOtp(phone: string) {
    try {
      await $api('/auth/request-otp', {
        method: 'POST',
        body: { phone },
      });

      showToast(
        t('auth.otp_sent'),
        'success'
      );
    } catch (error) {
      if (error.statusCode === 429) {
        showToast(
          t('auth.too_many_requests'),
          'error'
        );
      } else {
        throw error;
      }
    }
  }

  async function verifyOtp(phone: string, otp: string) {
    const response = await $api('/auth/verify-otp', {
      method: 'POST',
      body: { phone, otp },
    });

    authStore.setToken(response.data.token);
    authStore.setUser(response.data.user);

    return response.data;
  }

  async function logout() {
    try {
      await $api('/auth/logout', {
        method: 'POST',
      });
    } finally {
      authStore.clear();
      navigateTo('/auth/login');
    }
  }

  return {
    requestOtp,
    verifyOtp,
    logout,
  };
}
```

## CRUD Operations

### Fetch List

```typescript
// composables/useProviders.ts
export function useProviders() {
  const providers = ref<Provider[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const page = ref(1);
  const hasMore = ref(true);

  async function fetchProviders(filters: ProviderFilters = {}) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await $api('/providers', {
        params: {
          page: page.value,
          per_page: 20,
          service: filters.service,
          location: filters.location,
          rating: filters.minRating,
        },
      });

      if (page.value === 1) {
        providers.value = response.data;
      } else {
        providers.value.push(...response.data);
      }

      hasMore.value = response.meta.current_page < response.meta.last_page;

      // Cache providers locally
      await cacheProviders(response.data);
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error');
    } finally {
      isLoading.value = false;
    }
  }

  function loadMore() {
    if (hasMore.value && !isLoading.value) {
      page.value++;
      fetchProviders();
    }
  }

  function reset() {
    page.value = 1;
    providers.value = [];
    hasMore.value = true;
  }

  return {
    providers: readonly(providers),
    isLoading: readonly(isLoading),
    error: readonly(error),
    hasMore: readonly(hasMore),
    fetchProviders,
    loadMore,
    reset,
  };
}
```

### Fetch Single Resource

```typescript
// composables/useProvider.ts
export function useProvider(providerId: MaybeRef<string>) {
  const id = toRef(providerId);

  const { data: provider, error, refresh } = useApi<Provider>(
    computed(() => `/providers/${id.value}`),
    {
      // Cache for 5 minutes
      getCachedData: (key) => {
        const cached = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
        if (!cached) return;

        const expiresAt = new Date(cached.fetchedAt);
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);

        if (expiresAt > new Date()) {
          return cached.value;
        }
      },
    }
  );

  return {
    provider,
    error,
    refresh,
  };
}
```

### Create Resource

```typescript
// composables/useBooking.ts
export function useBooking() {
  const { isOnline } = useOffline();

  async function createBooking(data: CreateBookingData): Promise<Booking> {
    // If offline, queue for later
    if (!isOnline.value) {
      const localId = await queueAction('CREATE_BOOKING', data);

      const localBooking: Booking = {
        ...data,
        id: localId,
        status: 'pending',
        synced: false,
        createdAt: new Date().toISOString(),
      };

      // Cache locally
      await db.bookings.add({
        id: localId,
        localId,
        data: localBooking,
        cachedAt: new Date(),
        synced: false,
      });

      return localBooking;
    }

    // If online, create immediately
    const response = await $api('/bookings', {
      method: 'POST',
      body: data,
    });

    // Cache the response
    await db.bookings.add({
      id: response.data.id,
      data: response.data,
      cachedAt: new Date(),
      synced: true,
    });

    return response.data;
  }

  async function updateBooking(
    id: string,
    updates: Partial<Booking>
  ): Promise<Booking> {
    if (!isOnline.value) {
      await queueAction('UPDATE_BOOKING', { id, ...updates });

      // Optimistically update cache
      const cached = await db.bookings.get(id);
      if (cached) {
        cached.data = { ...cached.data, ...updates };
        cached.synced = false;
        await db.bookings.put(cached);
      }

      return { ...cached!.data, ...updates };
    }

    const response = await $api(`/bookings/${id}`, {
      method: 'PUT',
      body: updates,
    });

    await db.bookings.update(id, {
      data: response.data,
      cachedAt: new Date(),
      synced: true,
    });

    return response.data;
  }

  async function cancelBooking(id: string): Promise<void> {
    if (!isOnline.value) {
      await queueAction('CANCEL_BOOKING', { id });
      await updateBooking(id, { status: 'cancelled' });
      return;
    }

    await $api(`/bookings/${id}/cancel`, {
      method: 'POST',
    });

    await updateBooking(id, { status: 'cancelled' });
  }

  return {
    createBooking,
    updateBooking,
    cancelBooking,
  };
}
```

## Error Handling

### API Error Types

```typescript
// types/api.ts
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface ApiErrorResponse {
  error: ApiError;
}
```

### Error Handler

```typescript
// utils/api-errors.ts
export function handleApiError(error: any): string {
  if (!error.response) {
    return 'Network error. Please check your connection.';
  }

  const { error: apiError } = error.response._data as ApiErrorResponse;

  switch (apiError.code) {
    case 'VALIDATION_ERROR':
      // Extract first validation message
      const firstField = Object.keys(apiError.details || {})[0];
      return apiError.details?.[firstField]?.[0] || apiError.message;

    case 'UNAUTHORIZED':
      return 'Please log in to continue';

    case 'FORBIDDEN':
      return 'You do not have permission to perform this action';

    case 'NOT_FOUND':
      return 'The requested resource was not found';

    case 'RATE_LIMITED':
      return 'Too many requests. Please try again later';

    default:
      return apiError.message || 'An unexpected error occurred';
  }
}
```

### Use in Components

```vue
<script setup lang="ts">
const { createBooking } = useBooking();
const { showToast } = useToast();

async function handleSubmit() {
  try {
    await createBooking(formData);
    showToast('Booking created!', 'success');
    navigateTo('/bookings');
  } catch (error) {
    const message = handleApiError(error);
    showToast(message, 'error');
  }
}
</script>
```

## Request Cancellation

### Abort Controller

```typescript
export function useProvider(providerId: string) {
  const abortController = ref<AbortController | null>(null);

  async function fetchProvider() {
    // Cancel previous request
    abortController.value?.abort();

    // Create new controller
    abortController.value = new AbortController();

    const response = await $api(`/providers/${providerId}`, {
      signal: abortController.value.signal,
    });

    return response.data;
  }

  onUnmounted(() => {
    abortController.value?.abort();
  });

  return { fetchProvider };
}
```

## File Uploads

### Upload with Progress

```typescript
export function useFileUpload() {
  const progress = ref(0);
  const isUploading = ref(false);

  async function uploadFile(file: File): Promise<string> {
    isUploading.value = true;
    progress.value = 0;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await $api('/upload', {
        method: 'POST',
        body: formData,

        onUploadProgress: (progressEvent) => {
          progress.value = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
        },
      });

      return response.data.url;
    } finally {
      isUploading.value = false;
    }
  }

  return {
    progress: readonly(progress),
    isUploading: readonly(isUploading),
    uploadFile,
  };
}
```

## Rate Limiting

### Client-Side Throttling

```typescript
import { useDebounceFn, useThrottleFn } from '@vueuse/core';

export function useProviderSearch() {
  const providers = ref<Provider[]>([]);
  const searchQuery = ref('');

  // Debounce search (wait 300ms after user stops typing)
  const debouncedSearch = useDebounceFn(async (query: string) => {
    const response = await $api('/providers/search', {
      params: { q: query },
    });
    providers.value = response.data;
  }, 300);

  watch(searchQuery, (newQuery) => {
    if (newQuery.length >= 3) {
      debouncedSearch(newQuery);
    } else {
      providers.value = [];
    }
  });

  return {
    searchQuery,
    providers: readonly(providers),
  };
}
```

## Pagination

### Infinite Scroll

```vue
<script setup lang="ts">
const { providers, loadMore, hasMore, isLoading } = useProviders();

onMounted(() => {
  fetchProviders();
});

// Load more when user scrolls to bottom
const { arrivedState } = useScroll(window);

watch(() => arrivedState.bottom, (isBottom) => {
  if (isBottom && hasMore.value && !isLoading.value) {
    loadMore();
  }
});
</script>

<template>
  <div>
    <ProviderCard
      v-for="provider in providers"
      :key="provider.id"
      :provider="provider"
    />

    <div v-if="isLoading" class="py-8 text-center">
      <UiSpinner />
    </div>

    <div v-else-if="!hasMore" class="py-8 text-center text-gray-500">
      {{ t('common.no_more_results') }}
    </div>
  </div>
</template>
```

## Real-Time Updates

### Polling

```typescript
export function useBookingStatus(bookingId: string) {
  const booking = ref<Booking | null>(null);
  const intervalId = ref<number | null>(null);

  async function pollStatus() {
    const response = await $api(`/bookings/${bookingId}`);
    booking.value = response.data;
  }

  onMounted(() => {
    // Poll every 10 seconds
    pollStatus();
    intervalId.value = window.setInterval(pollStatus, 10000);
  });

  onUnmounted(() => {
    if (intervalId.value) {
      clearInterval(intervalId.value);
    }
  });

  return {
    booking: readonly(booking),
  };
}
```

## Best Practices

### Do's

- ✅ Use typed responses with generics
- ✅ Handle errors gracefully
- ✅ Cache GET requests
- ✅ Queue mutations when offline
- ✅ Show loading states
- ✅ Cancel pending requests on unmount
- ✅ Use pagination for large lists
- ✅ Debounce search queries

### Don'ts

- ❌ Don't hardcode API URLs
- ❌ Don't ignore error responses
- ❌ Don't make unnecessary requests
- ❌ Don't block UI during requests
- ❌ Don't fetch same data multiple times
- ❌ Don't expose sensitive data in URLs

## Testing API Integration

```typescript
// tests/composables/useBooking.test.ts
import { describe, it, expect, vi } from 'vitest';

describe('useBooking', () => {
  it('creates booking successfully', async () => {
    // Mock API response
    vi.mock('~/composables/useApi', () => ({
      useApi: vi.fn(() => ({
        data: ref({ id: '123', status: 'pending' }),
        error: ref(null),
      })),
    }));

    const { createBooking } = useBooking();
    const booking = await createBooking({
      serviceId: 'service-1',
      providerId: 'provider-1',
    });

    expect(booking.id).toBe('123');
    expect(booking.status).toBe('pending');
  });

  it('handles API errors', async () => {
    // Mock API error
    vi.mock('~/composables/useApi', () => ({
      useApi: vi.fn(() => ({
        data: ref(null),
        error: ref(new Error('API Error')),
      })),
    }));

    const { createBooking } = useBooking();

    await expect(createBooking({})).rejects.toThrow('API Error');
  });
});
```

## Next Steps

- Review [Offline-First Guide](./offline-first.md)
- Check [Error Handling Patterns](../standards/error-handling.md)
- Explore [Testing Guide](./testing.md)
