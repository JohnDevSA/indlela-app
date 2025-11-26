<script setup lang="ts">
/**
 * LanguageSelector - Language picker with native action sheet
 * Uses Ionic's IonSelect for native-like mobile experience
 *
 * @example
 * <LanguageSelector />
 * <LanguageSelector variant="button" />
 */

import { IonSelect, IonSelectOption } from '@ionic/vue'
import { SUPPORTED_LOCALES } from '~/types'

interface Props {
  variant?: 'default' | 'button' | 'minimal'
  showFlag?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  showFlag: true,
})

const { locale, setLocale } = useI18n()
const { updateLocale, isAuthenticated } = useAuth()
const { hapticSelection } = useAnimation()

// Get current language info
const currentLanguage = computed(() => {
  return SUPPORTED_LOCALES.find((l) => l.code === locale.value) || SUPPORTED_LOCALES[0]
})

const handleChange = async (event: CustomEvent) => {
  const newLocale = event.detail.value
  hapticSelection()
  await setLocale(newLocale)

  // Update server preference if authenticated
  if (isAuthenticated.value) {
    await updateLocale(newLocale)
  }
}
</script>

<template>
  <div :class="['language-selector', `language-selector--${variant}`]">
    <!-- Language icon -->
    <Icon
      v-if="variant !== 'minimal'"
      name="heroicons:language"
      class="language-selector__icon"
    />

    <!-- Ionic select for native action sheet -->
    <IonSelect
      :value="locale"
      interface="action-sheet"
      :interface-options="{
        header: 'Select Language',
        subHeader: 'Choose your preferred language',
      }"
      class="language-selector__select"
      @ionChange="handleChange"
    >
      <IonSelectOption
        v-for="lang in SUPPORTED_LOCALES"
        :key="lang.code"
        :value="lang.code"
      >
        {{ lang.nativeName }}
      </IonSelectOption>
    </IonSelect>

    <!-- Chevron indicator -->
    <Icon
      v-if="variant === 'button'"
      name="heroicons:chevron-down"
      class="language-selector__chevron"
    />
  </div>
</template>

<style scoped>
.language-selector {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

/* Default variant */
.language-selector--default {
  padding: var(--space-2);
}

/* Button variant - looks like a button */
.language-selector--button {
  padding: var(--space-2) var(--space-3);
  background: var(--color-neutral-100);
  border-radius: var(--radius-lg);
  transition: background var(--duration-fast) var(--ease-out);
}

.language-selector--button:hover {
  background: var(--color-neutral-200);
}

/* Minimal variant - just the text */
.language-selector--minimal {
  padding: 0;
}

/* Icon */
.language-selector__icon {
  width: 20px;
  height: 20px;
  color: var(--color-neutral-500);
  flex-shrink: 0;
}

/* Select element */
.language-selector__select {
  --placeholder-color: var(--color-primary-500);
  --placeholder-opacity: 1;
  --padding-start: 0;
  --padding-end: 0;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-700);
  min-height: auto;
}

.language-selector--button .language-selector__select {
  color: var(--color-neutral-900);
}

/* Hide default ionic icon */
.language-selector__select::part(icon) {
  display: none;
}

/* Chevron */
.language-selector__chevron {
  width: 16px;
  height: 16px;
  color: var(--color-neutral-400);
  flex-shrink: 0;
  transition: transform var(--duration-fast) var(--ease-out);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .language-selector--button {
    background: var(--color-neutral-800);
  }

  .language-selector--button:hover {
    background: var(--color-neutral-700);
  }

  .language-selector__icon {
    color: var(--color-neutral-400);
  }

  .language-selector__select {
    color: var(--color-neutral-300);
  }

  .language-selector--button .language-selector__select {
    color: var(--color-neutral-100);
  }
}
</style>
