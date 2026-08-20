import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { LandingBackdrop } from '../components/landing/LandingBackdrop'
import { PRIVACY_POLICY } from '../content/privacyPolicy'
import { useLocale } from '../hooks/useLocale'
import { useDocumentSeo } from '../hooks/useDocumentSeo'

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

function LegalSubsection({ subsection }) {
  return (
    <div className="legal-doc__subsection">
      <h3 className="legal-doc__h3">{subsection.title}</h3>
      <LegalParagraphs items={subsection.paragraphs} />
      <LegalBullets items={subsection.bullets} />
      <LegalParagraphs items={subsection.afterBullets} />
    </div>
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
      {section.subsections?.map((subsection) => (
        <LegalSubsection key={subsection.title} subsection={subsection} />
      ))}
      {section.contact ? (
        <dl className="legal-doc__contact">
          <div>
            <dt>Application</dt>
            <dd>{section.contact.application}</dd>
          </div>
          <div>
            <dt>Privacy Contact</dt>
            <dd>
              <a href={`mailto:${section.contact.email}`}>{section.contact.email}</a>
            </dd>
          </div>
          <div>
            <dt>Privacy Policy URL</dt>
            <dd>
              <a href={section.contact.policyUrl}>{section.contact.policyUrl}</a>
            </dd>
          </div>
        </dl>
      ) : null}
      <LegalParagraphs items={section.afterBullets} />
    </section>
  )
}

export function PrivacyPolicyPage() {
  const { t } = useTranslation()
  const { localizePath } = useLocale()
  useDocumentSeo({ page: 'privacy' })

  return (
    <div className="landing-page relative min-h-screen w-full">
      <LandingBackdrop />

      <Header logoHref={localizePath('/')} fullWidth compact />

      <main className="relative z-[1] flex w-full flex-col pb-16 pt-6 sm:pb-20 sm:pt-10">
        <div className="landing-shell legal-doc">
          <nav className="legal-doc__crumb" aria-label={t('privacyPolicy.breadcrumbAria')}>
            <Link to={localizePath('/')}>{t('common.home')}</Link>
            <span aria-hidden="true">/</span>
            <span>{t('footer.privacy')}</span>
          </nav>

          <header className="legal-doc__hero">
            <p className="eyebrow">{t('footer.privacy')}</p>
            <h1 className="legal-doc__title">{PRIVACY_POLICY.title}</h1>
            <p className="legal-doc__updated">
              <strong>Last Updated:</strong> {PRIVACY_POLICY.lastUpdated}
            </p>
          </header>

          <div className="legal-doc__panel">
            <LegalParagraphs items={PRIVACY_POLICY.intro} />

            {PRIVACY_POLICY.sections.map((section) => (
              <LegalSection key={section.id} section={section} />
            ))}

            <footer className="legal-doc__footer">
              <p>
                <strong>{PRIVACY_POLICY.footer.brand}</strong>
              </p>
              <p>{PRIVACY_POLICY.footer.copyright}</p>
            </footer>
          </div>
        </div>
      </main>

      <Footer
        fullWidth
        links={[
          { href: localizePath('/'), label: t('common.home') },
          { href: localizePath('/privacy'), label: t('footer.privacy') },
        ]}
      />
    </div>
  )
}
