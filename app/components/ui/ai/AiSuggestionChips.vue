<script setup lang="ts">
/**
 * AiSuggestionChips - Quick action/suggestion chips for AI conversations
 * Inspired by: Google Assistant, ChatGPT, Gemini
 *
 * @example
 * <AiSuggestionChips
 *   :suggestions="['Find a plumber', 'Show nearby', 'Check prices']"
 *   @select="handleSelect"
 * />
 */

interface Suggestion {
  id?: string
  label: string
  icon?: string
  variant?: 'default' | 'primary' | 'secondary'
}

interface Props {
  suggestions: (string | Suggestion)[]
  disabled?: boolean
  loading?: boolean
  scrollable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  loading: false,
  scrollable: true,
})

const emit = defineEmits<{
  select: [suggestion: string | Suggestion]
}>()

const normalizedSuggestions = computed((): Suggestion[] => {
  return props.suggestions.map((s, index) => {
    if (typeof s === 'string') {
      return { id: `suggestion-${index}`, label: s, variant: 'default' }
    }
    return { ...s, id: s.id || `suggestion-${index}` }
  })
})

function handleSelect(suggestion: Suggestion) {
  if (!props.disabled && !props.loading) {
    emit('select', suggestion)
  }
}
</script>

<template>
  <div
    :class="[
      'suggestion-chips',
      {
        'suggestion-chips--scrollable': scrollable,
        'suggestion-chips--disabled': disabled,
      },
    ]"
  >
    <!-- Loading skeleton -->
    <template v-if="loading">
      <div
        v-for="i in 3"
        :key="`skeleton-${i}`"
        class="suggestion-chip suggestion-chip--skeleton"
      />
    </template>

    <!-- Suggestion chips -->
    <template v-else>
      <button
        v-for="suggestion in normalizedSuggestions"
        :key="suggestion.id"
        :class="[
          'suggestion-chip',
          `suggestion-chip--${suggestion.variant || 'default'}`,
        ]"
        :disabled="disabled"
        @click="handleSelect(suggestion)"
      >
        <Icon
          v-if="suggestion.icon"
          :name="suggestion.icon"
          class="suggestion-chip__icon"
        />
        <span class="suggestion-chip__label">{{ suggestion.label }}</span>
      </button>
    </template>
  </div>
</template>

<style scoped>
.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.suggestion-chips--scrollable {
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: var(--space-2);
  margin-bottom: calc(var(--space-2) * -1);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.suggestion-chips--scrollable::-webkit-scrollbar {
  display: none;
}

.suggestion-chips--disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* Chip base styles */
.suggestion-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  font-family: var(--font-sans);
  line-height: 1.4;
  white-space: nowrap;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
  border: 1.5px solid transparent;
}

.suggestion-chip:active:not(:disabled) {
  transform: scale(0.97);
}

.suggestion-chip:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Default variant */
.suggestion-chip--default {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
  border-color: var(--color-neutral-200);
}

.suggestion-chip--default:hover:not(:disabled) {
  background: var(--color-neutral-200);
  border-color: var(--color-neutral-300);
}

/* Primary variant */
.suggestion-chip--primary {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  border-color: var(--color-primary-200);
}

.suggestion-chip--primary:hover:not(:disabled) {
  background: var(--color-primary-100);
  border-color: var(--color-primary-300);
}

/* Secondary variant */
.suggestion-chip--secondary {
  background: var(--color-secondary-50);
  color: var(--color-secondary-700);
  border-color: var(--color-secondary-200);
}

.suggestion-chip--secondary:hover:not(:disabled) {
  background: var(--color-secondary-100);
  border-color: var(--color-secondary-300);
}

/* Icon */
.suggestion-chip__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Label */
.suggestion-chip__label {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Skeleton loading */
.suggestion-chip--skeleton {
  width: 100px;
  height: 36px;
  background: var(--color-neutral-200);
  border: none;
  cursor: default;
  position: relative;
  overflow: hidden;
}

.suggestion-chip--skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.5) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
  transform: translateX(-100%);
}

.suggestion-chip--skeleton:nth-child(2) {
  width: 120px;
}

.suggestion-chip--skeleton:nth-child(3) {
  width: 90px;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .suggestion-chip--default {
    background: var(--color-neutral-800);
    color: var(--color-neutral-200);
    border-color: var(--color-neutral-700);
  }

  .suggestion-chip--default:hover:not(:disabled) {
    background: var(--color-neutral-700);
    border-color: var(--color-neutral-600);
  }

  .suggestion-chip--primary {
    background: rgba(0, 168, 107, 0.15);
    color: var(--color-primary-400);
    border-color: rgba(0, 168, 107, 0.3);
  }

  .suggestion-chip--primary:hover:not(:disabled) {
    background: rgba(0, 168, 107, 0.25);
  }

  .suggestion-chip--secondary {
    background: rgba(245, 166, 35, 0.15);
    color: var(--color-secondary-400);
    border-color: rgba(245, 166, 35, 0.3);
  }

  .suggestion-chip--secondary:hover:not(:disabled) {
    background: rgba(245, 166, 35, 0.25);
  }

  .suggestion-chip--skeleton {
    background: var(--color-neutral-700);
  }

  .suggestion-chip--skeleton::after {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
  }
}
</style>
