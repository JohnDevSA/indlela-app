<script setup lang="ts">
/**
 * AiChatBubble - Message bubble for AI conversations
 * Inspired by: ChatGPT, Claude, iMessage
 *
 * @example
 * <AiChatBubble sender="user" :timestamp="new Date()">
 *   Hello, I need help finding a plumber
 * </AiChatBubble>
 * <AiChatBubble sender="ai" :typing="true" />
 */

interface Props {
  sender: 'user' | 'ai' | 'system'
  timestamp?: Date
  typing?: boolean
  streaming?: boolean
  avatar?: string
  name?: string
  status?: 'sending' | 'sent' | 'delivered' | 'error'
}

const props = withDefaults(defineProps<Props>(), {
  typing: false,
  streaming: false,
  status: 'sent',
})

const formattedTime = computed(() => {
  if (!props.timestamp) return ''
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: 'numeric',
  }).format(props.timestamp)
})

const bubbleClasses = computed(() => [
  'chat-bubble',
  `chat-bubble--${props.sender}`,
  {
    'chat-bubble--typing': props.typing,
    'chat-bubble--streaming': props.streaming,
    'chat-bubble--error': props.status === 'error',
  },
])

const defaultAiName = 'Indlela'
const displayName = computed(() => props.name || (props.sender === 'ai' ? defaultAiName : undefined))
</script>

<template>
  <div :class="['chat-bubble-wrapper', `chat-bubble-wrapper--${sender}`]">
    <!-- Avatar for AI messages -->
    <div v-if="sender === 'ai'" class="chat-bubble__avatar">
      <UiAvatar
        v-if="avatar"
        :src="avatar"
        :name="displayName"
        size="sm"
      />
      <div v-else class="chat-bubble__avatar-icon">
        <Icon name="ph:robot" />
      </div>
    </div>

    <div class="chat-bubble__content">
      <!-- Sender name (for AI) -->
      <span v-if="displayName && sender === 'ai'" class="chat-bubble__name">
        {{ displayName }}
      </span>

      <!-- Message bubble -->
      <div :class="bubbleClasses">
        <!-- Typing indicator -->
        <div v-if="typing" class="typing-indicator">
          <span class="dot" />
          <span class="dot" />
          <span class="dot" />
        </div>

        <!-- Message content -->
        <div v-else :class="['chat-bubble__text', { 'streaming-cursor': streaming }]">
          <slot />
        </div>
      </div>

      <!-- Metadata row -->
      <div class="chat-bubble__meta">
        <span v-if="formattedTime" class="chat-bubble__time">
          {{ formattedTime }}
        </span>

        <!-- Status indicator for user messages -->
        <span v-if="sender === 'user' && status" class="chat-bubble__status">
          <Icon
            v-if="status === 'sending'"
            name="lucide:loader-2"
            class="animate-spin"
          />
          <Icon
            v-else-if="status === 'sent'"
            name="heroicons:check"
          />
          <Icon
            v-else-if="status === 'delivered'"
            name="heroicons:check"
            class="text-primary"
          />
          <Icon
            v-else-if="status === 'error'"
            name="heroicons:exclamation-circle"
            class="text-error"
          />
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-bubble-wrapper {
  display: flex;
  gap: var(--space-2);
  max-width: 85%;
  animation: message-in 0.3s var(--ease-spring) forwards;
}

.chat-bubble-wrapper--user {
  flex-direction: row-reverse;
  margin-left: auto;
}

.chat-bubble-wrapper--ai {
  margin-right: auto;
}

.chat-bubble-wrapper--system {
  max-width: 100%;
  justify-content: center;
}

/* Avatar */
.chat-bubble__avatar {
  flex-shrink: 0;
  align-self: flex-end;
  margin-bottom: 20px;
}

.chat-bubble__avatar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--color-primary-100);
  color: var(--color-primary-600);
  border-radius: var(--radius-full);
}

.chat-bubble__avatar-icon :deep(svg) {
  width: 18px;
  height: 18px;
}

/* Content container */
.chat-bubble__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.chat-bubble-wrapper--user .chat-bubble__content {
  align-items: flex-end;
}

/* Sender name */
.chat-bubble__name {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--color-neutral-500);
  padding-left: var(--space-2);
}

/* Bubble styles */
.chat-bubble {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-2xl);
  line-height: var(--leading-relaxed);
  word-wrap: break-word;
}

.chat-bubble--user {
  background: var(--color-primary-500);
  color: white;
  border-bottom-right-radius: var(--radius-md);
}

.chat-bubble--ai {
  background: var(--color-neutral-100);
  color: var(--color-neutral-900);
  border-bottom-left-radius: var(--radius-md);
}

.chat-bubble--system {
  background: transparent;
  color: var(--color-neutral-500);
  font-size: var(--text-sm);
  text-align: center;
  padding: var(--space-2) var(--space-4);
}

.chat-bubble--error {
  background: var(--color-error-50);
  border: 1px solid var(--color-error-200);
}

.chat-bubble--user.chat-bubble--error {
  background: var(--color-error-500);
}

/* Text content */
.chat-bubble__text {
  font-size: var(--text-base);
}

.chat-bubble__text :deep(p) {
  margin: 0;
}

.chat-bubble__text :deep(p + p) {
  margin-top: var(--space-2);
}

/* Streaming cursor */
.streaming-cursor::after {
  content: '';
  display: inline-block;
  width: 2px;
  height: 1em;
  background: currentColor;
  margin-left: 2px;
  animation: blink 1s step-end infinite;
  vertical-align: text-bottom;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: var(--space-1) 0;
}

.typing-indicator .dot {
  width: 8px;
  height: 8px;
  background: var(--color-neutral-400);
  border-radius: var(--radius-full);
  animation: typing-dots 1.4s ease-in-out infinite;
}

.typing-indicator .dot:nth-child(1) { animation-delay: 0ms; }
.typing-indicator .dot:nth-child(2) { animation-delay: 160ms; }
.typing-indicator .dot:nth-child(3) { animation-delay: 320ms; }

@keyframes typing-dots {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

/* Metadata */
.chat-bubble__meta {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0 var(--space-2);
}

.chat-bubble__time {
  font-size: 11px;
  color: var(--color-neutral-400);
}

.chat-bubble__status {
  display: flex;
  align-items: center;
}

.chat-bubble__status :deep(svg) {
  width: 14px;
  height: 14px;
  color: var(--color-neutral-400);
}

.chat-bubble__status .text-primary :deep(svg) {
  color: var(--color-primary-500);
}

.chat-bubble__status .text-error :deep(svg) {
  color: var(--color-error-500);
}

/* Message entrance animation */
@keyframes message-in {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .chat-bubble__avatar-icon {
    background: rgba(0, 168, 107, 0.2);
    color: var(--color-primary-400);
  }

  .chat-bubble--ai {
    background: var(--color-neutral-800);
    color: var(--color-neutral-100);
  }

  .typing-indicator .dot {
    background: var(--color-neutral-500);
  }
}
</style>
