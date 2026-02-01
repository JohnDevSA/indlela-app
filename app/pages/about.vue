<script setup lang="ts">
/**
 * About Page
 * Information about Indlela with AppHeader and AppFooter
 */

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const config = useRuntimeConfig()

// Team/Stats info
const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '5K+', label: 'Service Providers' },
  { value: '50K+', label: 'Completed Bookings' },
  { value: '6', label: 'Languages Supported' },
]

const values = [
  {
    icon: 'heroicons:users',
    title: 'Community First',
    description: 'We prioritize the needs of township communities, creating economic opportunities locally.',
  },
  {
    icon: 'heroicons:shield-check',
    title: 'Trust & Safety',
    description: 'Every provider is verified. Every transaction is secure. Your safety is our priority.',
  },
  {
    icon: 'heroicons:device-phone-mobile',
    title: 'Accessible Technology',
    description: 'Designed for low-data environments with offline support and multiple languages.',
  },
  {
    icon: 'heroicons:currency-dollar',
    title: 'Fair Economics',
    description: 'Transparent pricing with fair commissions that support both customers and providers.',
  },
]
</script>

<template>
  <div class="static-page">
    <AppHeader
      :title="t('footer.about')"
      :show-back="true"
      :show-offline-bar="false"
    />

    <main class="static-page__content">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-logo">
          <img src="/icons/logo.svg" alt="Indlela" width="64" height="64" />
        </div>
        <h1 class="hero-title">Indlela</h1>
        <p class="hero-tagline">"The Way" in isiZulu</p>
        <p class="hero-description">
          Connecting South African township communities with trusted local service providers through innovative, accessible mobile technology.
        </p>
      </section>

      <!-- Stats Section -->
      <section class="stats-section">
        <div class="stats-grid">
          <div v-for="stat in stats" :key="stat.label" class="stat-card">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </section>

      <!-- Mission Section -->
      <section class="content-section">
        <h2>Our Mission</h2>
        <p>
          Indlela was created to address a fundamental challenge in South African townships: the disconnect between skilled service providers and customers who need their services. Traditional methods of finding reliable help - word of mouth, street advertising, or chance encounters - are inefficient and often unreliable.
        </p>
        <p>
          We believe that everyone deserves access to quality services, and every skilled worker deserves the opportunity to grow their business. Indlela bridges this gap through technology that's designed specifically for our communities.
        </p>
      </section>

      <!-- Values Section -->
      <section class="content-section">
        <h2>Our Values</h2>
        <div class="values-grid">
          <div v-for="value in values" :key="value.title" class="value-card">
            <div class="value-icon">
              <Icon :name="value.icon" />
            </div>
            <h3 class="value-title">{{ value.title }}</h3>
            <p class="value-description">{{ value.description }}</p>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="content-section">
        <h2>Why Indlela?</h2>
        <ul class="feature-list">
          <li>
            <Icon name="heroicons:check-circle" class="check-icon" />
            <span><strong>Voice-First Design:</strong> Order services in your language using voice commands</span>
          </li>
          <li>
            <Icon name="heroicons:check-circle" class="check-icon" />
            <span><strong>Offline Capable:</strong> Book and manage services even without internet connection</span>
          </li>
          <li>
            <Icon name="heroicons:check-circle" class="check-icon" />
            <span><strong>6 SA Languages:</strong> English, isiZulu, isiXhosa, Afrikaans, Sesotho, Setswana</span>
          </li>
          <li>
            <Icon name="heroicons:check-circle" class="check-icon" />
            <span><strong>Verified Providers:</strong> ID verification and reviews ensure quality</span>
          </li>
          <li>
            <Icon name="heroicons:check-circle" class="check-icon" />
            <span><strong>Secure Payments:</strong> Card, EFT, or cash payment options</span>
          </li>
          <li>
            <Icon name="heroicons:check-circle" class="check-icon" />
            <span><strong>Low Data Usage:</strong> Optimized for South African mobile networks</span>
          </li>
        </ul>
      </section>

      <!-- Contact Section -->
      <section class="content-section">
        <h2>Get in Touch</h2>
        <div class="contact-card">
          <p>Have questions or feedback? We'd love to hear from you!</p>
          <div class="contact-links">
            <a href="mailto:hello@indlela.co.za" class="contact-link">
              <Icon name="heroicons:envelope" />
              hello@indlela.co.za
            </a>
            <a href="tel:+27123456789" class="contact-link">
              <Icon name="heroicons:phone" />
              +27 12 345 6789
            </a>
          </div>
        </div>
      </section>

      <!-- Version Info -->
      <section class="version-section">
        <p>Version {{ config.public.appVersion || '1.0.0' }}</p>
        <p>Made with love in South Africa</p>
      </section>
    </main>

    <AppFooter :show-social="true" :show-language="true" />
  </div>
</template>

<style scoped>
.static-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-neutral-50);
}

.static-page__content {
  flex: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
  width: 100%;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  margin-bottom: var(--space-6);
}

.hero-logo {
  margin-bottom: var(--space-4);
}

.hero-logo img {
  width: 64px;
  height: 64px;
}

.hero-title {
  margin: 0 0 var(--space-1);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-primary-600);
}

.hero-tagline {
  margin: 0 0 var(--space-4);
  font-size: var(--text-lg);
  font-style: italic;
  color: var(--color-neutral-500);
}

.hero-description {
  margin: 0;
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-neutral-700);
  max-width: 600px;
  margin: 0 auto;
}

/* Stats Section */
.stats-section {
  margin-bottom: var(--space-8);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  background: var(--color-primary-500);
  color: white;
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  text-align: center;
}

.stat-value {
  display: block;
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  line-height: 1;
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: var(--text-sm);
  opacity: 0.9;
}

/* Content Sections */
.content-section {
  background: var(--color-neutral-0);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.content-section h2 {
  margin: 0 0 var(--space-4);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-neutral-900);
}

.content-section p {
  margin: 0 0 var(--space-4);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-neutral-700);
}

.content-section p:last-child {
  margin-bottom: 0;
}

/* Values Grid */
.values-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .values-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.value-card {
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-lg);
}

.value-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--color-primary-100);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-3);
}

.value-icon :deep(svg) {
  width: 24px;
  height: 24px;
  color: var(--color-primary-600);
}

.value-title {
  margin: 0 0 var(--space-2);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
}

.value-description {
  margin: 0;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-neutral-600);
}

/* Feature List */
.feature-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.feature-list li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-neutral-700);
}

.feature-list li:last-child {
  margin-bottom: 0;
}

.check-icon {
  width: 20px;
  height: 20px;
  color: var(--color-success-500);
  flex-shrink: 0;
  margin-top: 2px;
}

/* Contact Card */
.contact-card {
  background: var(--color-primary-50);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.contact-card p {
  margin: 0 0 var(--space-3);
  color: var(--color-neutral-700);
}

.contact-links {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

@media (min-width: 640px) {
  .contact-links {
    flex-direction: row;
    gap: var(--space-6);
  }
}

.contact-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-primary-600);
  text-decoration: none;
}

.contact-link:hover {
  color: var(--color-primary-700);
}

.contact-link :deep(svg) {
  width: 20px;
  height: 20px;
}

/* Version Section */
.version-section {
  text-align: center;
  padding: var(--space-6) 0;
  color: var(--color-neutral-500);
  font-size: var(--text-sm);
}

.version-section p {
  margin: 0;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .static-page {
    background: var(--color-neutral-950);
  }

  .hero-title {
    color: var(--color-primary-400);
  }

  .hero-tagline {
    color: var(--color-neutral-400);
  }

  .hero-description {
    color: var(--color-neutral-300);
  }

  .stat-card {
    background: var(--color-primary-600);
  }

  .content-section {
    background: var(--color-neutral-900);
  }

  .content-section h2 {
    color: var(--color-neutral-100);
  }

  .content-section p,
  .feature-list li {
    color: var(--color-neutral-300);
  }

  .value-card {
    background: var(--color-neutral-800);
  }

  .value-icon {
    background: rgba(0, 168, 107, 0.15);
  }

  .value-icon :deep(svg) {
    color: var(--color-primary-400);
  }

  .value-title {
    color: var(--color-neutral-100);
  }

  .value-description {
    color: var(--color-neutral-400);
  }

  .contact-card {
    background: rgba(0, 168, 107, 0.1);
  }

  .contact-card p {
    color: var(--color-neutral-300);
  }

  .contact-link {
    color: var(--color-primary-400);
  }

  .contact-link:hover {
    color: var(--color-primary-300);
  }
}
</style>