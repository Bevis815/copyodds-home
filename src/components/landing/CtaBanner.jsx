import { useTranslation } from 'react-i18next'
import { SITE } from '../../lib/site'
import { IconTelegram } from '../ui/Icons'
import { SectionReveal } from '../ui/Motion'

export function CtaBanner() {
  const { t } = useTranslation()

  return (
    <SectionReveal as="section" className="cta-banner" id="launch">
      <div className="cta-banner__inner">
        <h2>{t('landing.cta.title')}</h2>
        <p>{t('landing.cta.body')}</p>
        <div className="cta-banner__actions">
          <a className="btn-primary" href={SITE.appUrl}>
            {t('landing.hero.launchApp')}
          </a>
          <a
            className="btn-secondary"
            href={SITE.social.telegram}
            target="_blank"
            rel="noreferrer"
          >
            <IconTelegram className="size-4" />
            {t('landing.hero.openTelegramBot')}
          </a>
          <a className="btn-ghost" href={SITE.github.web.url} target="_blank" rel="noreferrer">
            {t('landing.hero.viewGithub')}
          </a>
        </div>
      </div>
    </SectionReveal>
  )
}
