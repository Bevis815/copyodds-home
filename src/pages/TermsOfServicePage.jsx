import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { LandingBackdrop } from '../components/landing/LandingBackdrop'
import { TERMS_OF_SERVICE } from '../content/termsOfService'
import { useDocumentSeo } from '../hooks/useDocumentSeo'
import { useLocale } from '../hooks/useLocale'
import { SITE } from '../lib/site'

function LegalParagraphs({ items }) {
  if (!items?.length) return null
  return items.map((text) => (
    <p key={text} className="legal-doc__p">
      {text}
    </p>
  ))
}

function LegalBullets({ items }) {
  if (!items?.length) return null
  return (
    <ul className="legal-doc__list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function LegalSection({ section }) {
  return (
    <section className="legal-doc__section" aria-labelledby={section.id}>
      <h2 id={section.id} className="legal-doc__h2">
        {section.title}
      </h2>
      {section.intro ? <p className="legal-doc__p">{section.intro}</p> : null}
      <LegalParagraphs items={section.paragraphs} />
      <LegalBullets items={section.bullets} />
      {section.contact ? (
        <dl className="legal-doc__contact">
          <div>
            <dt>Application</dt>
            <dd>{section.contact.application}</dd>
          </div>
          <div>
            <dt>Support</dt>
            <dd>{section.contact.supportNote}</dd>
          </div>
          <div>
            <dt>Privacy Policy</dt>
            <dd>
              <a href={section.contact.privacyUrl}>{section.contact.privacyUrl}</a>
            </dd>
          </div>
          <div>
            <dt>Trust Center</dt>
            <dd>
              <a href={section.contact.trustUrl}>{section.contact.trustUrl}</a>
            </dd>
          </div>
        </dl>
      ) : null}
    </section>
  )
}

export function TermsOfServicePage() {
  const { t } = useTranslation()
  const { localizePath } = useLocale()
  useDocumentSeo({ page: 'terms' })

  return (
    <div className="landing-page relative min-h-screen w-full">
      <LandingBackdrop />

      <Header logoHref={localizePath('/')} fullWidth compact />

      <main className="relative z-[1] flex w-full flex-col pb-16 pt-6 sm:pb-20 sm:pt-10">
        <div className="landing-shell legal-doc">
          <nav className="legal-doc__crumb" aria-label={t('termsOfService.breadcrumbAria')}>
            <Link to={localizePath('/')}>{t('common.home')}</Link>
            <span aria-hidden="true">/</span>
            <span>{t('footer.terms')}</span>
          </nav>

          <header className="legal-doc__hero">
            <p className="eyebrow">{t('footer.terms')}</p>
            <h1 className="legal-doc__title">{TERMS_OF_SERVICE.title}</h1>
            <p className="legal-doc__updated">
              <strong>{t('termsOfService.statusLabel')}:</strong> {t('termsOfService.statusDraft')}
              {' · '}
              <strong>{t('termsOfService.lastUpdatedLabel')}:</strong> {TERMS_OF_SERVICE.lastUpdated}
            </p>
            <div className="legal-doc__draft-banner" role="status">
              <LegalParagraphs items={TERMS_OF_SERVICE.draftNotice} />
            </div>
          </header>

          <div className="legal-doc__panel">
            <LegalParagraphs items={TERMS_OF_SERVICE.intro} />

            {TERMS_OF_SERVICE.sections.map((section) => (
              <LegalSection key={section.id} section={section} />
            ))}

            <footer className="legal-doc__footer">
              <p>
                <strong>{TERMS_OF_SERVICE.footer.brand}</strong>
              </p>
              <p>{TERMS_OF_SERVICE.footer.copyright}</p>
            </footer>
          </div>
        </div>
      </main>

      <Footer
        fullWidth
        links={[
          { href: localizePath('/'), label: t('common.home') },
          { href: localizePath(SITE.docs.trust), label: t('footer.trust') },
          { href: localizePath(SITE.docs.privacy), label: t('footer.privacy') },
          { href: localizePath(SITE.docs.terms), label: t('footer.terms') },
        ]}
      />
    </div>
  )
}
