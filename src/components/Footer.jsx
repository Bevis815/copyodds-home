import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SITE } from '../lib/site'
import { IconGitHub, IconTelegram, IconX } from './ui/Icons'

const LOGO_SRC = '/home-logo.jpg'

export function Footer({ fullWidth = false, links = [] }) {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  const defaultLinks = [
    { href: SITE.github.web.url, label: 'GitHub', external: true },
    { href: SITE.social.x, label: 'X', external: true },
    { href: SITE.social.telegram, label: 'Telegram', external: true },
    { href: SITE.docs.home, label: t('landing.nav.docs'), external: true },
    { href: SITE.docs.api, label: t('landing.nav.api'), external: true },
    { href: SITE.docs.privacy, label: t('footer.privacy') },
    { href: SITE.docs.terms, label: t('footer.terms') },
    { href: SITE.docs.license, label: t('footer.license'), external: true },
  ]

  const resolvedLinks = Array.isArray(links) && links.length > 0 ? links : defaultLinks

  return (
    <footer
      className={`site-footer ${fullWidth ? 'landing-shell landing-footer--full' : 'mx-auto mb-6 max-w-[1280px] px-4 sm:px-6 lg:px-8'}`}
      id="footer"
    >
      <div className="site-footer__top">
        <Link className="site-logo site-logo--footer" to="/" aria-label={t('header.logoHomeAria')}>
          <img src={LOGO_SRC} alt={t('header.logoAlt')} width={140} height={42} decoding="async" />
        </Link>

        <div className="site-footer__social">
          <a href={SITE.github.web.url} target="_blank" rel="noreferrer" aria-label="GitHub">
            <IconGitHub className="size-4" />
          </a>
          <a href={SITE.social.x} target="_blank" rel="noreferrer" aria-label="X">
            <IconX className="size-4" />
          </a>
          <a href={SITE.social.telegram} target="_blank" rel="noreferrer" aria-label="Telegram">
            <IconTelegram className="size-4" />
          </a>
        </div>
      </div>

      <nav className="site-footer__nav" aria-label={t('footer.navAria')}>
        {resolvedLinks.map((link) =>
          link.href.startsWith('#') || link.href.startsWith('/') ? (
            link.href.startsWith('/') ? (
              <Link key={`${link.href}-${link.label}`} to={link.href}>
                {link.label}
              </Link>
            ) : (
              <a key={`${link.href}-${link.label}`} href={link.href}>
                {link.label}
              </a>
            )
          ) : (
            <a
              key={`${link.href}-${link.label}`}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
            >
              {link.label}
            </a>
          ),
        )}
      </nav>

      <p className="site-footer__copy">
        © {year} {t('footer.brand')} · {SITE.license}
      </p>
    </footer>
  )
}
