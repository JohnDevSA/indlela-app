# Architecture Overview

> Understanding the Indlela mobile app architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Indlela Mobile App                     │
│                  (PWA + iOS + Android)                   │
└───────────┬─────────────────────────────────────────────┘
            │
            │ HTTPS / REST API
            │
┌───────────▼─────────────────────────────────────────────┐
│                Laravel 12 API Backend                    │
│        (Sanctum Auth + PostgreSQL + Redis)              │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Layer

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | Nuxt 4 | SSR/SSG, routing, meta framework |
| UI Components | Ionic 8 | Cross-platform mobile UI |
| Mobile Runtime | Capacitor 6 | Native iOS/Android bridge |
| State Management | Pinia 2 | Global reactive state |
| Offline Storage | Dexie (IndexedDB) | Local data persistence |
| HTTP Client | ofetch | API requests with retry |
| Internationalization | @nuxtjs/i18n | 6 South African languages |
| Styling | Tailwind CSS | Utility-first CSS |

### Architecture Principles

#### 1. Offline-First

All critical features work without internet connectivity:

- **Service Discovery:** Providers cached locally
- **Booking Creation:** Queued in IndexedDB, synced later
- **User Data:** Cached and updated optimistically

```typescript
// Example: Create booking offline
const booking = await createBooking(data);
// If offline, queued locally with local-xxx ID
// When online, synced to server and ID updated
```

#### 2. Mobile-First

Built for mobile from the ground up:

- Touch-optimized UI (44x44px minimum touch targets)
- Native device features (camera, location, haptics)
- Responsive design that works on all screen sizes
- Optimized for slow/expensive data connections

#### 3. Multi-Channel

Single codebase deploys to multiple platforms:

- **PWA:** Progressive Web App for browsers
- **Android:** Native Android app via Capacitor
- **iOS:** Native iOS app via Capacitor

All share the same code, components, and business logic.

## Application Architecture

### Layer Architecture

```
┌─────────────────────────────────────────────────┐
│              Pages (Route Components)           │
│  pages/index.vue, pages/bookings/[id].vue      │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│            Layouts (Shell Components)           │
│        layouts/default.vue, auth.vue            │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│        Components (Reusable UI Blocks)          │
│  BookingCard, ProviderCard, EmptyState, etc.   │
└─────┬──────────────────────────────────┬────────┘
      │                                  │
┌─────▼─────────┐              ┌─────────▼────────┐
│  Composables  │              │   Pinia Stores   │
│  (Business    │              │  (Global State)  │
│   Logic)      │              │                  │
│               │              │                  │
│ useAuth       │              │ authStore        │
│ useBooking    │◄─────────────┤ bookingStore     │
│ useOffline    │              │ offlineStore     │
└───────┬───────┘              └──────────────────┘
        │
        │
┌───────▼────────────────────────────────────────┐
│          Utils (Helper Functions)              │
│     API client, offline queue, formatting      │
└────────────────────────────────────────────────┘
```

### Data Flow

#### Online Flow

```
User Action (e.g., Create Booking)
    │
    ▼
Component calls composable
    │
    ▼
Composable calls API via useApi()
    │
    ▼
API request sent to Laravel backend
    │
    ▼
Response cached in IndexedDB
    │
    ▼
Pinia store updated
    │
    ▼
UI reactively updates
```

#### Offline Flow

```
User Action (e.g., Create Booking)
    │
    ▼
Detect offline state
    │
    ▼
Queue action in IndexedDB
    │
    ▼
Generate temporary local ID (local-xxx)
    │
    ▼
Update Pinia store with local data
    │
    ▼
UI shows optimistic update with "pending sync" indicator
    │
    ▼
When online: Process queue → Sync to server → Update IDs
```

## File Structure

```
indlela/
├── app/
│   ├── assets/           # Static assets (CSS, images)
│   ├── components/       # Vue components
│   │   ├── booking/      # Booking-related components
│   │   ├── provider/     # Provider components
│   │   ├── service/      # Service components
│   │   └── ui/           # Shared UI components
│   ├── composables/      # Reusable composition functions
│   ├── layouts/          # Layout components
│   ├── middleware/       # Route middleware
│   ├── pages/            # Route pages (auto-routes)
│   ├── plugins/          # Nuxt plugins
│   ├── stores/           # Pinia stores
│   └── types/            # TypeScript type definitions
│
├── locales/              # i18n translation files
│   ├── en.json           # English
│   ├── zu.json           # isiZulu
│   ├── xh.json           # isiXhosa
│   ├── af.json           # Afrikaans
│   ├── st.json           # Sesotho
│   └── tn.json           # Setswana
│
├── public/               # Static files (served as-is)
│   └── icons/            # PWA icons
│
├── android/              # Capacitor Android project
├── ios/                  # Capacitor iOS project
│
├── tests/                # Test files
│   ├── unit/             # Unit tests
│   └── e2e/              # End-to-end tests
│
└── docs/                 # Documentation
    ├── getting-started/
    ├── guides/
    └── standards/
```

## Key Patterns

### 1. Composables for Business Logic

Composables encapsulate reusable business logic:

```typescript
// composables/useBooking.ts
export function useBooking() {
  const bookings = ref<Booking[]>([]);
  const isLoading = ref(false);

  async function createBooking(data: BookingData) {
    // Business logic here
  }

  return {
    bookings: readonly(bookings),
    isLoading: readonly(isLoading),
    createBooking,
  };
}
```

### 2. Pinia for Global State

Pinia stores manage application-wide state:

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);

  async function login(phone: string) {
    // Login logic
  }

  return { user, token, login };
});
```

### 3. Auto-Routing with Pages

File-based routing via Nuxt's `pages/` directory:

```
pages/
├── index.vue                  → /
├── bookings/
│   ├── index.vue              → /bookings
│   ├── new.vue                → /bookings/new
│   └── [id].vue               → /bookings/:id
└── providers/
    └── [id].vue               → /providers/:id
```

### 4. Middleware for Route Protection

Route middleware controls access:

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login');
  }
});
```

## State Management Strategy

### Local Component State

Use `ref` and `reactive` for component-specific state:

```vue
<script setup lang="ts">
const count = ref(0);
const form = reactive({ name: '', email: '' });
</script>
```

### Shared/Cross-Component State

Use composables for state shared across related components:

```typescript
// Shared between BookingCard and BookingDetails
const { booking, updateStatus } = useBooking(bookingId);
```

### Global Application State

Use Pinia stores for truly global state:

```typescript
// User authentication state used everywhere
const authStore = useAuthStore();
```

## Offline-First Implementation

### IndexedDB Structure

```typescript
// Dexie database schema
class IndlelaDB extends Dexie {
  queue!: Table<QueuedAction>;      // Pending API calls
  providers!: Table<CachedProvider>; // Cached providers
  bookings!: Table<CachedBooking>;   // User bookings
}
```

### Sync Strategy

1. **On app startup:** Check for pending actions
2. **When online:** Process queue in FIFO order
3. **On success:** Update local cache with server data
4. **On failure:** Retry with exponential backoff (max 5 attempts)

### Conflict Resolution

- **Last-write-wins** for most updates
- **Server-authoritative** for booking status
- **User notified** if sync fails after retries

## Security Considerations

### Authentication

- **Token-based auth** using Laravel Sanctum
- **Tokens stored securely** in HTTP-only cookies (web) or Capacitor SecureStorage (mobile)
- **OTP verification** for passwordless login
- **Auto-refresh** tokens before expiry

### Data Protection

- **Sensitive data encrypted** in IndexedDB (payment info, personal details)
- **API calls over HTTPS** only
- **No sensitive data in logs** or error messages
- **Rate limiting** on API endpoints

## Performance Optimizations

### Code Splitting

- **Route-based splitting:** Each page is a separate chunk
- **Component lazy loading:** Large components loaded on demand
- **Dynamic imports:** Heavy libraries only loaded when needed

### Caching Strategy

- **Static assets:** Long-term cache (1 year)
- **API responses:** Network-first with fallback to cache
- **Images:** Cache-first with background refresh

### Data Loading

- **Pagination:** Load providers/bookings in batches
- **Infinite scroll:** Load more as user scrolls
- **Optimistic updates:** Show changes immediately, sync in background

## Next Steps

- Explore [Offline-First Guide](../guides/offline-first.md)
- Review [State Management Patterns](../standards/state-management.md)
- Check out [API Integration Guide](../guides/api-integration.md)
