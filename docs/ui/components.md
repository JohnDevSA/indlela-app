# Component Library

Comprehensive reference for all UI components in the Indlela design system.

## Layout Components

### PageFooter

General-purpose footer wrapper with automatic safe area handling for iOS and Android.

```vue
<!-- Basic footer -->
<PageFooter>
  <p>© 2025 Indlela. All rights reserved.</p>
</PageFooter>

<!-- With border and custom background -->
<PageFooter :border="true" background="surface">
  <p>Footer content here</p>
</PageFooter>

<!-- Sticky footer with shadow -->
<PageFooter :sticky="true" :shadow="true" padding="lg">
  <p>Always visible at bottom</p>
</PageFooter>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| border | `boolean` | `false` | Add top border |
| shadow | `boolean` | `false` | Add shadow effect |
| background | `'default' \| 'transparent' \| 'surface'` | `'default'` | Background style |
| padding | `'sm' \| 'md' \| 'lg'` | `'md'` | Internal padding |
| sticky | `boolean` | `false` | Fix to bottom of viewport |

**Features:**
- Automatic `env(safe-area-inset-bottom)` handling for iOS notch and Android nav bar
- Works in PWA, Android, and iOS native apps
- Graceful fallback on browsers without safe area support

---

### PageActions

Specialized component for action button groups at the bottom of pages. Ensures consistent spacing, safe area padding, and 44x44px touch targets.

```vue
<!-- Basic actions -->
<PageActions>
  <IonButton expand="block">Save Changes</IonButton>
  <IonButton expand="block" fill="outline">Cancel</IonButton>
</PageActions>

<!-- With custom gap and padding -->
<PageActions gap="lg" padding="lg">
  <IonButton expand="block" color="success">Confirm</IonButton>
  <IonButton expand="block" fill="outline">Contact</IonButton>
  <IonButton expand="block" color="danger" fill="outline">Cancel</IonButton>
</PageActions>

<!-- Sticky with visual separation -->
<PageActions :sticky="true" :border="true" :shadow="true" background="surface">
  <IonButton expand="block">Checkout</IonButton>
</PageActions>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| gap | `'sm' \| 'md' \| 'lg'` | `'md'` | Space between buttons |
| sticky | `boolean` | `false` | Fix to bottom of viewport |
| background | `'default' \| 'transparent' \| 'surface'` | `'default'` | Background style |
| padding | `'sm' \| 'md' \| 'lg'` | `'md'` | Internal padding |
| border | `boolean` | `false` | Add top border |
| shadow | `boolean` | `false` | Add shadow effect |

**Features:**
- Vertical flexbox layout with consistent gaps
- Automatic safe area padding for all platforms
- Guarantees minimum 44x44px touch targets
- Optimized for booking flows, forms, and action-heavy pages

**Use Cases:**
- ✅ Form submit/cancel buttons
- ✅ Booking confirmation flows
- ✅ Multi-button action groups
- ❌ Inline form buttons (use regular buttons)
- ❌ Toolbar buttons (use IonToolbar)

---

## Base Components

### UiButton

Primary button component with multiple variants.

```vue
<UiButton>Default</UiButton>
<UiButton variant="secondary">Secondary</UiButton>
<UiButton variant="outline">Outline</UiButton>
<UiButton variant="ghost">Ghost</UiButton>
<UiButton variant="danger">Danger</UiButton>

<!-- Sizes -->
<UiButton size="sm">Small</UiButton>
<UiButton size="md">Medium</UiButton>
<UiButton size="lg">Large</UiButton>

<!-- States -->
<UiButton :loading="true">Loading...</UiButton>
<UiButton :disabled="true">Disabled</UiButton>

<!-- With icon -->
<UiButton icon="heroicons:plus">Add New</UiButton>
<UiButton icon="heroicons:arrow-right" icon-position="right">Next</UiButton>

<!-- Full width -->
<UiButton :full-width="true">Full Width</UiButton>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Visual style |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| loading | `boolean` | `false` | Show loading spinner |
| disabled | `boolean` | `false` | Disable interactions |
| fullWidth | `boolean` | `false` | Stretch to container width |
| icon | `string` | - | Iconify icon name |
| iconPosition | `'left' \| 'right'` | `'left'` | Icon placement |

---

### UiInput

Text input with label, validation, and icon support.

```vue
<UiInput
  v-model="email"
  type="email"
  label="Email Address"
  placeholder="you@example.com"
  :required="true"
/>

<!-- With icon -->
<UiInput
  v-model="search"
  icon="heroicons:magnifying-glass"
  placeholder="Search..."
  :clearable="true"
/>

<!-- Password with toggle -->
<UiInput
  v-model="password"
  type="password"
  label="Password"
/>

<!-- With error -->
<UiInput
  v-model="phone"
  label="Phone"
  error="Invalid phone number"
/>

<!-- With hint -->
<UiInput
  v-model="name"
  label="Display Name"
  hint="This will be visible to other users"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | `string \| number` | - | Input value (v-model) |
| type | `'text' \| 'email' \| 'password' \| 'tel' \| 'number' \| 'search' \| 'url'` | `'text'` | Input type |
| label | `string` | - | Label text |
| placeholder | `string` | - | Placeholder text |
| hint | `string` | - | Helper text below input |
| error | `string` | - | Error message |
| disabled | `boolean` | `false` | Disable input |
| required | `boolean` | `false` | Mark as required |
| icon | `string` | - | Iconify icon name |
| iconPosition | `'left' \| 'right'` | `'left'` | Icon placement |
| clearable | `boolean` | `false` | Show clear button |

---

### UiCard

Flexible card container with multiple variants.

```vue
<UiCard>
  Basic card content
</UiCard>

<!-- Variants -->
<UiCard variant="elevated">Elevated</UiCard>
<UiCard variant="outlined">Outlined</UiCard>
<UiCard variant="filled">Filled</UiCard>
<UiCard variant="glass">Glass effect</UiCard>

<!-- Interactive (clickable) -->
<UiCard :interactive="true" @click="handleClick">
  Click me
</UiCard>

<!-- With header and footer -->
<UiCard>
  <template #header>
    <h3>Card Title</h3>
  </template>

  Card content goes here

  <template #footer>
    <UiButton>Action</UiButton>
  </template>
</UiCard>

<!-- Padding options -->
<UiCard padding="none">No padding</UiCard>
<UiCard padding="sm">Small padding</UiCard>
<UiCard padding="lg">Large padding</UiCard>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'default' \| 'elevated' \| 'outlined' \| 'filled' \| 'glass'` | `'default'` | Visual style |
| padding | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Internal padding |
| interactive | `boolean` | `false` | Make clickable |
| disabled | `boolean` | `false` | Disable interactions |
| loading | `boolean` | `false` | Show loading overlay |

---

### UiAvatar

User avatar with image, initials, or icon fallback.

```vue
<!-- With image -->
<UiAvatar src="/avatars/user.jpg" alt="John Doe" />

<!-- With initials (auto-generated from name) -->
<UiAvatar name="John Doe" />

<!-- Sizes -->
<UiAvatar name="JD" size="xs" />
<UiAvatar name="JD" size="sm" />
<UiAvatar name="JD" size="md" />
<UiAvatar name="JD" size="lg" />
<UiAvatar name="JD" size="xl" />

<!-- With online status -->
<UiAvatar name="John" :online="true" />
<UiAvatar name="Jane" :offline="true" />

<!-- Square shape -->
<UiAvatar name="Company" shape="square" />
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| src | `string` | - | Image URL |
| alt | `string` | - | Alt text |
| name | `string` | - | Name for initials |
| size | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Avatar size |
| shape | `'circle' \| 'square'` | `'circle'` | Avatar shape |
| online | `boolean` | - | Show online indicator |
| offline | `boolean` | - | Show offline indicator |

---

### UiBadge

Status badges and labels.

```vue
<UiBadge>Default</UiBadge>
<UiBadge variant="primary">Primary</UiBadge>
<UiBadge variant="success">Completed</UiBadge>
<UiBadge variant="warning">Pending</UiBadge>
<UiBadge variant="error">Failed</UiBadge>
<UiBadge variant="info">Info</UiBadge>

<!-- With dot indicator -->
<UiBadge variant="success" :dot="true">Online</UiBadge>

<!-- Outline style -->
<UiBadge variant="primary" :outline="true">Outline</UiBadge>

<!-- With icon -->
<UiBadge icon="heroicons:star">Featured</UiBadge>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'default'` | Color variant |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Badge size |
| dot | `boolean` | `false` | Show dot indicator |
| pill | `boolean` | `true` | Fully rounded |
| outline | `boolean` | `false` | Outline style |
| icon | `string` | - | Iconify icon name |

---

## Feedback Components

### UiToast

Toast notifications (use with composable for programmatic usage).

```vue
<UiToast
  type="success"
  title="Booking Confirmed!"
  message="Your plumber will arrive at 2 PM"
  :duration="4000"
/>
```

### UiModal

Accessible modal/dialog.

```vue
<UiModal v-model="isOpen" title="Confirm Booking">
  <p>Are you sure you want to confirm this booking?</p>

  <template #footer>
    <UiButton variant="ghost" @click="isOpen = false">Cancel</UiButton>
    <UiButton @click="confirm">Confirm</UiButton>
  </template>
</UiModal>
```

### ErrorState

Comprehensive error state display with presets for common error scenarios.

```vue
<!-- Network error with retry -->
<ErrorState preset="network" @retry="fetchData" />

<!-- Server error -->
<ErrorState preset="server" @retry="tryAgain" />

<!-- Not found (404) -->
<ErrorState preset="not-found" action-label="Go Home" @action="goHome" />

<!-- Permission denied (403) -->
<ErrorState preset="forbidden" />

<!-- Request timeout -->
<ErrorState preset="timeout" @retry="reload" />

<!-- Custom error -->
<ErrorState
  icon="heroicons:exclamation-triangle"
  title="Payment Failed"
  message="Your payment could not be processed"
  retry-label="Try Again"
  @retry="retryPayment"
/>

<!-- With support link -->
<ErrorState
  preset="server"
  :show-support="true"
  @support="contactSupport"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| preset | `'network' \| 'server' \| 'not-found' \| 'forbidden' \| 'timeout' \| 'generic'` | `'generic'` | Predefined error type |
| icon | `string` | - | Custom icon (overrides preset) |
| title | `string` | - | Custom title (overrides preset) |
| message | `string` | - | Custom message (overrides preset) |
| retryLabel | `string` | - | Retry button label |
| actionLabel | `string` | - | Additional action button label |
| actionVariant | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `'primary'` | Action button variant |
| showRetry | `boolean` | `true` | Show retry button |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| showSupport | `boolean` | `false` | Show contact support link |

**Events:**
- `@retry` - Emitted when retry button is clicked
- `@action` - Emitted when additional action button is clicked
- `@support` - Emitted when support link is clicked

**Presets:**
- `network` - No internet connection
- `server` - Server error (5xx)
- `not-found` - 404 not found
- `forbidden` - 403 permission denied
- `timeout` - Request timeout
- `generic` - Generic error

---

### OfflineState

Offline and sync state display for offline-first functionality.

```vue
<!-- No connection -->
<OfflineState preset="no-connection" />

<!-- Sync pending with count -->
<OfflineState
  preset="sync-pending"
  :pending-count="3"
  @sync="syncNow"
/>

<!-- Actively syncing -->
<OfflineState preset="syncing" :animated="true" />

<!-- Limited connection -->
<OfflineState preset="limited-connection" />

<!-- Custom offline state -->
<OfflineState
  icon="heroicons:cloud-arrow-up"
  title="You're Offline"
  message="Your changes will sync automatically"
  action-label="Sync Now"
  @action="forcSync"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| preset | `'no-connection' \| 'sync-pending' \| 'syncing' \| 'limited-connection'` | `'no-connection'` | Predefined offline type |
| icon | `string` | - | Custom icon (overrides preset) |
| title | `string` | - | Custom title (overrides preset) |
| message | `string` | - | Custom message (overrides preset) |
| actionLabel | `string` | - | Action button label |
| actionVariant | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `'outline'` | Action button variant |
| showAction | `boolean` | `true` | Show action button |
| pendingCount | `number` | `0` | Number of pending items |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| animated | `boolean` | `false` | Animate icon (auto-enabled for 'syncing') |

**Events:**
- `@sync` - Emitted when sync button is clicked (for 'sync-pending' preset)
- `@action` - Emitted when action button is clicked

**Presets:**
- `no-connection` - No internet, data cached locally
- `sync-pending` - Changes waiting to sync
- `syncing` - Actively syncing to cloud
- `limited-connection` - Slow/unreliable connection

---

### LoadingState

Flexible loading state with spinner or skeleton patterns.

```vue
<!-- Spinner with message -->
<LoadingState message="Loading services..." />

<!-- Dots spinner -->
<LoadingState spinner-variant="dots" message="Please wait..." />

<!-- Pulse spinner -->
<LoadingState spinner-variant="pulse" />

<!-- Skeleton for list -->
<LoadingState type="skeleton" preset="list" :count="3" />

<!-- Skeleton for card -->
<LoadingState type="skeleton" preset="card" :count="2" />

<!-- Skeleton for provider card -->
<LoadingState type="skeleton" preset="provider-card" />

<!-- Skeleton for booking card -->
<LoadingState type="skeleton" preset="booking-card" />

<!-- Custom skeleton layout -->
<LoadingState type="skeleton">
  <div class="flex gap-4">
    <div class="skeleton-avatar" />
    <div class="flex-1">
      <div class="skeleton-line" />
      <div class="skeleton-line" style="width: 60%" />
    </div>
  </div>
</LoadingState>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | `'spinner' \| 'skeleton'` | `'spinner'` | Loading indicator type |
| preset | `'list' \| 'card' \| 'provider-card' \| 'booking-card'` | `'list'` | Skeleton preset layout |
| message | `string` | - | Loading message (spinner only) |
| icon | `string` | - | Icon for spinner |
| count | `number` | `1` | Number of skeleton items |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| showMessage | `boolean` | `false` | Show message below skeleton |
| spinnerVariant | `'circular' \| 'dots' \| 'pulse'` | `'circular'` | Spinner animation type |

**When to Use:**
- **Spinner:** Initial page load, quick operations (< 3s)
- **Skeleton:** Content loading, better UX for perceived performance

**Skeleton Presets:**
- `list` - Simple text list items
- `card` - Card with image and text
- `provider-card` - Provider profile card
- `booking-card` - Booking details card

---

### UiSkeleton

Loading placeholder with shimmer.

```vue
<!-- Text line -->
<UiSkeleton />

<!-- Avatar -->
<UiSkeleton variant="circle" size="lg" />

<!-- Image/Rectangle -->
<UiSkeleton variant="rect" :height="200" />
```

### UiSpinner

Loading spinner.

```vue
<UiSpinner />
<UiSpinner size="lg" color="primary" />
<UiSpinner variant="dots" />
```

---

## AI Components

### AiChatBubble

Message bubble for AI conversations.

```vue
<!-- User message -->
<AiChatBubble sender="user" :timestamp="new Date()">
  Hi, I need help finding a plumber near me
</AiChatBubble>

<!-- AI response -->
<AiChatBubble sender="ai" name="Indlela">
  I found 5 plumbers within 10km of your location. Would you like me to show you their ratings and availability?
</AiChatBubble>

<!-- AI typing indicator -->
<AiChatBubble sender="ai" :typing="true" />

<!-- Streaming response -->
<AiChatBubble sender="ai" :streaming="true">
  Finding plumbers...
</AiChatBubble>
```

### AiChatInput

Chat input with voice support.

```vue
<AiChatInput
  v-model="message"
  :loading="isSending"
  :show-voice="true"
  placeholder="Ask Indlela anything..."
  @send="handleSend"
  @voice="startVoiceInput"
/>
```

### AiSuggestionChips

Quick action suggestions.

```vue
<AiSuggestionChips
  :suggestions="[
    'Find a plumber',
    'Show nearby',
    'Check prices'
  ]"
  @select="handleSelect"
/>

<!-- With icons -->
<AiSuggestionChips
  :suggestions="[
    { label: 'Plumber', icon: 'heroicons:wrench' },
    { label: 'Electrician', icon: 'heroicons:bolt' },
  ]"
  @select="handleSelect"
/>
```

### AiVoiceButton

Voice input button with visual feedback.

```vue
<AiVoiceButton
  :recording="isRecording"
  :processing="isProcessing"
  size="lg"
  @start="startRecording"
  @stop="stopRecording"
/>
```

---

## Composables

### usePageState

Simplifies page state management for loading, error, empty, and offline states.

```vue
<script setup lang="ts">
const { state, isLoading, isError, isEmpty, setLoading, setError, setSuccess, setEmpty } = usePageState()

async function loadServices() {
  setLoading('Loading services...')

  try {
    const data = await api.getServices()

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
    <IonContent>
      <!-- Loading State -->
      <LoadingState
        v-if="isLoading"
        type="skeleton"
        preset="provider-card"
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
        @action="navigateToSearch"
      />

      <!-- Success State -->
      <div v-else>
        <!-- Your content here -->
      </div>
    </IonContent>
  </IonPage>
</template>
```

**API:**

```typescript
const {
  state,           // Current state object
  isIdle,          // Boolean: is idle
  isLoading,       // Boolean: is loading
  isSuccess,       // Boolean: is success
  isError,         // Boolean: is error
  isEmpty,         // Boolean: is empty
  isOffline,       // Boolean: is offline
  setState,        // Set any state
  setLoading,      // Set loading state
  setError,        // Set error state with preset
  setEmpty,        // Set empty state
  setOffline,      // Set offline state with preset
  setSuccess,      // Set success state
  reset,           // Reset to idle
} = usePageState()
```

**State Types:**
- `'idle'` - Initial state
- `'loading'` - Data is loading
- `'success'` - Data loaded successfully
- `'error'` - Error occurred
- `'empty'` - No data (empty result)
- `'offline'` - Offline/sync issue

**Error Presets:**
- `'network'` - No internet connection
- `'server'` - Server error (5xx)
- `'not-found'` - 404 not found
- `'forbidden'` - 403 permission denied
- `'timeout'` - Request timeout
- `'generic'` - Generic error

**Empty State Presets:**
- `'no-services'` - No services found
- `'no-bookings'` - No bookings yet
- `'no-providers'` - No providers found
- `'no-favorites'` - No favorites yet
- `'no-search-results'` - No search results
- `'no-messages'` - No messages
- `'no-notifications'` - No notifications

---

### useAsyncState

Wrapper for async operations with automatic state management.

```vue
<script setup lang="ts">
const { data, isLoading, isError, error, execute } = useAsyncState(
  async () => {
    const services = await api.getServices()
    return services
  },
  {
    immediate: true,
    onSuccess: (services) => {
      console.log('Loaded', services.length, 'services')
    },
    onError: (err) => {
      console.error('Failed to load services:', err)
    },
  }
)

// Manual execution
async function refresh() {
  await execute()
}
</script>

<template>
  <div>
    <LoadingState v-if="isLoading" />
    <ErrorState v-else-if="isError" @retry="refresh" />
    <div v-else>
      <!-- Use data.value here -->
    </div>
  </div>
</template>
```

**Options:**
```typescript
interface UseAsyncStateOptions<T> {
  immediate?: boolean          // Execute on mount (default: false)
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  onFinally?: () => void
}
```

---

## Related Documentation

- [Button Patterns](./button-patterns.md) - Comprehensive button usage guide
- [Design Tokens](./design-tokens.md) - Color, spacing, sizing tokens
- [Accessibility](./accessibility.md) - WCAG compliance guidelines
- [Page Layout Patterns](./page-layout-patterns.md) - Safe area and layout
- [Animations](./animations.md) - Motion and transition patterns
