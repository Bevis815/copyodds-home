import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useLocale } from '../hooks/useLocale'
import { resolveAnalyzeIdentifier } from '../services/smartMoney'
import { LiveLeaderboard } from './landing/LiveLeaderboard'
import { OpenSourceStatsBar } from './landing/OpenSourceStatsBar'
import { IconSearch, IconSpinner } from './ui/Icons'

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
        </MotionDiv>

        <LiveLeaderboard />
      </div>

      <OpenSourceStatsBar />
    </section>
  )
}
