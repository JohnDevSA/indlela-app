// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },

  // Use app/ directory for source files
  srcDir: 'app/',

  // Future-proof settings
  future: {
    compatibilityVersion: 4,
  },

  // Modules
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt',
  ],

  // PWA Configuration
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Indlela - The Way',
      short_name: 'Indlela',
      description: 'Connect with trusted service providers in your community',
      theme_color: '#00A86B',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      lang: 'en',
      categories: ['lifestyle', 'business', 'utilities'],
      icons: [
        {
          src: '/icons/pwa-64x64.svg',
          sizes: '64x64',
          type: 'image/svg+xml',
        },
        {
          src: '/icons/pwa-192x192.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
        },
        {
          src: '/icons/pwa-512x512.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
        },
        {
          src: '/icons/pwa-512x512.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any',
        },
        {
          src: '/icons/maskable-icon-512x512.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'maskable',
        },
      ],
      screenshots: [
        {
          src: '/screenshots/home.png',
          sizes: '390x844',
          type: 'image/png',
          form_factor: 'narrow',
          label: 'Home Screen',
        },
      ],
    },
    workbox: {
      // Precache all static assets
      globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,webp,woff,woff2,ico}'],

      // Runtime caching strategies
      runtimeCaching: [
        // API calls - Network first with cache fallback
        {
          urlPattern: /^https?:\/\/.*\/api\/v1\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 30, // 30 minutes
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
            networkTimeoutSeconds: 10,
          },
        },
        // Service categories - Cache first (rarely changes)
        {
          urlPattern: /^https?:\/\/.*\/api\/v1\/services\/categories.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'categories-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24, // 24 hours
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // Provider images - Cache first with long expiry
        {
          urlPattern: /^https?:\/\/.*\.(png|jpg|jpeg|webp|avif)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // Google Fonts stylesheets
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-stylesheets',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
          },
        },
        // Google Fonts webfont files
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-webfonts',
            expiration: {
              maxEntries: 30,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // Iconify icons (used by @nuxt/icon)
        {
          urlPattern: /^https:\/\/api\.iconify\.design\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'iconify-cache',
            expiration: {
              maxEntries: 500,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
      // Skip waiting and claim clients immediately
      skipWaiting: true,
      clientsClaim: true,
      // Clean up old caches
      cleanupOutdatedCaches: true,
    },
    // PWA client options
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600, // Check for updates every hour
    },
    // Dev options - enable in development for testing
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      type: 'module',
    },
  },

  // Icon configuration - access to 200k+ icons from Iconify
  icon: {
    // Use remote fetching for icons (works offline after first load due to SW caching)
    serverBundle: 'remote',
    // Scan components for icon usage and bundle automatically
    clientBundle: {
      scan: true,
    },
    // Customize icon component defaults
    class: 'nuxt-icon',
    size: '1.2em',
  },

  // Image optimization
  image: {
    quality: 80,
    format: ['webp', 'avif', 'jpeg'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
    },
  },

  // TypeScript - disable strict checks for faster builds
  typescript: {
    strict: false,
    typeCheck: false,
  },

  // Components auto-import configuration
  components: [
    {
      path: '~/components',
      pathPrefix: false, // Don't prefix component names with folder path
    },
  ],

  // Pinia configuration
  pinia: {
    storesDirs: ['~/stores/**'],
  },

  // i18n configuration for 6 South African languages
  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'zu', name: 'isiZulu', file: 'zu.json' },
      { code: 'xh', name: 'isiXhosa', file: 'xh.json' },
      { code: 'af', name: 'Afrikaans', file: 'af.json' },
      { code: 'st', name: 'Sesotho', file: 'st.json' },
      { code: 'tn', name: 'Setswana', file: 'tn.json' },
    ],
    defaultLocale: 'en',
    lazy: true,
    langDir: '../locales/',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'indlela_locale',
      fallbackLocale: 'en',
    },
  },

  // Runtime config
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8000',
      appName: 'Indlela',
      appVersion: '1.0.0',
      // Set to true to use mock API calls (for offline dev without backend)
      useMockApi: process.env.NUXT_PUBLIC_USE_MOCK_API === 'true',
    },
  },

  // App configuration
  app: {
    head: {
      title: 'Indlela - The Way',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Connect with trusted service providers in your community' },
        // Status bar color for PWA - matches primary green
        { name: 'theme-color', content: '#00A86B' },
        // iOS specific meta tags
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        // Additional PWA color hints
        { name: 'msapplication-TileColor', content: '#00A86B' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icons/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.svg' },
      ],
    },
  },

  // CSS
  css: [
    '@ionic/vue/css/core.css',
    '@ionic/vue/css/normalize.css',
    '@ionic/vue/css/structure.css',
    '@ionic/vue/css/typography.css',
    '@ionic/vue/css/padding.css',
    '@ionic/vue/css/float-elements.css',
    '@ionic/vue/css/text-alignment.css',
    '@ionic/vue/css/text-transformation.css',
    '@ionic/vue/css/flex-utils.css',
    '@ionic/vue/css/display.css',
    '~/assets/css/main.css',
  ],

  // Build configuration
  build: {
    transpile: ['@ionic/vue', '@ionic/vue-router'],
  },

  // Vite configuration
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },

  // SSR disabled for Capacitor mobile app
  ssr: false,

  // Nitro configuration
  nitro: {
    preset: 'static',
  },
})