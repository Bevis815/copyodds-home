import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { loginUrl } from '../lib/app-links'
import { formatNumber } from '../utils/format'
import { LanguageSwitcher } from './LanguageSwitcher'
import { SupportFloatingButton } from './SupportEntry'

const LOGO_SRC = '/logo.jpg'

function HeaderLink({ href, label }) {
  const className =
    'interactive-focus rounded-full px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/5 hover:text-[#F8D978] sm:px-4 sm:py-2 sm:text-sm'

  if (href.startsWith('#')) {
    return (
      <a className={className} href={href}>
        {label}
      </a>
    )
  }

  return (
    <Link className={className} to={href}>
      {label}
    </Link>
  )
}

function HeaderLogo({ href, logoAlt, logoHomeAria }) {
  const className =
    'interactive-focus logo-frame flex h-[52px] w-[168px] items-center rounded-[16px] px-2 py-2 transition duration-200 hover:border-[#F5C542]/24 hover:shadow-[0_28px_70px_rgba(0,0,0,0.46),0_0_38px_rgba(245,197,66,0.14)] sm:h-[72px] sm:w-[228px] sm:rounded-[22px] sm:px-3 sm:py-2.5 lg:h-[78px] lg:w-[252px] lg:rounded-[24px] lg:px-4 lg:py-3 xl:h-[84px] xl:w-[276px]'

  const logoImage = <img className="logo-image" src={LOGO_SRC} alt={logoAlt} />

  if (href.startsWith('#')) {
    return (
      <a className={className} href={href} aria-label={logoHomeAria} style={{ padding: 0 }}>
        {logoImage}
      </a>
    )
  }

  return (
    <Link className={className} to={href} aria-label={logoHomeAria} style={{ padding: 0 }}>
      {logoImage}
    </Link>
  )
}

function LoginHeaderButton() {
  const { t } = useTranslation()

  return (
    <a
      href={loginUrl()}
      className="interactive-focus btn-gold inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
      aria-label={t('header.loginAria')}
    >
      {t('header.login')}
    </a>
  )
}

export function Header({
  totalTraders = 0,
  logoHref = '#top',
  navigation = [],
  badges = null,
  fullWidth = false,
}) {
  const { t } = useTranslation()
  const resolvedNavigation = navigation
  const resolvedBadges = badges ?? [
    {
      tone: 'metal',
      text: t('header.tracked', { count: formatNumber(totalTraders) }),
    },
  ]
  const hasNavigation = Array.isArray(resolvedNavigation) && resolvedNavigation.length > 0

  return (
    <>
      <div className="site-header-sticky">
        <header
          className={`site-header-inner flex w-full flex-col gap-3 pt-3 pb-3 sm:gap-4 sm:pt-3.5 sm:pb-3.5 lg:flex-row lg:items-center lg:justify-between lg:pt-4 lg:pb-4 ${
            fullWidth ? 'landing-shell' : 'mx-auto max-w-[1280px] px-3 sm:px-6 lg:px-8'
          }`}
        >
        <div className="flex items-center gap-5">
          <HeaderLogo href={logoHref} logoAlt={t('header.logoAlt')} logoHomeAria={t('header.logoHomeAria')} />
        </div>

        {hasNavigation ? (
          <nav
            className="surface-panel flex w-full max-w-full flex-wrap items-center gap-1.5 rounded-2xl px-1.5 py-1.5 sm:w-auto sm:gap-2 sm:rounded-full sm:px-2 sm:py-2"
            aria-label={t('common.primaryNavAria')}
          >
            {resolvedNavigation.map((link) => (
              <HeaderLink key={`${link.href}-${link.label}`} href={link.href} label={link.label} />
            ))}
          </nav>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-1.5 text-xs sm:gap-2 sm:text-sm lg:ml-auto">
          <LoginHeaderButton />
          <LanguageSwitcher />
          {resolvedBadges.map((badge) => (
            <span
              className={`rounded-full px-3 py-1.5 font-medium sm:px-4 sm:py-2 ${
                badge.tone === 'metal' ? 'badge-metal' : 'badge-neutral'
              }`}
              key={`${badge.tone}-${badge.text}`}
            >
              {badge.text}
            </span>
          ))}
        </div>
        </header>
      </div>
      <SupportFloatingButton />
    </>
  )
}
