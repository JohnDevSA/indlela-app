<script setup lang="ts">
/**
 * Welcome Page - First-time user landing
 * Entry point for the auth flow with value proposition
 */
import { IonPage, IonContent } from '@ionic/vue'

definePageMeta({
  layout: false,
})

const { t } = useI18n()
const router = useRouter()
const { haptic } = useAnimation()

// Feature highlights
const features = [
  {
    icon: 'heroicons:magnifying-glass',
    title: 'Find Services',
    description: 'Discover trusted providers in your community',
  },
  {
    icon: 'heroicons:calendar-days',
    title: 'Book Easily',
    description: 'Schedule at your convenience, even offline',
  },
  {
    icon: 'heroicons:shield-check',
    title: 'Safe & Secure',
    description: 'Verified providers you can trust',
  },
]

// Current feature for carousel (simple auto-rotate)
const currentFeature = ref(0)
let featureInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  featureInterval = setInterval(() => {
    currentFeature.value = (currentFeature.value + 1) % features.length
  }, 3000)
})

onUnmounted(() => {
  if (featureInterval) clearInterval(featureInterval)
})

const getStarted = () => {
  haptic('light')
  router.push('/auth/role')
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
          <h1 class="app-name">Indlela</h1>
          <p class="tagline">{{ t('auth.tagline') }}</p>
        </div>

        <!-- Features Carousel -->
        <div class="features-section">
          <div class="feature-carousel">
            <TransitionGroup name="feature-fade">
              <div
                v-for="(feature, index) in features"
                v-show="currentFeature === index"
                :key="feature.title"
                class="feature-card"
              >
                <div class="feature-icon-wrapper">
                  <Icon :name="feature.icon" class="feature-icon" />
                </div>
                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-description">{{ feature.description }}</p>
              </div>
            </TransitionGroup>
          </div>

          <!-- Dots Indicator -->
          <div class="dots-indicator">
            <button
              v-for="(_, index) in features"
              :key="index"
              :class="['dot', { active: currentFeature === index }]"
              @click="currentFeature = index"
            />
          </div>
        </div>

        <!-- CTA Section -->
        <div class="cta-section">
          <UiButton
            variant="primary"
            size="lg"
            :full-width="true"
            class="get-started-btn"
            @click="getStarted"
          >
            Get Started
          </UiButton>

          <button class="sign-in-link" @click="signIn">
            Already have an account? <span>Sign in</span>
          </button>
        </div>

        <!-- Footer -->
        <div class="welcome-footer">
          <p class="footer-text">By continuing, you agree to our Terms of Service</p>
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
  padding: var(--space-8) 0 var(--space-6);
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
}

.tagline {
  font-size: var(--text-lg);
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: var(--font-medium);
}

/* Features Section */
.features-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--space-8) 0;
}

.feature-carousel {
  position: relative;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-card {
  position: absolute;
  width: 100%;
  text-align: center;
  padding: var(--space-6);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-2xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-icon-wrapper {
  width: 64px;
  height: 64px;
  background: white;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-4);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 32px;
  height: 32px;
  color: var(--color-primary-600);
}

.feature-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: white;
  margin: 0 0 var(--space-2);
}

.feature-description {
  font-size: var(--text-base);
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: var(--leading-relaxed);
}

/* Feature transition */
.feature-fade-enter-active,
.feature-fade-leave-active {
  transition: all 0.4s ease;
}

.feature-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.feature-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Dots Indicator */
.dots-indicator {
  display: flex;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-6);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.dot.active {
  width: 24px;
  background: white;
}

/* CTA Section */
.cta-section {
  padding: var(--space-4) 0;
}

.get-started-btn {
  --background: white;
  --color: var(--color-primary-600);
  font-weight: var(--font-bold);
  font-size: var(--text-lg);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.get-started-btn:deep(.ui-button) {
  background: white !important;
  color: var(--color-primary-600) !important;
}

.sign-in-link {
  display: block;
  width: 100%;
  margin-top: var(--space-4);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--text-base);
  cursor: pointer;
  padding: var(--space-2);
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
}

/* Responsive */
@media (max-height: 600px) {
  .hero-section {
    padding: var(--space-4) 0;
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

  .features-section {
    padding: var(--space-4) 0;
  }

  .feature-carousel {
    min-height: 150px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .feature-fade-enter-active,
  .feature-fade-leave-active {
    transition: opacity 0.2s;
  }

  .feature-fade-enter-from,
  .feature-fade-leave-to {
    transform: none;
  }
}
</style>
