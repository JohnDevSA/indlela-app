# Create UI Page

Create a new page following Indlela's design patterns and Ionic conventions.

## Instructions

When creating a new page, follow these guidelines:

### 1. Page Structure
```vue
<script setup lang="ts">
/**
 * PageName - Brief description
 */

// Meta
definePageMeta({
  layout: 'default', // or 'provider', 'admin', 'auth'
  middleware: ['auth'], // if protected
})

// Head
useHead({
  title: 'Page Title | Indlela',
})

// i18n
const { t } = useI18n()

// State & Composables
const loading = ref(false)
const error = ref<string | null>(null)

// Data fetching
const { data, pending, refresh } = await useAsyncData('key', () => {
  // Fetch data
})

// Methods
async function handleAction() {
  // Action logic
}
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton default-href="/" />
        </IonButtons>
        <IonTitle>{{ t('page.title') }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <!-- Header collapse (iOS style) -->
      <IonHeader collapse="condense">
        <IonToolbar>
          <IonTitle size="large">{{ t('page.title') }}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <!-- Loading State -->
      <div v-if="pending" class="loading-container">
        <UiSpinner size="lg" />
      </div>

      <!-- Error State -->
      <EmptyState
        v-else-if="error"
        icon="heroicons:exclamation-circle"
        :title="t('common.error')"
        :message="error"
        :action="{ label: t('common.retry'), onClick: refresh }"
      />

      <!-- Empty State -->
      <EmptyState
        v-else-if="!data?.length"
        icon="heroicons:inbox"
        :title="t('page.empty.title')"
        :message="t('page.empty.message')"
      />

      <!-- Content -->
      <div v-else class="page-content">
        <!-- Page content here -->
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.page-content {
  padding: var(--space-4);
}
</style>
```

### 2. Layout Selection
- `default` - Customer-facing with bottom tabs
- `provider` - Provider dashboard with provider tabs
- `admin` - Admin dashboard with admin navigation
- `auth` - Auth pages with branded background

### 3. Page Patterns

#### List Page
- Pull-to-refresh
- Infinite scroll for long lists
- Loading skeletons
- Empty state

#### Detail Page
- Back button
- Action buttons in header
- Loading state
- Error handling

#### Form Page
- Validation feedback
- Loading state on submit
- Success/error toasts
- Keyboard avoidance

### 4. Required States
Every page should handle:
1. **Loading** - Show skeleton or spinner
2. **Error** - Show error message with retry
3. **Empty** - Show empty state with guidance
4. **Success** - Show data/content

### 5. Offline Considerations
- Check `useOffline()` for connectivity
- Queue actions when offline
- Show offline indicator
- Cache critical data

## Arguments

$PAGE_NAME - Name of the page (e.g., "booking-details")
$ROUTE_PATH - Route path (e.g., "bookings/[id]")
$LAYOUT - Layout to use: default, provider, admin, auth
$DESCRIPTION - Brief description of the page purpose

## Example Usage

```
/ui-page booking-confirmation bookings/[id]/confirm default "Booking confirmation and payment page"
```
