<script setup lang="ts">
/**
 * PWA Update Prompt Component
 * Shows a toast/banner when a new version of the app is available
 */
const { needRefresh, updateServiceWorker, closeRefreshPrompt } = usePWAInstall()

const isUpdating = ref(false)

const handleUpdate = async () => {
  isUpdating.value = true
  try {
    await updateServiceWorker()
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <Transition name="slide-down">
    <div
      v-if="needRefresh"
      class="pwa-update-prompt"
    >
      <div class="pwa-update-prompt__content">
        <Icon
          name="heroicons:arrow-path"
          size="20"
          class="pwa-update-prompt__icon"
        />
        <p class="pwa-update-prompt__text">
          A new version is available
        </p>
      </div>
      <div class="pwa-update-prompt__actions">
        <button
          class="pwa-update-prompt__later"
          @click="closeRefreshPrompt"
        >
          Later
        </button>
        <button
          class="pwa-update-prompt__update"
          :disabled="isUpdating"
          @click="handleUpdate"
        >
          <Icon
            v-if="isUpdating"
            name="heroicons:arrow-path"
            size="16"
            class="animate-spin"
          />
          <span v-else>Update</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.pwa-update-prompt {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 8px);
  left: 16px;
  right: 16px;
  background: var(--color-primary);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  color: white;
}

.pwa-update-prompt__content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.pwa-update-prompt__icon {
  flex-shrink: 0;
  opacity: 0.9;
}

.pwa-update-prompt__text {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.pwa-update-prompt__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.pwa-update-prompt__later {
  height: 32px;
  padding: 0 12px;
  border-radius: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pwa-update-prompt__later:hover {
  background: rgba(255, 255, 255, 0.3);
}

.pwa-update-prompt__update {
  height: 32px;
  padding: 0 14px;
  border-radius: 6px;
  border: none;
  background: white;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background-color 0.2s, transform 0.1s;
}

.pwa-update-prompt__update:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.9);
}

.pwa-update-prompt__update:active:not(:disabled) {
  transform: scale(0.98);
}

.pwa-update-prompt__update:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Slide down animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
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
