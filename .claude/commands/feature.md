# Create New Feature

Create a complete feature scaffold for Indlela with all necessary files.

## Instructions

When the user runs `/feature <name>`, create a complete feature scaffold:

1. **Component** at `app/components/<name>/<Name>Card.vue` and `app/components/<name>/<Name>List.vue`
2. **Composable** at `app/composables/use<Name>.ts`
3. **Store** at `stores/<name>.ts` (Pinia store)
4. **Types** - Add to `types/index.ts` if needed

## Requirements

- Use Vue 3 Composition API with `<script setup lang="ts">`
- Use Ionic components for UI
- Include proper TypeScript types
- Add i18n keys (use `$t('feature.key')` pattern)
- Follow offline-first patterns where applicable
- Include loading and error states
- Minimum 44x44px touch targets for accessibility

## Example

For `/feature favorite`:

### app/components/favorite/FavoriteButton.vue
```vue
<script setup lang="ts">
import { IonButton, IonIcon } from '@ionic/vue'
import { heart, heartOutline } from 'ionicons/icons'

const props = defineProps<{
  providerId: string
}>()

const { isFavorite, toggleFavorite, isLoading } = useFavorites()
const isFav = computed(() => isFavorite(props.providerId))
</script>

<template>
  <IonButton fill="clear" :disabled="isLoading" @click.stop="toggleFavorite(providerId)">
    <IonIcon :icon="isFav ? heart : heartOutline" :color="isFav ? 'danger' : 'medium'" />
  </IonButton>
</template>
```

### app/composables/useFavorites.ts
```typescript
export function useFavorites() {
  const favorites = ref<string[]>([])
  const isLoading = ref(false)
  // ... implementation
}
```

### stores/favorites.ts
```typescript
export const useFavoritesStore = defineStore('favorites', () => {
  // ... implementation
})
```

Now create the feature based on the user's input. Ask clarifying questions if the feature name is ambiguous.