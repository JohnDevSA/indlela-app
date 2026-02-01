<script setup lang="ts">
/**
 * Privacy Policy Page
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
      :title="t('footer.privacy')"
      :show-back="true"
      :show-offline-bar="false"
    />

    <main class="static-page__content">
      <div class="static-page__header">
        <h1>{{ t('footer.privacy') }}</h1>
        <p class="last-updated">Last updated: {{ lastUpdated }}</p>
      </div>

      <div class="static-page__body">
        <section class="legal-section">
          <h2>1. Introduction</h2>
          <p>
            Indlela ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </p>
          <p>
            We comply with the Protection of Personal Information Act (POPIA) of South Africa and other applicable data protection laws.
          </p>
        </section>

        <section class="legal-section">
          <h2>2. Information We Collect</h2>
          <h3>Personal Information</h3>
          <ul>
            <li>Name and contact details (phone number, email)</li>
            <li>South African ID number (for provider verification)</li>
            <li>Location data (for service matching)</li>
            <li>Profile photos and service descriptions</li>
          </ul>
          <h3>Usage Information</h3>
          <ul>
            <li>App usage patterns and preferences</li>
            <li>Device information and identifiers</li>
            <li>Transaction and booking history</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>3. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul>
            <li>Provide and improve our services</li>
            <li>Match customers with service providers</li>
            <li>Process payments and transactions</li>
            <li>Send service notifications and updates</li>
            <li>Verify identity and prevent fraud</li>
            <li>Resolve disputes and provide support</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>4. Information Sharing</h2>
          <p>We may share your information with:</p>
          <ul>
            <li><strong>Service providers:</strong> To facilitate bookings</li>
            <li><strong>Payment processors:</strong> To process transactions (Yoco)</li>
            <li><strong>Legal authorities:</strong> When required by law</li>
            <li><strong>Business partners:</strong> With your consent</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>
        </section>

        <section class="legal-section">
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information, including:
          </p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Secure authentication mechanisms (OTP)</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and employee training</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>6. Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain information for legal compliance, dispute resolution, or legitimate business purposes.
          </p>
        </section>

        <section class="legal-section">
          <h2>7. Your Rights (POPIA)</h2>
          <p>Under POPIA, you have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Lodge a complaint with the Information Regulator</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>8. Offline Data</h2>
          <p>
            Our app supports offline functionality. Data stored locally on your device is encrypted and synchronized when you reconnect. You can clear local data at any time through the app settings.
          </p>
        </section>

        <section class="legal-section">
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. We will notify you of significant changes through the app or via email. Your continued use of the app after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section class="legal-section">
          <h2>10. Contact Us</h2>
          <p>
            For privacy-related questions or to exercise your rights, contact our Information Officer:
          </p>
          <p>
            <strong>Email:</strong> privacy@indlela.co.za<br />
            <strong>Phone:</strong> +27 12 345 6789<br />
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

.legal-section h3 {
  margin: var(--space-4) 0 var(--space-2);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-800);
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

  .legal-section h3 {
    color: var(--color-neutral-200);
  }

  .legal-section p,
  .legal-section li {
    color: var(--color-neutral-300);
  }
}
</style>