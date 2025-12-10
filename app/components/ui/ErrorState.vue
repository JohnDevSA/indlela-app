<script setup lang="ts">
/**
 * ErrorState - Error state display with icon, title, message, and optional retry action
 * Designed for network errors, server errors, permission issues, and other error scenarios
 *
 * @example
 * <!-- Network error with preset -->
 * <ErrorState preset="network" @retry="fetchData" />
 *
 * <!-- Custom error -->
 * <ErrorState
 *   icon="heroicons:exclamation-triangle"
 *   title="Something went wrong"
 *   message="Please try again"
 *   retry-label="Retry"
 *   @retry="handleRetry"
 * />
 *
 * <!-- Server error with custom action -->
 * <ErrorState
 *   preset="server"
 *   action-label="Go Home"
 *   @action="navigateHome"
 * />
 */

export interface ErrorStatePreset {
  icon: string
  title: string
  message: string
  retryLabel?: string
  showRetry?: boolean
}

interface Props {
  /**
   * Preset error type - provides predefined icon, title, message
   * 'network' - No internet connection
   * 'server' - Server error (5xx)
   * 'not-found' - 404 not found
   * 'forbidden' - 403 permission denied
   * 'timeout' - Request timeout
   * 'generic' - Generic error
   */
  preset?: 'network' | 'server' | 'not-found' | 'forbidden' | 'timeout' | 'generic'

  /** Custom icon (overrides preset) */
  icon?: string

  /** Custom title (overrides preset) */
  title?: string

  /** Custom message (overrides preset) */
  message?: string

  /** Label for retry button */
  retryLabel?: string

  /** Label for additional action button */
  actionLabel?: string

  /** Variant for action button */
  actionVariant?: 'primary' | 'secondary' | 'outline' | 'ghost'

  /** Show retry button */
  showRetry?: boolean

  /** Size variant */
  size?: 'sm' | 'md' | 'lg'

  /** Show contact support link */
  showSupport?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  preset: 'generic',
  actionVariant: 'primary',
  size: 'md',
  showRetry: true,
  showSupport: false,
})

const emit = defineEmits<{
  retry: []
  action: []
  support: []
}>()

// Preset configurations
const presets: Record<string, ErrorStatePreset> = {
  network: {
    icon: 'heroicons:wifi-solid',
    title: 'No Internet Connection',
    message: 'Please check your connection and try again',
    retryLabel: 'Try Again',
    showRetry: true,
  },
  server: {
    icon: 'heroicons:server-solid',
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later',
    retryLabel: 'Retry',
    showRetry: true,
  },
  'not-found': {
    icon: 'heroicons:magnifying-glass',
    title: 'Not Found',
    message: 'The page or resource you\'re looking for doesn\'t exist',
    showRetry: false,
  },
  forbidden: {
    icon: 'heroicons:lock-closed',
    title: 'Access Denied',
    message: 'You don\'t have permission to view this content',
    showRetry: false,
  },
  timeout: {
    icon: 'heroicons:clock',
    title: 'Request Timeout',
    message: 'The request took too long. Please check your connection and try again',
    retryLabel: 'Try Again',
    showRetry: true,
  },
  generic: {
    icon: 'heroicons:exclamation-triangle',
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again',
    retryLabel: 'Try Again',
    showRetry: true,
  },
}

const currentPreset = computed(() => presets[props.preset || 'generic'])

const displayIcon = computed(() => props.icon || currentPreset.value.icon)
const displayTitle = computed(() => props.title || currentPreset.value.title)
const displayMessage = computed(() => props.message || currentPreset.value.message)
const displayRetryLabel = computed(() => props.retryLabel || currentPreset.value.retryLabel || 'Try Again')
const shouldShowRetry = computed(() => props.showRetry && currentPreset.value.showRetry !== false)

const sizeClasses = computed(() => `error-state--${props.size}`)
</script>

<template>
  <div :class="['error-state', sizeClasses]">
    <div class="error-state__icon-wrapper">
      <Icon :name="displayIcon" class="error-state__icon" />
    </div>

    <h3 class="error-state__title">{{ displayTitle }}</h3>

    <p class="error-state__message">{{ displayMessage }}</p>

    <div v-if="shouldShowRetry || actionLabel" class="error-state__actions">
      <UiButton
        v-if="shouldShowRetry"
        :variant="actionVariant"
        icon="heroicons:arrow-path"
        @click="emit('retry')"
      >
        {{ displayRetryLabel }}
      </UiButton>

      <UiButton
        v-if="actionLabel"
        variant="outline"
        @click="emit('action')"
      >
        {{ actionLabel }}
      </UiButton>
    </div>

    <button
      v-if="showSupport"
      class="error-state__support"
      @click="emit('support')"
    >
      Contact Support
    </button>
  </div>
</template>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  animation: fade-in var(--duration-normal) var(--ease-out);
}

/* Sizes */
.error-state--sm {
  padding: var(--space-6) var(--space-4);
}

.error-state--md {
  padding: var(--space-12) var(--space-6);
}

.error-state--lg {
  padding: var(--space-16) var(--space-8);
}

/* Icon wrapper */
.error-state__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin-bottom: var(--space-4);
  background: var(--color-error-50);
  border-radius: var(--radius-full);
}

.error-state--sm .error-state__icon-wrapper {
  width: 56px;
  height: 56px;
}

.error-state--lg .error-state__icon-wrapper {
  width: 96px;
  height: 96px;
}

/* Icon */
.error-state__icon {
  width: 40px;
  height: 40px;
  color: var(--color-error-500);
}

.error-state--sm .error-state__icon {
  width: 28px;
  height: 28px;
}

.error-state--lg .error-state__icon {
  width: 48px;
  height: 48px;
}

/* Title */
.error-state__title {
  margin: 0 0 var(--space-2);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
  line-height: var(--leading-tight);
}

.error-state--sm .error-state__title {
  font-size: var(--text-base);
}

.error-state--lg .error-state__title {
  font-size: var(--text-xl);
}

/* Message */
.error-state__message {
  margin: 0 0 var(--space-6);
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
  max-width: 280px;
  line-height: var(--leading-relaxed);
}

.error-state--sm .error-state__message {
  font-size: var(--text-xs);
  margin-bottom: var(--space-4);
}

.error-state--lg .error-state__message {
  font-size: var(--text-base);
  max-width: 320px;
}

/* Action buttons */
.error-state__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
  max-width: 280px;
  margin-top: var(--space-2);
}

.error-state--sm .error-state__actions {
  max-width: 240px;
}

.error-state--lg .error-state__actions {
  max-width: 320px;
}

/* Support link */
.error-state__support {
  margin-top: var(--space-6);
  padding: var(--space-2);
  background: none;
  border: none;
  font-size: var(--text-sm);
  color: var(--color-primary-500);
  text-decoration: underline;
  cursor: pointer;
  transition: color var(--duration-normal) var(--ease-in-out);
}

.error-state__support:hover {
  color: var(--color-primary-600);
}

.error-state__support:active {
  color: var(--color-primary-700);
}

/* Animation */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .error-state__icon-wrapper {
    background: rgba(239, 68, 68, 0.15);
  }

  .error-state__title {
    color: var(--color-neutral-100);
  }

  .error-state__message {
    color: var(--color-neutral-400);
  }

  .error-state__support {
    color: var(--color-primary-400);
  }

  .error-state__support:hover {
    color: var(--color-primary-300);
  }
}
</style>