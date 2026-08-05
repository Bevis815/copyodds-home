import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { SITE } from '../lib/site'
import { LiveLeaderboard } from './landing/LiveLeaderboard'
import { OpenSourceStatsBar } from './landing/OpenSourceStatsBar'
import { IconGitHub, IconPlay } from './ui/Icons'

const ease = [0.22, 1, 0.36, 1]
const MotionDiv = motion.div

export function Hero() {
  const { t } = useTranslation()

  return (
    <section className="hero" id="top">
      <div className="hero__grid">
        <MotionDiv
          className="hero__copy"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease }}
        >
          <p className="hero__badge">{t('landing.hero.badge')}</p>
          <h1 className="hero__title">
            <span className="hero__title-line">{t('landing.hero.titleLine1')}</span>
            <span className="hero__title-line hero__title-line--accent">
              {t('landing.hero.titleLine2')}
            </span>
          </h1>
          <p className="hero__subtitle">{t('landing.hero.subtitle')}</p>

          <div className="hero__actions">
            <a className="btn-primary" href={SITE.appUrl}>
              {t('landing.hero.launchApp')}
            </a>
            <a
              className="btn-secondary"
              href={SITE.github.web.url}
              target="_blank"
              rel="noreferrer"
            >
              <IconGitHub className="size-4" />
              {t('landing.hero.viewGithub')}
            </a>
            <a
              className="btn-ghost"
              href={SITE.docs.home}
              target="_blank"
              rel="noreferrer"
            >
              {t('landing.hero.docs')}
            </a>
            <a className="btn-ghost" href="#product">
              <IconPlay className="size-3.5" />
              {t('landing.hero.watchDemo')}
            </a>
          </div>
        </MotionDiv>

        <LiveLeaderboard />
      </div>

      <OpenSourceStatsBar />
    </section>
  )
}
