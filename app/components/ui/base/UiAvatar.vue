<script setup lang="ts">
/**
 * UiAvatar - User avatar with image, initials, or icon fallback
 * Inspired by: Slack, Discord, Linear
 *
 * @example
 * <UiAvatar src="/avatars/user.jpg" alt="John Doe" />
 * <UiAvatar name="John Doe" />
 * <UiAvatar size="lg" :online="true" />
 *
 */

interface Props {
  src?: string
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
  online?: boolean
  offline?: boolean
  icon?: string
  color?: 'primary' | 'secondary' | 'neutral' | 'auto'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  shape: 'circle',
  color: 'auto',
})

const imgError = ref(false)

const initials = computed(() => {
  if (!props.name) return ''
  const parts = props.name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})

const showImage = computed(() => props.src && !imgError.value)
const showInitials = computed(() => !showImage.value && initials.value)
const showIcon = computed(() => !showImage.value && !showInitials.value)

// Generate consistent color from name
const autoColor = computed(() => {
  if (!props.name) return 0
  let hash = 0
  for (let i = 0; i < props.name.length; i++) {
    hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash % 6)
})

const avatarClasses = computed(() => [
  'ui-avatar',
  `ui-avatar--${props.size}`,
  `ui-avatar--${props.shape}`,
  {
    'ui-avatar--has-status': props.online !== undefined || props.offline !== undefined,
    [`ui-avatar--color-${props.color}`]: props.color !== 'auto',
    [`ui-avatar--color-auto-${autoColor.value}`]: props.color === 'auto' && !showImage.value,
  },
])

function handleImageError() {
  imgError.value = true
}
</script>

<template>
  <div :class="avatarClasses">
    <!-- Image -->
    <img
      v-if="showImage"
      :src="src"
      :alt="alt || name || 'Avatar'"
      class="ui-avatar__image"
      @error="handleImageError"
    >

    <!-- Initials -->
    <span v-else-if="showInitials" class="ui-avatar__initials">
      {{ initials }}
    </span>

    <!-- Fallback icon -->
    <Icon
      v-else-if="showIcon"
      :name="icon || 'heroicons:user'"
      class="ui-avatar__icon"
    />

    <!-- Online/Offline status -->
    <span
      v-if="online || offline"
      :class="['ui-avatar__status', online ? 'ui-avatar__status--online' : 'ui-avatar__status--offline']"
    />
  </div>
</template>

<style scoped>
.ui-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  user-select: none;
  font-weight: var(--font-semibold);
}

/* Sizes */
.ui-avatar--xs {
  width: 24px;
  height: 24px;
  font-size: 10px;
}

.ui-avatar--sm {
  width: 32px;
  height: 32px;
  font-size: var(--text-xs);
}

.ui-avatar--md {
  width: 40px;
  height: 40px;
  font-size: var(--text-sm);
}

.ui-avatar--lg {
  width: 56px;
  height: 56px;
  font-size: var(--text-lg);
}

.ui-avatar--xl {
  width: 80px;
  height: 80px;
  font-size: var(--text-2xl);
}

/* Shapes */
.ui-avatar--circle {
  border-radius: var(--radius-full);
}

.ui-avatar--square {
  border-radius: var(--radius-lg);
}

/* Image */
.ui-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Initials & Icon placeholder */
.ui-avatar__initials,
.ui-avatar__icon {
  color: white;
}

.ui-avatar__icon {
  width: 50%;
  height: 50%;
}

/* Manual colors */
.ui-avatar--color-primary {
  background: var(--color-primary-500);
}

.ui-avatar--color-secondary {
  background: var(--color-secondary-500);
}

.ui-avatar--color-neutral {
  background: var(--color-neutral-400);
}

/* Auto colors - variety for visual distinction */
.ui-avatar--color-auto-0 {
  background: var(--color-primary-500);
}

.ui-avatar--color-auto-1 {
  background: #8b5cf6; /* violet */
}

.ui-avatar--color-auto-2 {
  background: #ec4899; /* pink */
}

.ui-avatar--color-auto-3 {
  background: #f59e0b; /* amber */
}

.ui-avatar--color-auto-4 {
  background: #06b6d4; /* cyan */
}

.ui-avatar--color-auto-5 {
  background: #84cc16; /* lime */
}

/* Status indicator */
.ui-avatar__status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 25%;
  height: 25%;
  min-width: 8px;
  min-height: 8px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-neutral-0);
}

.ui-avatar__status--online {
  background: var(--color-success-500);
}

.ui-avatar__status--offline {
  background: var(--color-neutral-400);
}

/* Status positioning by size */
.ui-avatar--xs .ui-avatar__status {
  width: 8px;
  height: 8px;
  border-width: 1px;
}

.ui-avatar--sm .ui-avatar__status {
  width: 10px;
  height: 10px;
  border-width: 2px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .ui-avatar__status {
    border-color: var(--color-neutral-900);
  }
}
</style>
