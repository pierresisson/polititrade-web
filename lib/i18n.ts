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

/** Check if a string is a valid locale */
export function isValidLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** Extract locale from a pathname, defaulting to `defaultLocale` */
export function getLocaleFromPathname(pathname: string): Locale {
  const first = pathname.split('/').filter(Boolean)[0]
  return first && isValidLocale(first) ? first : defaultLocale
}

/** Build a localized path — omits prefix for the default locale */
export function buildLocalePath(path: string, locale: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (locale === defaultLocale) return normalized === '/' ? '/' : normalized
  return `/${locale}${normalized === '/' ? '' : normalized}`
}

/** Strip the locale prefix from a pathname */
export function stripLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0 && isValidLocale(segments[0])) {
    const rest = segments.slice(1).join('/')
    return `/${rest}`
  }
  return pathname
}
