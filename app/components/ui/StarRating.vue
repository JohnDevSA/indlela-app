<script setup lang="ts">
/**
 * StarRating - Star rating display with optional interactivity
 * Refined to use Indlela design system tokens
 *
 * @example
 * <StarRating :rating="4.5" />
 * <StarRating :rating="3" :interactive="true" @change="handleRating" />
 * <StarRating :rating="4.2" :show-value="true" size="lg" />
 */

interface Props {
  rating: number
  maxRating?: number
  showValue?: boolean
  showCount?: boolean
  count?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  color?: 'gold' | 'primary'
}

const props = withDefaults(defineProps<Props>(), {
  maxRating: 5,
  showValue: false,
  showCount: false,
  size: 'md',
  interactive: false,
  color: 'gold',
})

const emit = defineEmits<{
  change: [rating: number]
}>()

const { hapticSelection } = useAnimation()

// Calculate stars to display
const stars = computed(() => {
  const result = []
  const fullStars = Math.floor(props.rating)
  const hasHalfStar = props.rating % 1 >= 0.5

  for (let i = 1; i <= props.maxRating; i++) {
    if (i <= fullStars) {
      result.push({ index: i, icon: 'heroicons-solid:star', type: 'full' })
    } else if (i === fullStars + 1 && hasHalfStar) {
      result.push({ index: i, icon: 'heroicons:star', type: 'half' })
    } else {
      result.push({ index: i, icon: 'heroicons:star', type: 'empty' })
    }
  }

  return result
})

// Handle click on star (for interactive mode)
function handleStarClick(starIndex: number) {
  if (props.interactive) {
    hapticSelection()
    emit('change', starIndex)
  }
}

// Formatted rating value
const formattedRating = computed(() => props.rating.toFixed(1))
</script>

<template>
  <div
    :class="[
      'star-rating',
      `star-rating--${size}`,
      `star-rating--${color}`,
      { 'star-rating--interactive': interactive },
    ]"
    role="img"
    :aria-label="`Rating: ${rating} out of ${maxRating} stars`"
  >
    <div class="star-rating__stars">
      <button
        v-for="starItem in stars"
        :key="starItem.index"
        type="button"
        :class="['star-rating__star', `star-rating__star--${starItem.type}`]"
        :disabled="!interactive"
        :aria-label="`Rate ${starItem.index} star${starItem.index > 1 ? 's' : ''}`"
        @click="handleStarClick(starItem.index)"
      >
        <Icon :name="starItem.icon" />
      </button>
    </div>

    <span v-if="showValue" class="star-rating__value">
      {{ formattedRating }}
    </span>

    <span v-if="showCount && count !== undefined" class="star-rating__count">
      ({{ count }})
    </span>
  </div>
</template>

<style scoped>
.star-rating {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.star-rating__stars {
  display: flex;
  align-items: center;
  gap: 1px;
}

/* Star button */
.star-rating__star {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: default;
  transition: transform var(--duration-fast) var(--ease-out);
}

.star-rating--interactive .star-rating__star {
  cursor: pointer;
}

.star-rating--interactive .star-rating__star:hover {
  transform: scale(1.15);
}

.star-rating--interactive .star-rating__star:active {
  transform: scale(0.95);
}

/* Star colors - Gold (default) */
.star-rating--gold .star-rating__star--full {
  color: var(--color-secondary-500);
}

.star-rating--gold .star-rating__star--half {
  color: var(--color-secondary-500);
}

.star-rating--gold .star-rating__star--empty {
  color: var(--color-neutral-300);
}

/* Star colors - Primary */
.star-rating--primary .star-rating__star--full {
  color: var(--color-primary-500);
}

.star-rating--primary .star-rating__star--half {
  color: var(--color-primary-500);
}

.star-rating--primary .star-rating__star--empty {
  color: var(--color-neutral-300);
}

/* Sizes */
.star-rating--sm .star-rating__star :deep(svg) {
  width: 14px;
  height: 14px;
}

.star-rating--md .star-rating__star :deep(svg) {
  width: 18px;
  height: 18px;
}

.star-rating--lg .star-rating__star :deep(svg) {
  width: 24px;
  height: 24px;
}

/* Rating value */
.star-rating__value {
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
  margin-left: var(--space-1);
}

.star-rating--sm .star-rating__value {
  font-size: var(--text-xs);
}

.star-rating--md .star-rating__value {
  font-size: var(--text-sm);
}

.star-rating--lg .star-rating__value {
  font-size: var(--text-base);
}

/* Review count */
.star-rating__count {
  color: var(--color-neutral-500);
  margin-left: var(--space-1);
}

.star-rating--sm .star-rating__count {
  font-size: var(--text-xs);
}

.star-rating--md .star-rating__count {
  font-size: var(--text-sm);
}

.star-rating--lg .star-rating__count {
  font-size: var(--text-base);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .star-rating--gold .star-rating__star--empty,
  .star-rating--primary .star-rating__star--empty {
    color: var(--color-neutral-600);
  }

  .star-rating__value {
    color: var(--color-neutral-100);
  }

  .star-rating__count {
    color: var(--color-neutral-400);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .star-rating__star {
    transition: none;
  }
}
</style>
