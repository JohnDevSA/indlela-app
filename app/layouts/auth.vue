<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue'
</script>

<template>
  <IonPage>
    <IonContent class="auth-layout" :fullscreen="true">
      <div class="auth-container">
        <!-- Logo Section -->
        <div class="auth-header">
          <div class="logo">
            <img src="/icons/logo.svg" alt="Indlela" width="80" height="80" />
          </div>
          <h1 class="app-name">Indlela</h1>
          <p class="tagline">{{ $t('auth.tagline') }}</p>
        </div>

        <!-- Content Slot -->
        <div class="auth-content">
          <slot />
        </div>

        <!-- Footer -->
        <div class="auth-footer">
          <p class="text-muted">{{ $t('auth.footer_text') }}</p>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.auth-layout {
  --background: linear-gradient(180deg, #00A86B 0%, #008556 100%);
}

.auth-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 24px;
  padding-top: calc(24px + env(safe-area-inset-top));
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

.auth-header {
  text-align: center;
  padding: 40px 0;
}

.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.logo img {
  width: 60px;
  height: 60px;
}

.app-name {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px;
}

.tagline {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.auth-content {
  flex: 1;
  background: white;
  border-radius: 24px;
  padding: 32px 24px;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.1);
}

.auth-footer {
  text-align: center;
  padding: 24px 0 0;
}

.auth-footer p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}
</style>