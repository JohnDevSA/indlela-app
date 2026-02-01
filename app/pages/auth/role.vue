<script setup lang="ts">
/**
 * Role Selection Page - Choose Customer or Provider
 * Users select their primary role before phone authentication
 */
import { IonPage, IonContent } from '@ionic/vue'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

const { t } = useI18n()
const router = useRouter()
const { haptic } = useAnimation()

// Selected role state
const selectedRole = ref<'customer' | 'provider' | null>(null)

// Role options with details
const roles = [
  {
    id: 'customer' as const,
    icon: 'heroicons:magnifying-glass-circle',
    title: 'Find Services',
    subtitle: 'I need help with tasks',
    description: 'Browse providers, book services, and get things done.',
    features: ['Find trusted providers', 'Book instantly', 'Pay securely'],
    color: 'primary',
  },
  {
    id: 'provider' as const,
    icon: 'heroicons:briefcase',
    title: 'Offer Services',
    subtitle: 'I want to earn money',
    description: 'List your skills, set your rates, and grow your business.',
    features: ['Set your own prices', 'Flexible schedule', 'Build your reputation'],
    color: 'secondary',
  },
]

const selectRole = (role: 'customer' | 'provider') => {
  haptic('light')
  selectedRole.value = role
}

const continueToLogin = () => {
  if (!selectedRole.value) return

  haptic('medium')
  // Store selected role in session storage for the auth flow
  sessionStorage.setItem('indlela_selected_role', selectedRole.value)
  router.push('/auth/login')
}

const goBack = () => {
  haptic('light')
  router.back()
}
</script>

<template>
  <IonPage>
    <IonContent class="role-content" :fullscreen="true">
      <div class="role-container">
        <!-- Header -->
        <div class="role-header">
          <button class="back-btn" @click="goBack">
            <Icon name="heroicons:arrow-left" />
          </button>
          <div class="header-text">
            <h1 class="page-title">How will you use Indlela?</h1>
            <p class="page-subtitle">You can always switch later in settings</p>
          </div>
        </div>

        <!-- Role Cards -->
        <div class="role-cards">
          <button
            v-for="role in roles"
            :key="role.id"
            :class="[
              'role-card',
              `role-card--${role.color}`,
              { 'role-card--selected': selectedRole === role.id }
            ]"
            @click="selectRole(role.id)"
          >
            <!-- Selection Indicator -->
            <div class="selection-indicator">
              <Icon
                v-if="selectedRole === role.id"
                name="heroicons:check-circle-solid"
                class="check-icon"
              />
              <div v-else class="empty-circle" />
            </div>

            <!-- Card Content -->
            <div class="role-icon-wrapper">
              <Icon :name="role.icon" class="role-icon" />
            </div>

            <div class="role-info">
              <h2 class="role-title">{{ role.title }}</h2>
              <p class="role-subtitle">{{ role.subtitle }}</p>
            </div>

            <!-- Features List -->
            <ul class="role-features">
              <li v-for="feature in role.features" :key="feature">
                <Icon name="heroicons:check" class="feature-check" />
                <span>{{ feature }}</span>
              </li>
            </ul>
          </button>
        </div>

        <!-- Continue Button -->
        <div class="action-section">
          <UiButton
            variant="primary"
            size="lg"
            :full-width="true"
            :disabled="!selectedRole"
            @click="continueToLogin"
          >
            Continue
            <template #icon-right>
              <Icon name="heroicons:arrow-right" />
            </template>
          </UiButton>

          <p class="switch-note">
            <Icon name="heroicons:arrows-right-left" />
            You can switch between roles anytime
          </p>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.role-content {
  --background: var(--color-neutral-50);
}

.role-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: var(--space-6);
  padding-top: calc(var(--space-4) + env(safe-area-inset-top));
  padding-bottom: calc(var(--space-6) + env(safe-area-inset-bottom));
}

/* Header */
.role-header {
  margin-bottom: var(--space-6);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  color: var(--color-neutral-600);
  cursor: pointer;
  margin-bottom: var(--space-4);
  transition: all var(--duration-fast);
}

.back-btn:hover {
  background: var(--color-neutral-100);
  color: var(--color-neutral-900);
}

.back-btn :deep(svg) {
  width: 20px;
  height: 20px;
}

.header-text {
  text-align: center;
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-neutral-900);
  margin: 0 0 var(--space-2);
}

.page-subtitle {
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
  margin: 0;
}

/* Role Cards */
.role-cards {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.role-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-6);
  background: white;
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--radius-2xl);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  text-align: center;
}

.role-card:hover {
  border-color: var(--color-neutral-300);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.role-card--selected.role-card--primary {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
}

.role-card--selected.role-card--secondary {
  border-color: #2563EB;
  background: rgba(37, 99, 235, 0.05);
}

/* Selection Indicator */
.selection-indicator {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
}

.check-icon {
  width: 28px;
  height: 28px;
  color: var(--color-primary-500);
}

.role-card--selected.role-card--secondary .check-icon {
  color: #2563EB;
}

.empty-circle {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-neutral-300);
  border-radius: 50%;
}

/* Role Icon */
.role-icon-wrapper {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-4);
  transition: all var(--duration-normal);
}

.role-card--primary .role-icon-wrapper {
  background: var(--color-primary-100);
}

.role-card--secondary .role-icon-wrapper {
  background: rgba(37, 99, 235, 0.1);
}

.role-card--selected.role-card--primary .role-icon-wrapper {
  background: var(--color-primary-500);
}

.role-card--selected.role-card--secondary .role-icon-wrapper {
  background: #2563EB;
}

.role-icon {
  width: 36px;
  height: 36px;
  transition: color var(--duration-normal);
}

.role-card--primary .role-icon {
  color: var(--color-primary-600);
}

.role-card--secondary .role-icon {
  color: #2563EB;
}

.role-card--selected .role-icon {
  color: white;
}

/* Role Info */
.role-info {
  margin-bottom: var(--space-4);
}

.role-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-neutral-900);
  margin: 0 0 var(--space-1);
}

.role-subtitle {
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
  margin: 0;
}

/* Features */
.role-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
}

.role-features li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  justify-content: center;
}

.feature-check {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.role-card--primary .feature-check {
  color: var(--color-primary-500);
}

.role-card--secondary .feature-check {
  color: #2563EB;
}

/* Action Section */
.action-section {
  padding-top: var(--space-6);
}

.switch-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin: var(--space-4) 0 0;
  font-size: var(--text-xs);
  color: var(--color-neutral-400);
}

.switch-note :deep(svg) {
  width: 14px;
  height: 14px;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .role-content {
    --background: var(--color-neutral-900);
  }

  .back-btn {
    background: var(--color-neutral-800);
    border-color: var(--color-neutral-700);
    color: var(--color-neutral-300);
  }

  .back-btn:hover {
    background: var(--color-neutral-700);
    color: white;
  }

  .page-title {
    color: white;
  }

  .page-subtitle {
    color: var(--color-neutral-400);
  }

  .role-card {
    background: var(--color-neutral-800);
    border-color: var(--color-neutral-700);
  }

  .role-card:hover {
    border-color: var(--color-neutral-600);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .role-card--selected.role-card--primary {
    background: rgba(0, 168, 107, 0.1);
    border-color: var(--color-primary-500);
  }

  .role-card--selected.role-card--secondary {
    background: rgba(37, 99, 235, 0.1);
    border-color: #2563EB;
  }

  .empty-circle {
    border-color: var(--color-neutral-600);
  }

  .role-title {
    color: white;
  }

  .role-subtitle,
  .role-features li {
    color: var(--color-neutral-400);
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .role-card {
    transition: border-color 0.1s, background-color 0.1s;
  }

  .role-card:hover {
    transform: none;
  }
}

/* Small screens */
@media (max-height: 700px) {
  .role-card {
    padding: var(--space-4);
  }

  .role-icon-wrapper {
    width: 56px;
    height: 56px;
  }

  .role-icon {
    width: 28px;
    height: 28px;
  }

  .role-features {
    display: none;
  }
}
</style>
