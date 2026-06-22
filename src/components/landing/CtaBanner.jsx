import { useTranslation } from 'react-i18next'
import { leaderboardUrl } from '../../lib/app-links'
import { Reveal } from './Reveal'

export function CtaBanner() {
  const { t } = useTranslation()

  return (
    <Reveal as="section" className="landing-cta surface-panel rounded-2xl px-5 py-10 sm:rounded-[32px] sm:px-10 sm:py-12">
      <div className="landing-cta__glow" aria-hidden />
      <div className="relative z-[1] flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-[20ch] font-display text-2xl font-semibold tracking-[-0.04em] text-white sm:max-w-none sm:text-3xl lg:text-4xl">
          {t('landing.cta.title')}
        </h2>
        <a
          className="btn-gold interactive-focus rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] sm:px-10 sm:text-base"
          href={leaderboardUrl()}
        >
          {t('landing.cta.primary')}
        </a>
      </div>
    </Reveal>
  )
}
