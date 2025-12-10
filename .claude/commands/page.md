# Create New Page

Create a new Nuxt page with Ionic layout for Indlela.

## Instructions

When the user runs `/page <path>`, create a new page at `app/pages/<path>.vue`.

## Requirements

1. Use proper Ionic page structure:
   - `IonPage` as root
   - `IonHeader` with `IonToolbar` and `IonTitle`
   - `IonContent` for main content
   - Back button if not a root page

2. Include:
   - `definePageMeta` with appropriate layout
   - Loading skeleton states
   - Pull-to-refresh where applicable
   - Empty states
   - Error handling

3. Follow conventions:
   - Use `<script setup lang="ts">`
   - Use composables for data fetching
   - Use i18n for all user-facing strings
   - Include proper TypeScript types

## Template

```vue
<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/vue'

definePageMeta({
  layout: 'default', // or 'auth', 'provider'
})

const { t } = useI18n()

// State
const isLoading = ref(true)

// Methods
const handleRefresh = async (event: CustomEvent) => {
  await fetchData()
  event.target.complete()
}

const fetchData = async () => {
  isLoading.value = true
  try {
    // Fetch data
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)
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
      <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
        <IonRefresherContent />
      </IonRefresher>

      <!-- Loading State -->
      <template v-if="isLoading">
        <!-- Skeleton content -->
      </template>

      <!-- Content -->
      <template v-else>
        <!-- Page content -->
      </template>
    </IonContent>
  </IonPage>
</template>

<style scoped>
/* Page-specific styles */
</style>
```

## Examples

- `/page services/[category]` - Dynamic category page
- `/page bookings/new` - New booking page
- `/page provider-dashboard/earnings` - Provider earnings page

Now create the page based on the user's input.