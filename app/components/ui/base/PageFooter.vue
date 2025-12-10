<script setup lang="ts">
/**
 * PageFooter Component
 *
 * A wrapper for page footer content that handles safe area padding.
 * Use for content that should stick to the bottom of pages or appear
 * at the end of scrolling content with proper spacing.
 *
 * Features:
 * - Automatic safe area padding (iOS notch, Android navigation bar)
 * - Customizable background
 * - Optional border/shadow
 * - Flexible padding control
 *
 * @example
 * <PageFooter>
 *   <IonButton expand="block">Submit</IonButton>
 * </PageFooter>
 */

interface Props {
  /**
   * Add top border to visually separate from content
   */
  border?: boolean

  /**
   * Add shadow for elevated appearance
   */
  shadow?: boolean

  /**
   * Background variant
   */
  background?: 'default' | 'transparent' | 'surface'

  /**
   * Internal padding size
   */
  padding?: 'sm' | 'md' | 'lg'

  /**
   * Make footer sticky (fixed to bottom of viewport)
   * Use sparingly - prefer natural document flow
   */
  sticky?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  border: false,
  shadow: false,
  background: 'default',
  padding: 'md',
  sticky: false,
})

const paddingClass = computed(() => {
  const paddingMap = {
    sm: 'page-footer--padding-sm',
    md: 'page-footer--padding-md',
    lg: 'page-footer--padding-lg',
  }
  return paddingMap[props.padding]
})

const backgroundClass = computed(() => {
  const bgMap = {
    default: 'page-footer--bg-default',
    transparent: 'page-footer--bg-transparent',
    surface: 'page-footer--bg-surface',
  }
  return bgMap[props.background]
})
</script>

<template>
  <div
    class="page-footer"
    :class="[
      paddingClass,
      backgroundClass,
      {
        'page-footer--border': border,
        'page-footer--shadow': shadow,
        'page-footer--sticky': sticky,
      }
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
.page-footer {
  /* Safe area inset for bottom (iOS notch, Android nav bar) */
  padding-bottom: calc(var(--page-footer-padding-y, 16px) + env(safe-area-inset-bottom));

  /* Horizontal padding */
  padding-left: var(--page-footer-padding-x, 16px);
  padding-right: var(--page-footer-padding-x, 16px);
}

/* Padding variants */
.page-footer--padding-sm {
  --page-footer-padding-y: 12px;
  --page-footer-padding-x: 12px;
  padding-top: 12px;
}

.page-footer--padding-md {
  --page-footer-padding-y: 16px;
  --page-footer-padding-x: 16px;
  padding-top: 16px;
}

.page-footer--padding-lg {
  --page-footer-padding-y: 24px;
  --page-footer-padding-x: 24px;
  padding-top: 24px;
}

/* Background variants */
.page-footer--bg-default {
  background: var(--ion-background-color, #fff);
}

.page-footer--bg-transparent {
  background: transparent;
}

.page-footer--bg-surface {
  background: var(--ion-color-light, #f4f5f8);
}

/* Border */
.page-footer--border {
  border-top: 1px solid var(--ion-border-color, #e0e0e0);
}

/* Shadow */
.page-footer--shadow {
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
}

/* Sticky positioning */
.page-footer--sticky {
  position: sticky;
  bottom: 0;
  z-index: 100;
}

/**
 * Accessibility: Ensure touch targets within footer meet 44x44px minimum
 * This is handled by individual button/link components, but we ensure
 * the footer doesn't constrain them.
 */
</style>
