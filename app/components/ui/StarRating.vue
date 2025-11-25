<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { star, starHalf, starOutline } from 'ionicons/icons'

const props = withDefaults(
  defineProps<{
    rating: number
    maxRating?: number
    showValue?: boolean
    size?: 'small' | 'medium' | 'large'
    interactive?: boolean
  }>(),
  {
    maxRating: 5,
    showValue: false,
    size: 'medium',
    interactive: false,
  }
)

const emit = defineEmits<{
  change: [rating: number]
}>()

// Calculate stars to display
const stars = computed(() => {
  const result = []
  const fullStars = Math.floor(props.rating)
  const hasHalfStar = props.rating % 1 >= 0.5

  for (let i = 1; i <= props.maxRating; i++) {
    if (i <= fullStars) {
      result.push({ index: i, icon: star, type: 'full' })
    } else if (i === fullStars + 1 && hasHalfStar) {
      result.push({ index: i, icon: starHalf, type: 'half' })
    } else {
      result.push({ index: i, icon: starOutline, type: 'empty' })
    }
  }

  return result
})

// Handle click on star (for interactive mode)
const handleStarClick = (starIndex: number) => {
  if (props.interactive) {
    emit('change', starIndex)
  }
}

// Size classes
const sizeClass = computed(() => `size-${props.size}`)
</script>

<template>
  <div
    class="star-rating"
    :class="[sizeClass, { interactive }]"
    role="img"
    :aria-label="`Rating: ${rating} out of ${maxRating} stars`"
  >
    <IonIcon
      v-for="starItem in stars"
      :key="starItem.index"
      :icon="starItem.icon"
      class="star"
      :class="starItem.type"
      @click="handleStarClick(starItem.index)"
    />
    <span v-if="showValue" class="rating-value">
      {{ rating.toFixed(1) }}
    </span>
  </div>
</template>

<style scoped>
.star-rating {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.star-rating.interactive {
  cursor: pointer;
}

.star {
  color: var(--ion-color-warning);
  transition: transform 0.1s ease;
}

.star.empty {
  color: var(--ion-color-medium-shade);
}

.interactive .star:hover {
  transform: scale(1.1);
}

/* Sizes */
.size-small .star {
  font-size: 14px;
}

.size-small .rating-value {
  font-size: 12px;
}

.size-medium .star {
  font-size: 18px;
}

.size-medium .rating-value {
  font-size: 14px;
}

.size-large .star {
  font-size: 24px;
}

.size-large .rating-value {
  font-size: 16px;
}

.rating-value {
  margin-left: 4px;
  font-weight: 600;
  color: var(--ion-text-color);
}
</style>