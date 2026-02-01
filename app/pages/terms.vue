<script setup lang="ts">
/**
 * Terms of Service Page
 * Static legal page with AppHeader and AppFooter
 */

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()

// Last updated date
const lastUpdated = '1 December 2024'
</script>

<template>
  <div class="static-page">
    <AppHeader
      :title="t('footer.terms')"
      :show-back="true"
      :show-offline-bar="false"
    />

    <main class="static-page__content">
      <div class="static-page__header">
        <h1>{{ t('footer.terms') }}</h1>
        <p class="last-updated">Last updated: {{ lastUpdated }}</p>
      </div>

      <div class="static-page__body">
        <section class="legal-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Indlela mobile application ("App"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
          </p>
        </section>

        <section class="legal-section">
          <h2>2. Description of Service</h2>
          <p>
            Indlela is a marketplace platform that connects customers with local service providers in South African townships. We facilitate the booking and payment process but are not directly responsible for the services rendered by providers.
          </p>
        </section>

        <section class="legal-section">
          <h2>3. User Registration</h2>
          <p>To use our services, you must:</p>
          <ul>
            <li>Be at least 18 years of age</li>
            <li>Provide accurate and complete registration information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>4. Service Provider Requirements</h2>
          <p>Service providers on Indlela must:</p>
          <ul>
            <li>Complete identity verification (valid SA ID)</li>
            <li>Provide accurate service descriptions and pricing</li>
            <li>Maintain professional conduct with customers</li>
            <li>Comply with all applicable South African laws</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>5. Fees and Payments</h2>
          <p>
            Indlela charges a 12% commission on each completed booking, payable by the customer. A flat booking fee of R10-15 may also apply. All payments are processed securely through our payment partner, Yoco.
          </p>
        </section>

        <section class="legal-section">
          <h2>6. Cancellation Policy</h2>
          <p>
            Customers may cancel bookings up to 24 hours before the scheduled service time for a full refund. Cancellations within 24 hours may incur a cancellation fee. Service providers who cancel may face account restrictions.
          </p>
        </section>

        <section class="legal-section">
          <h2>7. Dispute Resolution</h2>
          <p>
            In case of disputes between customers and service providers, Indlela will mediate to reach a fair resolution. Users agree to attempt resolution through our platform before seeking external remedies.
          </p>
        </section>

        <section class="legal-section">
          <h2>8. Limitation of Liability</h2>
          <p>
            Indlela acts as an intermediary platform and is not liable for the quality, safety, or legality of services provided. We do not guarantee the accuracy of provider information or the outcome of any service engagement.
          </p>
        </section>

        <section class="legal-section">
          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Users will be notified of significant changes via the app or email. Continued use of the service after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section class="legal-section">
          <h2>10. Contact Information</h2>
          <p>
            For questions about these terms, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> legal@indlela.co.za<br />
            <strong>Address:</strong> Johannesburg, South Africa
          </p>
        </section>
      </div>
    </main>

    <AppFooter compact :show-version="true" />
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

.static-page__header {
  margin-bottom: var(--space-8);
}

.static-page__header h1 {
  margin: 0 0 var(--space-2);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-neutral-900);
}

.last-updated {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
}

.static-page__body {
  background: var(--color-neutral-0);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.legal-section {
  margin-bottom: var(--space-6);
}

.legal-section:last-child {
  margin-bottom: 0;
}

.legal-section h2 {
  margin: 0 0 var(--space-3);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
}

.legal-section p {
  margin: 0 0 var(--space-3);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-neutral-700);
}

.legal-section p:last-child {
  margin-bottom: 0;
}

.legal-section ul {
  margin: var(--space-3) 0;
  padding-left: var(--space-6);
}

.legal-section li {
  margin-bottom: var(--space-2);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-neutral-700);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .static-page {
    background: var(--color-neutral-950);
  }

  .static-page__header h1 {
    color: var(--color-neutral-100);
  }

  .last-updated {
    color: var(--color-neutral-400);
  }

  .static-page__body {
    background: var(--color-neutral-900);
  }

  .legal-section h2 {
    color: var(--color-neutral-100);
  }

  .legal-section p,
  .legal-section li {
    color: var(--color-neutral-300);
  }
}
</style>