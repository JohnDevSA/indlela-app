# Code Style Guide

> Coding standards and conventions for Indlela

## Vue/Nuxt Conventions

### Always Use `<script setup lang="ts">`

Use the Composition API with TypeScript:

```vue
<!-- ✅ CORRECT -->
<script setup lang="ts">
const count = ref(0);
const doubled = computed(() => count.value * 2);
</script>

<!-- ❌ WRONG - Options API -->
<script lang="ts">
export default {
  data() {
    return { count: 0 };
  },
  computed: {
    doubled() {
      return this.count * 2;
    }
  }
}
</script>
```

### Component Structure

Consistent component organization:

```vue
<script setup lang="ts">
// 1. Imports
import { ref, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';

// 2. Props
interface Props {
  title: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
});

// 3. Emits
interface Emits {
  update: [value: number];
  close: [];
}

const emit = defineEmits<Emits>();

// 4. Composables & Stores
const authStore = useAuthStore();
const { t } = useI18n();

// 5. Reactive State
const isOpen = ref(false);

// 6. Computed Properties
const displayTitle = computed(() => props.title.toUpperCase());

// 7. Methods
function handleClick() {
  emit('update', props.count + 1);
}

// 8. Lifecycle Hooks
onMounted(() => {
  console.log('Component mounted');
});
</script>

<template>
  <!-- Template content -->
</template>

<style scoped>
/* Component styles */
</style>
```

### Template Conventions

```vue
<template>
  <!-- ✅ Use semantic HTML -->
  <article class="booking-card">
    <header>
      <h2>{{ booking.title }}</h2>
    </header>
    <main>
      <p>{{ booking.description }}</p>
    </main>
  </article>

  <!-- ✅ Use v-for with :key -->
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>

  <!-- ✅ Use shorthand directives -->
  <button @click="submit" :disabled="isLoading">
    Submit
  </button>

  <!-- ❌ Avoid v-if with v-for on same element -->
  <div v-for="item in items" v-if="item.active" :key="item.id">
    <!-- This works but is inefficient -->
  </div>

  <!-- ✅ Filter in computed instead -->
  <div v-for="item in activeItems" :key="item.id">
    {{ item.name }}
  </div>
</template>

<script setup lang="ts">
const activeItems = computed(() => items.value.filter(i => i.active));
</script>
```

### TypeScript Best Practices

```typescript
// ✅ Define interfaces for all props
interface BookingCardProps {
  booking: Booking;
  showActions?: boolean;
}

const props = withDefaults(defineProps<BookingCardProps>(), {
  showActions: true,
});

// ✅ Type emits
interface BookingCardEmits {
  cancel: [bookingId: string];
  update: [booking: Booking];
}

const emit = defineEmits<BookingCardEmits>();

// ✅ Type refs properly
const bookings = ref<Booking[]>([]);
const selectedBooking = ref<Booking | null>(null);

// ✅ Use type for object state
interface FormState {
  name: string;
  email: string;
  isValid: boolean;
}

const form = reactive<FormState>({
  name: '',
  email: '',
  isValid: false,
});

// ✅ Type function parameters and returns
async function createBooking(data: CreateBookingData): Promise<Booking> {
  const response = await $api<BookingResponse>('/bookings', {
    method: 'POST',
    body: data,
  });
  return response.data;
}
```

## File Naming Conventions

### Components

Use **PascalCase** for all component files:

```
✅ CORRECT:
components/
├── BookingCard.vue
├── ProviderProfile.vue
└── ui/
    ├── EmptyState.vue
    └── OfflineIndicator.vue

❌ WRONG:
components/
├── booking-card.vue
├── providerProfile.vue
└── ui/
    ├── empty_state.vue
    └── offline-indicator.vue
```

### Composables

Use **useCamelCase** pattern:

```
✅ CORRECT:
composables/
├── useAuth.ts
├── useBooking.ts
└── useGeolocation.ts

❌ WRONG:
composables/
├── auth.ts
├── Booking.ts
└── use-geolocation.ts
```

### Pages

Use **kebab-case** for multi-word pages:

```
✅ CORRECT:
pages/
├── index.vue
├── auth/
│   ├── login.vue
│   └── verify-otp.vue
└── provider-dashboard/
    └── earnings.vue

❌ WRONG:
pages/
├── Auth/
│   └── VerifyOTP.vue
└── providerDashboard/
    └── Earnings.vue
```

### Stores

Use **camelCase** for store files:

```
✅ CORRECT:
stores/
├── auth.ts
├── booking.ts
└── offlineQueue.ts

❌ WRONG:
stores/
├── Auth.ts
├── BookingStore.ts
└── offline-queue.ts
```

## Component Organization

### Feature-Based Structure

Group components by feature, not by type:

```
✅ CORRECT:
components/
├── booking/
│   ├── BookingCard.vue
│   ├── BookingForm.vue
│   ├── BookingStatus.vue
│   └── BookingHistory.vue
├── provider/
│   ├── ProviderCard.vue
│   ├── ProviderProfile.vue
│   └── AvailabilityCalendar.vue
└── ui/               # Shared UI components
    ├── EmptyState.vue
    ├── StarRating.vue
    └── base/
        ├── UiButton.vue
        └── UiInput.vue

❌ WRONG:
components/
├── cards/
│   ├── BookingCard.vue
│   └── ProviderCard.vue
├── forms/
│   └── BookingForm.vue
└── widgets/
    └── AvailabilityCalendar.vue
```

## Styling Conventions

### Use Tailwind Utility Classes

Prefer Tailwind utilities over custom CSS:

```vue
<!-- ✅ CORRECT -->
<template>
  <div class="flex items-center gap-4 rounded-lg bg-white p-4 shadow-md">
    <img :src="provider.avatar" class="h-12 w-12 rounded-full" alt="" />
    <div>
      <h3 class="text-lg font-semibold">{{ provider.name }}</h3>
      <p class="text-sm text-gray-600">{{ provider.service }}</p>
    </div>
  </div>
</template>

<!-- ❌ WRONG - Excessive custom CSS -->
<template>
  <div class="provider-card">
    <img :src="provider.avatar" class="avatar" alt="" />
    <div class="info">
      <h3 class="name">{{ provider.name }}</h3>
      <p class="service">{{ provider.service }}</p>
    </div>
  </div>
</template>

<style scoped>
.provider-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
/* ...more custom styles */
</style>
```

### When to Use Custom CSS

Use `<style scoped>` for:

- Complex animations
- Component-specific design tokens
- Styles that can't be achieved with Tailwind

```vue
<style scoped>
/* ✅ CORRECT - Animation not in Tailwind */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.slide-enter-active {
  animation: slideIn 0.3s ease-out;
}

/* ✅ CORRECT - Custom design system token */
.booking-card {
  border-left: 4px solid var(--color-brand-primary);
}
</style>
```

### Accessibility

Always include accessibility attributes:

```vue
<template>
  <!-- ✅ Touch targets (44x44px minimum) -->
  <button class="min-h-[44px] min-w-[44px] p-3">
    <ion-icon :icon="heart" />
  </button>

  <!-- ✅ Semantic HTML -->
  <article role="article" aria-labelledby="booking-title">
    <h2 id="booking-title">{{ booking.title }}</h2>
    <p>{{ booking.description }}</p>
  </article>

  <!-- ✅ Alt text for images -->
  <img
    :src="provider.avatar"
    :alt="`${provider.name}'s profile photo`"
  />

  <!-- ✅ ARIA labels for icon-only buttons -->
  <button aria-label="Add to favorites">
    <ion-icon :icon="heart" />
  </button>

  <!-- ✅ Form labels -->
  <label for="phone-input" class="block text-sm font-medium">
    {{ t('auth.phone') }}
  </label>
  <input id="phone-input" type="tel" v-model="phone" />
</template>
```

## Internationalization (i18n)

### Use Translation Keys

Never hardcode user-facing text:

```vue
<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <!-- ✅ CORRECT -->
  <h1>{{ t('home.welcome') }}</h1>
  <p>{{ t('home.tagline') }}</p>
  <button>{{ t('common.submit') }}</button>

  <!-- ❌ WRONG -->
  <h1>Welcome to Indlela</h1>
  <p>Find trusted service providers</p>
  <button>Submit</button>
</template>
```

### Translation File Structure

Organize translations by feature:

```json
{
  "nav": {
    "home": "Home",
    "bookings": "Bookings",
    "profile": "Profile"
  },
  "booking": {
    "title": "Book a Service",
    "status": {
      "pending": "Pending",
      "confirmed": "Confirmed",
      "completed": "Completed"
    },
    "actions": {
      "create": "Create Booking",
      "cancel": "Cancel",
      "reschedule": "Reschedule"
    }
  }
}
```

### Pluralization and Interpolation

```vue
<script setup lang="ts">
const { t, n } = useI18n();
const bookingCount = ref(3);
</script>

<template>
  <!-- Pluralization -->
  <p>{{ t('booking.count', bookingCount) }}</p>
  <!-- Output: "You have 3 bookings" -->

  <!-- Number formatting -->
  <p>{{ n(booking.amount, 'currency') }}</p>
  <!-- Output: "R 450.00" -->

  <!-- Interpolation -->
  <p>{{ t('booking.scheduled', { date: booking.date }) }}</p>
  <!-- Output: "Scheduled for 2025-01-15" -->
</template>
```

## Error Handling

### Composables

```typescript
export function useBooking() {
  const error = ref<Error | null>(null);
  const isLoading = ref(false);

  async function createBooking(data: BookingData) {
    isLoading.value = true;
    error.value = null;

    try {
      const booking = await $api('/bookings', {
        method: 'POST',
        body: data,
      });
      return booking;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error');
      throw err; // Re-throw to allow component handling
    } finally {
      isLoading.value = false;
    }
  }

  return {
    error: readonly(error),
    isLoading: readonly(isLoading),
    createBooking,
  };
}
```

### Components

```vue
<script setup lang="ts">
const { createBooking, error, isLoading } = useBooking();
const { showToast } = useToast();

async function handleSubmit() {
  try {
    await createBooking(formData);
    showToast('Booking created successfully', 'success');
    navigateTo('/bookings');
  } catch (err) {
    // Error already set in composable
    // Optional: Show user-friendly message
    showToast(t('errors.booking_failed'), 'error');
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <!-- Form fields -->

    <!-- Show error if present -->
    <div v-if="error" class="rounded-md bg-red-50 p-4 text-red-800">
      {{ error.message }}
    </div>

    <button :disabled="isLoading" type="submit">
      {{ isLoading ? t('common.loading') : t('booking.create') }}
    </button>
  </form>
</template>
```

## Testing Conventions

### Component Tests

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BookingCard from '~/components/booking/BookingCard.vue';

describe('BookingCard', () => {
  it('renders booking details', () => {
    const wrapper = mount(BookingCard, {
      props: {
        booking: {
          id: '123',
          title: 'Home Cleaning',
          status: 'pending',
        },
      },
    });

    expect(wrapper.text()).toContain('Home Cleaning');
    expect(wrapper.find('[data-testid="status"]').text()).toBe('pending');
  });

  it('emits cancel event when cancel button clicked', async () => {
    const wrapper = mount(BookingCard, {
      props: {
        booking: { id: '123', title: 'Test' },
      },
    });

    await wrapper.find('[data-testid="cancel-btn"]').trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
    expect(wrapper.emitted('cancel')?.[0]).toEqual(['123']);
  });
});
```

### Composable Tests

```typescript
import { describe, it, expect } from 'vitest';
import { useBooking } from '~/composables/useBooking';

describe('useBooking', () => {
  it('creates a booking', async () => {
    const { createBooking, isLoading } = useBooking();

    expect(isLoading.value).toBe(false);

    const promise = createBooking({
      serviceId: '123',
      providerId: '456'
    });

    expect(isLoading.value).toBe(true);

    const booking = await promise;

    expect(isLoading.value).toBe(false);
    expect(booking.id).toBeDefined();
  });
});
```

## Code Comments

### When to Comment

```typescript
// ✅ Complex business logic
function calculateCommission(amount: number): number {
  // Commission is 12% of total, with minimum of R10
  const commission = amount * 0.12;
  return Math.max(commission, 10);
}

// ✅ Non-obvious workarounds
async function syncBookings() {
  // Wait 100ms before sync to allow IndexedDB transaction to complete
  // See: https://github.com/dexie/Dexie.js/issues/123
  await new Promise(resolve => setTimeout(resolve, 100));
  await processQueue();
}

// ❌ Obvious code doesn't need comments
function getUserName(user: User): string {
  // Return the user's name
  return user.name; // This is redundant
}
```

### JSDoc for Public APIs

```typescript
/**
 * Creates a new booking for a service
 *
 * @param data - Booking details
 * @returns Promise resolving to the created booking
 * @throws {ValidationError} If booking data is invalid
 * @throws {ProviderUnavailableError} If provider is not available
 *
 * @example
 * ```typescript
 * const booking = await createBooking({
 *   serviceId: '123',
 *   providerId: '456',
 *   scheduledAt: new Date(),
 * });
 * ```
 */
export async function createBooking(data: BookingData): Promise<Booking> {
  // Implementation
}
```

## Linting and Formatting

### Run Before Committing

```bash
# Check for errors
pnpm lint

# Auto-fix where possible
pnpm lint --fix

# Type checking
pnpm typecheck
```

### ESLint Rules

Key rules enforced:

- `vue/multi-word-component-names` - Components must be multi-word (except pages)
- `@typescript-eslint/no-unused-vars` - No unused variables
- `vue/no-v-html` - Avoid v-html (XSS risk)
- `vue/require-default-prop` - Props need defaults
- `vue/require-prop-types` - Props must be typed

### Disable Rules Sparingly

Only disable rules when absolutely necessary:

```vue
<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dynamicData: any = JSON.parse(rawData);
</script>
```

## Git Commit Messages

Follow conventional commits:

```bash
# Format: type(scope): description

feat(booking): add recurring bookings
fix(auth): handle OTP expiry correctly
docs(api): update authentication guide
test(provider): add verification tests
chore(deps): upgrade Nuxt to 4.1
refactor(offline): simplify queue processing
perf(images): lazy load provider avatars
```

## Summary Checklist

Before submitting code, verify:

- [ ] All components use `<script setup lang="ts">`
- [ ] File names follow conventions (PascalCase/camelCase/kebab-case)
- [ ] All user-facing text uses i18n
- [ ] TypeScript types are defined for props, emits, and functions
- [ ] Accessibility attributes are present (alt, aria-label, etc.)
- [ ] Touch targets are at least 44x44px
- [ ] Error handling is implemented
- [ ] Tests are written for new features
- [ ] Linting passes (`pnpm lint`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Commit message follows convention
