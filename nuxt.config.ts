// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

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
  ],

  // TypeScript - disable strict checks for faster builds
  typescript: {
    strict: false,
    typeCheck: false,
  },

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
        { name: 'theme-color', content: '#00A86B' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/icons/favicon.png' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
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