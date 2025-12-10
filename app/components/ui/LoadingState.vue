<script setup lang="ts">
/**
 * LoadingState - Loading state display with skeleton-based or spinner patterns
 * Designed for initial loading, refetch, and content placeholder scenarios
 *
 * @example
 * <!-- Spinner with message -->
 * <LoadingState message="Loading services..." />
 *
 * <!-- Skeleton for list items -->
 * <LoadingState preset="list" :count="3" />
 *
 * <!-- Skeleton for provider card -->
 * <LoadingState preset="provider-card" />
 *
 * <!-- Custom skeleton layout -->
 * <LoadingState type="skeleton">
 *   <div class="flex gap-4">
 *     <UiSkeleton variant="circle" size="lg" />
 *     <div class="flex-1">
 *       <UiSkeleton class="mb-2" />
 *       <UiSkeleton width="60%" />
 *     </div>
 *   </div>
 * </LoadingState>
 */

export interface LoadingStatePreset {
  type: 'spinner' | 'skeleton'
  layout: 'list' | 'card' | 'provider-card' | 'booking-card' | 'custom'
}

interface Props {
  /**
   * Loading indicator type
   * 'spinner' - Animated spinner with optional message
   * 'skeleton' - Skeleton placeholder matching content structure
   */
  type?: 'spinner' | 'skeleton'

  /**
   * Preset layout patterns
   * 'list' - List of text items
   * 'card' - Card with image and text
   * 'provider-card' - Provider profile card
   * 'booking-card' - Booking details card
   */
  preset?: 'list' | 'card' | 'provider-card' | 'booking-card'

  /** Loading message (spinner only) */
  message?: string

  /** Icon to show with spinner */
  icon?: string

  /** Number of skeleton items to render */
  count?: number

  /** Size variant */
  size?: 'sm' | 'md' | 'lg'

  /** Show loading message below skeleton */
  showMessage?: boolean

  /** Spinner variant */
  spinnerVariant?: 'circular' | 'dots' | 'pulse'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'spinner',
  preset: 'list',
  count: 1,
  size: 'md',
  showMessage: false,
  spinnerVariant: 'circular',
})

const sizeClasses = computed(() => `loading-state--${props.size}`)

// Generate array for v-for rendering
const skeletonItems = computed(() => Array.from({ length: props.count }, (_, i) => i))
</script>

<template>
  <div :class="['loading-state', sizeClasses]">
    <!-- Spinner Type -->
    <div v-if="type === 'spinner'" class="loading-state__spinner-container">
      <!-- Circular Spinner -->
      <div v-if="spinnerVariant === 'circular'" class="loading-state__spinner">
        <Icon
          v-if="icon"
          :name="icon"
          class="loading-state__spinner-icon"
        />
        <div v-else class="loading-state__spinner-circle">
          <div class="spinner-ring" />
        </div>
      </div>

      <!-- Dots Spinner -->
      <div v-else-if="spinnerVariant === 'dots'" class="loading-state__dots">
        <span class="dot" />
        <span class="dot" />
        <span class="dot" />
      </div>

      <!-- Pulse Spinner -->
      <div v-else-if="spinnerVariant === 'pulse'" class="loading-state__pulse">
        <div class="pulse-circle" />
      </div>

      <p v-if="message" class="loading-state__message">{{ message }}</p>
    </div>

    <!-- Skeleton Type -->
    <div v-else-if="type === 'skeleton'" class="loading-state__skeleton-container">
      <!-- List Preset -->
      <div v-if="preset === 'list'" class="skeleton-list">
        <div
          v-for="index in skeletonItems"
          :key="index"
          class="skeleton-list-item"
        >
          <div class="skeleton-line skeleton-line--full" />
          <div class="skeleton-line skeleton-line--60" />
        </div>
      </div>

      <!-- Card Preset -->
      <div v-else-if="preset === 'card'" class="skeleton-card">
        <div
          v-for="index in skeletonItems"
          :key="index"
          class="skeleton-card-item"
        >
          <div class="skeleton-image" />
          <div class="skeleton-card-content">
            <div class="skeleton-line skeleton-line--full" />
            <div class="skeleton-line skeleton-line--80" />
            <div class="skeleton-line skeleton-line--60" />
          </div>
        </div>
      </div>

      <!-- Provider Card Preset -->
      <div v-else-if="preset === 'provider-card'" class="skeleton-provider">
        <div
          v-for="index in skeletonItems"
          :key="index"
          class="skeleton-provider-item"
        >
          <div class="skeleton-provider-header">
            <div class="skeleton-avatar" />
            <div class="skeleton-provider-info">
              <div class="skeleton-line skeleton-line--full" />
              <div class="skeleton-line skeleton-line--70" />
            </div>
          </div>
          <div class="skeleton-line skeleton-line--full" />
          <div class="skeleton-line skeleton-line--80" />
          <div class="skeleton-badges">
            <div class="skeleton-badge" />
            <div class="skeleton-badge" />
          </div>
        </div>
      </div>

      <!-- Booking Card Preset -->
      <div v-else-if="preset === 'booking-card'" class="skeleton-booking">
        <div
          v-for="index in skeletonItems"
          :key="index"
          class="skeleton-booking-item"
        >
          <div class="skeleton-booking-header">
            <div class="skeleton-line skeleton-line--full" />
            <div class="skeleton-badge" />
          </div>
          <div class="skeleton-line skeleton-line--80" />
          <div class="skeleton-line skeleton-line--60" />
          <div class="skeleton-booking-footer">
            <div class="skeleton-line skeleton-line--40" />
            <div class="skeleton-line skeleton-line--40" />
          </div>
        </div>
      </div>

      <!-- Custom (slot) -->
      <slot v-else />

      <p v-if="showMessage && message" class="loading-state__message">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: fade-in var(--duration-normal) var(--ease-out);
}

/* Sizes */
.loading-state--sm {
  padding: var(--space-4);
}

.loading-state--md {
  padding: var(--space-8);
}

.loading-state--lg {
  padding: var(--space-12);
}

/* ===== SPINNER STYLES ===== */
.loading-state__spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

/* Circular Spinner */
.loading-state__spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state__spinner-icon {
  width: 48px;
  height: 48px;
  color: var(--color-primary-500);
  animation: spin 1s linear infinite;
}

.loading-state__spinner-circle {
  width: 48px;
  height: 48px;
  position: relative;
}

.spinner-ring {
  width: 100%;
  height: 100%;
  border: 3px solid var(--color-neutral-200);
  border-top-color: var(--color-primary-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Dots Spinner */
.loading-state__dots {
  display: flex;
  gap: var(--space-2);
}

.dot {
  width: 12px;
  height: 12px;
  background: var(--color-primary-500);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

/* Pulse Spinner */
.loading-state__pulse {
  width: 60px;
  height: 60px;
  position: relative;
}

.pulse-circle {
  width: 100%;
  height: 100%;
  background: var(--color-primary-500);
  border-radius: 50%;
  opacity: 0.6;
  animation: pulse 1.5s ease-in-out infinite;
}

/* Message */
.loading-state__message {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
  text-align: center;
  line-height: var(--leading-relaxed);
}

.loading-state--sm .loading-state__message {
  font-size: var(--text-xs);
}

.loading-state--lg .loading-state__message {
  font-size: var(--text-base);
}

/* ===== SKELETON STYLES ===== */
.loading-state__skeleton-container {
  width: 100%;
}

.skeleton-line,
.skeleton-image,
.skeleton-avatar,
.skeleton-badge {
  background: linear-gradient(
    90deg,
    var(--color-neutral-100) 25%,
    var(--color-neutral-200) 50%,
    var(--color-neutral-100) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}

.skeleton-line {
  height: 16px;
  margin-bottom: var(--space-2);
}

.skeleton-line--full {
  width: 100%;
}

.skeleton-line--80 {
  width: 80%;
}

.skeleton-line--70 {
  width: 70%;
}

.skeleton-line--60 {
  width: 60%;
}

.skeleton-line--40 {
  width: 40%;
}

/* List Skeleton */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.skeleton-list-item {
  display: flex;
  flex-direction: column;
}

/* Card Skeleton */
.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.skeleton-card-item {
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.skeleton-image {
  width: 100%;
  height: 160px;
  margin-bottom: var(--space-3);
}

.skeleton-card-content {
  padding: 0 var(--space-4) var(--space-4);
}

/* Provider Card Skeleton */
.skeleton-provider {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.skeleton-provider-item {
  padding: var(--space-4);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
}

.skeleton-provider-header {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.skeleton-avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.skeleton-provider-info {
  flex: 1;
}

.skeleton-badges {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.skeleton-badge {
  width: 60px;
  height: 24px;
  border-radius: var(--radius-full);
}

/* Booking Card Skeleton */
.skeleton-booking {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.skeleton-booking-item {
  padding: var(--space-4);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
}

.skeleton-booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.skeleton-booking-footer {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-3);
}

/* Animations */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .spinner-ring {
    border-color: var(--color-neutral-700);
    border-top-color: var(--color-primary-500);
  }

  .skeleton-line,
  .skeleton-image,
  .skeleton-avatar,
  .skeleton-badge {
    background: linear-gradient(
      90deg,
      var(--color-neutral-800) 25%,
      var(--color-neutral-700) 50%,
      var(--color-neutral-800) 75%
    );
    background-size: 200% 100%;
  }

  .skeleton-provider-item,
  .skeleton-booking-item {
    border-color: var(--color-neutral-700);
  }

  .loading-state__message {
    color: var(--color-neutral-400);
  }
}
</style>