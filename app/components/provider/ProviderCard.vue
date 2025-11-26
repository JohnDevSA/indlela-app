<script setup lang="ts">
/**
 * ProviderCard - Card displaying a service provider
 * Used on home page, search results, and provider listings
 *
 * @example
 * <ProviderCard
 *   id="provider-1"
 *   name="John Doe"
 *   service="Plumbing"
 *   :rating="4.8"
 *   :reviews="124"
 *   distance="2.5km"
 *   @click="viewProvider"
 * />
 */

interface Props {
  id: string
  name: string
  service: string
  avatar?: string
  rating?: number
  reviews?: number
  distance?: string
  price?: string
  available?: boolean
  verified?: boolean
  loading?: boolean
  variant?: 'list' | 'card'
}

const props = withDefaults(defineProps<Props>(), {
  rating: 0,
  reviews: 0,
  available: true,
  verified: false,
  loading: false,
  variant: 'list',
})

const emit = defineEmits<{
  click: [id: string]
}>()

const { haptic } = useAnimation()

function handleClick() {
  if (!props.loading) {
    haptic('light')
    emit('click', props.id)
  }
}
</script>

<template>
  <component
    :is="variant === 'card' ? 'div' : 'button'"
    :type="variant === 'list' ? 'button' : undefined"
    :class="[
      'provider-card',
      `provider-card--${variant}`,
      { 'provider-card--loading': loading },
    ]"
    :disabled="loading"
    @click="handleClick"
  >
    <!-- Loading skeleton -->
    <template v-if="loading">
      <UiSkeleton variant="circle" size="md" />
      <div class="provider-card__content">
        <UiSkeleton :width="'60%'" :height="16" />
        <UiSkeleton :width="'40%'" :height="14" />
        <UiSkeleton :width="'50%'" :height="12" />
      </div>
    </template>

    <!-- Content -->
    <template v-else>
      <!-- Avatar -->
      <div class="provider-card__avatar-wrapper">
        <UiAvatar
          :src="avatar"
          :name="name"
          size="md"
          :online="available"
        />
        <Icon
          v-if="verified"
          name="heroicons:check-badge"
          class="provider-card__verified"
        />
      </div>

      <!-- Info -->
      <div class="provider-card__content">
        <div class="provider-card__header">
          <h3 class="provider-card__name">{{ name }}</h3>
          <UiBadge v-if="price" variant="secondary" size="sm">
            {{ price }}
          </UiBadge>
        </div>

        <p class="provider-card__service">{{ service }}</p>

        <div class="provider-card__meta">
          <!-- Rating -->
          <div v-if="rating > 0" class="provider-card__rating">
            <StarRating :rating="rating" size="sm" :show-value="true" />
            <span class="provider-card__reviews">({{ reviews }})</span>
          </div>

          <!-- Distance -->
          <div v-if="distance" class="provider-card__distance">
            <Icon name="heroicons:map-pin" class="provider-card__meta-icon" />
            <span>{{ distance }}</span>
          </div>
        </div>
      </div>

      <!-- Chevron (list variant only) -->
      <Icon
        v-if="variant === 'list'"
        name="heroicons:chevron-right"
        class="provider-card__chevron"
      />
    </template>
  </component>
</template>

<style scoped>
.provider-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  text-align: left;
  background: var(--color-neutral-0);
  border: none;
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}

.provider-card:disabled {
  cursor: default;
}

/* List variant */
.provider-card--list {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-neutral-100);
}

.provider-card--list:hover:not(:disabled) {
  background: var(--color-neutral-50);
}

.provider-card--list:active:not(:disabled) {
  background: var(--color-neutral-100);
}

/* Card variant */
.provider-card--card {
  flex-direction: column;
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.provider-card--card:hover:not(:disabled) {
  box-shadow: var(--shadow-md);
}

/* Avatar wrapper */
.provider-card__avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.provider-card__verified {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  color: var(--color-primary-500);
  background: var(--color-neutral-0);
  border-radius: var(--radius-full);
}

/* Content */
.provider-card__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.provider-card--card .provider-card__content {
  align-items: center;
  text-align: center;
  margin-top: var(--space-2);
}

/* Header */
.provider-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.provider-card--card .provider-card__header {
  flex-direction: column;
}

/* Name */
.provider-card__name {
  margin: 0;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
  line-height: var(--leading-tight);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Service */
.provider-card__service {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Meta row */
.provider-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-1);
}

.provider-card--card .provider-card__meta {
  justify-content: center;
}

/* Rating */
.provider-card__rating {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.provider-card__reviews {
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
}

/* Distance */
.provider-card__distance {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
}

.provider-card__meta-icon {
  width: 14px;
  height: 14px;
}

/* Chevron */
.provider-card__chevron {
  width: 20px;
  height: 20px;
  color: var(--color-neutral-400);
  flex-shrink: 0;
}

/* Loading state */
.provider-card--loading .provider-card__content {
  gap: var(--space-2);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .provider-card {
    background: var(--color-neutral-900);
  }

  .provider-card--list {
    border-bottom-color: var(--color-neutral-800);
  }

  .provider-card--list:hover:not(:disabled) {
    background: var(--color-neutral-850);
  }

  .provider-card--list:active:not(:disabled) {
    background: var(--color-neutral-800);
  }

  .provider-card__verified {
    background: var(--color-neutral-900);
  }

  .provider-card__name {
    color: var(--color-neutral-100);
  }

  .provider-card__service {
    color: var(--color-neutral-400);
  }

  .provider-card__chevron {
    color: var(--color-neutral-500);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .provider-card {
    transition: none;
  }
}
</style>
