'use client'
import { useStore } from '@/lib/store'
import { translations, type TranslationKey } from '@/lib/i18n'

export function useT() {
  const language = useStore(s => s.language)
  const dict = translations[language]
  return (key: TranslationKey) => dict[key]
}
