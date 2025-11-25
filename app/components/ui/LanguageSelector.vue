<script setup lang="ts">
import { IonSelect, IonSelectOption } from '@ionic/vue'
import { SUPPORTED_LOCALES } from '~/types'

const { locale, setLocale } = useI18n()
const { updateLocale, isAuthenticated } = useAuth()

const handleChange = async (event: CustomEvent) => {
  const newLocale = event.detail.value
  await setLocale(newLocale)

  // Update server preference if authenticated
  if (isAuthenticated.value) {
    await updateLocale(newLocale)
  }
}
</script>

<template>
  <IonSelect
    :value="locale"
    interface="action-sheet"
    @ionChange="handleChange"
    class="language-select"
  >
    <IonSelectOption
      v-for="lang in SUPPORTED_LOCALES"
      :key="lang.code"
      :value="lang.code"
    >
      {{ lang.nativeName }}
    </IonSelectOption>
  </IonSelect>
</template>

<style scoped>
.language-select {
  --placeholder-color: var(--ion-color-primary);
  --placeholder-opacity: 1;
  font-size: 14px;
  font-weight: 500;
}
</style>