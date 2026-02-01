<script setup lang="ts">
/**
 * AppFooter - App footer component for non-tab pages
 * Shows legal links, contact info, and optional elements
 *
 * Typically used on:
 * - Landing pages
 * - Auth pages
 * - Legal/static pages
 *
 * @example
 * <AppFooter />
 *
 * @example
 * <AppFooter
 *   :show-social="true"
 *   :show-language="true"
 *   :compact="true"
 * />
 */

interface Props {
  // Show social media links
  showSocial?: boolean
  // Show language selector
  showLanguage?: boolean
  // Compact mode (less padding, single line)
  compact?: boolean
  // Show app version
  showVersion?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSocial: false,
  showLanguage: false,
  compact: false,
  showVersion: false,
})

const { t } = useI18n()
const config = useRuntimeConfig()

// Current year for copyright
const currentYear = new Date().getFullYear()

// App version from config
const appVersion = computed(() => config.public.appVersion || '1.0.0')

// Footer links
const legalLinks = [
  { path: '/terms', label: 'footer.terms' },
  { path: '/privacy', label: 'footer.privacy' },
  { path: '/about', label: 'footer.about' },
]

// Social links (using placeholders - update with actual URLs)
const socialLinks = [
  { name: 'Facebook', icon: 'simple-icons:facebook', url: 'https://facebook.com/indlela' },
  { name: 'Twitter', icon: 'simple-icons:x', url: 'https://x.com/indlela' },
  { name: 'Instagram', icon: 'simple-icons:instagram', url: 'https://instagram.com/indlela' },
  { name: 'WhatsApp', icon: 'simple-icons:whatsapp', url: 'https://wa.me/27123456789' },
]

// Contact info
const contactEmail = 'support@indlela.co.za'
const contactPhone = '+27 12 345 6789'
</script>

<template>
  <footer
    :class="[
      'app-footer',
      { 'app-footer--compact': compact },
    ]"
  >
    <div class="app-footer__container">
      <!-- Main content section -->
      <div v-if="!compact" class="app-footer__main">
        <!-- Brand section -->
        <div class="app-footer__brand">
          <div class="app-footer__logo">
            <img
              src="/icons/logo.svg"
              alt="Indlela"
              width="28"
              height="28"
              loading="lazy"
            />
            <span>Indlela</span>
          </div>
          <p class="app-footer__tagline">
            {{ t('footer.tagline', 'Connecting communities with trusted service providers') }}
          </p>
        </div>

        <!-- Contact section -->
        <div class="app-footer__contact">
          <h4 class="app-footer__heading">{{ t('footer.contact', 'Contact') }}</h4>
          <a :href="`mailto:${contactEmail}`" class="app-footer__contact-link">
            <Icon name="heroicons:envelope" />
            {{ contactEmail }}
          </a>
          <a :href="`tel:${contactPhone.replace(/\s/g, '')}`" class="app-footer__contact-link">
            <Icon name="heroicons:phone" />
            {{ contactPhone }}
          </a>
        </div>

        <!-- Links section -->
        <div class="app-footer__links">
          <h4 class="app-footer__heading">{{ t('footer.links', 'Links') }}</h4>
          <nav aria-label="Footer navigation">
            <NuxtLink
              v-for="link in legalLinks"
              :key="link.path"
              :to="link.path"
              class="app-footer__link"
            >
              {{ t(link.label) }}
            </NuxtLink>
          </nav>
        </div>

        <!-- Social section -->
        <div v-if="showSocial" class="app-footer__social">
          <h4 class="app-footer__heading">{{ t('footer.follow', 'Follow Us') }}</h4>
          <div class="app-footer__social-links">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.url"
              target="_blank"
              rel="noopener noreferrer"
              class="app-footer__social-link"
              :aria-label="social.name"
            >
              <Icon :name="social.icon" />
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="app-footer__bottom">
        <!-- Language selector -->
        <UiLanguageSelector v-if="showLanguage" variant="minimal" />

        <!-- Copyright -->
        <p class="app-footer__copyright">
          &copy; {{ currentYear }} Indlela.
          {{ t('footer.rights', 'All rights reserved.') }}
        </p>

        <!-- Compact mode links -->
        <nav v-if="compact" class="app-footer__compact-links" aria-label="Footer links">
          <NuxtLink
            v-for="link in legalLinks"
            :key="link.path"
            :to="link.path"
          >
            {{ t(link.label) }}
          </NuxtLink>
        </nav>

        <!-- Version -->
        <span v-if="showVersion" class="app-footer__version">
          v{{ appVersion }}
        </span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: var(--color-neutral-50);
  border-top: 1px solid var(--color-neutral-200);
  padding-bottom: env(safe-area-inset-bottom);
}

.app-footer__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
}

/* Main content grid */
.app-footer__main {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-neutral-200);
}

@media (min-width: 640px) {
  .app-footer__main {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .app-footer__main {
    grid-template-columns: 2fr 1fr 1fr 1fr;
  }
}

/* Brand */
.app-footer__brand {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.app-footer__logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-primary-600);
}

.app-footer__logo img {
  width: 28px;
  height: 28px;
}

.app-footer__tagline {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  max-width: 280px;
}

/* Section headings */
.app-footer__heading {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Contact */
.app-footer__contact {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.app-footer__contact-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out);
}

.app-footer__contact-link:hover {
  color: var(--color-primary-600);
}

.app-footer__contact-link :deep(svg) {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Links */
.app-footer__links nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.app-footer__link {
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out);
}

.app-footer__link:hover {
  color: var(--color-primary-600);
}

/* Social */
.app-footer__social-links {
  display: flex;
  gap: var(--space-3);
}

.app-footer__social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--color-neutral-100);
  border-radius: var(--radius-full);
  color: var(--color-neutral-600);
  text-decoration: none;
  transition: all var(--duration-fast) var(--ease-out);
}

.app-footer__social-link:hover {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
}

.app-footer__social-link :deep(svg) {
  width: 20px;
  height: 20px;
}

/* Bottom bar */
.app-footer__bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  text-align: center;
}

@media (min-width: 640px) {
  .app-footer__bottom {
    justify-content: space-between;
  }
}

.app-footer__copyright {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
}

.app-footer__compact-links {
  display: flex;
  gap: var(--space-4);
}

.app-footer__compact-links a {
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out);
}

.app-footer__compact-links a:hover {
  color: var(--color-primary-600);
}

.app-footer__version {
  font-size: var(--text-xs);
  color: var(--color-neutral-400);
  font-family: var(--font-mono, monospace);
}

/* Compact mode */
.app-footer--compact .app-footer__container {
  padding: var(--space-4);
}

.app-footer--compact .app-footer__bottom {
  flex-direction: column;
  gap: var(--space-2);
}

@media (min-width: 640px) {
  .app-footer--compact .app-footer__bottom {
    flex-direction: row;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .app-footer {
    background: var(--color-neutral-900);
    border-top-color: var(--color-neutral-800);
  }

  .app-footer__main {
    border-bottom-color: var(--color-neutral-800);
  }

  .app-footer__logo {
    color: var(--color-primary-400);
  }

  .app-footer__heading {
    color: var(--color-neutral-100);
  }

  .app-footer__tagline,
  .app-footer__contact-link,
  .app-footer__link {
    color: var(--color-neutral-400);
  }

  .app-footer__contact-link:hover,
  .app-footer__link:hover {
    color: var(--color-primary-400);
  }

  .app-footer__social-link {
    background: var(--color-neutral-800);
    color: var(--color-neutral-400);
  }

  .app-footer__social-link:hover {
    background: var(--color-primary-900);
    color: var(--color-primary-400);
  }

  .app-footer__copyright,
  .app-footer__compact-links a {
    color: var(--color-neutral-500);
  }

  .app-footer__compact-links a:hover {
    color: var(--color-primary-400);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .app-footer__contact-link,
  .app-footer__link,
  .app-footer__social-link,
  .app-footer__compact-links a {
    transition: none;
  }
}
</style>