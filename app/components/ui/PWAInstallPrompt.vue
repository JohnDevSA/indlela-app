<script setup lang="ts">
/**
 * PWA Install Prompt Component
 * Shows a banner prompting users to install the app
 */
const { canInstall, isInstalled, installApp } = usePWAInstall()

const isDismissed = ref(false)
const isInstalling = ref(false)

// Don't show if already installed, dismissed, or can't install
const showPrompt = computed(() => {
  return canInstall.value && !isInstalled.value && !isDismissed.value
})

const handleInstall = async () => {
  isInstalling.value = true
  try {
    const success = await installApp()
    if (!success) {
      // User dismissed, hide prompt
      isDismissed.value = true
    }
  } finally {
    isInstalling.value = false
  }
}

const dismiss = () => {
  isDismissed.value = true
  // Store dismissal in localStorage to remember across sessions
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }
}

// Check if user previously dismissed (within last 7 days)
onMounted(() => {
  if (typeof localStorage !== 'undefined') {
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed')
    if (dismissedAt) {
      const dismissedDate = parseInt(dismissedAt, 10)
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      if (dismissedDate > sevenDaysAgo) {
        isDismissed.value = true
      }
    }
  }
})
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="showPrompt"
      class="pwa-install-prompt"
    >
      <div class="pwa-install-prompt__content">
        <div class="pwa-install-prompt__icon">
          <Icon name="heroicons:device-phone-mobile" size="24" />
        </div>
        <div class="pwa-install-prompt__text">
          <p class="pwa-install-prompt__title">Install Indlela</p>
          <p class="pwa-install-prompt__description">
            Add to home screen for quick access
          </p>
        </div>
      </div>
      <div class="pwa-install-prompt__actions">
        <button
          class="pwa-install-prompt__dismiss"
          @click="dismiss"
          aria-label="Dismiss install prompt"
        >
          <Icon name="heroicons:x-mark" size="20" />
        </button>
        <button
          class="pwa-install-prompt__install"
          :disabled="isInstalling"
          @click="handleInstall"
        >
          <Icon
            v-if="isInstalling"
            name="heroicons:arrow-path"
            size="16"
            class="animate-spin"
          />
          <span v-else>Install</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  bottom: calc(68px + env(safe-area-inset-bottom, 0px));
  left: 16px;
  right: 16px;
  background: var(--color-surface);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  border: 1px solid var(--color-border);
}

.pwa-install-prompt__content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.pwa-install-prompt__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pwa-install-prompt__text {
  flex: 1;
  min-width: 0;
}

.pwa-install-prompt__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.pwa-install-prompt__description {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}

.pwa-install-prompt__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.pwa-install-prompt__dismiss {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pwa-install-prompt__dismiss:hover {
  background: var(--color-surface-hover);
}

.pwa-install-prompt__install {
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  border: none;
  background: var(--color-primary);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background-color 0.2s, transform 0.1s;
}

.pwa-install-prompt__install:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.pwa-install-prompt__install:active:not(:disabled) {
  transform: scale(0.98);
}

.pwa-install-prompt__install:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Spinning animation for loading */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
