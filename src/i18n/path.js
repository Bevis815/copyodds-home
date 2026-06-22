import { defaultLocale, locales } from './constants'

export function isLocale(value) {
  return typeof value === 'string' && locales.includes(value)
}

/**
 * @param {string} pathname
 * @returns {{ locale: string, pathnameWithoutLocale: string }}
 */
export function parsePathLocale(pathname) {
  const raw = pathname || '/'
  const parts = raw.split('/').filter(Boolean)
  const first = parts[0]
  if (first && isLocale(first)) {
    const rest = parts.length > 1 ? `/${parts.slice(1).join('/')}` : '/'
    return { locale: first, pathnameWithoutLocale: rest }
  }
  return { locale: defaultLocale, pathnameWithoutLocale: raw.startsWith('/') ? raw : `/${raw}` }
}

/**
 * @param {string} locale
 * @param {string} pathnameWithoutLocale path starting with `/`, e.g. `/` or `/backtest/0xabc`
 */
export function buildLocalizedPath(locale, pathnameWithoutLocale) {
  const path = pathnameWithoutLocale.startsWith('/') ? pathnameWithoutLocale : `/${pathnameWithoutLocale}`
  if (locale === defaultLocale) {
    return path === '' ? '/' : path
  }
  if (path === '/') {
    return `/${locale}`
  }
  return `/${locale}${path}`
}
