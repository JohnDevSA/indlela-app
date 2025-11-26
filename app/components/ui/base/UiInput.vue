<script setup lang="ts">
/**
 * UiInput - Text input with label, validation, and icon support
 * Inspired by: Linear, Vercel, Claude
 *
 * @example
 * <UiInput v-model="email" label="Email" type="email" />
 * <UiInput v-model="search" placeholder="Search..." icon="heroicons:magnifying-glass" />
 * <UiInput v-model="phone" label="Phone" :error="phoneError" />
 */

interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'search' | 'url'
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  clearable?: boolean
  maxlength?: number
  autofocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  iconPosition: 'left',
  clearable: false,
  disabled: false,
  readonly: false,
  required: false,
  autofocus: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  clear: []
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const showPassword = ref(false)

const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

const hasValue = computed(() => {
  return props.modelValue !== undefined && props.modelValue !== ''
})

const wrapperClasses = computed(() => [
  'ui-input',
  {
    'ui-input--focused': isFocused.value,
    'ui-input--error': props.error,
    'ui-input--disabled': props.disabled,
    'ui-input--has-icon-left': props.icon && props.iconPosition === 'left',
    'ui-input--has-icon-right': props.icon && props.iconPosition === 'right' || props.clearable || props.type === 'password',
  },
])

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleFocus(event: FocusEvent) {
  isFocused.value = true
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  isFocused.value = false
  emit('blur', event)
}

function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

function togglePassword() {
  showPassword.value = !showPassword.value
}

// Expose focus method
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
})
</script>

<template>
  <div class="ui-input-wrapper">
    <!-- Label -->
    <label v-if="label" class="ui-input__label">
      {{ label }}
      <span v-if="required" class="ui-input__required">*</span>
    </label>

    <!-- Input container -->
    <div :class="wrapperClasses">
      <!-- Left icon -->
      <Icon
        v-if="icon && iconPosition === 'left'"
        :name="icon"
        class="ui-input__icon ui-input__icon--left"
      />

      <!-- Input element -->
      <input
        ref="inputRef"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :autofocus="autofocus"
        class="ui-input__field"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      >

      <!-- Right side actions -->
      <div class="ui-input__actions">
        <!-- Clear button -->
        <button
          v-if="clearable && hasValue && !disabled"
          type="button"
          class="ui-input__action-btn"
          @click="handleClear"
        >
          <Icon name="heroicons:x-circle" />
        </button>

        <!-- Password toggle -->
        <button
          v-if="type === 'password'"
          type="button"
          class="ui-input__action-btn"
          @click="togglePassword"
        >
          <Icon :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" />
        </button>

        <!-- Right icon -->
        <Icon
          v-if="icon && iconPosition === 'right'"
          :name="icon"
          class="ui-input__icon ui-input__icon--right"
        />
      </div>
    </div>

    <!-- Hint or Error -->
    <p v-if="error" class="ui-input__message ui-input__message--error">
      {{ error }}
    </p>
    <p v-else-if="hint" class="ui-input__message ui-input__message--hint">
      {{ hint }}
    </p>
  </div>
</template>

<style scoped>
.ui-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
}

.ui-input__label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-700);
}

.ui-input__required {
  color: var(--color-error-500);
  margin-left: 2px;
}

.ui-input {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--color-neutral-0);
  border: 1.5px solid var(--color-neutral-300);
  border-radius: var(--radius-lg);
  transition-property: border-color, box-shadow;
  transition-duration: var(--duration-normal);
  transition-timing-function: var(--ease-in-out);
}

.ui-input:hover:not(.ui-input--disabled) {
  border-color: var(--color-neutral-400);
}

.ui-input--focused {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.ui-input--error {
  border-color: var(--color-error-500);
}

.ui-input--error.ui-input--focused {
  box-shadow: 0 0 0 3px var(--color-error-50);
}

.ui-input--disabled {
  background: var(--color-neutral-100);
  cursor: not-allowed;
}

.ui-input__field {
  flex: 1;
  width: 100%;
  height: var(--touch-target-min);
  padding: 0 var(--space-4);
  border: none;
  background: transparent;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  color: var(--color-neutral-900);
  outline: none;
}

.ui-input__field::placeholder {
  color: var(--color-neutral-400);
}

.ui-input__field:disabled {
  cursor: not-allowed;
  color: var(--color-neutral-500);
}

/* Icon positioning */
.ui-input--has-icon-left .ui-input__field {
  padding-left: var(--space-10);
}

.ui-input--has-icon-right .ui-input__field {
  padding-right: var(--space-10);
}

.ui-input__icon {
  position: absolute;
  width: 20px;
  height: 20px;
  color: var(--color-neutral-400);
  pointer-events: none;
}

.ui-input__icon--left {
  left: var(--space-3);
}

.ui-input__icon--right {
  right: var(--space-3);
}

/* Actions */
.ui-input__actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding-right: var(--space-2);
}

.ui-input__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--color-neutral-400);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: color var(--duration-fast), background var(--duration-fast);
}

.ui-input__action-btn:hover {
  color: var(--color-neutral-600);
  background: var(--color-neutral-100);
}

.ui-input__action-btn :deep(svg) {
  width: 18px;
  height: 18px;
}

/* Messages */
.ui-input__message {
  font-size: var(--text-sm);
  margin: 0;
}

.ui-input__message--hint {
  color: var(--color-neutral-500);
}

.ui-input__message--error {
  color: var(--color-error-500);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .ui-input__label {
    color: var(--color-neutral-300);
  }

  .ui-input {
    background: var(--color-neutral-900);
    border-color: var(--color-neutral-700);
  }

  .ui-input:hover:not(.ui-input--disabled) {
    border-color: var(--color-neutral-600);
  }

  .ui-input--focused {
    box-shadow: 0 0 0 3px rgba(0, 168, 107, 0.2);
  }

  .ui-input--disabled {
    background: var(--color-neutral-800);
  }

  .ui-input__field {
    color: var(--color-neutral-100);
  }

  .ui-input__action-btn:hover {
    background: var(--color-neutral-800);
    color: var(--color-neutral-200);
  }
}
</style>
