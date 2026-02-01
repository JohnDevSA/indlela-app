<script setup lang="ts">
/**
 * Welcome Page - First-time user landing
 * Entry point for the auth flow with value proposition
 * Emphasizes community, trust, and offline-first capabilities
 */
import { IonPage, IonContent } from '@ionic/vue'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

const { t } = useI18n()
const router = useRouter()
const { haptic } = useAnimation()

// Primary value propositions for township users
const benefits = [
  {
    icon: 'heroicons:users',
    title: t('auth.welcome.benefit_community_title'),
    description: t('auth.welcome.benefit_community_desc'),
  },
  {
    icon: 'heroicons:signal-slash',
    title: t('auth.welcome.benefit_offline_title'),
    description: t('auth.welcome.benefit_offline_desc'),
  },
  {
    icon: 'heroicons:shield-check',
    title: t('auth.welcome.benefit_verified_title'),
    description: t('auth.welcome.benefit_verified_desc'),
  },
  {
    icon: 'heroicons:banknotes',
    title: t('auth.welcome.benefit_earnings_title'),
    description: t('auth.welcome.benefit_earnings_desc'),
  },
]

const getStarted = (role?: 'customer' | 'provider') => {
  haptic('light')
  if (role) {
    // Store role and skip role selection page
    sessionStorage.setItem('indlela_selected_role', role)
    router.push('/auth/login')
  } else {
    // Go to role selection page
    router.push('/auth/role')
  }
}

const signIn = () => {
  haptic('light')
  router.push('/auth/login')
}
</script>

<template>
  <IonPage>
    <IonContent class="welcome-content" :fullscreen="true">
      <div class="welcome-container">
        <!-- Hero Section -->
        <div class="hero-section">
          <!-- Logo -->
          <div class="logo-container">
            <div class="logo">
              <Icon name="heroicons:home-modern" class="logo-icon" />
            </div>
          </div>

          <!-- App Name & Tagline -->
          <h1 class="app-name">{{ t('app.name') }}</h1>
          <p class="tagline">{{ t('auth.welcome.tagline') }}</p>

          <!-- Offline Badge -->
          <div class="offline-badge">
            <Icon name="heroicons:signal-slash" class="badge-icon" />
            <span>{{ t('auth.welcome.works_offline') }}</span>
          </div>
        </div>

        <!-- Benefits Grid - Static to save data -->
        <div class="benefits-section">
          <div class="benefits-grid">
            <div
              v-for="(benefit, index) in benefits"
              :key="benefit.title"
              class="benefit-card"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <div class="benefit-icon-wrapper">
                <Icon :name="benefit.icon" class="benefit-icon" />
              </div>
              <h3 class="benefit-title">{{ benefit.title }}</h3>
              <p class="benefit-description">{{ benefit.description }}</p>
            </div>
          </div>
        </div>

        <!-- CTA Section with Quick Actions -->
        <div class="cta-section">
          <!-- Primary Action Buttons -->
          <div class="quick-actions">
            <UiButton
              variant="primary"
              size="lg"
              :full-width="true"
              class="customer-btn"
              @click="getStarted('customer')"
            >
              <template #icon-left>
                <Icon name="heroicons:magnifying-glass-circle" />
              </template>
              {{ t('auth.welcome.find_services') }}
            </UiButton>

            <UiButton
              variant="outline"
              size="lg"
              :full-width="true"
              class="provider-btn"
              @click="getStarted('provider')"
            >
              <template #icon-left>
                <Icon name="heroicons:briefcase" />
              </template>
              {{ t('auth.welcome.offer_services') }}
            </UiButton>
          </div>

          <!-- Sign In Link -->
          <button class="sign-in-link" @click="signIn">
            {{ t('auth.welcome.already_have_account') }}
            <span>{{ t('auth.welcome.sign_in') }}</span>
          </button>
        </div>

        <!-- Footer -->
        <div class="welcome-footer">
          <p class="footer-text">{{ t('auth.footer_text') }}</p>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.welcome-content {
  --background: linear-gradient(180deg, #00A86B 0%, #007A4D 100%);
}

.welcome-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: var(--space-6);
  padding-top: calc(var(--space-6) + env(safe-area-inset-top));
  padding-bottom: calc(var(--space-6) + env(safe-area-inset-bottom));
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: var(--space-6) 0 var(--space-4);
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-4);
}

.logo {
  width: 88px;
  height: 88px;
  background: white;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: logoFadeIn 0.6s ease-out;
}

@keyframes logoFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.logo-icon {
  width: 48px;
  height: 48px;
  color: var(--color-primary-600);
}

.app-name {
  font-size: 40px;
  font-weight: 800;
  color: white;
  margin: 0 0 var(--space-2);
  letter-spacing: -0.5px;
  animation: fadeInUp 0.6s ease-out 0.1s both;
}

.tagline {
  font-size: var(--text-lg);
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 var(--space-4);
  font-weight: var(--font-medium);
  line-height: var(--leading-relaxed);
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

/* Offline Badge */
.offline-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-full);
  color: white;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  animation: fadeInUp 0.6s ease-out 0.3s both;
}

.badge-icon {
  width: 16px;
  height: 16px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Benefits Section */
.benefits-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--space-6) 0;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

.benefit-card {
  padding: var(--space-4);
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  text-align: center;
  animation: benefitFadeIn 0.5s ease-out both;
}

@keyframes benefitFadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.benefit-icon-wrapper {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-3);
}

.benefit-icon {
  width: 24px;
  height: 24px;
  color: white;
}

.benefit-title {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: white;
  margin: 0 0 var(--space-1);
  line-height: var(--leading-tight);
}

.benefit-description {
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  line-height: var(--leading-snug);
}

/* CTA Section */
.cta-section {
  padding: var(--space-4) 0;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.customer-btn {
  background: white;
  color: var(--color-primary-600);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.customer-btn:deep(.ui-button) {
  background: white;
  color: var(--color-primary-600);
}

.customer-btn:deep(.ui-button:hover) {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 6px 32px rgba(0, 0, 0, 0.25);
}

.provider-btn {
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
}

.provider-btn:deep(.ui-button) {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
}

.provider-btn:deep(.ui-button:hover) {
  background: rgba(255, 255, 255, 0.15);
  border-color: white;
}

.sign-in-link {
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: var(--text-base);
  cursor: pointer;
  padding: var(--space-3);
  min-height: var(--touch-target-min);
  transition: color var(--duration-normal);
}

.sign-in-link:hover {
  color: white;
}

.sign-in-link span {
  color: white;
  font-weight: var(--font-semibold);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* Footer */
.welcome-footer {
  text-align: center;
  padding-top: var(--space-4);
}

.footer-text {
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: var(--leading-relaxed);
}

/* Responsive - Small screens */
@media (max-width: 374px) {
  .benefits-grid {
    grid-template-columns: 1fr;
  }

  .benefit-card {
    padding: var(--space-3);
  }
}

/* Responsive - Short screens */
@media (max-height: 700px) {
  .hero-section {
    padding: var(--space-4) 0 var(--space-3);
  }

  .logo {
    width: 72px;
    height: 72px;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
  }

  .app-name {
    font-size: 32px;
  }

  .tagline {
    font-size: var(--text-base);
  }

  .benefits-section {
    padding: var(--space-4) 0;
  }

  .benefit-card {
    padding: var(--space-3);
  }

  .benefit-icon-wrapper {
    width: 40px;
    height: 40px;
  }

  .benefit-icon {
    width: 20px;
    height: 20px;
  }
}

/* Very short screens - prioritize CTA */
@media (max-height: 600px) {
  .benefits-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-2);
  }

  .benefit-description {
    display: none;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .logo,
  .app-name,
  .tagline,
  .offline-badge,
  .benefit-card {
    animation: none;
  }
}

/* Dark mode support (if system preference) */
@media (prefers-color-scheme: dark) {
  .welcome-content {
    --background: linear-gradient(180deg, #00A86B 0%, #006B42 100%);
  }
}
</style>
