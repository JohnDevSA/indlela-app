<script setup lang="ts">
import { IonIcon, IonButton } from '@ionic/vue'

defineProps<{
  icon: string
  title: string
  message?: string
  actionLabel?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="empty-state">
    <IonIcon :icon="icon" class="icon" />
    <h3 class="title">{{ title }}</h3>
    <p v-if="message" class="message">{{ message }}</p>
    <IonButton
      v-if="actionLabel"
      fill="outline"
      @click="emit('action')"
      class="action-button"
    >
      {{ actionLabel }}
    </IonButton>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.icon {
  font-size: 64px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-text-color);
}

.message {
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--ion-color-medium);
  max-width: 280px;
}

.action-button {
  --border-radius: 8px;
}
</style>