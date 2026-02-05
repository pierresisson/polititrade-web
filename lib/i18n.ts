export const locales = ['en', 'fr'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

const dictionaries = {
  en: () => import('@/messages/en.json').then((m) => m.default),
  fr: () => import('@/messages/fr.json').then((m) => m.default),
}

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]()
}
