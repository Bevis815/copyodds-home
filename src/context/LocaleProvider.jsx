import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import i18n from '../i18n/i18n'
import { defaultLocale } from '../i18n/constants'
import { buildLocalizedPath, parsePathLocale } from '../i18n/path'
import { LocaleContext } from './localeContext'

export function LocaleProvider({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const { locale, pathnameWithoutLocale } = useMemo(
    () => parsePathLocale(location.pathname),
    [location.pathname]
  )

  useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale)
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  const localizePath = useCallback(
    (path) => {
      const normalized = path.startsWith('/') ? path : `/${path}`
      return buildLocalizedPath(locale, normalized)
    },
    [locale]
  )

  const setLocale = useCallback(
    (next) => {
      if (next === locale) {
        return
      }
      const nextPath = buildLocalizedPath(next, pathnameWithoutLocale)
      navigate(`${nextPath}${location.search}${location.hash}`)
    },
    [locale, pathnameWithoutLocale, navigate, location.search, location.hash]
  )

  const value = useMemo(
    () => ({
      locale,
      defaultLocale,
      pathnameWithoutLocale,
      localizePath,
      setLocale,
    }),
    [locale, pathnameWithoutLocale, localizePath, setLocale]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
