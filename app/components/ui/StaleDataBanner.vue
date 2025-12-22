<script setup lang="ts">
/**
 * StaleDataBanner - Shows when viewing cached/stale data
 * Non-intrusive indicator with refresh action
 *
 * @example
 * <StaleDataBanner
 *   :cached-at="providersCachedAt"
 *   :threshold="FRESHNESS_THRESHOLDS.providers"
 *   @refresh="handleRefresh"
 * />
 */
import { FRESHNESS_THRESHOLDS, useDataFreshness } from '~/composables/useDataFreshness'

interface Props {
  /** When the data was cached */
  cachedAt: Date | null
  /** Staleness threshold in milliseconds */
  threshold: number
  /** Optional data type for context */
  dataType?: string
}

const props = withDefaults(defineProps<Props>(), {
  dataType: 'data',
})

const emit = defineEmits<{
  refresh: []
}>()

const { t } = useI18n()
const { haptic } = useAnimation()

// Track freshness
const { isStale, relativeAge } = useDataFreshness(
  computed(() => props.cachedAt),
  props.threshold
)

// Dismissible state (per session)
const isDismissed = ref(false)

// Should show the banner?
const isVisible = computed(() => isStale.value && !isDismissed.value)

const handleRefresh = () => {
  haptic('light')
  emit('refresh')
}

const dismiss = () => {
  isDismissed.value = true
  haptic('light')
}

// Reset dismissed state when cachedAt changes (new data loaded)
watch(() => props.cachedAt, () => {
  isDismissed.value = false
})
</script>

<template>
  <Transition name="slide-fade">
    <div
      v-if="isVisible"
      class="stale-banner"
      role="status"
      aria-live="polite"
    >
      <div class="stale-banner__content">
        <Icon name="heroicons:clock" class="stale-banner__icon" />
        <span class="stale-banner__text">
          {{ t('offline.updated_ago', { time: relativeAge }) }}
        </span>
        <button
          type="button"
          class="stale-banner__action"
          @click="handleRefresh"
        >
          {{ t('offline.refresh') }}
        </button>
        <button
          type="button"
          class="stale-banner__dismiss"
          :aria-label="t('common.close')"
          @click="dismiss"
        >
          <Icon name="heroicons:x-mark" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.stale-banner {
  width: 100%;
  background: var(--color-info-50);
  border-bottom: 1px solid var(--color-info-200);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  user-select: none;
}

.stale-banner__content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  min-height: 40px;
}

.stale-banner__icon {
  width: 16px;
  height: 16px;
  color: var(--color-info-600);
  flex-shrink: 0;
}

.stale-banner__text {
  flex: 1;
  color: var(--color-info-800);
  line-height: 1.3;
  font-weight: var(--font-medium);
}

.stale-banner__action {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--color-primary-600);
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-200);
  cursor: pointer;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  min-height: 28px;
  white-space: nowrap;
  transition: background var(--duration-fast) var(--ease-out);
}

.stale-banner__action:hover {
  background: var(--color-primary-100);
}

.stale-banner__action:active {
  background: var(--color-primary-200);
}

.stale-banner__dismiss {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-info-500);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition: background var(--duration-fast) var(--ease-out);
}

.stale-banner__dismiss:hover {
  background: var(--color-info-100);
}

.stale-banner__dismiss:active {
  background: var(--color-info-200);
}

.stale-banner__dismiss :deep(svg) {
  width: 16px;
  height: 16px;
}

/* Slide-fade transition */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease-out;
}

.slide-fade-enter-from {
  transform: translateY(-8px);
  opacity: 0;
}

.slide-fade-leave-to {
  opacity: 0;
  height: 0;
  padding: 0;
  overflow: hidden;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .stale-banner {
    background: rgba(59, 130, 246, 0.1);
    border-bottom-color: rgba(59, 130, 246, 0.2);
  }

  .stale-banner__icon {
    color: var(--color-info-400);
  }

  .stale-banner__text {
    color: var(--color-info-200);
  }

  .stale-banner__action {
    background: rgba(0, 168, 107, 0.15);
    border-color: rgba(0, 168, 107, 0.3);
    color: var(--color-primary-400);
  }

  .stale-banner__action:hover {
    background: rgba(0, 168, 107, 0.25);
  }

  .stale-banner__dismiss {
    color: var(--color-info-400);
  }

  .stale-banner__dismiss:hover {
    background: rgba(59, 130, 246, 0.15);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: opacity 0.15s;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: none;
  }
}
</style>