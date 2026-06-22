import { useTranslation } from 'react-i18next'
import { leaderboardUrl } from '../lib/app-links'
import { HeroDashboardMock } from './landing/HeroDashboardMock'

export function Hero() {
  const { t } = useTranslation()

  return (
    <section className="landing-hero" id="top">
      <div className="landing-hero__copy landing-enter landing-enter--left">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="badge-metal rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.18em]">
            {t('landing.hero.badge')}
          </span>
        </div>

        <h1 className="landing-hero__title font-display font-bold tracking-[-0.04em] text-white">
          {t('landing.hero.title')}
        </h1>

        <p className="landing-hero__subtitle mt-5 text-[15px] leading-7 text-slate-300 sm:mt-6 sm:text-lg sm:leading-8 lg:text-xl">
          {t('landing.hero.subtitle')}
        </p>

        <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
          <a
            className="btn-gold interactive-focus rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] sm:px-8 sm:py-3.5"
            href={leaderboardUrl()}
          >
            {t('landing.hero.primaryCta')}
          </a>
          <a
            className="btn-ghost interactive-focus rounded-full px-6 py-3 text-sm font-semibold sm:px-8 sm:py-3.5"
            href="#how-it-works"
          >
            {t('landing.hero.secondaryCta')}
          </a>
        </div>
      </div>

      <div className="landing-enter landing-enter--right landing-enter--delay-2">
        <HeroDashboardMock />
      </div>
    </section>
  )
}
