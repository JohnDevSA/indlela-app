<script setup lang="ts">
/**
 * UiModal - Accessible modal/dialog component
 * Inspired by: Radix UI, Linear, Notion
 *
 * @example
 * <UiModal v-model="isOpen" title="Confirm Action">
 *   <p>Are you sure you want to proceed?</p>
 *   <template #footer>
 *     <UiButton @click="confirm">Confirm</UiButton>
 *   </template>
 * </UiModal>
 */

interface Props {
  modelValue?: boolean
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
  closable?: boolean
  closeOnOverlay?: boolean
  closeOnEscape?: boolean
  persistent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  size: 'md',
  closable: true,
  closeOnOverlay: true,
  closeOnEscape: true,
  persistent: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  open: []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const modalRef = ref<HTMLElement | null>(null)

function close() {
  if (!props.persistent) {
    isOpen.value = false
    emit('close')
  }
}

function handleOverlayClick() {
  if (props.closeOnOverlay) {
    close()
  }
}

function handleEscapeKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.closeOnEscape) {
    close()
  }
}

// Focus trap
const previousActiveElement = ref<HTMLElement | null>(null)

watch(isOpen, (value) => {
  if (value) {
    previousActiveElement.value = document.activeElement as HTMLElement
    emit('open')
    nextTick(() => {
      modalRef.value?.focus()
    })
  } else {
    previousActiveElement.value?.focus()
  }
})

// Handle escape key
onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
})

const modalClasses = computed(() => [
  'ui-modal__content',
  `ui-modal__content--${props.size}`,
])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="ui-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'modal-title' : undefined"
        :aria-describedby="description ? 'modal-description' : undefined"
      >
        <!-- Backdrop -->
        <div class="ui-modal__backdrop" @click="handleOverlayClick" />

        <!-- Modal content -->
        <div
          ref="modalRef"
          :class="modalClasses"
          tabindex="-1"
          @click.stop
        >
          <!-- Header -->
          <header v-if="title || closable || $slots.header" class="ui-modal__header">
            <slot name="header">
              <div class="ui-modal__header-text">
                <h2 v-if="title" id="modal-title" class="ui-modal__title">
                  {{ title }}
                </h2>
                <p v-if="description" id="modal-description" class="ui-modal__description">
                  {{ description }}
                </p>
              </div>
            </slot>

            <button
              v-if="closable"
              class="ui-modal__close"
              aria-label="Close modal"
              @click="close"
            >
              <Icon name="heroicons:x-mark" />
            </button>
          </header>

          <!-- Body -->
          <div class="ui-modal__body">
            <slot />
          </div>

          <!-- Footer -->
          <footer v-if="$slots.footer" class="ui-modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ui-modal {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.ui-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.ui-modal__content {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - var(--space-8));
  background: var(--color-neutral-0);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  outline: none;
  overflow: hidden;
}

/* Sizes */
.ui-modal__content--sm {
  width: 100%;
  max-width: 400px;
}

.ui-modal__content--md {
  width: 100%;
  max-width: 540px;
}

.ui-modal__content--lg {
  width: 100%;
  max-width: 720px;
}

.ui-modal__content--full {
  width: calc(100% - var(--space-8));
  height: calc(100% - var(--space-8));
  max-width: none;
  max-height: none;
}

/* Header */
.ui-modal__header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-6);
  padding-bottom: 0;
}

.ui-modal__header-text {
  flex: 1;
  min-width: 0;
}

.ui-modal__title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
  line-height: var(--leading-tight);
}

.ui-modal__description {
  margin: var(--space-1) 0 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
  line-height: var(--leading-normal);
}

.ui-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-lg);
  color: var(--color-neutral-400);
  cursor: pointer;
  transition: background var(--duration-fast), color var(--duration-fast);
  flex-shrink: 0;
}

.ui-modal__close:hover {
  background: var(--color-neutral-100);
  color: var(--color-neutral-600);
}

.ui-modal__close :deep(svg) {
  width: 20px;
  height: 20px;
}

/* Body */
.ui-modal__body {
  flex: 1;
  padding: var(--space-6);
  overflow-y: auto;
}

/* Footer */
.ui-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  background: var(--color-neutral-50);
  border-top: 1px solid var(--color-neutral-200);
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-normal) var(--ease-in-out);
}

.modal-enter-active .ui-modal__content,
.modal-leave-active .ui-modal__content {
  transition: transform var(--duration-normal) var(--ease-spring), opacity var(--duration-normal);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .ui-modal__content {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.modal-leave-to .ui-modal__content {
  opacity: 0;
  transform: scale(0.98);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .ui-modal__backdrop {
    background: rgba(0, 0, 0, 0.7);
  }

  .ui-modal__content {
    background: var(--color-neutral-900);
    border: 1px solid var(--color-neutral-700);
  }

  .ui-modal__title {
    color: var(--color-neutral-100);
  }

  .ui-modal__description {
    color: var(--color-neutral-400);
  }

  .ui-modal__close:hover {
    background: var(--color-neutral-800);
    color: var(--color-neutral-200);
  }

  .ui-modal__footer {
    background: var(--color-neutral-800);
    border-color: var(--color-neutral-700);
  }
}
</style>
