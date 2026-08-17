import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { SITE } from '../../lib/site'
import { useLocale } from '../../hooks/useLocale'
import { formatNumber, formatScore, formatSignedCurrency, abbreviateWallet } from '../../utils/format'
import { fetchSmartMoneyLeaderboard } from '../../services/smartMoney'
import { setSmartMoneyListPreview } from '../../lib/smartMoneySessionCache'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { PnlSparkline } from './PnlSparkline'

const MotionAside = motion.aside
const MotionLi = motion.li
const BOARD_LIMIT = 12

function sampleSparkline(seed, trend = 1) {
  const points = []
  let value = 40 + seed * 8
  for (let i = 0; i < 24; i += 1) {
    value += Math.sin(seed + i * 0.55) * 3.2 + trend * 1.15
    points.push({ t: i, v: value })
  }
  return points
}

const FALLBACK_TRADERS = [
  { name: 'AlphaWhale', winRate: 0.68, roi: 0.142, predictions: 312, aiScore: 92.4, totalPnl: 184200, sparkline: sampleSparkline(1, 1.4) },
  { name: 'PolyEdge', winRate: 0.61, roi: 0.94, predictions: 198, aiScore: 87.1, totalPnl: 96200, sparkline: sampleSparkline(2, 1.1) },
  { name: 'SignalFox', winRate: 0.64, roi: 0.81, predictions: 156, aiScore: 84.6, totalPnl: 74300, sparkline: sampleSparkline(3, 0.9) },
  { name: 'MarketMaven', winRate: 0.59, roi: 0.72, predictions: 142, aiScore: 81.2, totalPnl: 51800, sparkline: sampleSparkline(4, 0.7) },
  { name: 'OddsOracle', winRate: 0.57, roi: 0.66, predictions: 118, aiScore: 79.8, totalPnl: 42100, sparkline: sampleSparkline(5, 0.55) },
  { name: 'EdgeHunter', winRate: 0.55, roi: 0.58, predictions: 204, aiScore: 77.4, totalPnl: 38600, sparkline: sampleSparkline(6, 0.4) },
  { name: 'QuietFlow', winRate: 0.62, roi: 0.49, predictions: 91, aiScore: 76.1, totalPnl: 27400, sparkline: sampleSparkline(7, 0.85) },
  { name: 'NovaDesk', winRate: 0.53, roi: 0.41, predictions: 167, aiScore: 74.8, totalPnl: 19800, sparkline: sampleSparkline(8, 0.25) },
  { name: 'TideMaker', winRate: 0.58, roi: 0.37, predictions: 129, aiScore: 73.2, totalPnl: 16200, sparkline: sampleSparkline(9, 0.5) },
  { name: 'ClipTrade', winRate: 0.51, roi: 0.29, predictions: 88, aiScore: 71.6, totalPnl: 9400, sparkline: sampleSparkline(10, 0.15) },
  { name: 'NorthBook', winRate: 0.54, roi: 0.22, predictions: 73, aiScore: 70.1, totalPnl: 6100, sparkline: sampleSparkline(11, 0.35) },
  { name: 'AmberLane', winRate: 0.49, roi: 0.18, predictions: 64, aiScore: 68.4, totalPnl: 2800, sparkline: sampleSparkline(12, 0.05) },
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
    wallet: item?.wallet || item?.address || null,
    avatar: item?.profileImage || null,
    winRate,
    roi,
    predictions: item?.predictionCount ?? null,
    aiScore,
    copyability: item?.copyabilityScore ?? null,
    totalPnl: item?.totalPnl ?? null,
    sparkline: Array.isArray(item?.sparkline) ? item.sparkline : [],
    rank: index + 1,
    score: aiScore,
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

function PnlValue({ value }) {
  if (value == null || Number.isNaN(value)) {
    return <span className="text-brand-muted">—</span>
  }
  const tone = value > 0 ? 'is-up' : value < 0 ? 'is-down' : ''
  return <span className={`hero-board__pnl tabular-nums ${tone}`}>{formatSignedCurrency(value)}</span>
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

function TraderMetrics({ trader, t }) {
  return (
    <>
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
        <span>{t('landing.heroBoard.colPnl')}</span>
        <strong>
          <PnlValue value={trader.totalPnl} />
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
      <div className="hero-board__card-spark">
        <span>{t('landing.heroBoard.colCurve')}</span>
        <PnlSparkline points={trader.sparkline} width={180} height={32} />
      </div>
    </>
  )
}

export function LiveLeaderboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { localizePath } = useLocale()
  const [traders, setTraders] = useState(FALLBACK_TRADERS)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchSmartMoneyLeaderboard({
      limit: BOARD_LIMIT,
      offset: 0,
      eligibleOnly: true,
      includeCopyability: true,
    })
      .then((data) => {
        if (cancelled) return
        const mapped = (data.items || []).slice(0, BOARD_LIMIT).map(mapApiTrader)
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

  function openTrader(trader) {
    if (!trader?.wallet) return
    setSmartMoneyListPreview(trader.wallet, {
      displayName: trader.name ?? null,
      profileImage: trader.avatar ?? null,
      rank: trader.rank ?? null,
      score: trader.score != null ? String(trader.score) : null,
    })
    navigate(localizePath(`/backtest/${encodeURIComponent(trader.wallet)}`))
  }

  function handleTraderKeyDown(event, trader) {
    if (!trader?.wallet) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openTrader(trader)
    }
  }

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
            key={`${trader.wallet || trader.name}-${index}`}
            className={`hero-board__card ${trader.wallet ? 'is-clickable' : ''}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 + index * 0.04, duration: 0.4 }}
            onClick={() => openTrader(trader)}
            onKeyDown={(event) => handleTraderKeyDown(event, trader)}
            role={trader.wallet ? 'link' : undefined}
            tabIndex={trader.wallet ? 0 : undefined}
          >
            <div className="hero-board__card-head">
              <span className="hero-board__rank">{index + 1}</span>
              <TraderAvatar name={trader.name} avatar={trader.avatar} />
              <span className="hero-board__name">{trader.name}</span>
            </div>
            <div className="hero-board__card-metrics">
              <TraderMetrics trader={trader} t={t} />
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
              <th scope="col">{t('landing.heroBoard.colPnl')}</th>
              <th scope="col">{t('landing.heroBoard.colPredictions')}</th>
              <th scope="col">{t('landing.heroBoard.colAiScore')}</th>
              <th scope="col">{t('landing.heroBoard.colCurve')}</th>
            </tr>
          </thead>
          <tbody>
            {traders.map((trader, index) => (
              <tr
                key={`row-${trader.wallet || trader.name}-${index}`}
                className={trader.wallet ? 'is-clickable' : undefined}
                onClick={() => openTrader(trader)}
                onKeyDown={(event) => handleTraderKeyDown(event, trader)}
                tabIndex={trader.wallet ? 0 : undefined}
              >
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
                  <PnlValue value={trader.totalPnl} />
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
                <td>
                  <PnlSparkline points={trader.sparkline} />
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
