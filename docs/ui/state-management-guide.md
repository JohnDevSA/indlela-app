# State Management Implementation Guide

Quick reference guide for implementing state management patterns in Indlela pages.

## Quick Start Templates

### Basic Page with Data Fetching

```vue
<script setup lang="ts">
import { usePageState, getEmptyStatePreset } from '~/composables/usePageState'

const { state, isLoading, isError, isEmpty, setLoading, setError, setSuccess, setEmpty } = usePageState()

const services = ref([])

async function loadServices() {
  setLoading('Loading services...')

  try {
    const data = await $fetch('/api/v1/services')
    services.value = data

    if (data.length === 0) {
      setEmpty({ preset: 'no-services' })
    } else {
      setSuccess()
    }
  } catch (error) {
    setError('network')
  }
}

onMounted(loadServices)
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Services</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent>
      <!-- Loading State -->
      <LoadingState
        v-if="isLoading"
        type="skeleton"
        preset="card"
        :count="3"
      />

      <!-- Error State -->
      <ErrorState
        v-else-if="isError"
        :preset="state.config?.preset"
        @retry="loadServices"
      />

      <!-- Empty State -->
      <EmptyState
        v-else-if="isEmpty"
        v-bind="getEmptyStatePreset('no-services')"
        action-label="Browse Categories"
        @action="navigateTo('/categories')"
      />

      <!-- Success State -->
      <div v-else class="p-4">
        <ServiceCard
          v-for="service in services"
          :key="service.id"
          :service="service"
        />
      </div>
    </IonContent>
  </IonPage>
</template>
```

---

### Search Page with Results

```vue
<script setup lang="ts">
import { usePageState } from '~/composables/usePageState'

const { isLoading, isError, isEmpty, setLoading, setError, setSuccess, setEmpty } = usePageState('idle')

const searchQuery = ref('')
const results = ref([])

async function search() {
  if (!searchQuery.value.trim()) return

  setLoading('Searching...')

  try {
    const data = await $fetch('/api/v1/search', {
      query: { q: searchQuery.value }
    })

    results.value = data

    if (data.length === 0) {
      setEmpty({
        icon: 'heroicons:magnifying-glass',
        title: 'No results found',
        message: `No results for "${searchQuery.value}"`,
      })
    } else {
      setSuccess()
    }
  } catch (error) {
    setError('network')
  }
}

// Watch search query with debounce
watchDebounced(searchQuery, search, { debounce: 500 })
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonSearchbar
          v-model="searchQuery"
          placeholder="Search services..."
          @ionClear="results = []; setSuccess()"
        />
      </IonToolbar>
    </IonHeader>

    <IonContent>
      <!-- Initial State (before search) -->
      <EmptyState
        v-if="!searchQuery && isEmpty"
        icon="heroicons:magnifying-glass"
        title="Search for Services"
        message="Try searching for 'plumber' or 'electrician'"
        size="lg"
      />

      <!-- Loading State -->
      <LoadingState
        v-else-if="isLoading"
        type="skeleton"
        preset="list"
        :count="5"
      />

      <!-- Error State -->
      <ErrorState
        v-else-if="isError"
        preset="network"
        @retry="search"
      />

      <!-- Empty Results -->
      <EmptyState
        v-else-if="isEmpty"
        v-bind="state.config"
      />

      <!-- Results -->
      <div v-else class="p-4">
        <p class="text-sm text-neutral-500 mb-4">
          {{ results.length }} result{{ results.length !== 1 ? 's' : '' }} found
        </p>
        <SearchResultCard
          v-for="result in results"
          :key="result.id"
          :result="result"
        />
      </div>
    </IonContent>
  </IonPage>
</template>
```

---

### Form Submission with Loading

```vue
<script setup lang="ts">
import { usePageState } from '~/composables/usePageState'

const router = useRouter()

const formData = ref({
  name: '',
  email: '',
  phone: '',
})

const { isLoading, setLoading, setSuccess } = usePageState()

async function submitForm() {
  setLoading()

  try {
    await $fetch('/api/v1/profile', {
      method: 'POST',
      body: formData.value,
    })

    setSuccess()

    // Show success toast
    showToast('Profile updated successfully', 'success')

    // Navigate away
    router.push('/profile')
  } catch (error) {
    // Show error toast
    showToast('Failed to update profile', 'error')

    // Don't use setError here - we're staying on the form
    // Just let loading state reset
  }
}
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton />
        </IonButtons>
        <IonTitle>Edit Profile</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent>
      <form @submit.prevent="submitForm" class="p-4">
        <UiInput
          v-model="formData.name"
          label="Full Name"
          required
        />

        <UiInput
          v-model="formData.email"
          type="email"
          label="Email"
          required
        />

        <UiInput
          v-model="formData.phone"
          type="tel"
          label="Phone"
          required
        />
      </form>
    </IonContent>

    <PageActions>
      <UiButton
        variant="primary"
        :full-width="true"
        :loading="isLoading"
        @click="submitForm"
      >
        Save Changes
      </UiButton>
    </PageActions>
  </IonPage>
</template>
```

---

### Offline-Aware Page

```vue
<script setup lang="ts">
import { usePageState } from '~/composables/usePageState'
import { useOffline } from '~/composables/useOffline'

const { isOnline, pendingSync } = useOffline()
const { isLoading, isError, isOffline, setLoading, setError, setSuccess, setOffline } = usePageState()

const bookings = ref([])

async function loadBookings() {
  // Check offline first
  if (!isOnline.value) {
    setOffline('no-connection')
    // Try to load from local cache
    bookings.value = await loadFromCache()
    return
  }

  setLoading('Loading bookings...')

  try {
    const data = await $fetch('/api/v1/bookings')
    bookings.value = data
    setSuccess()

    // Cache for offline use
    await cacheData(data)
  } catch (error) {
    // Fallback to cache on error
    if (!isOnline.value) {
      setOffline('no-connection')
      bookings.value = await loadFromCache()
    } else {
      setError('network')
    }
  }
}

// Show sync pending if there are pending items
watchEffect(() => {
  if (pendingSync.value.length > 0) {
    setOffline('sync-pending', { count: pendingSync.value.length })
  }
})

onMounted(loadBookings)
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>My Bookings</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent>
      <!-- Offline Banner (always visible if offline) -->
      <OfflineState
        v-if="isOffline"
        v-bind="state.config"
        :pending-count="pendingSync.length"
        @sync="syncNow"
        size="sm"
        class="mx-4 mt-4"
      />

      <!-- Loading State -->
      <LoadingState
        v-if="isLoading"
        type="skeleton"
        preset="booking-card"
        :count="3"
      />

      <!-- Error State -->
      <ErrorState
        v-else-if="isError"
        :preset="state.config?.preset"
        @retry="loadBookings"
      />

      <!-- Bookings List -->
      <div v-else class="p-4">
        <BookingCard
          v-for="booking in bookings"
          :key="booking.id"
          :booking="booking"
        />
      </div>
    </IonContent>
  </IonPage>
</template>
```

---

## Common Patterns

### Pattern 1: List Page

```vue
<script setup lang="ts">
const { isLoading, isError, isEmpty, setLoading, setError, setSuccess, setEmpty } = usePageState()
const items = ref([])

async function loadItems() {
  setLoading()
  try {
    items.value = await fetchItems()
    items.value.length ? setSuccess() : setEmpty({ preset: 'no-items' })
  } catch (error) {
    setError('network')
  }
}

onMounted(loadItems)
</script>

<template>
  <LoadingState v-if="isLoading" type="skeleton" preset="list" :count="5" />
  <ErrorState v-else-if="isError" @retry="loadItems" />
  <EmptyState v-else-if="isEmpty" preset="no-items" />
  <ItemList v-else :items="items" />
</template>
```

### Pattern 2: Detail Page

```vue
<script setup lang="ts">
const route = useRoute()
const { isLoading, isError, setLoading, setError, setSuccess } = usePageState()
const item = ref(null)

async function loadItem() {
  setLoading()
  try {
    item.value = await fetchItem(route.params.id)
    setSuccess()
  } catch (error) {
    setError(error.status === 404 ? 'not-found' : 'network')
  }
}

onMounted(loadItem)
</script>

<template>
  <LoadingState v-if="isLoading" type="skeleton" preset="card" />
  <ErrorState v-else-if="isError" :preset="state.config?.preset" />
  <ItemDetail v-else :item="item" />
</template>
```

### Pattern 3: Infinite Scroll

```vue
<script setup lang="ts">
const { isLoading, setLoading, setSuccess } = usePageState()
const items = ref([])
const page = ref(1)
const hasMore = ref(true)

async function loadMore() {
  if (!hasMore.value) return

  setLoading()
  try {
    const data = await fetchItems(page.value)
    items.value.push(...data)
    hasMore.value = data.length > 0
    page.value++
    setSuccess()
  } catch (error) {
    // Show toast instead of full error state
    showToast('Failed to load more', 'error')
  }
}

onMounted(loadMore)
</script>

<template>
  <div>
    <ItemList :items="items" />
    <LoadingState v-if="isLoading" type="spinner" size="sm" />
    <IonInfiniteScroll @ionInfinite="loadMore" :disabled="!hasMore">
      <IonInfiniteScrollContent />
    </IonInfiniteScroll>
  </div>
</template>
```

### Pattern 4: Pull to Refresh

```vue
<script setup lang="ts">
const { isLoading, setLoading, setSuccess } = usePageState()
const items = ref([])

async function refresh(event?: any) {
  setLoading()
  try {
    items.value = await fetchItems()
    setSuccess()
  } catch (error) {
    showToast('Failed to refresh', 'error')
  } finally {
    event?.target.complete()
  }
}

onMounted(refresh)
</script>

<template>
  <IonContent>
    <IonRefresher slot="fixed" @ionRefresh="refresh">
      <IonRefresherContent />
    </IonRefresher>

    <ItemList :items="items" />
  </IonContent>
</template>
```

---

## Button Patterns

### Pattern 1: Page Actions

```vue
<template>
  <IonPage>
    <IonContent>
      <!-- Content -->
    </IonContent>

    <PageActions>
      <UiButton variant="primary" :full-width="true" @click="save">
        Save
      </UiButton>
      <UiButton variant="outline" :full-width="true" @click="cancel">
        Cancel
      </UiButton>
    </PageActions>
  </IonPage>
</template>
```

### Pattern 2: Card Actions

```vue
<template>
  <UiCard>
    <div class="mb-4">
      <!-- Card content -->
    </div>

    <div class="flex gap-2">
      <UiButton variant="outline" class="flex-1">
        View Details
      </UiButton>
      <UiButton variant="primary" class="flex-1">
        Book Now
      </UiButton>
    </div>
  </UiCard>
</template>
```

### Pattern 3: Icon-Only Actions

```vue
<template>
  <div class="flex justify-between items-center">
    <h2>{{ title }}</h2>

    <div class="flex gap-2">
      <UiButton
        variant="ghost"
        icon="heroicons:heart"
        aria-label="Add to favorites"
        @click="toggleFavorite"
      />
      <UiButton
        variant="ghost"
        icon="heroicons:share"
        aria-label="Share"
        @click="share"
      />
    </div>
  </div>
</template>
```

---

## Common Mistakes to Avoid

### Mistake 1: Not Handling Empty States
```vue
<!-- ❌ Bad: No empty state -->
<div v-if="items.length > 0">
  <ItemList :items="items" />
</div>

<!-- ✅ Good: Proper empty state -->
<EmptyState v-if="isEmpty" preset="no-items" />
<ItemList v-else :items="items" />
```

### Mistake 2: Inconsistent Button Sizing
```vue
<!-- ❌ Bad: No consistent sizing -->
<button style="height: 40px">Submit</button>

<!-- ✅ Good: Using UiButton with proper sizing -->
<UiButton size="md">Submit</UiButton>
```

### Mistake 3: Missing Loading States
```vue
<!-- ❌ Bad: No loading feedback -->
<div v-if="!loading">
  <ItemList :items="items" />
</div>

<!-- ✅ Good: Clear loading state -->
<LoadingState v-if="isLoading" type="skeleton" preset="list" />
<ItemList v-else :items="items" />
```

### Mistake 4: Hardcoded Error Messages
```vue
<!-- ❌ Bad: Hardcoded error UI -->
<div v-if="error" class="error">
  Something went wrong
</div>

<!-- ✅ Good: Using ErrorState component -->
<ErrorState v-if="isError" preset="network" @retry="retry" />
```

---

## Checklist for New Pages

- [ ] Import usePageState composable
- [ ] Set up state management (loading, error, empty, success)
- [ ] Use LoadingState with appropriate skeleton/spinner
- [ ] Use ErrorState with appropriate preset
- [ ] Use EmptyState with appropriate preset or custom config
- [ ] Handle offline scenarios with OfflineState
- [ ] Use UiButton instead of IonButton where appropriate
- [ ] Wrap bottom actions in PageActions component
- [ ] Ensure all buttons meet 44x44px touch target
- [ ] Add proper aria-labels to icon-only buttons
- [ ] Test dark mode
- [ ] Test on iOS and Android
- [ ] Test offline functionality

---

## Related Documentation

- [Components](./components.md) - Full component API reference
- [Button Patterns](./button-patterns.md) - Comprehensive button guide
- [Standardization Summary](./standardization-summary.md) - Overview of standardization
- [Design Tokens](./design-tokens.md) - Design system tokens
- [Accessibility](./accessibility.md) - WCAG guidelines