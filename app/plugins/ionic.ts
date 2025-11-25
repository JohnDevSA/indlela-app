import { IonicVue } from '@ionic/vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(IonicVue, {
    // Ionic configuration
    mode: 'md', // Use Material Design style consistently
    animated: true,
    rippleEffect: true,
    hardwareBackButton: true,
    statusTap: true,
    swipeBackEnabled: true,
  })
})