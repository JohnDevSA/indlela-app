import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'za.co.indlela.app',
  appName: 'Indlela',
  webDir: '.output/public',

  // Server configuration for development
  server: {
    // Uncomment for live reload during development
    // url: 'http://192.168.1.x:3000',
    // cleartext: true,
  },

  // iOS specific configuration
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'Indlela',
  },

  // Android specific configuration
  android: {
    allowMixedContent: true, // Allow HTTP for local development
    captureInput: true,
    webContentsDebuggingEnabled: true, // Enable for debugging
  },

  // Plugin configurations
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#00A86B',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#00A86B',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    App: {
      // Deep linking configuration
      // Associate with your domain for universal links
    },
  },
}

export default config