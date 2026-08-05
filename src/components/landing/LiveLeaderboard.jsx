import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { SITE } from '../../lib/site'
import { formatNumber, formatScore, abbreviateWallet } from '../../utils/format'
import { fetchSmartMoneyLeaderboard } from '../../services/smartMoney'
import { AnimatedNumber } from '../ui/AnimatedNumber'

const MotionAside = motion.aside
const MotionLi = motion.li

const FALLBACK_TRADERS = [
  { name: 'AlphaWhale', winRate: 0.68, roi: 0.142, predictions: 312, aiScore: 92.4 },
  { name: 'PolyEdge', winRate: 0.61, roi: 0.94, predictions: 198, aiScore: 87.1 },
  { name: 'SignalFox', winRate: 0.64, roi: 0.81, predictions: 156, aiScore: 84.6 },
  { name: 'MarketMaven', winRate: 0.59, roi: 0.72, predictions: 142, aiScore: 81.2 },
  { name: 'OddsOracle', winRate: 0.57, roi: 0.66, predictions: 118, aiScore: 79.8 },
]

/** Convert API ratio/percent into display percent points (e.g. 83.1). */
function toPercentPoints(value) {
  if (value == null || Number.isNaN(value)) return null
  const abs = Math.abs(value)
  if (abs <= 1) return value * 100
  return value
}

function mapApiTrader(item, index) {
  const name =
    item?.displayName ||
    item?.name ||
    abbreviateWallet(item?.wallet || item?.address) ||
    `Trader ${index + 1}`

  const winRate =
    item?.displayProfile?.winRate ??
    item?.externalWinRate ??
    null

  const roi =
    item?.totalReturn1y ??
    item?.displayProfile?.totalReturnRatio ??
    (item?.externalTotalReturn != null && Math.abs(item.externalTotalReturn) > 1
      ? item.externalTotalReturn / 100
      : item?.externalTotalReturn) ??
    null

  const aiScore =
    item?.displayScore ??
    item?.traderScore ??
    item?.score ??
    null

  return {
    name,
    avatar: item?.profileImage || null,
    winRate,
    roi,
    predictions: item?.predictionCount ?? null,
    aiScore,
    copyability: item?.copyabilityScore ?? null,
  }
}

function PercentValue({ value, signed = false, className = '' }) {
  const points = toPercentPoints(value)
  if (points == null) {
    return <span className="text-brand-muted">—</span>
  }
  return (
    <AnimatedNumber
      value={points}
      decimals={1}
      format={(n) => {
        const body = `${n.toFixed(1)}%`
        if (!signed) return body
        return n > 0 ? `+${body}` : body
      }}
      className={`tabular-nums ${className}`}
    />
  )
}

function TraderAvatar({ name, avatar }) {
  if (avatar) {
    return <img className="hero-board__avatar-img" src={avatar} alt="" loading="lazy" />
  }
  return (
    <span className="hero-board__avatar" aria-hidden>
      {(name || '?').slice(0, 1).toUpperCase()}
    </span>
  )
}

export function LiveLeaderboard() {
  const { t } = useTranslation()
  const [traders, setTraders] = useState(FALLBACK_TRADERS)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchSmartMoneyLeaderboard({
      limit: 12,
      offset: 0,
      eligibleOnly: true,
      includeCopyability: true,
    })
      .then((data) => {
        if (cancelled) return
        const mapped = (data.items || []).slice(0, 8).map(mapApiTrader)
        if (mapped.length > 0) {
          setTraders(mapped)
          setLive(true)
        }
      })
      .catch(() => {
        /* keep fallback sample */
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <MotionAside
      className="hero-board"
      aria-label={t('landing.heroBoard.aria')}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
    >
      <div className="hero-board__chrome">
        <div>
          <p className="hero-board__kicker">{t('landing.heroBoard.kicker')}</p>
          <h2 className="hero-board__title">{t('landing.heroBoard.title')}</h2>
        </div>
        <span className={`hero-board__live ${live ? 'is-live' : ''}`}>
          <span className="hero-board__live-dot" aria-hidden />
          {live ? t('landing.heroBoard.live') : t('landing.heroBoard.sample')}
        </span>
      </div>

      {/* Mobile: stacked cards — avoids horizontal page overflow */}
      <ul className="hero-board__cards">
        {traders.map((trader, index) => (
          <MotionLi
            key={`${trader.name}-${index}`}
            className="hero-board__card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 + index * 0.05, duration: 0.4 }}
          >
            <div className="hero-board__card-head">
              <span className="hero-board__rank">{index + 1}</span>
              <TraderAvatar name={trader.name} avatar={trader.avatar} />
              <span className="hero-board__name">{trader.name}</span>
            </div>
            <div className="hero-board__card-metrics">
              <div>
                <span>{t('landing.heroBoard.colWinRate')}</span>
                <strong>
                  <PercentValue value={trader.winRate} className="text-brand-profit" />
                </strong>
              </div>
              <div>
                <span>{t('landing.heroBoard.colRoi')}</span>
                <strong>
                  <PercentValue value={trader.roi} signed className="text-brand-profit" />
                </strong>
              </div>
              <div>
                <span>{t('landing.heroBoard.colPredictions')}</span>
                <strong>
                  {trader.predictions != null ? (
                    <AnimatedNumber
                      value={trader.predictions}
                      format={(n) => formatNumber(n)}
                      className="tabular-nums"
                    />
                  ) : (
                    <span className="text-brand-muted">—</span>
                  )}
                </strong>
              </div>
              <div>
                <span>{t('landing.heroBoard.colAiScore')}</span>
                <strong>
                  {trader.aiScore != null ? (
                    <AnimatedNumber
                      value={trader.aiScore}
                      decimals={1}
                      format={(n) => formatScore(n)}
                      className="tabular-nums text-brand-blue-soft"
                    />
                  ) : (
                    <span className="text-brand-muted">—</span>
                  )}
                </strong>
              </div>
            </div>
          </MotionLi>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hero-board__table-wrap">
        <table className="hero-board__table">
          <thead>
            <tr>
              <th scope="col">{t('landing.heroBoard.colTrader')}</th>
              <th scope="col">{t('landing.heroBoard.colWinRate')}</th>
              <th scope="col">{t('landing.heroBoard.colRoi')}</th>
              <th scope="col">{t('landing.heroBoard.colPredictions')}</th>
              <th scope="col">{t('landing.heroBoard.colAiScore')}</th>
            </tr>
          </thead>
          <tbody>
            {traders.map((trader, index) => (
              <tr key={`row-${trader.name}-${index}`}>
                <td>
                  <div className="hero-board__trader">
                    <span className="hero-board__rank">{index + 1}</span>
                    <TraderAvatar name={trader.name} avatar={trader.avatar} />
                    <span className="hero-board__name">{trader.name}</span>
                  </div>
                </td>
                <td>
                  <PercentValue value={trader.winRate} className="text-brand-profit" />
                </td>
                <td>
                  <PercentValue value={trader.roi} signed className="text-brand-profit" />
                </td>
                <td>
                  {trader.predictions != null ? (
                    <AnimatedNumber
                      value={trader.predictions}
                      format={(n) => formatNumber(n)}
                      className="tabular-nums"
                    />
                  ) : (
                    <span className="text-brand-muted">—</span>
                  )}
                </td>
                <td>
                  {trader.aiScore != null ? (
                    <AnimatedNumber
                      value={trader.aiScore}
                      decimals={1}
                      format={(n) => formatScore(n)}
                      className="tabular-nums text-brand-blue-soft"
                    />
                  ) : (
                    <span className="text-brand-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hero-board__footer">
        <a className="text-link" href={SITE.leaderboardUrl}>
          {t('landing.heroBoard.explore')} →
        </a>
      </div>
    </MotionAside>
  )
}
