# First Contribution Guide

> How to make your first code contribution to Indlela

## Before You Start

Make sure you've completed:

1. [Environment Setup](./setup.md)
2. Read the [Architecture Overview](./architecture.md)
3. Reviewed [Code Style Guide](../standards/code-style.md)

## Finding an Issue

### Good First Issues

Look for issues labeled `good first issue` on GitHub. These are:
- Well-defined with clear acceptance criteria
- Lower complexity
- Good introduction to the codebase

### Understanding the Issue

Before starting work:

1. **Read the issue description carefully**
2. **Check for linked discussions or PRs**
3. **Ask questions if anything is unclear**
4. **Comment that you're working on it** (prevents duplicate work)

## Development Workflow

### 1. Create a Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/booking-calendar
# or
git checkout -b fix/payment-webhook-timeout
```

Branch naming convention:
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring
- `test/description` - Adding tests

### 2. Make Your Changes

Follow the coding standards:

```vue
<!-- ✅ Good component structure -->
<script setup lang="ts">
// Imports
import { ref, computed } from 'vue';

// Props with TypeScript
interface Props {
  booking: Booking;
}

const props = defineProps<Props>();

// Emits with types
interface Emits {
  cancel: [bookingId: string];
}

const emit = defineEmits<Emits>();

// Logic
function handleCancel() {
  emit('cancel', props.booking.id);
}
</script>

<template>
  <div class="booking-card">
    <h3>{{ booking.title }}</h3>
    <button
      @click="handleCancel"
      class="min-h-[44px] min-w-[44px]"
    >
      {{ t('booking.cancel') }}
    </button>
  </div>
</template>
```

### 3. Write Tests

Every feature/fix should have tests:

```typescript
// tests/components/booking/BookingCard.test.ts
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
  });

  it('emits cancel event', async () => {
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

Run tests:

```bash
pnpm test
```

### 4. Add Translations

For any user-facing text:

```json
// locales/en.json
{
  "booking": {
    "calendar": {
      "title": "Select a Date",
      "no_slots": "No available time slots"
    }
  }
}
```

Add to ALL language files (en, zu, xh, af, st, tn).

For translations you don't know, use English temporarily and mark with TODO:

```json
// locales/zu.json
{
  "booking": {
    "calendar": {
      "title": "TODO: Translate - Select a Date",
      "no_slots": "TODO: Translate - No available time slots"
    }
  }
}
```

### 5. Check Code Quality

Before committing:

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Run all tests
pnpm test:run

# Optional: Check test coverage
pnpm test:coverage
```

Fix any errors before proceeding.

### 6. Commit Your Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .

# Format: type(scope): description
git commit -m "feat(booking): add booking calendar component"

# Other examples:
# git commit -m "fix(auth): handle OTP expiry correctly"
# git commit -m "docs(api): update authentication guide"
# git commit -m "test(provider): add verification flow tests"
```

### 7. Push to GitHub

```bash
git push origin feature/booking-calendar
```

### 8. Create Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template:

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix
- [x] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Added booking calendar component
- Implemented date selection logic
- Added tests for calendar interactions

## Testing
- [ ] All tests pass (`pnpm test`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] Tested offline functionality

## Screenshots (if applicable)
Add screenshots showing the new feature/fix.

## Related Issues
Closes #123
```

5. Request review from team members

## Code Review Process

### What Reviewers Look For

1. **Code Quality**
   - Follows coding standards
   - Well-structured and readable
   - No obvious bugs or issues

2. **Testing**
   - Adequate test coverage
   - Tests actually test the right things
   - Edge cases handled

3. **Documentation**
   - Code is self-documenting
   - Complex logic has comments
   - User-facing changes have i18n

4. **Accessibility**
   - Touch targets are 44x44px minimum
   - Semantic HTML used
   - Alt text on images

5. **Offline-First**
   - Critical features work offline
   - Proper error handling
   - Data cached appropriately

### Responding to Feedback

When you receive review comments:

1. **Be respectful and open-minded**
2. **Ask questions if you don't understand**
3. **Make requested changes promptly**
4. **Reply to comments when done**

```bash
# Make changes based on feedback
git add .
git commit -m "refactor: apply review feedback"
git push origin feature/booking-calendar
```

### Getting Approval

Once reviewers approve:
- **Don't merge yourself** (unless you're a maintainer)
- Maintainers will merge when ready
- Your code will be deployed automatically

## Common Mistakes to Avoid

### ❌ Not Testing Offline

```typescript
// Bad: Assumes network is always available
async function createBooking(data: BookingData) {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

// Good: Works offline
async function createBooking(data: BookingData) {
  const { isOnline } = useOffline();

  if (!isOnline.value) {
    return await queueAction('CREATE_BOOKING', data);
  }

  return await $api('/bookings', {
    method: 'POST',
    body: data,
  });
}
```

### ❌ Hardcoding Text

```vue
<!-- Bad: English only -->
<template>
  <h1>Welcome to Indlela</h1>
</template>

<!-- Good: Supports all languages -->
<template>
  <h1>{{ t('home.welcome') }}</h1>
</template>
```

### ❌ Small Touch Targets

```vue
<!-- Bad: Icon-only button too small -->
<template>
  <button class="p-1">
    <ion-icon :icon="heart" />
  </button>
</template>

<!-- Good: Meets 44x44px requirement -->
<template>
  <button class="min-h-[44px] min-w-[44px] p-3">
    <ion-icon :icon="heart" />
  </button>
</template>
```

### ❌ Not Using TypeScript

```vue
<!-- Bad: No types -->
<script setup>
const props = defineProps(['booking']);
</script>

<!-- Good: Fully typed -->
<script setup lang="ts">
interface Props {
  booking: Booking;
}

const props = defineProps<Props>();
</script>
```

### ❌ Options API

```vue
<!-- Bad: Options API -->
<script lang="ts">
export default {
  data() {
    return { count: 0 };
  },
};
</script>

<!-- Good: Composition API -->
<script setup lang="ts">
const count = ref(0);
</script>
```

## Example: Full Feature Implementation

Let's walk through adding a "Favorite Providers" feature.

### 1. Create the Composable

```typescript
// composables/useFavorites.ts
export function useFavorites() {
  const favorites = ref<Provider[]>([]);
  const isLoading = ref(false);

  async function fetchFavorites() {
    isLoading.value = true;
    try {
      const { data } = await useApi<Provider[]>('/favorites');
      favorites.value = data.value ?? [];
    } finally {
      isLoading.value = false;
    }
  }

  async function addFavorite(providerId: string) {
    await $api('/favorites', {
      method: 'POST',
      body: { provider_id: providerId },
    });
    await fetchFavorites();
  }

  async function removeFavorite(providerId: string) {
    await $api(`/favorites/${providerId}`, {
      method: 'DELETE',
    });
    favorites.value = favorites.value.filter(p => p.id !== providerId);
  }

  function isFavorite(providerId: string): boolean {
    return favorites.value.some(p => p.id === providerId);
  }

  return {
    favorites: readonly(favorites),
    isLoading: readonly(isLoading),
    fetchFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
}
```

### 2. Create the Component

```vue
<!-- components/provider/FavoriteButton.vue -->
<script setup lang="ts">
import { heart, heartOutline } from 'ionicons/icons';

interface Props {
  providerId: string;
}

const props = defineProps<Props>();

const { addFavorite, removeFavorite, isFavorite, isLoading } = useFavorites();

const isFav = computed(() => isFavorite(props.providerId));

async function toggleFavorite() {
  if (isFav.value) {
    await removeFavorite(props.providerId);
  } else {
    await addFavorite(props.providerId);
  }
}
</script>

<template>
  <button
    aria-label="Toggle favorite"
    :disabled="isLoading"
    @click.stop="toggleFavorite"
    class="min-h-[44px] min-w-[44px] p-3"
  >
    <ion-icon
      :icon="isFav ? heart : heartOutline"
      :color="isFav ? 'danger' : 'medium'"
      class="text-2xl"
    />
  </button>
</template>
```

### 3. Add Tests

```typescript
// tests/composables/useFavorites.test.ts
import { describe, it, expect, vi } from 'vitest';
import { useFavorites } from '~/composables/useFavorites';

describe('useFavorites', () => {
  it('adds provider to favorites', async () => {
    const { addFavorite, isFavorite } = useFavorites();

    await addFavorite('provider-123');

    expect(isFavorite('provider-123')).toBe(true);
  });

  it('removes provider from favorites', async () => {
    const { addFavorite, removeFavorite, isFavorite } = useFavorites();

    await addFavorite('provider-123');
    await removeFavorite('provider-123');

    expect(isFavorite('provider-123')).toBe(false);
  });
});
```

### 4. Add Translations

```json
// locales/en.json
{
  "favorites": {
    "add": "Add to favorites",
    "remove": "Remove from favorites",
    "title": "My Favorites"
  }
}
```

### 5. Commit and Push

```bash
git add .
git commit -m "feat(provider): add favorite providers feature

- Add useFavorites composable
- Add FavoriteButton component
- Add tests for favorite functionality
- Add i18n translations"

git push origin feature/favorite-providers
```

## Getting Help

If you're stuck:

1. **Check existing documentation** in `/docs`
2. **Search closed PRs and issues** - someone may have solved similar problems
3. **Ask in team Slack** - don't struggle alone
4. **Tag maintainers** in your PR if you need guidance

## Next Steps

After your first contribution:

- Look for more complex issues
- Help review other PRs
- Improve documentation
- Share knowledge with new contributors

Welcome to the Indlela team!
