<script setup lang="ts">
/**
 * AiChatInput - Chat input with voice, attachments, and actions
 * Inspired by: ChatGPT, Claude, WhatsApp
 *
 * @example
 * <AiChatInput
 *   v-model="message"
 *   :loading="isSending"
 *   @send="handleSend"
 *   @voice="handleVoice"
 * />
 */

interface Props {
  modelValue?: string
  placeholder?: string
  loading?: boolean
  disabled?: boolean
  maxLength?: number
  showVoice?: boolean
  showAttachment?: boolean
  autoGrow?: boolean
  maxRows?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Type a message...',
  loading: false,
  disabled: false,
  maxLength: 2000,
  showVoice: true,
  showAttachment: false,
  autoGrow: true,
  maxRows: 4,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: [message: string]
  voice: []
  attachment: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isFocused = ref(false)

const message = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const canSend = computed(() => {
  return message.value.trim().length > 0 && !props.loading && !props.disabled
})

const characterCount = computed(() => message.value.length)
const isNearLimit = computed(() => characterCount.value > props.maxLength * 0.9)

function handleSend() {
  if (canSend.value) {
    emit('send', message.value.trim())
    message.value = ''
    nextTick(() => {
      adjustHeight()
    })
  }
}

function handleKeydown(event: KeyboardEvent) {
  // Send on Enter (without Shift)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function handleInput() {
  if (props.autoGrow) {
    adjustHeight()
  }
}

function adjustHeight() {
  const textarea = textareaRef.value
  if (!textarea) return

  textarea.style.height = 'auto'
  const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
  const maxHeight = lineHeight * props.maxRows
  const newHeight = Math.min(textarea.scrollHeight, maxHeight)
  textarea.style.height = `${newHeight}px`
}

function handleFocus(event: FocusEvent) {
  isFocused.value = true
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  isFocused.value = false
  emit('blur', event)
}

// Expose methods
defineExpose({
  focus: () => textareaRef.value?.focus(),
  blur: () => textareaRef.value?.blur(),
})

onMounted(() => {
  adjustHeight()
})
</script>

<template>
  <div
    :class="[
      'chat-input',
      {
        'chat-input--focused': isFocused,
        'chat-input--disabled': disabled,
        'chat-input--loading': loading,
      },
    ]"
  >
    <!-- Attachment button -->
    <button
      v-if="showAttachment"
      type="button"
      class="chat-input__action"
      :disabled="disabled"
      @click="emit('attachment')"
    >
      <Icon name="heroicons:paper-clip" />
    </button>

    <!-- Text input area -->
    <div class="chat-input__field-wrapper">
      <textarea
        ref="textareaRef"
        v-model="message"
        :placeholder="placeholder"
        :disabled="disabled || loading"
        :maxlength="maxLength"
        class="chat-input__field"
        rows="1"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- Character count (when near limit) -->
      <span
        v-if="isNearLimit"
        :class="[
          'chat-input__count',
          { 'chat-input__count--warning': characterCount >= maxLength },
        ]"
      >
        {{ characterCount }}/{{ maxLength }}
      </span>
    </div>

    <!-- Action buttons -->
    <div class="chat-input__actions">
      <!-- Voice input -->
      <button
        v-if="showVoice && !canSend"
        type="button"
        class="chat-input__action chat-input__action--voice"
        :disabled="disabled"
        @click="emit('voice')"
      >
        <Icon name="heroicons:microphone" />
      </button>

      <!-- Send button -->
      <button
        v-if="canSend || loading"
        type="button"
        :class="[
          'chat-input__send',
          { 'chat-input__send--loading': loading },
        ]"
        :disabled="!canSend"
        @click="handleSend"
      >
        <Icon v-if="loading" name="lucide:loader-2" class="animate-spin" />
        <Icon v-else name="heroicons:paper-airplane" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-input {
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-neutral-0);
  border: 1.5px solid var(--color-neutral-200);
  border-radius: var(--radius-2xl);
  transition: border-color var(--duration-normal), box-shadow var(--duration-normal);
}

.chat-input--focused {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.chat-input--disabled {
  background: var(--color-neutral-100);
  cursor: not-allowed;
}

/* Field wrapper */
.chat-input__field-wrapper {
  flex: 1;
  position: relative;
  min-width: 0;
}

.chat-input__field {
  width: 100%;
  min-height: 24px;
  max-height: 120px;
  padding: var(--space-2) 0;
  border: none;
  background: transparent;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--color-neutral-900);
  resize: none;
  outline: none;
}

.chat-input__field::placeholder {
  color: var(--color-neutral-400);
}

.chat-input__field:disabled {
  cursor: not-allowed;
}

/* Character count */
.chat-input__count {
  position: absolute;
  right: 0;
  bottom: -16px;
  font-size: 11px;
  color: var(--color-neutral-400);
}

.chat-input__count--warning {
  color: var(--color-warning-600);
}

/* Action buttons */
.chat-input__actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.chat-input__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  color: var(--color-neutral-500);
  cursor: pointer;
  transition: background var(--duration-fast), color var(--duration-fast);
}

.chat-input__action:hover:not(:disabled) {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
}

.chat-input__action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-input__action :deep(svg) {
  width: 20px;
  height: 20px;
}

/* Voice button active state */
.chat-input__action--voice:active {
  background: var(--color-error-100);
  color: var(--color-error-600);
}

/* Send button */
.chat-input__send {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: var(--color-primary-500);
  border: none;
  border-radius: var(--radius-full);
  color: white;
  cursor: pointer;
  transition: background var(--duration-fast), transform var(--duration-fast);
}

.chat-input__send:hover:not(:disabled) {
  background: var(--color-primary-600);
}

.chat-input__send:active:not(:disabled) {
  transform: scale(0.95);
}

.chat-input__send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-input__send--loading {
  cursor: wait;
}

.chat-input__send :deep(svg) {
  width: 18px;
  height: 18px;
}

/* Animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .chat-input {
    background: var(--color-neutral-900);
    border-color: var(--color-neutral-700);
  }

  .chat-input--focused {
    box-shadow: 0 0 0 3px rgba(0, 168, 107, 0.2);
  }

  .chat-input--disabled {
    background: var(--color-neutral-800);
  }

  .chat-input__field {
    color: var(--color-neutral-100);
  }

  .chat-input__action:hover:not(:disabled) {
    background: var(--color-neutral-800);
    color: var(--color-neutral-200);
  }
}
</style>
