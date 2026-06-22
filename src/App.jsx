import { useEffect, useLayoutEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { defaultLocale, locales } from './i18n/constants'
import { parsePathLocale } from './i18n/path'
import { HomePage } from './pages/HomePage'
import { BacktestPage } from './pages/BacktestPage'
function isHomeRoutePath(pathname) {
  const { pathnameWithoutLocale } = parsePathLocale(pathname)
  return pathnameWithoutLocale === '/' || pathnameWithoutLocale === ''
}

function initialHomeWarm() {
  if (typeof window === 'undefined') {
    return true
  }
  return isHomeRoutePath(window.location.pathname)
}

function EmptyHomeRoute() {
  return null
}

function scrollWindowToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  // Android / 部分 WebView 滚动根在 documentElement 或 body
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

function App() {
  const { pathname } = useLocation()
  const onHome = isHomeRoutePath(pathname)
  const [homeWarm, setHomeWarm] = useState(initialHomeWarm)

  /** 首页 Keep-Alive + RR 默认不滚顶：从长列表进详情时视口仍停在原 scrollY，移动端 Edge 同样如此 */
  useLayoutEffect(() => {
    const { pathnameWithoutLocale } = parsePathLocale(pathname)
    if (pathnameWithoutLocale.startsWith('/backtest/')) {
      scrollWindowToTop()
    }
  }, [pathname])

  useEffect(() => {
    if (onHome) {
      setHomeWarm(true)
    }
  }, [onHome])

  const shellActive = homeWarm || onHome
  const nonDefaultLocales = locales.filter((l) => l !== defaultLocale)

  return (
    <>
      {shellActive ? (
        <div hidden={!onHome} aria-hidden={!onHome} inert={onHome ? undefined : true}>
          <HomePage visible={onHome} />
        </div>
      ) : null}

      <Routes>
        <Route path="/backtest/:segment" element={<BacktestPage />} />
        {nonDefaultLocales.map((locale) => (
          <Route key={`${locale}-backtest`} path={`/${locale}/backtest/:segment`} element={<BacktestPage />} />
        ))}
        <Route path="/" element={shellActive ? <EmptyHomeRoute /> : <HomePage visible />} />
        {nonDefaultLocales.map((locale) => (
          <Route key={locale} path={`/${locale}`} element={shellActive ? <EmptyHomeRoute /> : <HomePage visible />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
