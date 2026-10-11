import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { useEffect, useState } from 'react'
import en from './locales/en.json'

// Every word a visitor reads lives in src/locales/<language>.json and is shown with t('key').
// One entry per language, named by its code. The first one is the site's main language: it is
// what a new visitor sees and what a missing translation falls back to.
export const languages = { en }

const mainLanguage = Object.keys(languages)[0]
const STORAGE_KEY = 'language'

i18n.use(initReactI18next).init({
  resources: Object.fromEntries(Object.entries(languages).map(([code, translation]) => [code, { translation }])),
  lng: mainLanguage,
  fallbackLng: mainLanguage,
  interpolation: { escapeValue: false },
  returnNull: false,
  initAsync: false,
  initImmediate: false,
  react: { useSuspense: false, bindI18nStore: 'added' },
})

// The visual editor reads and changes the language through this.
globalThis.__pdI18n = i18n

// The language on screen, the ones available, and a way to change it. The visitor's choice is
// remembered. The first render is always in the main language (the published page is built that
// way), then the saved choice is applied.
export function useLanguage() {
  const [language, setCurrent] = useState(i18n.language)

  useEffect(() => {
    const onChange = (code) => {
      setCurrent(code)
      document.documentElement.lang = code
    }
    i18n.on('languageChanged', onChange)
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && languages[saved] && saved !== i18n.language) i18n.changeLanguage(saved)
    else document.documentElement.lang = i18n.language
    return () => i18n.off('languageChanged', onChange)
  }, [])

  const setLanguage = (code) => {
    if (!languages[code]) return
    localStorage.setItem(STORAGE_KEY, code)
    i18n.changeLanguage(code)
  }

  return { language, languages: Object.keys(languages), setLanguage }
}

export default i18n
