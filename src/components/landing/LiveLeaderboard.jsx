import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { SITE } from '../../lib/site'
import { useLocale } from '../../hooks/useLocale'
import { formatNumber, formatScore, formatSignedCurrency, abbreviateWallet } from '../../utils/format'
import { fetchSmartMoneyLeaderboard } from '../../services/smartMoney'
import { setSmartMoneyListPreview } from '../../lib/smartMoneySessionCache'
import { IconChevronDown, IconCopy, IconMedal, IconTrendingUp } from '../ui/Icons'
import { PnlSparkline } from './PnlSparkline'

const MotionAside = motion.aside
const MotionLi = motion.li
const BOARD_LIMIT = 12

const PRIMARY_CATEGORIES = [
  { value: null, key: 'all' },
  { value: 'POLITICS', key: 'politics' },
  { value: 'SPORTS', key: 'sports' },
  { value: 'CRYPTO', key: 'crypto' },
  { value: 'ESPORTS', key: 'esports' },
]

const MORE_CATEGORIES = [
  { value: 'FINANCE', key: 'finance' },
  { value: 'TECH', key: 'tech' },
  { value: 'CULTURE', key: 'culture' },
  { value: 'ECONOMICS', key: 'economics' },
  { value: 'WEATHER', key: 'weather' },
  { value: 'MENTIONS', key: 'mentions' },
]

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
  { name: 'AlphaWhale', wallet: '0x1111111111111111111111111111111111111111', winRate: 0.68, avgProfitRate: 0.42, profitFactor: 8.2, predictions: 312, aiScore: 92.4, totalPnl: 184200, trades7d: 64, recentPnl7d: 12400, sparkline: sampleSparkline(1, 1.4) },
  { name: 'PolyEdge', wallet: '0x2222222222222222222222222222222222222222', winRate: 0.61, avgProfitRate: 0.31, profitFactor: 5.4, predictions: 198, aiScore: 87.1, totalPnl: 96200, trades7d: 41, recentPnl7d: 6100, sparkline: sampleSparkline(2, 1.1) },
  { name: 'SignalFox', wallet: '0x3333333333333333333333333333333333333333', winRate: 0.64, avgProfitRate: 0.28, profitFactor: 4.8, predictions: 156, aiScore: 84.6, totalPnl: 74300, trades7d: 33, recentPnl7d: 4200, sparkline: sampleSparkline(3, 0.9) },
  { name: 'MarketMaven', wallet: '0x4444444444444444444444444444444444444444', winRate: 0.59, avgProfitRate: 0.22, profitFactor: 3.9, predictions: 142, aiScore: 81.2, totalPnl: 51800, trades7d: 28, recentPnl7d: 2800, sparkline: sampleSparkline(4, 0.7) },
  { name: 'OddsOracle', wallet: '0x5555555555555555555555555555555555555555', winRate: 0.57, avgProfitRate: 0.19, profitFactor: 3.1, predictions: 118, aiScore: 79.8, totalPnl: 42100, trades7d: 22, recentPnl7d: 1900, sparkline: sampleSparkline(5, 0.55) },
  { name: 'EdgeHunter', wallet: '0x6666666666666666666666666666666666666666', winRate: 0.55, avgProfitRate: 0.16, profitFactor: 2.7, predictions: 204, aiScore: 77.4, totalPnl: 38600, trades7d: 37, recentPnl7d: 1500, sparkline: sampleSparkline(6, 0.4) },
  { name: 'QuietFlow', wallet: '0x7777777777777777777777777777777777777777', winRate: 0.62, avgProfitRate: 0.21, profitFactor: 3.4, predictions: 91, aiScore: 76.1, totalPnl: 27400, trades7d: 18, recentPnl7d: 980, sparkline: sampleSparkline(7, 0.85) },
  { name: 'NovaDesk', wallet: '0x8888888888888888888888888888888888888888', winRate: 0.53, avgProfitRate: 0.12, profitFactor: 2.1, predictions: 167, aiScore: 74.8, totalPnl: 19800, trades7d: 25, recentPnl7d: 640, sparkline: sampleSparkline(8, 0.25) },
  { name: 'TideMaker', wallet: '0x9999999999999999999999999999999999999999', winRate: 0.58, avgProfitRate: 0.14, profitFactor: 2.4, predictions: 129, aiScore: 73.2, totalPnl: 16200, trades7d: 19, recentPnl7d: 510, sparkline: sampleSparkline(9, 0.5) },
  { name: 'ClipTrade', wallet: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', winRate: 0.51, avgProfitRate: 0.09, profitFactor: 1.8, predictions: 88, aiScore: 71.6, totalPnl: 9400, trades7d: 14, recentPnl7d: 220, sparkline: sampleSparkline(10, 0.15) },
  { name: 'NorthBook', wallet: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', winRate: 0.54, avgProfitRate: 0.11, profitFactor: 1.9, predictions: 73, aiScore: 70.1, totalPnl: 6100, trades7d: 11, recentPnl7d: 140, sparkline: sampleSparkline(11, 0.35) },
  { name: 'AmberLane', wallet: '0xcccccccccccccccccccccccccccccccccccccccc', winRate: 0.49, avgProfitRate: 0.07, profitFactor: 1.5, predictions: 64, aiScore: 68.4, totalPnl: 2800, trades7d: 8, recentPnl7d: 60, sparkline: sampleSparkline(12, 0.05) },
]

function toPercentPoints(value) {
  if (value == null || Number.isNaN(value)) return null
  const abs = Math.abs(value)
  if (abs <= 1) return value * 100
  return value
}

function shortWallet(wallet) {
  if (!wallet || wallet.length < 14) return wallet || '—'
  return `${wallet.slice(0, 4)}…${wallet.slice(-4)}`
}

function formatProfitFactor(trader) {
  if (trader.profitFactorNoLoss) return '∞'
  const n = trader.profitFactor
  if (n == null || Number.isNaN(n)) return null
  return n >= 99 ? '>99' : n.toFixed(2)
}

function formatAvgProfitRate(value) {
  if (value == null || Number.isNaN(value)) return null
  const pct = value * 100
  const body = `${Math.abs(pct).toFixed(1)}%`
  if (pct > 0) return `+${body}`
  if (pct < 0) return `-${body}`
  return body
}

function isWinStrong(winRate) {
  const points = toPercentPoints(winRate)
  return points != null && points >= 58
}

function scoreTone(score) {
  if (score == null || Number.isNaN(score)) return 'neutral'
  if (score >= 70) return 'high'
  if (score >= 40) return 'mid'
  return 'low'
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
    avgProfitRate: item?.avgClosedReturnRate ?? null,
    profitFactor: item?.profitFactor ?? null,
    profitFactorNoLoss: Boolean(item?.profitFactorNoLoss),
    predictions: item?.predictionCount ?? null,
    aiScore,
    totalPnl: item?.totalPnl ?? null,
    trades7d: item?.trades7d ?? null,
    recentPnl7d: item?.recentPnl7d ?? null,
    sparkline: Array.isArray(item?.sparkline) ? item.sparkline : [],
    rank: index + 1,
    score: aiScore,
  }
}

function RankBadge({ rank }) {
  if (rank === 1 || rank === 2 || rank === 3) {
    return (
      <span className={`hero-board__medal hero-board__medal--${rank}`} title={`#${rank}`} aria-label={`#${rank}`}>
        <IconMedal />
      </span>
    )
  }
  return <span className="hero-board__rank">#{rank}</span>
}

function ScorePill({ score }) {
  if (score == null || Number.isNaN(score)) {
    return <span className="text-brand-muted">—</span>
  }
  return (
    <span className={`hero-board__score is-${scoreTone(score)}`}>
      {formatScore(score)}
    </span>
  )
}

function PnlValue({ value }) {
  if (value == null || Number.isNaN(value)) {
    return <span className="text-brand-muted">—</span>
  }
  const tone = value > 0 ? 'is-up' : value < 0 ? 'is-down' : ''
  return <span className={`hero-board__pnl tabular-nums ${tone}`}>{formatSignedCurrency(value)}</span>
}

function WinRateValue({ value }) {
  const points = toPercentPoints(value)
  if (points == null) {
    return <span className="text-brand-muted">—</span>
  }
  return (
    <span className="hero-board__winrate">
      {isWinStrong(value) ? <IconTrendingUp className="hero-board__trend" /> : null}
      <span className="tabular-nums">{`${points.toFixed(1)}%`}</span>
    </span>
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

function CopyWalletButton({ wallet, t }) {
  const [copied, setCopied] = useState(false)
  if (!wallet) return null

  async function handleCopy(event) {
    event.preventDefault()
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(wallet)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      className="hero-board__copy"
      onClick={handleCopy}
      title={copied ? t('landing.heroBoard.copied') : t('landing.heroBoard.copyAddress')}
      aria-label={t('landing.heroBoard.copyAddress')}
    >
      <IconCopy />
    </button>
  )
}

function TraderIdentity({ trader, t }) {
  return (
    <div className="hero-board__identity">
      <div className="hero-board__identity-row">
        <TraderAvatar name={trader.name} avatar={trader.avatar} />
        <span className="hero-board__name">{trader.name}</span>
        <CopyWalletButton wallet={trader.wallet} t={t} />
      </div>
      {trader.wallet ? (
        <span className="hero-board__wallet" title={trader.wallet}>
          {shortWallet(trader.wallet)}
        </span>
      ) : null}
    </div>
  )
}

function MetricCell({ label, children }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  )
}

function TraderMetrics({ trader, t }) {
  const profitFactor = formatProfitFactor(trader)
  const avgRate = formatAvgProfitRate(trader.avgProfitRate)
  return (
    <>
      <MetricCell label={t('landing.heroBoard.colScore')}>
        <ScorePill score={trader.aiScore} />
      </MetricCell>
      <MetricCell label={t('landing.heroBoard.colPnl')}>
        <PnlValue value={trader.totalPnl} />
      </MetricCell>
      <MetricCell label={t('landing.heroBoard.colAvgProfit')}>
        {avgRate ?? <span className="text-brand-muted">—</span>}
      </MetricCell>
      <MetricCell label={t('landing.heroBoard.colProfitFactor')}>
        {profitFactor ?? <span className="text-brand-muted">—</span>}
      </MetricCell>
      <MetricCell label={t('landing.heroBoard.colWinRate')}>
        <WinRateValue value={trader.winRate} />
      </MetricCell>
      <MetricCell label={t('landing.heroBoard.colActivity')}>
        <span className="hero-board__activity">
          <span>
            {trader.trades7d != null
              ? t('landing.heroBoard.tradesCount', { count: formatNumber(trader.trades7d) })
              : '—'}
          </span>
          {trader.recentPnl7d != null ? <PnlValue value={trader.recentPnl7d} /> : null}
        </span>
      </MetricCell>
      <div className="hero-board__card-spark">
        <span>{t('landing.heroBoard.colCurve')}</span>
        <PnlSparkline points={trader.sparkline} width={180} height={32} />
      </div>
    </>
  )
}

function CategoryBar({ category, onChange, t }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef(null)
  const moreActive = MORE_CATEGORIES.some((item) => item.value === category)

  useEffect(() => {
    if (!moreOpen) return undefined
    const onPointer = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [moreOpen])

  return (
    <div className="hero-board__filters">
      {PRIMARY_CATEGORIES.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`hero-board__chip ${category === item.value ? 'is-active' : ''}`}
          aria-pressed={category === item.value}
          onClick={() => onChange(item.value)}
        >
          {t(`landing.heroBoard.cat.${item.key}`)}
        </button>
      ))}
      <div className="hero-board__more" ref={moreRef}>
        <button
          type="button"
          className={`hero-board__chip ${moreActive || moreOpen ? 'is-active' : ''}`}
          aria-expanded={moreOpen}
          aria-haspopup="menu"
          onClick={() => setMoreOpen((open) => !open)}
        >
          {t('landing.heroBoard.cat.more')}
          <IconChevronDown className={`hero-board__more-caret ${moreOpen ? 'is-open' : ''}`} />
        </button>
        {moreOpen ? (
          <div className="hero-board__more-menu" role="menu">
            {MORE_CATEGORIES.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`hero-board__chip ${category === item.value ? 'is-active' : ''}`}
                onClick={() => {
                  onChange(item.value)
                  setMoreOpen(false)
                }}
              >
                {t(`landing.heroBoard.cat.${item.key}`)}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function LiveLeaderboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { localizePath } = useLocale()
  const [traders, setTraders] = useState(FALLBACK_TRADERS)
  const [live, setLive] = useState(false)
  const [category, setCategory] = useState(null)
  const [empty, setEmpty] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchSmartMoneyLeaderboard({
      limit: BOARD_LIMIT,
      offset: 0,
      eligibleOnly: true,
      includeCopyability: true,
      category: category || undefined,
    })
      .then((data) => {
        if (cancelled) return
        const mapped = (data.items || []).slice(0, BOARD_LIMIT).map(mapApiTrader)
        if (mapped.length > 0) {
          setTraders(mapped)
          setLive(true)
          setEmpty(false)
        } else {
          setTraders([])
          setEmpty(true)
        }
      })
      .catch(() => {
        if (!cancelled && category) {
          setTraders([])
          setEmpty(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [category])

  const metricCols = useMemo(
    () => [
      t('landing.heroBoard.colScore'),
      t('landing.heroBoard.colPnl'),
      t('landing.heroBoard.colAvgProfit'),
      t('landing.heroBoard.colProfitFactor'),
      t('landing.heroBoard.colWinRate'),
      t('landing.heroBoard.colCurve'),
      t('landing.heroBoard.colActivity'),
    ],
    [t]
  )

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

      <CategoryBar category={category} onChange={setCategory} t={t} />

      {empty ? (
        <p className="hero-board__empty">{t('landing.heroBoard.emptyCategory')}</p>
      ) : (
        <>
          <ul className="hero-board__cards">
            {traders.map((trader, index) => (
              <MotionLi
                key={`${trader.wallet || trader.name}-${index}`}
                className={`hero-board__card ${trader.wallet ? 'is-clickable' : ''}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + index * 0.03, duration: 0.35 }}
                onClick={() => openTrader(trader)}
                onKeyDown={(event) => handleTraderKeyDown(event, trader)}
                tabIndex={trader.wallet ? 0 : undefined}
              >
                <div className="hero-board__card-head">
                  <RankBadge rank={index + 1} />
                  <TraderIdentity trader={trader} t={t} />
                </div>
                <div className="hero-board__card-metrics">
                  <TraderMetrics trader={trader} t={t} />
                </div>
              </MotionLi>
            ))}
          </ul>

          <div className="hero-board__table-wrap">
            <table className="hero-board__table">
              <thead>
                <tr className="hero-board__groups">
                  <th colSpan={2} />
                  <th>{t('landing.heroBoard.groupOverview')}</th>
                  <th colSpan={6}>{t('landing.heroBoard.groupPerformance')}</th>
                </tr>
                <tr>
                  <th scope="col">{t('landing.heroBoard.colRank')}</th>
                  <th scope="col">{t('landing.heroBoard.colUser')}</th>
                  {metricCols.map((label) => (
                    <th key={label} scope="col" className="hero-board__metric-th">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {traders.map((trader, index) => {
                  const profitFactor = formatProfitFactor(trader)
                  const avgRate = formatAvgProfitRate(trader.avgProfitRate)
                  return (
                    <tr
                      key={`row-${trader.wallet || trader.name}-${index}`}
                      className={trader.wallet ? 'is-clickable' : undefined}
                      onClick={() => openTrader(trader)}
                      onKeyDown={(event) => handleTraderKeyDown(event, trader)}
                      tabIndex={trader.wallet ? 0 : undefined}
                    >
                      <td className="hero-board__metric-td">
                        <RankBadge rank={index + 1} />
                      </td>
                      <td>
                        <TraderIdentity trader={trader} t={t} />
                      </td>
                      <td className="hero-board__metric-td">
                        <ScorePill score={trader.aiScore} />
                      </td>
                      <td className="hero-board__metric-td">
                        <PnlValue value={trader.totalPnl} />
                      </td>
                      <td className="hero-board__metric-td tabular-nums">
                        {avgRate ?? <span className="text-brand-muted">—</span>}
                      </td>
                      <td className="hero-board__metric-td tabular-nums">
                        {profitFactor ?? <span className="text-brand-muted">—</span>}
                      </td>
                      <td className="hero-board__metric-td">
                        <WinRateValue value={trader.winRate} />
                      </td>
                      <td className="hero-board__metric-td">
                        <PnlSparkline points={trader.sparkline} width={160} height={36} />
                      </td>
                      <td className="hero-board__metric-td">
                        <div className="hero-board__activity">
                          <span>
                            {trader.trades7d != null
                              ? t('landing.heroBoard.tradesCount', { count: formatNumber(trader.trades7d) })
                              : '—'}
                          </span>
                          {trader.recentPnl7d != null ? <PnlValue value={trader.recentPnl7d} /> : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="hero-board__footer">
        <a className="text-link" href={SITE.leaderboardUrl}>
          {t('landing.heroBoard.explore')} →
        </a>
      </div>
    </MotionAside>
  )
}
