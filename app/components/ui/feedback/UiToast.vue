<script setup lang="ts">
/**
 * UiToast - Toast notification component
 * Inspired by: Sonner, Vercel, Linear
 *
 * Use with the useToast composable for programmatic usage
 *
 * @example
 * <UiToast type="success" title="Saved!" message="Your changes have been saved" />
 */

interface Props {
  type?: 'default' | 'success' | 'warning' | 'error' | 'info'
  title?: string
  message?: string
  duration?: number
  closable?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  duration: 4000,
  closable: true,
})

const emit = defineEmits<{
  close: []
}>()

const isVisible = ref(true)
const isLeaving = ref(false)

const icons: Record<string, string> = {
  default: 'heroicons:information-circle',
  success: 'heroicons:check-circle',
  warning: 'heroicons:exclamation-triangle',
  error: 'heroicons:x-circle',
  info: 'heroicons:information-circle',
}

const toastClasses = computed(() => [
  'ui-toast',
  `ui-toast--${props.type}`,
  {
    'ui-toast--leaving': isLeaving.value,
  },
])

let timeoutId: ReturnType<typeof setTimeout>

function close() {
  isLeaving.value = true
  setTimeout(() => {
    isVisible.value = false
    emit('close')
  }, 200)
}

function handleAction() {
  props.action?.onClick()
  close()
}

onMounted(() => {
  if (props.duration > 0) {
    timeoutId = setTimeout(close, props.duration)
  }
})

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})
</script>

<template>
  <Transition name="toast">
    <div v-if="isVisible" :class="toastClasses" role="alert">
      <div class="ui-toast__icon">
        <Icon :name="icons[type]" />
      </div>

      <div class="ui-toast__content">
        <p v-if="title" class="ui-toast__title">{{ title }}</p>
        <p v-if="message" class="ui-toast__message">{{ message }}</p>
      </div>

      <div class="ui-toast__actions">
        <button
          v-if="action"
          class="ui-toast__action"
          @click="handleAction"
        >
          {{ action.label }}
        </button>

        <button
          v-if="closable"
          class="ui-toast__close"
          aria-label="Close"
          @click="close"
        >
          <Icon name="heroicons:x-mark" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.ui-toast {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  min-width: 300px;
  max-width: 420px;
  padding: var(--space-4);
  background: var(--color-neutral-0);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-neutral-200);
}

.ui-toast__icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.ui-toast__icon :deep(svg) {
  width: 100%;
  height: 100%;
}

/* Type colors */
.ui-toast--default .ui-toast__icon {
  color: var(--color-neutral-500);
}

.ui-toast--success .ui-toast__icon {
  color: var(--color-success-500);
}

.ui-toast--warning .ui-toast__icon {
  color: var(--color-warning-500);
}

.ui-toast--error .ui-toast__icon {
  color: var(--color-error-500);
}

.ui-toast--info .ui-toast__icon {
  color: var(--color-info-500);
}

/* Content */
.ui-toast__content {
  flex: 1;
  min-width: 0;
}

.ui-toast__title {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
  line-height: var(--leading-tight);
}

.ui-toast__message {
  margin: var(--space-1) 0 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  line-height: var(--leading-normal);
}

/* Actions */
.ui-toast__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.ui-toast__action {
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-primary-600);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--duration-fast);
}

.ui-toast__action:hover {
  background: var(--color-primary-50);
}

.ui-toast__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-neutral-400);
  cursor: pointer;
  transition: background var(--duration-fast), color var(--duration-fast);
}

.ui-toast__close:hover {
  background: var(--color-neutral-100);
  color: var(--color-neutral-600);
}

.ui-toast__close :deep(svg) {
  width: 18px;
  height: 18px;
}

/* Animations */
.toast-enter-active {
  animation: toast-in 0.3s var(--ease-spring);
}

.toast-leave-active {
  animation: toast-out 0.2s var(--ease-in);
}

@keyframes toast-in {
  0% {
    opacity: 0;
    transform: translateY(16px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toast-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .ui-toast {
    background: var(--color-neutral-900);
    border-color: var(--color-neutral-700);
  }

  .ui-toast__title {
    color: var(--color-neutral-100);
  }

  .ui-toast__message {
    color: var(--color-neutral-400);
  }

  .ui-toast__action:hover {
    background: rgba(0, 168, 107, 0.1);
  }

  .ui-toast__close:hover {
    background: var(--color-neutral-800);
    color: var(--color-neutral-200);
  }
}
</style>
