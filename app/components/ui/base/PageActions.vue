<script setup lang="ts">
/**
 * PageActions Component
 *
 * A container for action buttons at the bottom of pages.
 * Automatically handles safe area padding, spacing, and layout.
 *
 * Features:
 * - Vertical stacking with consistent gaps
 * - Safe area padding for iOS/Android
 * - Optional sticky positioning
 * - Background customization
 * - Proper touch target sizing
 *
 * @example
 * <PageActions>
 *   <IonButton expand="block">Primary Action</IonButton>
 *   <IonButton expand="block" fill="outline">Secondary</IonButton>
 * </PageActions>
 *
 * @example
 * <PageActions :sticky="true" background="surface">
 *   <IonButton expand="block">Save Changes</IonButton>
 * </PageActions>
 */

interface Props {
  /**
   * Gap between action buttons
   */
  gap?: 'sm' | 'md' | 'lg'

  /**
   * Make actions sticky to bottom of viewport
   * Useful for forms that need persistent submit buttons
   */
  sticky?: boolean

  /**
   * Background variant
   */
  background?: 'default' | 'transparent' | 'surface'

  /**
   * Internal padding size
   */
  padding?: 'sm' | 'md' | 'lg'

  /**
   * Add top border for visual separation
   */
  border?: boolean

  /**
   * Add shadow for elevated appearance (recommended with sticky)
   */
  shadow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  gap: 'md',
  sticky: false,
  background: 'default',
  padding: 'md',
  border: false,
  shadow: false,
})

const gapClass = computed(() => {
  const gapMap = {
    sm: 'page-actions--gap-sm',
    md: 'page-actions--gap-md',
    lg: 'page-actions--gap-lg',
  }
  return gapMap[props.gap]
})

const paddingClass = computed(() => {
  const paddingMap = {
    sm: 'page-actions--padding-sm',
    md: 'page-actions--padding-md',
    lg: 'page-actions--padding-lg',
  }
  return paddingMap[props.padding]
})

const backgroundClass = computed(() => {
  const bgMap = {
    default: 'page-actions--bg-default',
    transparent: 'page-actions--bg-transparent',
    surface: 'page-actions--bg-surface',
  }
  return bgMap[props.background]
})
</script>

<template>
  <div
    class="page-actions"
    :class="[
      gapClass,
      paddingClass,
      backgroundClass,
      {
        'page-actions--sticky': sticky,
        'page-actions--border': border,
        'page-actions--shadow': shadow,
      }
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
.page-actions {
  display: flex;
  flex-direction: column;
  /*
   * Bottom padding calculation:
   * - Base padding (16px default)
   * - Tab bar height (60px) - the fixed bottom navigation
   * - Tab bar internal padding (16px) - padding inside tab bar
   * - Safe area inset (iOS home indicator, Android nav)
   * - Extra buffer (8px) - ensures no overlap with tab bar
   */
  padding-bottom: calc(
    var(--page-actions-padding-y, 16px) +
    var(--tab-bar-height, 60px) +
    8px +
    env(safe-area-inset-bottom)
  );

  /* Horizontal padding */
  padding-left: var(--page-actions-padding-x, 16px);
  padding-right: var(--page-actions-padding-x, 16px);
}

/* Gap variants */
.page-actions--gap-sm {
  gap: 8px;
}

.page-actions--gap-md {
  gap: 12px;
}

.page-actions--gap-lg {
  gap: 16px;
}

/* Padding variants */
.page-actions--padding-sm {
  --page-actions-padding-y: 12px;
  --page-actions-padding-x: 12px;
  padding-top: 12px;
}

.page-actions--padding-md {
  --page-actions-padding-y: 16px;
  --page-actions-padding-x: 16px;
  padding-top: 16px;
}

.page-actions--padding-lg {
  --page-actions-padding-y: 24px;
  --page-actions-padding-x: 24px;
  padding-top: 24px;
}

/* Background variants */
.page-actions--bg-default {
  background: var(--ion-background-color, #fff);
}

.page-actions--bg-transparent {
  background: transparent;
}

.page-actions--bg-surface {
  background: var(--ion-color-light, #f4f5f8);
}

/* Sticky positioning */
.page-actions--sticky {
  position: sticky;
  bottom: 0;
  z-index: 100;
}

/* Border */
.page-actions--border {
  border-top: 1px solid var(--ion-border-color, #e0e0e0);
}

/* Shadow */
.page-actions--shadow {
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
}

/**
 * Ensure all direct children (buttons) have proper touch targets
 * Ionic buttons already handle this, but we ensure no constraints
 */
.page-actions > :deep(*) {
  /* Minimum touch target height */
  min-height: 44px;
}

/**
 * iOS-specific: Additional padding for devices with home indicator
 * The env(safe-area-inset-bottom) handles this automatically
 */

/**
 * Android-specific: Works with gesture navigation and button navigation
 * The env(safe-area-inset-bottom) adapts to both
 */
</style>
