import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SupportFooterLink } from './SupportEntry'

function FooterLink({ href, children }) {
  const className =
    'interactive-focus rounded-full px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-[#F8D978] sm:px-4 sm:py-2 sm:text-sm'

  if (href.startsWith('#')) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    )
  }

  return (
    <Link className={className} to={href}>
      {children}
    </Link>
  )
}

export function Footer({ links = [], fullWidth = false, showSupport = false }) {
  const { t } = useTranslation()
  const resolvedLinks = links
  const hasLinks = Array.isArray(resolvedLinks) && resolvedLinks.length > 0
  const hasActions = showSupport || hasLinks

  return (
    <footer
      className={`surface-panel relative z-10 flex w-full flex-col gap-3 py-5 sm:gap-4 sm:py-6 lg:flex-row lg:items-center lg:justify-between ${
        fullWidth
          ? 'landing-shell landing-footer--full mt-8 rounded-none border-x-0 sm:mt-10'
          : 'mx-auto mb-4 max-w-[1280px] rounded-2xl px-4 sm:mb-6 sm:rounded-[28px] sm:px-7 lg:px-8'
      }`}
      id="footer"
    >
      <div>
        <p className="font-display text-base font-bold tracking-[0.2em] text-white uppercase sm:text-lg">
          {t('footer.brand')}
        </p>
        <p className="mt-1.5 max-w-[56ch] text-[13px] leading-6 text-slate-400 sm:mt-2 sm:text-sm sm:leading-7">
          {t('footer.tagline')}
        </p>
      </div>
      {hasActions ? (
        <div className="flex flex-wrap items-center gap-2">
          {showSupport ? <SupportFooterLink /> : null}
          {resolvedLinks.map((link) => (
            <FooterLink key={`${link.href}-${link.label}`} href={link.href}>
              {link.label}
            </FooterLink>
          ))}
        </div>
      ) : null}
    </footer>
  )
}
