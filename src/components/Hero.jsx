import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useLocale } from '../hooks/useLocale'
import { SITE } from '../lib/site'
import { getTelegramSupportHref } from '../lib/support'
import { resolveAnalyzeIdentifier } from '../services/smartMoney'
import { LiveLeaderboard } from './landing/LiveLeaderboard'
import { OpenSourceStatsBar } from './landing/OpenSourceStatsBar'
import { IconArrowRight, IconSearch, IconSpinner, IconTelegram } from './ui/Icons'

const ease = [0.22, 1, 0.36, 1]
const MotionDiv = motion.div

export function Hero() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { localizePath } = useLocale()
  const [analyzeQuery, setAnalyzeQuery] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const analyzeWallet = resolveAnalyzeIdentifier(analyzeQuery)
  const analyzeInvalid = Boolean(analyzeQuery.trim()) && !analyzeWallet
  const recruitHref = getTelegramSupportHref()
  const cooperationHref = localizePath(SITE.docs.cooperation)

  function handleAnalyze(event) {
    event.preventDefault()
    if (!analyzeWallet || analyzing) {
      return
    }
    setAnalyzing(true)
    navigate(localizePath(`/backtest/${encodeURIComponent(analyzeWallet)}`))
  }

  return (
    <section className="hero" id="top">
      <div className="landing-shell hero__inner">
        <div className="hero-stage">
          <Link to={cooperationHref}>
            <img
              className="hero-stage__img"
              src={SITE.bannerImage}
              alt={t('landing.hero.recruit.bannerAlt')}
              width={SITE.bannerWidth}
              height={SITE.bannerHeight}
              decoding="async"
              fetchPriority="high"
            />
          </Link>
          <div className="hero-stage__wash" aria-hidden />
        </div>

        <div className="hero-recruit">
          <p className="hero-recruit__text">
            <strong>{t('landing.hero.recruit.title')}</strong>
            <span>{t('landing.hero.recruit.body')}</span>
          </p>
          <div className="hero-recruit__actions">
            <Link className="btn-secondary hero-recruit__cta" to={cooperationHref}>
              {t('landing.hero.recruit.learnMore')}
              <IconArrowRight className="size-3.5" />
            </Link>
            <a className="btn-primary hero-recruit__cta" href={recruitHref} target="_blank" rel="noreferrer">
              <IconTelegram className="size-4" />
              {t('landing.hero.recruit.cta')}
            </a>
          </div>
        </div>

        <MotionDiv
          className="hero-stage__panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <h1 className="sr-only">{t('landing.hero.title')}</h1>
          <div className="hero-lookup-card">
            <form className="hero-lookup" onSubmit={handleAnalyze}>
              <label className="sr-only" htmlFor="hero-analyze-input">
                {t('landing.hero.analyzeLabel')}
              </label>
              <div className="hero-lookup__field">
                <IconSearch className="hero-lookup__icon" />
                <input
                  id="hero-analyze-input"
                  className="hero-lookup__input"
                  type="search"
                  value={analyzeQuery}
                  onChange={(e) => setAnalyzeQuery(e.target.value)}
                  placeholder={t('landing.hero.analyzePlaceholder')}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <button className="btn-primary" type="submit" disabled={!analyzeWallet || analyzing}>
                {analyzing ? <IconSpinner className="analysis-spinner-icon size-4" /> : null}
                {t('landing.hero.analyzeCta')}
              </button>
            </form>
            <p className={`hero-lookup__hint ${analyzeInvalid ? 'is-error' : ''}`}>
              {analyzeInvalid ? t('landing.hero.analyzeAddressOnly') : t('landing.hero.analyzeHint')}
            </p>
          </div>
        </MotionDiv>

        <div className="hero__body">
          <LiveLeaderboard />
          <OpenSourceStatsBar />
        </div>
      </div>
    </section>
  )
}
