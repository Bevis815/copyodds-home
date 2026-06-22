import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { defaultLocale } from './constants'
import { parsePathLocale } from './path'
import { deepMerge } from './merge'
import en from './messages/en.json'
import zh from './messages/zh.json'
import id from './messages/id.json'
import fr from './messages/fr.json'
import ru from './messages/ru.json'
import es from './messages/es.json'

const partialLocales = { zh, id, fr, ru, es }

const resources = Object.fromEntries(
  Object.entries(partialLocales).map(([lng, part]) => [lng, { translation: deepMerge(en, part) }])
)

function getInitialLocale() {
  if (typeof window === 'undefined') {
    return defaultLocale
  }
  return parsePathLocale(window.location.pathname).locale
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ...resources,
  },
  lng: getInitialLocale(),
  fallbackLng: defaultLocale,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
})

export default i18n
