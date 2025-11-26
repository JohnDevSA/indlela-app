<script setup lang="ts">
/**
 * ServiceCard - Card displaying a service category
 * Used on home page and service listings
 *
 * @example
 * <ServiceCard
 *   id="plumbing"
 *   icon="heroicons:wrench-screwdriver"
 *   name="Plumbing"
 *   :count="24"
 *   @click="viewService"
 * />
 */

interface Props {
  id: string
  icon?: string
  emoji?: string
  name: string
  count?: number
  description?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  click: [id: string]
}>()

const { t } = useI18n()
const { haptic } = useAnimation()

function handleClick() {
  if (!props.loading) {
    haptic('light')
    emit('click', props.id)
  }
}
</script>

<template>
  <button
    type="button"
    :class="[
      'service-card',
      { 'service-card--loading': loading },
    ]"
    :disabled="loading"
    @click="handleClick"
  >
    <!-- Loading skeleton -->
    <template v-if="loading">
      <UiSkeleton variant="circle" size="md" class="service-card__icon-skeleton" />
      <UiSkeleton :width="'70%'" class="service-card__name-skeleton" />
      <UiSkeleton :width="'50%'" class="service-card__count-skeleton" />
    </template>

    <!-- Content -->
    <template v-else>
      <!-- Icon or Emoji -->
      <div class="service-card__icon-wrapper">
        <span v-if="emoji" class="service-card__emoji">{{ emoji }}</span>
        <Icon v-else-if="icon" :name="icon" class="service-card__icon" />
        <Icon v-else name="heroicons:squares-2x2" class="service-card__icon" />
      </div>

      <!-- Name -->
      <span class="service-card__name">{{ name }}</span>

      <!-- Provider count -->
      <span v-if="count !== undefined" class="service-card__count">
        {{ count }} {{ t('home.providers') }}
      </span>

      <!-- Description (optional) -->
      <span v-if="description" class="service-card__description">
        {{ description }}
      </span>
    </template>
  </button>
</template>

<style scoped>
.service-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-4) var(--space-3);
  background: var(--color-neutral-0);
  border: none;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-out),
              box-shadow var(--duration-normal) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}

.service-card:hover:not(:disabled) {
  box-shadow: var(--shadow-md);
}

.service-card:active:not(:disabled) {
  transform: scale(0.97);
}

.service-card--loading {
  cursor: default;
  min-height: 110px;
}

/* Icon wrapper */
.service-card__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-2);
  background: var(--color-primary-50);
  border-radius: var(--radius-lg);
}

.service-card__icon {
  width: 24px;
  height: 24px;
  color: var(--color-primary-600);
}

.service-card__emoji {
  font-size: 28px;
  line-height: 1;
}

/* Name */
.service-card__name {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
  text-align: center;
  line-height: var(--leading-tight);
}

/* Count */
.service-card__count {
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
  margin-top: var(--space-1);
}

/* Description */
.service-card__description {
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
  text-align: center;
  margin-top: var(--space-1);
  line-height: var(--leading-normal);
}

/* Skeletons */
.service-card__icon-skeleton {
  margin-bottom: var(--space-2);
}

.service-card__name-skeleton {
  height: 14px;
  margin-bottom: var(--space-1);
}

.service-card__count-skeleton {
  height: 12px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .service-card {
    background: var(--color-neutral-900);
  }

  .service-card__icon-wrapper {
    background: rgba(0, 168, 107, 0.15);
  }

  .service-card__icon {
    color: var(--color-primary-400);
  }

  .service-card__name {
    color: var(--color-neutral-100);
  }

  .service-card__count,
  .service-card__description {
    color: var(--color-neutral-400);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .service-card {
    transition: none;
  }
}
</style>
