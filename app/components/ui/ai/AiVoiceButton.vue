<script setup lang="ts">
/**
 * AiVoiceButton - Voice input button with visual feedback
 * Inspired by: Google Assistant, Siri, Alexa
 *
 * @example
 * <AiVoiceButton @start="startRecording" @stop="stopRecording" />
 */

interface Props {
  recording?: boolean
  processing?: boolean
  disabled?: boolean
  size?: 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  recording: false,
  processing: false,
  disabled: false,
  size: 'lg',
})

const emit = defineEmits<{
  start: []
  stop: []
  click: []
}>()

const { haptic } = useAnimation()

function handleClick() {
  if (props.disabled || props.processing) return

  if (props.recording) {
    emit('stop')
    haptic('medium')
  } else {
    emit('start')
    haptic('light')
  }
  emit('click')
}

const buttonClasses = computed(() => [
  'voice-button',
  `voice-button--${props.size}`,
  {
    'voice-button--recording': props.recording,
    'voice-button--processing': props.processing,
    'voice-button--disabled': props.disabled,
  },
])
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :aria-label="recording ? 'Stop recording' : 'Start voice input'"
    @click="handleClick"
  >
    <!-- Pulse rings when recording -->
    <span v-if="recording" class="voice-button__pulse" />
    <span v-if="recording" class="voice-button__pulse voice-button__pulse--delayed" />

    <!-- Inner circle -->
    <span class="voice-button__inner">
      <!-- Processing spinner -->
      <Icon
        v-if="processing"
        name="lucide:loader-2"
        class="voice-button__icon animate-spin"
      />
      <!-- Stop icon when recording -->
      <span v-else-if="recording" class="voice-button__stop" />
      <!-- Mic icon default -->
      <Icon
        v-else
        name="heroicons:microphone"
        class="voice-button__icon"
      />
    </span>

    <!-- Audio level indicator bars (when recording) -->
    <div v-if="recording && !processing" class="voice-button__levels">
      <span class="voice-button__level" />
      <span class="voice-button__level" />
      <span class="voice-button__level" />
      <span class="voice-button__level" />
      <span class="voice-button__level" />
    </div>
  </button>
</template>

<style scoped>
.voice-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

.voice-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Sizes */
.voice-button--md {
  width: 56px;
  height: 56px;
}

.voice-button--lg {
  width: 72px;
  height: 72px;
}

.voice-button--xl {
  width: 96px;
  height: 96px;
}

/* Inner circle */
.voice-button__inner {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--color-primary-500);
  color: white;
  transition: transform var(--duration-fast), background var(--duration-fast);
}

.voice-button--md .voice-button__inner {
  width: 48px;
  height: 48px;
}

.voice-button--lg .voice-button__inner {
  width: 64px;
  height: 64px;
}

.voice-button--xl .voice-button__inner {
  width: 80px;
  height: 80px;
}

.voice-button:hover:not(:disabled) .voice-button__inner {
  background: var(--color-primary-600);
}

.voice-button:active:not(:disabled) .voice-button__inner {
  transform: scale(0.95);
}

/* Recording state */
.voice-button--recording .voice-button__inner {
  background: var(--color-error-500);
}

.voice-button--recording:hover:not(:disabled) .voice-button__inner {
  background: var(--color-error-600);
}

/* Processing state */
.voice-button--processing .voice-button__inner {
  background: var(--color-neutral-400);
}

/* Icon */
.voice-button__icon {
  width: 40%;
  height: 40%;
}

/* Stop icon (square) */
.voice-button__stop {
  width: 28%;
  height: 28%;
  background: white;
  border-radius: var(--radius-sm);
}

/* Pulse animation rings */
.voice-button__pulse {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-full);
  background: var(--color-error-500);
  opacity: 0.3;
  animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
}

.voice-button__pulse--delayed {
  animation-delay: 0.5s;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 0.4;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

/* Audio level bars */
.voice-button__levels {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 16px;
}

.voice-button__level {
  width: 3px;
  background: var(--color-error-500);
  border-radius: var(--radius-full);
  animation: level-bounce 0.5s ease-in-out infinite;
}

.voice-button__level:nth-child(1) {
  animation-delay: 0ms;
  height: 40%;
}

.voice-button__level:nth-child(2) {
  animation-delay: 100ms;
  height: 70%;
}

.voice-button__level:nth-child(3) {
  animation-delay: 200ms;
  height: 100%;
}

.voice-button__level:nth-child(4) {
  animation-delay: 300ms;
  height: 60%;
}

.voice-button__level:nth-child(5) {
  animation-delay: 400ms;
  height: 30%;
}

@keyframes level-bounce {
  0%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.4);
  }
}

/* Spin animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .voice-button--processing .voice-button__inner {
    background: var(--color-neutral-600);
  }
}
</style>
