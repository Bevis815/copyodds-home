import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SITE } from '../lib/site'
import { useGitHubStats } from '../hooks/useGitHubStats'
import { formatNumber } from '../utils/format'
import { LanguageSwitcher } from './LanguageSwitcher'
import { SupportFloatingButton } from './SupportEntry'
import { AnimatedNumber } from './ui/AnimatedNumber'
import { IconGitHub, IconStar, IconTelegram, IconX } from './ui/Icons'

const LOGO_SRC = '/home-logo.jpg'

const NAV = [
  { href: '#product', key: 'product' },
  { href: '#features', key: 'features' },
  { href: 'docs', key: 'docs', external: true },
  { href: 'api', key: 'api', external: true },
  { href: '#roadmap', key: 'roadmap' },
  { href: '#community', key: 'community' },
]

function resolveNavHref(item) {
  if (item.href === 'docs') return SITE.docs.home
  if (item.href === 'api') return SITE.docs.api
  return item.href
}

function HeaderLogo({ href, logoAlt, logoHomeAria }) {
  const className = 'site-logo interactive-focus'
  const image = <img src={LOGO_SRC} alt={logoAlt} width={160} height={48} decoding="async" />

  if (href.startsWith('#')) {
    return (
      <a className={className} href={href} aria-label={logoHomeAria}>
        {image}
      </a>
    )
  }

  return (
    <Link className={className} to={href} aria-label={logoHomeAria}>
      {image}
    </Link>
  )
}

export function Header({ logoHref = '#top', fullWidth = false, compact = false }) {
  const { t } = useTranslation()
  const { stats } = useGitHubStats()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <>
      <div className={`site-header-sticky ${scrolled ? 'is-scrolled' : ''}`}>
        <header
          className={`site-header ${fullWidth ? 'landing-shell' : 'mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8'}`}
        >
          <div className="site-header__left">
            <HeaderLogo
              href={logoHref}
              logoAlt={t('header.logoAlt')}
              logoHomeAria={t('header.logoHomeAria')}
            />

            {!compact ? (
              <a
                className="github-pill interactive-focus"
                href={SITE.github.web.url}
                target="_blank"
                rel="noreferrer"
                aria-label={t('landing.header.starsAria')}
              >
                <IconStar className="size-3.5 text-brand-blue" />
                <AnimatedNumber value={stats.stars} format={(n) => formatNumber(n)} />
                <span className="github-pill__sep" aria-hidden />
                <span className="github-pill__forks">
                  {t('landing.header.forks', { count: formatNumber(stats.forks) })}
                </span>
              </a>
            ) : null}
          </div>

          {!compact ? (
            <nav className="site-nav" aria-label={t('common.primaryNavAria')}>
              {NAV.map((item) => {
                const href = resolveNavHref(item)
                return (
                  <a
                    key={item.key}
                    className="site-nav__link interactive-focus"
                    href={href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noreferrer' : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {t(`landing.nav.${item.key}`)}
                  </a>
                )
              })}
            </nav>
          ) : null}

          <div className="site-header__right">
            {!compact ? (
              <div className="site-header__social">
                <a
                  className="icon-btn interactive-focus"
                  href={SITE.github.web.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                >
                  <IconGitHub className="size-4" />
                </a>
                <a
                  className="icon-btn interactive-focus"
                  href={SITE.social.x}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="X"
                >
                  <IconX className="size-4" />
                </a>
                <a
                  className="icon-btn interactive-focus"
                  href={SITE.social.telegram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram"
                >
                  <IconTelegram className="size-4" />
                </a>
              </div>
            ) : null}

            <LanguageSwitcher className="header-lang" />

            <a className="btn-primary btn-primary--sm" href={SITE.appUrl}>
              {t('landing.hero.launchApp')}
            </a>

            {!compact ? (
              <button
                type="button"
                className="menu-toggle interactive-focus"
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                aria-label={t('landing.header.menu')}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span />
                <span />
              </button>
            ) : null}
          </div>
        </header>

        {!compact && menuOpen ? (
          <div className="mobile-nav landing-shell" id="mobile-nav">
            {NAV.map((item) => {
              const href = resolveNavHref(item)
              return (
                <a
                  key={item.key}
                  href={href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noreferrer' : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {t(`landing.nav.${item.key}`)}
                </a>
              )
            })}
          </div>
        ) : null}
      </div>
      <SupportFloatingButton />
    </>
  )
}
