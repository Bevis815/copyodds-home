import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useLocale } from '../hooks/useLocale'
import i18n from '../i18n/i18n'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { extractWalletFromSegment, fetchSmartMoneyRiskProfile } from '../services/smartMoney'
import {
  getCachedSmartMoneyProfile,
  getSmartMoneyListPreview,
  hydrateSmartMoneyPeriodCache,
  setCachedSmartMoneyProfile,
} from '../lib/smartMoneySessionCache'
import {
  abbreviateWallet,
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  formatRatio,
  formatScore,
  formatSignedCurrency,
  formatSignedPercent,
  formatSignedReturnOrPercent,
} from '../utils/format'

const POLYGONSCAN_ADDRESS_BASE = 'https://polygonscan.com/address'
const PERIOD_OPTIONS = ['1D', '1W', '1M', 'ALL']

function isRiskPeriod(value) {
  return typeof value === 'string' && PERIOD_OPTIONS.includes(value)
}
const CHART_WIDTH = 720
const CHART_HEIGHT = 260
const CHART_PADDING = 18


function transformPointsForMode(points, mode) {
  if (!Array.isArray(points) || points.length === 0) {
    return []
  }
  const first = points[0].value
  if (mode === 'pnl') {
    return points.map((p) => ({ ts: p.ts, value: p.value - first }))
  }
  if (mode === 'equity') {
    return points.map((p) => {
      const eq = first === 0 ? 100 + (p.value - first) : (p.value / first) * 100
      return { ts: p.ts, value: eq }
    })
  }
  const equity = points.map((p) => (first === 0 ? 100 + (p.value - first) : (p.value / first) * 100))
  let peak = equity[0]
  return points.map((p, i) => {
    peak = Math.max(peak, equity[i])
    const dd = peak > 0 ? ((equity[i] - peak) / peak) * 100 : 0
    return { ts: p.ts, value: dd }
  })
}

function getBenchmarkValueForMode(rawPoints, mode) {
  if (!rawPoints.length) {
    return null
  }
  const first = rawPoints[0].value
  if (mode === 'pnl') {
    return 0
  }
  if (mode === 'equity') {
    return first === 0 ? 100 : 100
  }
  return 0
}

function getOfficialProfileUrl(wallet, locale) {
  const seg = locale === 'zh' ? 'zh' : 'en'
  return `https://polymarket.com/${seg}/${wallet}`
}

function isValidWallet(wallet) {
  return /^0x[a-fA-F0-9]{40}$/.test(wallet ?? '')
}

/** 仅 sessionStorage：不写进 URL/历史分享链接；刷新同标签页依赖此映射解析昵称路径下的 wallet */
const BACKTEST_LABEL_WALLET_STORAGE_KEY = 'copyodds:backtestLabelWallet:v1'

function readStoredWalletForLabel(label) {
  if (label == null || String(label).trim() === '') {
    return null
  }
  try {
    const raw = sessionStorage.getItem(BACKTEST_LABEL_WALLET_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const map = JSON.parse(raw)
    if (!map || typeof map !== 'object' || Array.isArray(map)) {
      return null
    }
    const w = map[String(label).trim().toLowerCase()]
    return isValidWallet(w) ? w.toLowerCase() : null
  } catch {
    return null
  }
}

function rememberWalletForLabel(label, wallet) {
  if (label == null || String(label).trim() === '' || !isValidWallet(wallet)) {
    return
  }
  try {
    const raw = sessionStorage.getItem(BACKTEST_LABEL_WALLET_STORAGE_KEY)
    let map = {}
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        map = parsed
      }
    }
    map[String(label).trim().toLowerCase()] = String(wallet).toLowerCase()
    sessionStorage.setItem(BACKTEST_LABEL_WALLET_STORAGE_KEY, JSON.stringify(map))
  } catch {
    /* quota / private mode */
  }
}

/** Base58，与 0x 区分 */
function _isProbableSolanaAddress(wallet) {
  if (wallet == null) {
    return false
  }
  const s = String(wallet).trim()
  if (!s || s.startsWith('0x')) {
    return false
  }
  if (s.length < 32 || s.length > 44) {
    return false
  }
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s)
}

/**
 * Polymarket 资金与交互主要在 Polygon；GMGN 偏 DEX/Meme，对预测市场地址常为「暂无数据」。
 * EVM：主链 Polygonscan，次选 GMGN/ETH 供交叉查看。
 */
function getWalletOnchainExplorerMeta(wallet) {
  if (wallet == null) {
    return null
  }
  const w = String(wallet).trim()
  if (!w) {
    return null
  }
  if (isValidWallet(w)) {
    const lower = w.toLowerCase()
    return {
      main: {
        url: `${POLYGONSCAN_ADDRESS_BASE}/${lower}`,
        label: i18n.t('backtest.polygonscan'),
        ariaLabel: i18n.t('backtest.polygonscanAria'),
      },
    }
  }
  return null
}

function labelsEqual(a, b) {
  return String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase()
}

function normalizeTraderLabel(value) {
  if (value == null) {
    return null
  }

  const text = String(value).trim()
  if (!text) {
    return null
  }

  if (/^0x[a-fA-F0-9]{12,}$/.test(text)) {
    return null
  }

  // Polymarket 常将 proxy / 内部 id 存为 0x+40hex-数字；非人类昵称，不用于标题或 “换 URL”
  if (/^0x[a-fA-F0-9]{40}-\d+$/i.test(text)) {
    return null
  }

  return text
}

/** 完整 0x 地址：缩写成 0xabcd…wxyz，供标题展示（不参与 URL 替换） */
function shortenFullWalletLabel(value) {
  if (value == null) {
    return null
  }
  const t = String(value).trim()
  if (!/^0x[a-fA-F0-9]{40}$/i.test(t)) {
    return null
  }
  const lower = t.toLowerCase()
  return `${lower.slice(0, 6)}...${lower.slice(-4)}`
}

/** Polymarket proxy 形态 0x+40hex-数字：缩短 hex 段便于扫一眼 */
function shortenProxyWalletLabel(value) {
  if (value == null) {
    return null
  }
  const t = String(value).trim()
  const m = t.match(/^(0x[a-fA-F0-9]{40})-(\d+)$/i)
  if (!m) {
    return null
  }
  const hex = m[1].toLowerCase()
  return `${hex.slice(0, 6)}...${hex.slice(-4)}-${m[2]}`
}

/** summary 与 snapshot profile 字段互斥补全：summary 里 displayName 常为 null 时不应盖住 profile 里的名字 */
function mergeProfileIdentity(profile) {
  if (profile == null) {
    return null
  }
  const p = profile.profile ?? {}
  const s = profile.summary ?? {}
  const merged = { ...p, ...s }
  merged.displayName = s.displayName ?? p.displayName ?? null
  merged.profileSlug = s.profileSlug ?? p.profileSlug ?? null
  merged.xUsername = s.xUsername ?? p.xUsername ?? null
  merged.profileImage = s.profileImage ?? p.profileImage ?? null
  merged.joinedAtText = s.joinedAtText ?? p.joinedAtText ?? null
  merged.wallet = s.wallet ?? p.wallet ?? profile.wallet ?? null
  return merged
}

/** 详情页展示名次：来自榜单列表 offset+index；勿用 summary.rank（内部评分序） */
function getDisplayLeaderboardRank(profile, listPreview) {
  if (listPreview?.rank != null && Number.isFinite(Number(listPreview.rank))) {
    return Number(listPreview.rank)
  }
  const s = profile?.summary
  if (!s) {
    return null
  }
  const rankBy = listPreview?.rankBy ?? 'ALL'
  const sourceRank =
    rankBy === 'WEEK'
      ? s.sourceRankWeek
      : rankBy === 'MONTH'
        ? s.sourceRankMonth
        : s.sourceRankAll
  if (sourceRank != null && Number.isFinite(Number(sourceRank))) {
    return Number(sourceRank)
  }
  return null
}

/** 仅人类可读昵称 / slug / X：用于「替换 URL」，避免把整段钱包或缩写过段塞进 path */
function getHumanReadableUrlLabel(identity) {
  if (!identity) {
    return null
  }
  const candidates = [
    normalizeTraderLabel(identity.displayName),
    normalizeTraderLabel(identity.profileSlug),
    normalizeTraderLabel(
      identity.xUsername ? `@${String(identity.xUsername).replace(/^@+/, '')}` : null
    ),
  ]
  return candidates.find(Boolean) ?? null
}

/** 页面标题：在人类可读字段之外，API 若用完整钱包 / proxy id 填 displayName，则用缩短串展示 */
function getDisplayTraderTitleLabel(identity) {
  if (!identity) {
    return null
  }
  const human = getHumanReadableUrlLabel(identity)
  if (human) {
    return human
  }
  return (
    shortenFullWalletLabel(identity.displayName) ??
    shortenFullWalletLabel(identity.profileSlug) ??
    shortenProxyWalletLabel(identity.displayName) ??
    shortenProxyWalletLabel(identity.profileSlug) ??
    null
  )
}

function getTraderTitle(identity, wallet) {
  const resolved = getDisplayTraderTitleLabel(identity)
  if (resolved) {
    return resolved
  }

  return isValidWallet(wallet) ? i18n.t('backtest.unnamedTrader') : i18n.t('backtest.traderDetailFallback')
}

function getRiskTone(level) {
  switch (level) {
    case 'LOW':
      return 'text-emerald-300'
    case 'MEDIUM':
      return 'text-amber-200'
    case 'HIGH':
      return 'text-orange-300'
    case 'EXTREME':
      return 'text-rose-300'
    default:
      return 'text-slate-300'
  }
}

function getValueToneClass(value, positiveClass = 'text-emerald-200', negativeClass = 'text-rose-200') {
  if (value == null || Number.isNaN(value)) {
    return 'text-white'
  }
  if (value > 0) {
    return positiveClass
  }
  if (value < 0) {
    return negativeClass
  }
  return 'text-white'
}

function getRiskSurfaceClass(level) {
  switch (level) {
    case 'LOW':
      return 'border-emerald-400/25 bg-emerald-400/[0.08]'
    case 'MEDIUM':
      return 'border-amber-400/25 bg-amber-400/[0.08]'
    case 'HIGH':
      return 'border-orange-400/25 bg-orange-400/[0.08]'
    case 'EXTREME':
      return 'border-rose-400/25 bg-rose-400/[0.08]'
    default:
      return 'border-white/10 bg-white/[0.04]'
  }
}

function getCoverageSummary(curve, fallbackPoints, period) {
  if (!curve) {
    return '--'
  }

  const pointCount = Array.isArray(curve.points) ? curve.points.length : 0
  if (pointCount === 0 && curve.coverageDays == null) {
    const avail = Array.isArray(curve.availablePeriods) && curve.availablePeriods.length > 0
    return avail
      ? i18n.t('coverage.noPointsTry', { periods: curve.availablePeriods.join(' / ') })
      : i18n.t('coverage.noTsPoints')
  }

  if (curve.coverageDays != null) {
    const covered = Math.round(curve.coverageDays * 10) / 10
    if (curve.requestedPeriodDays != null) {
      return i18n.t('coverage.daysSlash', {
        covered: formatNumber(covered),
        requested: formatNumber(curve.requestedPeriodDays),
      })
    }
    return i18n.t('coverage.daysOnly', { covered: formatNumber(covered) })
  }

  return formatCoverage(fallbackPoints, period)
}

function getCoverageState(curve) {
  if (!curve) {
    return { label: i18n.t('coverage.unknown'), tone: 'text-slate-300', chip: 'badge-neutral' }
  }
  const pointCount = Array.isArray(curve.points) ? curve.points.length : 0
  if (pointCount === 0) {
    return { label: i18n.t('coverage.noPoints'), tone: 'text-amber-200', chip: 'badge-metal' }
  }
  if (curve.hasFullRequestedWindow === true) {
    return { label: i18n.t('coverage.fullWindow'), tone: 'text-emerald-300', chip: 'badge-neutral' }
  }
  if (curve.hasFullRequestedWindow === false) {
    return { label: i18n.t('coverage.partialHistory'), tone: 'text-amber-200', chip: 'badge-metal' }
  }
  return { label: i18n.t('coverage.unknown'), tone: 'text-slate-300', chip: 'badge-neutral' }
}

function formatWindowRange(startTs, endTs) {
  if (!startTs || !endTs) {
    return '--'
  }
  return `${formatDateTime(startTs)} -> ${formatDateTime(endTs)}`
}

function formatAvailablePeriods(periods) {
  if (!Array.isArray(periods) || periods.length === 0) {
    return '—'
  }
  return periods.join(' · ')
}

function getTraderAvatarLabel(identity, wallet) {
  const label =
    identity?.displayName ??
    identity?.profileSlug ??
    (identity?.xUsername ? `@${identity.xUsername}` : null) ??
    wallet ??
    'TR'

  const cleaned = String(label).replace(/^@/, '').trim()
  if (!cleaned) {
    return 'TR'
  }

  return cleaned
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function buildAnalystNotes(profile, period, t) {
  if (!profile) {
    return []
  }

  const notes = []
  const curve = profile?.curve
  const pointCount = Array.isArray(curve?.points) ? curve.points.length : 0
  if (pointCount === 0) {
    notes.push(
      t('backtest.noteNoCurve', {
        period,
        source: profile?.summary?.externalMetricsSource ?? profile?.risk?.source ?? t('common.dash'),
      })
    )
  }
  if (curve?.activePeriod && curve?.period && curve.activePeriod !== curve.period) {
    notes.push(
      t('backtest.noteFallback', {
        requested: curve.period,
        active: curve.activePeriod,
      })
    )
  }
  const riskLevel = profile?.risk?.riskLevel ?? 'UNKNOWN'
  const positiveDayRatio = profile?.backtest?.positiveDayRatio
  const maxDrawdown = profile?.risk?.maxDrawdownPercent
  const sampledDayCount = profile?.backtest?.sampledDayCount ?? 0
  const returnRatio = profile?.risk?.returnRatio
  const score = profile?.summary?.score

  if (returnRatio != null) {
    notes.push(
      t('backtest.noteReturn', {
        period,
        ret: formatSignedReturnOrPercent(returnRatio),
        score: formatScore(score),
      })
    )
  }

  if (positiveDayRatio != null && maxDrawdown != null) {
    if (positiveDayRatio >= 0.6 && maxDrawdown <= 0.15) {
      notes.push(t('backtest.noteStable'))
    } else if (maxDrawdown >= 0.3 || riskLevel === 'HIGH' || riskLevel === 'EXTREME') {
      notes.push(t('backtest.noteRough'))
    }
  }

  if (profile?.curve?.hasFullRequestedWindow === false) {
    notes.push(t('backtest.notePartial'))
  } else if (sampledDayCount > 0 && sampledDayCount < 5) {
    notes.push(t('backtest.noteThinSample'))
  } else if (sampledDayCount >= 5) {
    notes.push(t('backtest.noteSampled', { count: formatNumber(sampledDayCount) }))
  }

  return notes.slice(0, 3)
}

function buildChartGeometry(points, benchmarkValue) {
  if (!points.length) {
    return { linePath: '', areaPath: '', marker: null, benchmarkY: null, coordinates: [] }
  }

  const values = points.map((point) => point.value)
  if (benchmarkValue != null && Number.isFinite(benchmarkValue)) {
    values.push(benchmarkValue)
  }
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const valueRange = maxValue - minValue || 1
  const innerWidth = CHART_WIDTH - CHART_PADDING * 2
  const innerHeight = CHART_HEIGHT - CHART_PADDING * 2

  const coordinates = points.map((point, index) => {
    const x =
      CHART_PADDING + (points.length === 1 ? innerWidth / 2 : (innerWidth * index) / (points.length - 1))
    const y =
      CHART_PADDING + innerHeight - ((point.value - minValue) / valueRange) * innerHeight
    return { x, y, ...point }
  })

  const linePath = coordinates
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  const lastPoint = coordinates[coordinates.length - 1]
  const areaPath = `${linePath} L ${lastPoint.x} ${CHART_HEIGHT - CHART_PADDING} L ${coordinates[0].x} ${
    CHART_HEIGHT - CHART_PADDING
  } Z`

  let benchmarkY = null
  if (benchmarkValue != null && Number.isFinite(benchmarkValue)) {
    benchmarkY =
      CHART_PADDING + innerHeight - ((benchmarkValue - minValue) / valueRange) * innerHeight
  }

  return {
    linePath,
    areaPath,
    marker: lastPoint,
    benchmarkY,
    coordinates,
  }
}

function nearestChartPointIndex(svgX, coordinates) {
  if (!coordinates.length) {
    return null
  }
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < coordinates.length; i += 1) {
    const d = Math.abs(coordinates[i].x - svgX)
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  }
  return best
}

function formatBacktestDayLabel(dayKey) {
  if (!dayKey) {
    return '--'
  }

  const date = new Date(`${dayKey}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) {
    return dayKey
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function formatBacktestRangeLabel(startDay, endDay) {
  if (!startDay || !endDay) {
    return '--'
  }
  if (startDay === endDay) {
    return `UTC ${formatBacktestDayLabel(startDay)}`
  }
  return `UTC ${formatBacktestDayLabel(startDay)} to ${formatBacktestDayLabel(endDay)}`
}

function getCoverageTargetDays(period) {
  if (period === '1D') {
    return 1
  }
  if (period === '1W') {
    return 7
  }
  if (period === '1M') {
    return 30
  }
  return null
}

function formatCoverage(points, period) {
  if (!Array.isArray(points) || points.length < 2) {
    return '--'
  }

  const start = new Date(points[0].ts)
  const end = new Date(points[points.length - 1].ts)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return '--'
  }

  const coveredDays = Math.max((end.getTime() - start.getTime()) / 86400000, 0)
  const targetDays = getCoverageTargetDays(period)
  if (targetDays == null) {
    return `${coveredDays.toFixed(1)}d`
  }

  return `${coveredDays.toFixed(1)}d / ${targetDays}d`
}

function formatChartHeadline(mode, value) {
  if (value == null || Number.isNaN(value)) {
    return '--'
  }
  if (mode === 'pnl') {
    return formatCurrency(value)
  }
  if (mode === 'equity') {
    return formatNumber(Math.round(value * 100) / 100)
  }
  return formatPercent(value)
}

function formatChartDelta(mode, delta) {
  if (delta == null || Number.isNaN(delta)) {
    return '--'
  }
  if (mode === 'pnl') {
    return formatSignedCurrency(delta)
  }
  if (mode === 'equity') {
    const rounded = Math.round(delta * 100) / 100
    const body = formatNumber(Math.abs(rounded))
    if (rounded > 0) {
      return `+${body}`
    }
    if (rounded < 0) {
      return `-${body}`
    }
    return body
  }
  return formatSignedPercent(delta)
}

function InsightCard({ label, value, hint, toneClass = 'text-white' }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-2.5 sm:p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-1 font-display text-base font-semibold sm:text-lg ${toneClass}`}>{value}</p>
      <p className="mt-1 text-[11px] leading-snug text-slate-500">{hint}</p>
    </div>
  )
}


function RiskMetric({ label, value }) {
  return (
    <div className="backtest-metric-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function BacktestChart({
  rawPoints,
  curveMeta,
  chartMode,
  onChartModeChange,
  period,
  coveragePeriod = period,
  availablePeriods,
  onPeriodChange,
  loading,
  emptyCurveFootnote,
}) {
  const { t } = useTranslation()
  const chartModeOptions = useMemo(() => [{ id: 'pnl', label: t('common.pnlLabel') }], [t])
  const displayPoints = useMemo(() => transformPointsForMode(rawPoints, chartMode), [rawPoints, chartMode])
  const benchmarkValue = useMemo(() => getBenchmarkValueForMode(rawPoints, chartMode), [rawPoints, chartMode])
  const geometry = useMemo(
    () => buildChartGeometry(displayPoints, benchmarkValue),
    [displayPoints, benchmarkValue]
  )
  const coverage = getCoverageSummary(curveMeta, displayPoints, coveragePeriod)
  const coverageState = getCoverageState(curveMeta)

  const latestValue = displayPoints.length ? displayPoints[displayPoints.length - 1].value : null
  const startDisplay = displayPoints.length ? displayPoints[0].value : null
  const changeValue =
    latestValue != null && startDisplay != null ? latestValue - startDisplay : null

  const drawdownStats = useMemo(() => {
    if (chartMode !== 'drawdown' || !displayPoints.length) {
      return null
    }
    const values = displayPoints.map((p) => p.value)
    const worst = Math.min(...values)
    const current = values[values.length - 1]
    const recoveryFromTrough = current - worst
    return { worst, current, recoveryFromTrough }
  }, [chartMode, displayPoints])

  const primaryHeadlineValue =
    chartMode === 'drawdown' && drawdownStats ? drawdownStats.worst : latestValue

  const curveSubtitle =
    chartMode === 'pnl'
      ? t('common.pnlFromStart')
      : chartMode === 'equity'
        ? t('common.normalizedIndex')
        : t('common.worstRunningDrawdown')

  const benchmarkCaption =
    chartMode === 'pnl'
      ? t('common.benchmarkPnl')
      : chartMode === 'equity'
        ? t('common.benchmarkIndex')
        : t('common.benchmarkDd')

  const coordinates = geometry.coordinates ?? []
  const chartWrapRef = useRef(null)
  const svgRef = useRef(null)
  const [hoverIndex, setHoverIndex] = useState(null)
  const [tooltipPos, setTooltipPos] = useState(null)

  const updateChartHover = useCallback(
    (clientX, clientY) => {
      const svg = svgRef.current
      const wrap = chartWrapRef.current
      if (!svg || !wrap || coordinates.length === 0) {
        return
      }
      const ctm = svg.getScreenCTM()
      if (!ctm) {
        return
      }
      const pt = svg.createSVGPoint()
      pt.x = clientX
      pt.y = clientY
      let svgP
      try {
        svgP = pt.matrixTransform(ctm.inverse())
      } catch {
        return
      }
      const idx = nearestChartPointIndex(svgP.x, coordinates)
      if (idx == null) {
        return
      }
      setHoverIndex(idx)
      const c = coordinates[idx]
      const tipPt = svg.createSVGPoint()
      tipPt.x = c.x
      tipPt.y = c.y
      const clientTip = tipPt.matrixTransform(ctm)
      const wrapRect = wrap.getBoundingClientRect()
      const rawLeft = clientTip.x - wrapRect.left
      const pad = 12
      const halfTip = Math.min(112, Math.max(28, (wrapRect.width - pad * 2) / 2))
      const minX = pad + halfTip
      const maxX = Math.max(minX, wrapRect.width - pad - halfTip)
      const clampedLeft = Math.min(Math.max(rawLeft, minX), maxX)
      const pointTop = clientTip.y - wrapRect.top
      const preferBelow = pointTop < 72
      setTooltipPos({
        left: clampedLeft,
        top: pointTop,
        preferBelow,
      })
    },
    [coordinates]
  )

  const clearChartHover = useCallback(() => {
    setHoverIndex(null)
    setTooltipPos(null)
  }, [])

  useEffect(() => {
    // Reset hover when chart inputs change; clearing hover state is intentional here.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chart remount semantics
    clearChartHover()
  }, [chartMode, period, coveragePeriod, displayPoints.length, loading, clearChartHover])

  if (!displayPoints.length) {
    return (
      <div className="backtest-chart-shell flex min-h-[200px] items-center justify-center rounded-2xl p-4 sm:min-h-[240px]">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {t('common.noCurveData')}
          </p>
          <p className="mt-2 max-w-[36ch] text-xs leading-relaxed text-slate-400">{t('common.noCurveBody')}</p>
          {emptyCurveFootnote ? (
            <p className="mx-auto mt-3 max-w-[40ch] text-xs leading-relaxed text-slate-300">{emptyCurveFootnote}</p>
          ) : null}
          {availablePeriods.length > 0 ? (
            <p className="mx-auto mt-2 max-w-[40ch] text-[11px] leading-relaxed text-slate-500">
              {t('common.apiDataFor', { periods: formatAvailablePeriods(availablePeriods) })}
            </p>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="backtest-chart-shell rounded-2xl p-3 sm:p-4">
      <div className="flex flex-col gap-2.5">
        {chartModeOptions.length > 1 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {t('common.view')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {chartModeOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`backtest-period-pill ${chartMode === opt.id ? 'is-active' : ''}`}
                  disabled={loading}
                  onClick={() => onChartModeChange(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
          <div className="min-w-0 w-full sm:w-auto sm:min-w-0 sm:flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F8D978]">
              {chartMode === 'drawdown'
                ? t('common.worstDrawdown')
                : chartMode === 'pnl'
                  ? t('common.currentPnl')
                  : t('common.latestValue')}
            </p>
            <p className="mt-1.5 font-display text-[clamp(1.45rem,6.5vw,2.65rem)] font-semibold tracking-[-0.04em] text-white lg:text-[clamp(1.55rem,2.8vw,2.85rem)]">
              {formatChartHeadline(chartMode, primaryHeadlineValue)}
              {chartMode === 'equity' ? (
                <span className="ml-1.5 text-base font-medium text-slate-500 sm:text-lg">{t('common.idx')}</span>
              ) : null}
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {curveSubtitle}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:max-w-md sm:items-end">
            <div className="flex w-full flex-wrap items-center justify-start gap-1.5 sm:justify-end sm:gap-2">
              {PERIOD_OPTIONS.map((option) => {
                const isAvailable =
                  availablePeriods.length === 0 || availablePeriods.includes(option)
                return (
                  <button
                    className={`backtest-period-pill ${period === option ? 'is-active' : ''}`}
                    type="button"
                    key={option}
                    disabled={!isAvailable || loading}
                    onClick={() => {
                      onPeriodChange(option)
                    }}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
            {chartMode === 'drawdown' && drawdownStats ? (
              <div className="w-full min-w-0 max-w-full space-y-2 sm:min-w-[180px] sm:max-w-sm">
                <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-left sm:text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t('common.currentDrawdown')}
                  </p>
                  <p
                    className={`mt-1 text-base font-semibold ${
                      (drawdownStats.current ?? 0) >= 0 ? 'text-emerald-300' : 'text-rose-200'
                    }`}
                  >
                    {formatChartHeadline('drawdown', drawdownStats.current)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-left sm:text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t('common.recoveryFromTrough')}
                  </p>
                  <p
                    className={`mt-1 text-base font-semibold ${
                      (drawdownStats.recoveryFromTrough ?? 0) > 0
                        ? 'text-emerald-300'
                        : (drawdownStats.recoveryFromTrough ?? 0) < 0
                          ? 'text-rose-300'
                          : 'text-slate-300'
                    }`}
                  >
                    {formatSignedPercent(drawdownStats.recoveryFromTrough)}
                  </p>
                  <p className="mt-1 text-[10px] leading-snug text-slate-500">{t('common.recoveryHint')}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-left sm:text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {t('common.windowChange')}
                </p>
                <p
                  className={`mt-1 text-base font-semibold ${
                    (changeValue ?? 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {formatChartDelta(chartMode, changeValue)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        ref={chartWrapRef}
        className="relative mt-3 overflow-hidden rounded-xl border border-white/8 bg-black/30 sm:mt-4"
      >
        <div className="backtest-chart-grid absolute inset-0 opacity-80" aria-hidden="true" />
        <svg
          ref={svgRef}
          className="relative z-10 h-auto w-full select-none"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          role="img"
          aria-label={t('common.interactiveCurve')}
        >
          <defs>
            <linearGradient id="backtestAreaFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(248,217,120,0.28)" />
              <stop offset="100%" stopColor="rgba(248,217,120,0)" />
            </linearGradient>
          </defs>
          {geometry.benchmarkY != null ? (
            <line
              x1={CHART_PADDING}
              x2={CHART_WIDTH - CHART_PADDING}
              y1={geometry.benchmarkY}
              y2={geometry.benchmarkY}
              stroke="rgba(147,197,253,0.45)"
              strokeDasharray="5 7"
              strokeWidth="1.5"
            />
          ) : null}
          <path d={geometry.areaPath} fill="url(#backtestAreaFill)" />
          <path
            d={geometry.linePath}
            fill="none"
            stroke="#DDF247"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3.5"
          />
          <rect
            aria-hidden="true"
            height={CHART_HEIGHT - CHART_PADDING * 2}
            style={{ cursor: 'crosshair', touchAction: 'none' }}
            width={CHART_WIDTH - CHART_PADDING * 2}
            x={CHART_PADDING}
            y={CHART_PADDING}
            fill="transparent"
            onMouseLeave={clearChartHover}
            onMouseMove={(e) => updateChartHover(e.clientX, e.clientY)}
            onTouchStart={(e) => {
              const t = e.touches[0]
              if (t) {
                updateChartHover(t.clientX, t.clientY)
              }
            }}
            onTouchMove={(e) => {
              const t = e.touches[0]
              if (t) {
                updateChartHover(t.clientX, t.clientY)
              }
            }}
            onTouchEnd={clearChartHover}
          />
          {hoverIndex != null && coordinates[hoverIndex] ? (
            <g aria-hidden="true" pointerEvents="none">
              <line
                x1={coordinates[hoverIndex].x}
                x2={coordinates[hoverIndex].x}
                y1={CHART_PADDING}
                y2={CHART_HEIGHT - CHART_PADDING}
                stroke="rgba(248,217,120,0.5)"
                strokeDasharray="4 6"
                strokeWidth="1.25"
              />
              <circle
                cx={coordinates[hoverIndex].x}
                cy={coordinates[hoverIndex].y}
                fill="rgba(221,242,71,0.18)"
                r="12"
                stroke="rgba(248,217,120,0.55)"
                strokeWidth="1.5"
              />
              <circle cx={coordinates[hoverIndex].x} cy={coordinates[hoverIndex].y} fill="#DDF247" r="5" />
              <circle cx={coordinates[hoverIndex].x} cy={coordinates[hoverIndex].y} fill="#0b0f14" r="2" />
            </g>
          ) : null}
          {geometry.marker ? (
            <g pointerEvents="none">
              <line
                x1={geometry.marker.x}
                x2={geometry.marker.x}
                y1={CHART_PADDING}
                y2={CHART_HEIGHT - CHART_PADDING}
                stroke="rgba(255,255,255,0.12)"
                strokeDasharray="6 8"
              />
              <circle cx={geometry.marker.x} cy={geometry.marker.y} fill="#DDF247" r="7" />
              <circle cx={geometry.marker.x} cy={geometry.marker.y} fill="#0b0f14" r="3" />
            </g>
          ) : null}
        </svg>
        {tooltipPos != null && hoverIndex != null && coordinates[hoverIndex] ? (
          <div
            className="pointer-events-none absolute z-20 max-w-[14rem] rounded-xl border border-white/12 bg-[rgba(11,15,20,0.92)] px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm"
            style={{
              left: tooltipPos.left,
              top: tooltipPos.top,
              transform: tooltipPos.preferBelow
                ? 'translate(-50%, 10px)'
                : 'translate(-50%, calc(-100% - 10px))',
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t('common.atPoint')}</p>
            <p className="mt-1 font-mono text-[11px] text-slate-300">
              {formatDateTime(coordinates[hoverIndex].ts)}
            </p>
            <p className="mt-1 font-display text-sm font-semibold text-white">
              {formatChartHeadline(chartMode, coordinates[hoverIndex].value)}
              {chartMode === 'equity' ? (
                <span className="ml-1 text-xs font-medium text-slate-500">{t('common.idx')}</span>
              ) : null}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-2.5 flex flex-col gap-1 text-xs text-slate-400 sm:text-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="badge-neutral rounded-full px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs">
            {t('common.periodColon', { period })}
            {curveMeta?.activePeriod &&
            curveMeta?.period &&
            curveMeta.activePeriod !== curveMeta.period
              ? t('common.curveActive', { period: curveMeta.activePeriod })
              : ''}
          </span>
          <span className="badge-neutral rounded-full px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs">
            {t('common.coverageColon', { coverage })}
          </span>
          <span
            className={`${coverageState.chip} rounded-full px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs`}
          >
            {coverageState.label}
          </span>
          <span className="badge-neutral rounded-full px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs">
            {t('common.pointsCount', { count: formatNumber(displayPoints.length) })}
          </span>
        </div>
        <p className="text-[11px] leading-snug text-slate-500 sm:text-xs">
          {t('common.windowColon', { range: formatWindowRange(curveMeta?.startTs, curveMeta?.endTs) })}
        </p>
        <p className="text-[11px] leading-snug text-slate-500 sm:text-xs">{benchmarkCaption}</p>
      </div>
    </div>
  )
}

/**
 * 与 profile-risk 请求解析一致；`fetchKey` 用于去重（StrictMode 双跑 + 钱包 URL replace 成昵称后 segment 变但仍是同一钱包）。
 */
function resolveProfileRiskFetchInputs(segment, period, preferWalletForLabelRef) {
  const trimmed = String(segment ?? '').trim()
  if (!trimmed) {
    return { ok: false, reason: 'missing' }
  }

  const segmentWallet = extractWalletFromSegment(trimmed)
  const pref = preferWalletForLabelRef.current
  if (pref) {
    if (segmentWallet) {
      if (segmentWallet !== pref.wallet) {
        preferWalletForLabelRef.current = null
      }
    } else if (!labelsEqual(trimmed, pref.label)) {
      preferWalletForLabelRef.current = null
    }
  }

  let legacyQueryWallet = null
  try {
    const w = new URLSearchParams(window.location.search).get('wallet')
    if (isValidWallet(w)) {
      legacyQueryWallet = w.toLowerCase()
    }
  } catch {
    /* ignore */
  }

  let apiIdentifier = trimmed
  if (legacyQueryWallet) {
    apiIdentifier = legacyQueryWallet
  } else if (segmentWallet) {
    apiIdentifier = segmentWallet
  } else {
    const storedWallet = readStoredWalletForLabel(trimmed)
    if (storedWallet) {
      apiIdentifier = storedWallet
    } else {
      const prefAfter = preferWalletForLabelRef.current
      if (prefAfter && labelsEqual(trimmed, prefAfter.label)) {
        apiIdentifier = prefAfter.wallet
      }
    }
  }

  const fetchKey = `${String(apiIdentifier).trim().toLowerCase()}|${period}`
  return { ok: true, trimmed, apiIdentifier, fetchKey, legacyQueryWallet }
}

export function BacktestPage() {
  const { t } = useTranslation()
  const { localizePath, locale } = useLocale()
  const { segment = '' } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  /** 钱包进页后 replace 成昵称路径时写入；同一路径下的后续请求（含 period）继续用钱包查 API，避免 displayName 二次请求失败或串数据 */
  const preferWalletForLabelRef = useRef(null)
  const displayNameUrlReplacedRef = useRef(false)
  const periodCacheRef = useRef({})
  const inflightRef = useRef(new Map())
  const periodParam = searchParams.get('period')
  const [period, setPeriod] = useState(() => (isRiskPeriod(periodParam) ? periodParam : 'ALL'))
  const [chartMode, setChartMode] = useState('pnl')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)

  const syncPeriodToUrl = useCallback(
    (nextPeriod) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (nextPeriod === 'ALL') {
            next.delete('period')
          } else {
            next.set('period', nextPeriod)
          }
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const onPeriodChange = useCallback(
    (nextPeriod) => {
      setPeriod(nextPeriod)
      syncPeriodToUrl(nextPeriod)
    },
    [syncPeriodToUrl]
  )

  useEffect(() => {
    if (isRiskPeriod(periodParam) && periodParam !== period) {
      setPeriod(periodParam)
    }
  }, [periodParam, period])

  const fetchProfileForPeriod = useCallback(
    async (targetPeriod, apiIdentifier) => {
      const cached = periodCacheRef.current[targetPeriod]
      if (cached) {
        return cached
      }

      const walletGuess =
        extractWalletFromSegment(String(apiIdentifier).trim()) ??
        (isValidWallet(apiIdentifier) ? String(apiIdentifier).toLowerCase() : null)
      if (walletGuess) {
        const sessionCached = getCachedSmartMoneyProfile(walletGuess, targetPeriod)
        if (sessionCached) {
          periodCacheRef.current[targetPeriod] = sessionCached
          return sessionCached
        }
      }

      const requestKey = `${String(apiIdentifier).trim().toLowerCase()}|${targetPeriod}`
      const inflight = inflightRef.current.get(requestKey)
      if (inflight) {
        return inflight
      }

      const task = fetchSmartMoneyRiskProfile(apiIdentifier, targetPeriod).then((res) => {
        periodCacheRef.current[targetPeriod] = res
        const walletKey = res?.wallet ?? walletGuess
        if (walletKey) {
          setCachedSmartMoneyProfile(walletKey, targetPeriod, res)
        }
        return res
      })
      inflightRef.current.set(requestKey, task)

      try {
        return await task
      } finally {
        inflightRef.current.delete(requestKey)
      }
    },
    []
  )

  const prefetchOtherPeriods = useCallback(
    (currentPeriod, apiIdentifier) => {
      for (const candidate of PERIOD_OPTIONS) {
        if (candidate === currentPeriod) {
          continue
        }
        if (periodCacheRef.current[candidate]) {
          continue
        }
        void fetchProfileForPeriod(candidate, apiIdentifier).catch(() => {
          /* 后台预取失败不打断当前页 */
        })
      }
    },
    [fetchProfileForPeriod]
  )

  useEffect(() => {
    const walletFromSegment = extractWalletFromSegment(segment)
    periodCacheRef.current = walletFromSegment
      ? hydrateSmartMoneyPeriodCache(walletFromSegment)
      : {}
    inflightRef.current.clear()
    setError('')
    const cached = periodCacheRef.current[period]
    if (cached) {
      setProfile(cached)
      setStatus('success')
    } else {
      setProfile(null)
      setStatus('loading')
    }
  }, [segment, period])

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      const resolved = resolveProfileRiskFetchInputs(segment, period, preferWalletForLabelRef)
      if (!resolved.ok) {
        setProfile(null)
        setStatus('error')
        setError(i18n.t('backtest.missingIdentifier'))
        return
      }

      const { apiIdentifier, legacyQueryWallet } = resolved
      const cached = periodCacheRef.current[period]
      if (cached) {
        setProfile(cached)
        setStatus('success')
        setError('')
        return
      }

      setStatus((prev) => (prev === 'success' ? 'loading' : prev === 'idle' ? 'loading' : prev))
      setError('')

      try {
        const data = await fetchProfileForPeriod(period, apiIdentifier)
        if (cancelled) {
          return
        }
        setProfile(data)
        setStatus('success')
        prefetchOtherPeriods(period, apiIdentifier)
        if (legacyQueryWallet) {
          try {
            const params = new URLSearchParams(window.location.search)
            if (params.has('wallet')) {
              params.delete('wallet')
              const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash}`
              navigate(next, { replace: true })
            }
          } catch {
            /* ignore */
          }
        }
      } catch (loadError) {
        if (cancelled) {
          return
        }
        setProfile(null)
        setStatus('error')
        setError(loadError instanceof Error ? loadError.message : i18n.t('backtest.loadError'))
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [fetchProfileForPeriod, navigate, period, prefetchOtherPeriods, segment])

  useEffect(() => {
    displayNameUrlReplacedRef.current = false
  }, [segment])

  /** 任意成功加载后记住「展示名 → 钱包」，刷新纯路径 /backtest/昵称 时仍可回退到钱包请求 */
  useEffect(() => {
    if (status !== 'success' || !profile?.wallet) {
      return
    }
    const merged = mergeProfileIdentity(profile)
    const label = getHumanReadableUrlLabel(merged)
    if (label) {
      rememberWalletForLabel(label, profile.wallet)
    }
  }, [status, profile])

  useEffect(() => {
    if (status !== 'success' || !profile?.wallet) {
      return
    }

    if (displayNameUrlReplacedRef.current) {
      return
    }

    const merged = mergeProfileIdentity(profile)
    const label = getHumanReadableUrlLabel(merged)
    if (!label) {
      return
    }

    const segmentWallet = extractWalletFromSegment(segment)
    const pw = profile.wallet.toLowerCase()
    if (!segmentWallet || segmentWallet !== pw) {
      return
    }

    preferWalletForLabelRef.current = { wallet: pw, label }
    displayNameUrlReplacedRef.current = true
    navigate(localizePath(`/backtest/${encodeURIComponent(label)}`), { replace: true })
  }, [navigate, localizePath, profile, segment, status])

  const identity = useMemo(() => mergeProfileIdentity(profile), [profile])
  const resolvedWallet =
    profile?.wallet ||
    extractWalletFromSegment(segment) ||
    readStoredWalletForLabel(String(segment ?? '').trim()) ||
    ''
  const listPreview = useMemo(
    () => (resolvedWallet ? getSmartMoneyListPreview(resolvedWallet) : null),
    [resolvedWallet]
  )
  const displayLeaderboardRank = useMemo(
    () => getDisplayLeaderboardRank(profile, listPreview),
    [listPreview, profile]
  )
  const curve = profile?.curve ?? null
  const backtest = profile?.backtest ?? null
  const risk = profile?.risk ?? null
  const summary = profile?.summary ?? null
  const snapshot = profile?.profile ?? null
  const meta = profile?.meta ?? null
  const availablePeriods = profile?.curve?.availablePeriods ?? []
  /** 与 frontend 一致：resolvedPeriod 为曲线实际周期；无则 activePeriod / 请求 period */
  const curveCoveragePeriod = curve?.resolvedPeriod ?? curve?.activePeriod ?? period
  const riskScore = risk?.riskScore ?? null
  const riskLevel = risk?.riskLevel ?? 'UNKNOWN'
  const riskBarWidth =
    riskScore == null || Number.isNaN(riskScore) ? '0%' : `${Math.max(0, Math.min(100, riskScore))}%`
  const titleText =
    getTraderTitle(identity, resolvedWallet) ||
    listPreview?.displayName ||
    (resolvedWallet ? abbreviateWallet(resolvedWallet) : '')
  const onchainExplorer = useMemo(() => getWalletOnchainExplorerMeta(resolvedWallet), [resolvedWallet])
  const isInitialLoading = status === 'loading' && !profile
  const isRefreshing = status === 'loading' && !!profile
  const avatarLabel = getTraderAvatarLabel(identity, resolvedWallet)
  const avatarUrl = identity?.profileImage ?? listPreview?.profileImage ?? null
  const coverageState = getCoverageState(curve)
  const analystNotes = useMemo(() => buildAnalystNotes(profile, period, t), [period, profile, t])

  /** 优先「窗口高点→低点」（与图表一致）；无则回退 UTC 日内口径 */
  const peakDrawdownDisplay = useMemo(() => {
    const bt = profile?.backtest
    if (!bt) {
      return { value: null, ratio: null, rangeLabel: null, footKey: 'backtest.intradayNeed' }
    }
    const w = bt.windowPeakDrawdown
    if (w?.drawdownValue != null && w.drawdownValue > 0) {
      const peakDay = w.peakTs?.slice(0, 10) ?? null
      const troughDay = w.troughTs?.slice(0, 10) ?? null
      return {
        value: -w.drawdownValue,
        ratio: w.drawdownRatio != null ? -w.drawdownRatio : null,
        rangeLabel:
          peakDay && troughDay ? formatBacktestRangeLabel(peakDay, troughDay) : null,
        footKey: 'backtest.intradayFoot',
      }
    }
    const intraday = bt.worstIntradayDrawdownDay
    if (intraday?.intradayMaxDrawdownValue != null) {
      return {
        value: -intraday.intradayMaxDrawdownValue,
        ratio:
          intraday.intradayMaxDrawdownRatio != null ? -intraday.intradayMaxDrawdownRatio : null,
        rangeLabel: intraday.date
          ? formatBacktestRangeLabel(intraday.date, intraday.date)
          : null,
        footKey: 'backtest.intradayFoot',
      }
    }
    return { value: null, ratio: null, rangeLabel: null, footKey: 'backtest.intradayNeed' }
  }, [profile?.backtest])

  const smartScoreValue =
    summary?.score ??
    listPreview?.score ??
    profile?.externalRisk?.smartScore ??
    null
  const curveHeadlineValue = curve?.changeValue ?? snapshot?.totalPnl ?? null
  const winRateValue =
    summary?.externalWinRate ??
    profile?.externalRisk?.winRate ??
    risk?.winRateProxy ??
    null
  const followRoi =
    curve?.changeValue != null
      ? formatSignedCurrency(curve.changeValue)
      : snapshot?.totalPnl != null
        ? formatSignedCurrency(snapshot.totalPnl)
        : '--'
  let copyResultText = t('backtest.copyResultNone')
  if (curve?.changeValue != null) {
    copyResultText = t('backtest.copyResultCurve', {
      period,
      value: formatSignedCurrency(curve.changeValue),
    })
  } else if (snapshot?.totalPnl != null) {
    copyResultText = t('backtest.copyResultSnapshot', { value: formatSignedCurrency(snapshot.totalPnl) })
  }
  const flagList = Array.isArray(summary?.flags) ? summary.flags : []
  const dataConfidenceParts = [
    summary?.externalMetricsSource ?? meta?.externalMetricsSource ?? null,
    curve?.hasFullRequestedWindow === false
      ? t('backtest.partialWindow')
      : curve?.hasFullRequestedWindow === true
        ? t('backtest.fullWindow')
        : null,
    Array.isArray(curve?.points) && curve.points.length === 0 ? t('backtest.curveEmptyFlag') : null,
  ].filter(Boolean)
  const keyStats = [
    {
      label: t('common.periodReturn', { period }),
      value: formatSignedReturnOrPercent(risk?.returnRatio),
      hint:
        curve?.changeValue != null
          ? t('backtest.hintWindowPnl', { value: formatSignedCurrency(curve.changeValue) })
          : risk?.returnRatio != null && Math.abs(risk.returnRatio) >= 500
            ? t('backtest.hintLargeExternal')
            : t('backtest.hintCurveProxy'),
      toneClass: getValueToneClass(risk?.returnRatio),
    },
    {
      label: t('common.maxDrawdown'),
      value: formatSignedCurrency(peakDrawdownDisplay.value),
      hint: peakDrawdownDisplay.rangeLabel
        ? t('backtest.intradayFoot', {
            range: peakDrawdownDisplay.rangeLabel,
            ratio: formatSignedPercent(peakDrawdownDisplay.ratio),
          })
        : t('backtest.intradayNeed'),
      toneClass: getValueToneClass(peakDrawdownDisplay.value),
    },
    {
      label: t('common.positiveDays'),
      value: formatPercent(backtest?.positiveDayRatio),
      hint: t('backtest.hintSampledDays', { count: formatNumber(backtest?.sampledDayCount ?? 0) }),
      toneClass: getValueToneClass(backtest?.positiveDayRatio != null ? backtest.positiveDayRatio - 0.5 : null),
    },
    {
      label: t('common.sharpeLike'),
      value: formatRatio(risk?.sharpeLike),
      hint: `${t('common.sortinoLike')} ${formatRatio(risk?.sortinoLike)}`,
      toneClass: getValueToneClass(risk?.sharpeLike),
    },
    {
      label: t('common.bestDay'),
      value: formatSignedCurrency(backtest?.bestDay?.changeValue),
      hint: backtest?.bestDay?.date
        ? t('backtest.hintBestDay', {
            date: formatBacktestDayLabel(backtest.bestDay.date),
            ratio: formatSignedPercent(backtest.bestDay.changeRatio),
          })
        : t('backtest.hintBestWaiting'),
      toneClass: getValueToneClass(backtest?.bestDay?.changeValue),
    },
    {
      label: t('common.worstDay'),
      value: formatSignedCurrency(backtest?.worstDay?.changeValue),
      hint: backtest?.worstDay?.date
        ? t('backtest.hintWorstDay', {
            date: formatBacktestDayLabel(backtest.worstDay.date),
            ratio: formatSignedPercent(backtest.worstDay.changeRatio),
          })
        : t('backtest.hintWorstWaiting'),
      toneClass: getValueToneClass(backtest?.worstDay?.changeValue),
    },
  ]
  const badges = [
    {
      tone: 'metal',
      text: isRefreshing ? t('common.updating') : t('common.riskProfile'),
    },
  ]

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(245,197,66,0.18),transparent_62%)]" />
      <div className="pointer-events-none absolute right-[-10rem] top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(245,197,66,0.14),transparent_68%)] blur-3xl" />
      <div className="pointer-events-none absolute left-[-8rem] top-[28rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_70%)] blur-3xl" />

      <Header
        logoHref={localizePath('/')}
        navigation={[]}
        badges={badges}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-[1320px] flex-col gap-3 px-3 pb-8 pt-2 min-[400px]:px-4 sm:gap-4 sm:px-5 sm:pt-3 lg:px-7">
        <section
          className="surface-panel rounded-2xl px-3 py-4 sm:rounded-3xl sm:px-5 sm:py-5 md:px-6 md:py-6"
          aria-labelledby="backtest-hero-title"
        >
          <div className="flex flex-col gap-4 lg:gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
                  <Link className="transition hover:text-[#F8D978]" to={localizePath('/')}>
                    {t('common.home')}
                  </Link>
                  <span aria-hidden="true">/</span>
                  <Link className="transition hover:text-[#F8D978]" to={`${localizePath('/')}#leaderboard`}>
                    {t('common.leaderboard')}
                  </Link>
                  <span aria-hidden="true">/</span>
                  <span className="text-slate-300">{t('backtest.breadcrumbTrader')}</span>
                </div>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-2xl border border-[#F8D978]/20 object-cover shadow-[0_12px_28px_rgba(0,0,0,0.24)] sm:h-14 sm:w-14"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#F8D978]/20 bg-[radial-gradient(circle_at_top,rgba(248,217,120,0.16),rgba(255,255,255,0.04))] font-display text-lg font-semibold tracking-[0.08em] text-[#F8D978] shadow-[0_12px_28px_rgba(0,0,0,0.24)] sm:h-14 sm:w-14 sm:text-xl">
                      {avatarLabel}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="eyebrow text-[10px] sm:text-xs">{t('backtest.heroEyebrow')}</span>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <h1
                        id="backtest-hero-title"
                        className="max-w-full break-words font-display text-[clamp(1.35rem,6vw,3rem)] font-semibold leading-tight tracking-[-0.04em] text-white lg:text-[clamp(1.5rem,2.6vw,3rem)]"
                        title={titleText}
                      >
                        {titleText}
                      </h1>
                      {displayLeaderboardRank != null ? (
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300 sm:text-xs">
                          #{displayLeaderboardRank}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-400 sm:gap-2 sm:text-sm">
                      <span className="max-w-full break-all rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] text-slate-300 sm:px-3 sm:text-[11px]">
                        {abbreviateWallet(resolvedWallet)}
                      </span>
                      {identity?.joinedAtText ? (
                        <span className="badge-neutral rounded-full px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.5">
                          {identity.joinedAtText}
                        </span>
                      ) : null}
                      {risk?.source ? (
                        <span className="badge-metal rounded-full px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.5">
                          {risk.source}
                        </span>
                      ) : null}
                      <span className={`${coverageState.chip} rounded-full px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.5`}>
                        {coverageState.label}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400 sm:text-sm">
                      {identity?.xUsername ? (
                        <a
                          className="transition hover:text-[#F8D978]"
                          href={`https://x.com/${String(identity.xUsername).replace(/^@+/, '')}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          @{String(identity.xUsername).replace(/^@+/, '')}
                        </a>
                      ) : null}
                      {snapshot?.viewsText ? (
                        <span>
                          {snapshot.viewsText} {t('common.views')}
                        </span>
                      ) : null}
                      {summary?.predictionCount != null ? (
                        <span>
                          {formatNumber(summary.predictionCount)} {t('common.predictions')}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                      <a
                        className="btn-gold interactive-focus w-full rounded-full px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em] sm:w-auto sm:px-5 sm:text-sm sm:tracking-[0.16em]"
                        href={resolvedWallet ? getOfficialProfileUrl(resolvedWallet, locale) : '#'}
                        target="_blank"
                        rel="noreferrer"
                        aria-disabled={!resolvedWallet}
                        onClick={resolvedWallet ? undefined : (e) => e.preventDefault()}
                      >
                        {t('common.openPolymarketProfile')}
                      </a>
                      {onchainExplorer ? (
                        <a
                          className="btn-ghost interactive-focus w-full rounded-full px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em] sm:w-auto sm:px-5 sm:text-sm sm:tracking-[0.16em]"
                          href={onchainExplorer.main.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={onchainExplorer.main.ariaLabel}
                        >
                          {onchainExplorer.main.label}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`flex w-full shrink-0 flex-col gap-2.5 rounded-2xl border p-3 sm:w-auto sm:min-w-[260px] sm:p-4 lg:min-w-[280px] ${getRiskSurfaceClass(riskLevel)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-xs sm:tracking-[0.2em]">
                      {t('common.smartScore')}
                    </p>
                    <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-[#F8D978] sm:text-3xl">
                      {formatScore(smartScoreValue)}
                    </p>
                  </div>
                  <div
                    className={`inline-flex w-fit shrink-0 rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] sm:px-2.5 sm:py-1.5 sm:text-xs sm:tracking-[0.12em] ${getRiskTone(riskLevel)}`}
                  >
                    {t('common.riskDot', { level: riskLevel })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/10 bg-black/25 px-2.5 py-2 sm:px-3 sm:py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {t('common.periodReturn', { period })}
                    </p>
                    <p className={`mt-0.5 text-base font-semibold sm:text-lg ${getValueToneClass(risk?.returnRatio)}`}>
                      {period === 'ALL'
                        ? formatSignedCurrency(curve?.changeValue ?? snapshot?.totalPnl ?? null)
                        : formatSignedCurrency(curve?.changeValue ?? null)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/25 px-2.5 py-2 sm:px-3 sm:py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {t('common.maxDrawdown')}
                    </p>
                    <p className="mt-0.5 text-base font-semibold text-rose-200 sm:text-lg">
                      {formatSignedCurrency(peakDrawdownDisplay.value)}
                    </p>
                  </div>
                </div>
                <div className="grid gap-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-white/8 bg-black/20 px-2 py-1.5 sm:gap-3 sm:px-2.5">
                    <span className="shrink-0">{t('common.snapshot')}</span>
                    <strong className="min-w-0 break-words text-right text-[10px] text-slate-200 sm:text-xs">
                      {formatDateTime(meta?.snapshotAt)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-white/8 bg-black/20 px-2 py-1.5 sm:gap-3 sm:px-2.5">
                    <span className="shrink-0">{t('common.scored')}</span>
                    <strong className="min-w-0 break-words text-right text-[10px] text-slate-200 sm:text-xs">
                      {formatDateTime(meta?.lastScoredAt)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-white/8 bg-black/20 px-2 py-1.5 sm:gap-3 sm:px-2.5">
                    <span className="shrink-0">{t('common.synced')}</span>
                    <strong className="min-w-0 break-words text-right text-[10px] text-slate-200 sm:text-xs">
                      {formatRelativeTime(meta?.syncedAt)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {profile ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-3 xl:grid-cols-6">
                {keyStats.map((item) => (
                  <InsightCard
                    key={item.label}
                    hint={item.hint}
                    label={item.label}
                    toneClass={item.toneClass}
                    value={item.value}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {isInitialLoading ? (
          <section className="surface-panel rounded-2xl p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F8D978] sm:text-sm sm:tracking-[0.18em]">
              {t('common.loading')}
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold text-white sm:mt-3 sm:text-2xl">
              {t('backtest.loadingTitle')}
            </h2>
            <p className="mt-2 max-w-[44ch] text-xs leading-relaxed text-slate-400 sm:mt-3 sm:text-sm sm:leading-6">
              {t('backtest.loadingBody')}
            </p>
          </section>
        ) : null}

        {status === 'error' ? (
          <section className="surface-panel rounded-2xl border border-rose-400/20 p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-300 sm:text-sm">
              {t('common.unavailable')}
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold text-white sm:mt-3 sm:text-2xl">
              {t('backtest.errorPageTitle')}
            </h2>
            <p className="mt-2 max-w-[44ch] text-xs leading-relaxed text-slate-400 sm:mt-3 sm:text-sm">
              {error}
            </p>
          </section>
        ) : null}

        {profile ? (
          <>
            <section
              className="surface-panel rounded-2xl px-3 py-4 sm:px-5 sm:py-4 md:px-6"
              aria-labelledby="performance-heading"
            >
              <div className="flex flex-col gap-0.5">
                <h2
                  id="performance-heading"
                  className="font-display text-lg font-semibold text-white sm:text-xl"
                >
                  {t('common.performance')}
                </h2>
                <p className="max-w-[62ch] text-xs leading-snug text-slate-400 sm:text-sm sm:leading-relaxed">
                  {t('backtest.performanceBody')}
                </p>
              </div>
              <div className="mt-3 sm:mt-4">
                <BacktestChart
                  rawPoints={curve?.points ?? []}
                  curveMeta={curve}
                  chartMode={chartMode}
                  onChartModeChange={setChartMode}
                  period={period}
                  coveragePeriod={curveCoveragePeriod}
                  availablePeriods={availablePeriods}
                  loading={isRefreshing}
                  onPeriodChange={onPeriodChange}
                  emptyCurveFootnote={
                    snapshot?.totalPnl != null
                      ? t('backtest.snapshotPnlFootnote', { value: formatSignedCurrency(snapshot.totalPnl) })
                      : null
                  }
                />
              </div>
            </section>

            <section
              className="surface-panel rounded-2xl px-3 py-4 sm:px-5 sm:py-4 md:px-6"
              aria-labelledby="window-overview-heading"
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-5">
                <div>
                  <h2
                    id="window-overview-heading"
                    className="font-display text-lg font-semibold text-white sm:text-xl"
                  >
                    {t('common.windowOverview')}
                  </h2>
                  <p className="mt-1 max-w-[62ch] text-xs leading-snug text-slate-400 sm:text-sm sm:leading-relaxed">
                    {t('backtest.windowOverviewBody')}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:gap-2.5 xl:grid-cols-3">
                    <InsightCard
                      label={t('common.currentPnl')}
                      value={formatSignedCurrency(curveHeadlineValue)}
                      hint={curve?.curveType ?? t('backtest.curveTypeHint')}
                    />
                    <InsightCard
                      label={t('common.coverage')}
                      value={getCoverageSummary(curve, curve?.points ?? [], curveCoveragePeriod)}
                      hint={t('common.windowColon', { range: formatWindowRange(curve?.startTs, curve?.endTs) })}
                    />
                    <InsightCard
                      label={t('common.points')}
                      value={formatNumber(curve?.points?.length ?? 0)}
                      hint={t('backtest.availablePeriodsHint', {
                        periods: formatAvailablePeriods(curve?.availablePeriods),
                      })}
                    />
                    <InsightCard
                      label={t('common.winRateProxy')}
                      value={formatPercent(winRateValue)}
                      hint={t('backtest.winRateHint', {
                        source: summary?.externalMetricsSource ?? meta?.externalMetricsSource ?? 'LOCAL_CURVE',
                      })}
                    />
                    <InsightCard
                      label={t('common.bestStep')}
                      value={formatSignedCurrency(backtest?.maxStepGainValue)}
                      hint={t('backtest.largestGainHint')}
                      toneClass={getValueToneClass(backtest?.maxStepGainValue)}
                    />
                    <InsightCard
                      label={t('common.worstStep')}
                      value={formatSignedCurrency(backtest?.maxStepLossValue)}
                      hint={t('backtest.largestDropHint')}
                      toneClass={getValueToneClass(backtest?.maxStepLossValue)}
                    />
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-xs sm:tracking-[0.18em]">
                    {t('common.analystSummary')}
                  </p>
                  <div className="mt-2 space-y-2">
                    {analystNotes.length > 0 ? (
                      analystNotes.map((note) => (
                        <div key={note} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
                          <p className="text-xs leading-relaxed text-slate-200 sm:text-sm sm:leading-6">{note}</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
                        <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">{t('backtest.analystEmpty')}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 grid gap-2 border-t border-white/10 pt-3 text-xs text-slate-300 sm:text-sm">
                    <RiskMetric label={t('common.requestedPeriod')} value={curve?.period ?? period} />
                    <RiskMetric
                      label={t('common.curvePlotWindow')}
                      value={
                        curve?.activePeriod && curve?.period && curve.activePeriod !== curve.period
                          ? `${curve.activePeriod}${t('backtest.fallbackSuffix')}`
                          : curve?.activePeriod ?? curve?.period ?? period
                      }
                    />
                    <RiskMetric label={t('common.coverageState')} value={coverageState.label} />
                    <RiskMetric
                      label={t('common.externalMetricsPeriod')}
                      value={summary?.externalMetricsPeriod ?? t('common.dash')}
                    />
                    <RiskMetric
                      label={t('common.candidatePeriodsRisk')}
                      value={formatAvailablePeriods(summary?.candidatePeriods)}
                    />
                    {meta?.curveDataSource ? (
                      <RiskMetric
                        label={t('common.curveDataSource')}
                        value={String(meta.curveDataSource).replace(/_/g, ' ')}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <section
              className="surface-panel rounded-2xl px-3 py-4 sm:px-5 sm:py-4 md:px-6"
              aria-labelledby="backtest-stats-heading"
            >
              <div className="flex flex-col gap-0.5">
                <h2
                  id="backtest-stats-heading"
                  className="font-display text-lg font-semibold text-white sm:text-xl"
                >
                  {t('common.backtestStats')}
                </h2>
                <p className="max-w-[62ch] text-xs leading-snug text-slate-400 sm:text-sm sm:leading-relaxed">
                  {t('backtest.statsBody')}
                </p>
                {(curve?.points?.length ?? 0) === 0 ? (
                  <p className="mt-2 max-w-[62ch] text-xs leading-snug text-amber-200/90 sm:text-sm sm:leading-relaxed">
                    {t('backtest.statsEmptyCurve')}
                  </p>
                ) : null}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-black/20 p-2.5 sm:p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t('common.worstDay')}
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-rose-200 sm:text-lg">
                    {formatSignedCurrency(profile.backtest?.worstDay?.changeValue)}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-500 sm:text-xs sm:leading-5">
                    {profile.backtest?.worstDay?.date
                      ? t('backtest.worstDayFoot', {
                          range: formatBacktestRangeLabel(
                            profile.backtest.worstDay.date,
                            profile.backtest.worstDay.date
                          ),
                          ratio: formatSignedPercent(profile.backtest.worstDay.changeRatio),
                        })
                      : t('backtest.worstDayNeed')}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-2.5 sm:p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t('common.bestDay')}
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-emerald-200 sm:text-lg">
                    {formatSignedCurrency(profile.backtest?.bestDay?.changeValue)}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-500 sm:text-xs sm:leading-5">
                    {profile.backtest?.bestDay?.date
                      ? t('backtest.bestDayFoot', {
                          range: formatBacktestRangeLabel(
                            profile.backtest.bestDay.date,
                            profile.backtest.bestDay.date
                          ),
                          ratio: formatSignedPercent(profile.backtest.bestDay.changeRatio),
                        })
                      : t('backtest.bestDayNeed')}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-2.5 sm:p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t('common.windowMaxDrawdown')}
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-rose-200 sm:text-lg">
                    {formatSignedCurrency(peakDrawdownDisplay.value)}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-500 sm:text-xs sm:leading-5">
                    {peakDrawdownDisplay.rangeLabel
                      ? t(peakDrawdownDisplay.footKey, {
                          range: peakDrawdownDisplay.rangeLabel,
                          ratio: formatSignedPercent(peakDrawdownDisplay.ratio),
                        })
                      : t('backtest.intradayNeed')}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-2.5 sm:p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t('common.longestLosingStreak')}
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-white sm:text-lg">
                    {profile.backtest?.losingStreaks?.longestLosingStreakDays
                      ? `${formatNumber(profile.backtest.losingStreaks.longestLosingStreakDays)}d`
                      : '0d'}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-500 sm:text-xs sm:leading-5">
                    {profile.backtest?.losingStreaks?.longestLosingStreakStartDate
                      ? t('backtest.losingStreakFoot', {
                          range: formatBacktestRangeLabel(
                            profile.backtest.losingStreaks.longestLosingStreakStartDate,
                            profile.backtest.losingStreaks.longestLosingStreakEndDate
                          ),
                          current: formatNumber(profile.backtest?.losingStreaks?.currentLosingStreakDays ?? 0),
                        })
                      : t('common.countsCcc')}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-black/20 p-2.5 sm:p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t('common.rollingWorst7d')}
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-rose-200 sm:text-lg">
                    {formatSignedCurrency(profile.backtest?.rollingWorst7D?.changeValue)}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-500 sm:text-xs sm:leading-5">
                    {profile.backtest?.rollingWorst7D?.startDate
                      ? t('backtest.rollingFoot', {
                          range: formatBacktestRangeLabel(
                            profile.backtest.rollingWorst7D.startDate,
                            profile.backtest.rollingWorst7D.endDate
                          ),
                          ratio: formatSignedPercent(profile.backtest.rollingWorst7D.changeRatio),
                        })
                      : t('backtest.rollingNeed')}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-2.5 sm:p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t('common.rollingWorst30d')}
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-rose-200 sm:text-lg">
                    {formatSignedCurrency(profile.backtest?.rollingWorst30D?.changeValue)}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-500 sm:text-xs sm:leading-5">
                    {profile.backtest?.rollingWorst30D?.startDate
                      ? t('backtest.rollingFoot', {
                          range: formatBacktestRangeLabel(
                            profile.backtest.rollingWorst30D.startDate,
                            profile.backtest.rollingWorst30D.endDate
                          ),
                          ratio: formatSignedPercent(profile.backtest.rollingWorst30D.changeRatio),
                        })
                      : t('backtest.rollingNeed')}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-2.5 sm:p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t('common.positiveDays')}
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-white sm:text-lg">
                    {formatPercent(profile.backtest?.positiveDayRatio)}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-500 sm:text-xs sm:leading-5">
                    {profile.backtest?.sampledDayCount
                      ? t('backtest.positiveDaysFoot', {
                          days: formatNumber(profile.backtest.sampledDayCount),
                          median: formatSignedPercent(profile.backtest?.dailyReturnDistribution?.medianReturn),
                        })
                      : t('backtest.positiveDaysNeed')}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-2.5 sm:p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t('common.worstStep')}
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-rose-200 sm:text-lg">
                    {formatSignedCurrency(profile.backtest?.maxStepLossValue)}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-500 sm:text-xs sm:leading-5">
                    {t('backtest.largestDropHint')}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <div className="rounded-xl border border-white/10 bg-black/20 p-2.5 sm:p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-[11px] sm:tracking-[0.18em]">
                        {t('common.dailyReturnDistribution')}
                      </p>
                      <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                        {t('common.meanMedian', {
                          mean: formatSignedPercent(profile.backtest?.dailyReturnDistribution?.meanReturn),
                          median: formatSignedPercent(profile.backtest?.dailyReturnDistribution?.medianReturn),
                        })}
                      </p>
                    </div>
                    <p className="shrink-0 text-[10px] text-slate-500 sm:text-xs">
                      {profile.backtest?.dailyReturnDistribution?.sampledDayCount
                        ? t('common.sampledDaysCount', {
                            count: formatNumber(profile.backtest.dailyReturnDistribution.sampledDayCount),
                          })
                        : t('common.noDailyBuckets')}
                    </p>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-5">
                    {profile.backtest?.dailyReturnDistribution?.buckets?.map((bucket) => (
                      <div
                        key={bucket.id ?? bucket.label}
                        className="rounded-lg border border-white/8 bg-white/[0.03] p-2 sm:p-2.5"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          {bucket.label}
                        </p>
                        <p className="mt-0.5 font-display text-base font-semibold text-white">
                          {formatNumber(bucket.count)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">{formatPercent(bucket.ratio)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-2.5 sm:p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-[11px] sm:tracking-[0.18em]">
                    {t('common.windowDiagnostics')}
                  </p>
                  <div className="mt-2 grid gap-2">
                    <RiskMetric
                      label={t('common.sevenSampledSpan')}
                      value={
                        profile.backtest?.rollingWorst7D?.calendarDaySpan
                          ? `${formatNumber(profile.backtest.rollingWorst7D.calendarDaySpan)}d`
                          : t('common.dash')
                      }
                    />
                    <RiskMetric
                      label={t('common.thirtySampledSpan')}
                      value={
                        profile.backtest?.rollingWorst30D?.calendarDaySpan
                          ? `${formatNumber(profile.backtest.rollingWorst30D.calendarDaySpan)}d`
                          : t('common.dash')
                      }
                    />
                    <RiskMetric
                      label={t('common.sevenFullWindow')}
                      value={
                        profile.backtest?.rollingWorst7D?.hasFullWindow == null
                          ? t('common.dash')
                          : profile.backtest.rollingWorst7D.hasFullWindow
                            ? t('common.yes')
                            : t('common.no')
                      }
                    />
                    <RiskMetric
                      label={t('common.thirtyFullWindow')}
                      value={
                        profile.backtest?.rollingWorst30D?.hasFullWindow == null
                          ? t('common.dash')
                          : profile.backtest.rollingWorst30D.hasFullWindow
                            ? t('common.yes')
                            : t('common.no')
                      }
                    />
                  </div>
                </div>
              </div>
            </section>

            <section
              className="surface-panel relative overflow-hidden rounded-2xl border border-[#F8D978]/25 px-3 py-4 sm:px-5 sm:py-4 md:px-6"
              aria-labelledby="follow-sim-heading"
            >
              <span
                className="pointer-events-none absolute right-3 top-3 text-xl opacity-40 sm:right-4 sm:top-4 sm:text-2xl"
                aria-hidden
              >
                ⭐
              </span>
              <h2 id="follow-sim-heading" className="font-display text-lg font-semibold text-white sm:text-xl">
                {t('common.followSimulation')}
              </h2>
              <p className="mt-1 max-w-[62ch] text-xs leading-snug text-slate-400 sm:text-sm">
                {t('backtest.followBody')}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3 sm:gap-3">
                <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t('common.roi')}
                  </p>
                  <p className="mt-0.5 font-display text-base font-semibold text-white sm:text-lg">{followRoi}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{t('common.externalOrCurve')}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t('backtest.maxDdLabel')}
                  </p>
                  <p className="mt-0.5 font-display text-base font-semibold text-rose-200 sm:text-lg">
                    {formatSignedCurrency(peakDrawdownDisplay.value)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 sm:col-span-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t('common.copyResult')}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug text-slate-200 sm:text-sm sm:leading-6">
                    {copyResultText}
                  </p>
                </div>
              </div>
            </section>

            <section
              className="surface-panel rounded-2xl px-3 py-4 sm:px-5 sm:py-4 md:px-6"
              aria-labelledby="risk-heading"
            >
              <h2 id="risk-heading" className="font-display text-lg font-semibold text-white sm:text-xl">
                {t('common.riskAnalysis')}
              </h2>
              <p className="mt-1 max-w-[62ch] text-xs leading-snug text-slate-400 sm:text-sm sm:leading-relaxed">
                {t('backtest.riskBody')}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span
                  className={`rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold ${getRiskTone(riskLevel)}`}
                >
                  {riskLevel}
                </span>
                {flagList.map((flag) => (
                  <span
                    key={flag}
                    className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-100"
                  >
                    {flag}
                  </span>
                ))}
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_256px]">
                <div className="grid gap-2 sm:grid-cols-2 lg:gap-2">
                  <RiskMetric label={t('common.maxDrawdown')} value={formatSignedCurrency(peakDrawdownDisplay.value)} />
                  <RiskMetric label={t('common.currentDrawdown')} value={formatPercent(risk?.currentDrawdown)} />
                  <RiskMetric label={t('common.volatilityProxy')} value={formatPercent(risk?.volatilityProxy)} />
                  <RiskMetric label={t('common.winRateProxy')} value={formatPercent(risk?.winRateProxy)} />
                  <RiskMetric label={t('common.sharpeLike')} value={formatRatio(risk?.sharpeLike)} />
                  <RiskMetric label={t('common.sortinoLike')} value={formatRatio(risk?.sortinoLike)} />
                  <RiskMetric label={t('common.returnProxy')} value={formatSignedReturnOrPercent(risk?.returnRatio)} />
                  <RiskMetric
                    label={t('common.externalMaxDrawdown')}
                    value={formatPercent(profile?.externalRisk?.maxDrawdownPercent)}
                  />
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-xs sm:tracking-[0.18em]">
                    {t('common.estimatedRiskScore')}
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
                    {formatScore(riskScore)}
                  </p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      <span>{t('common.low')}</span>
                      <span>{t('common.high')}</span>
                    </div>
                    <div className="backtest-risk-bar mt-1.5">
                      <span className="backtest-risk-bar__fill" style={{ width: riskBarWidth }} />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-1.5 text-[11px] text-slate-400 sm:text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span>{t('common.riskSource')}</span>
                      <strong className="text-slate-200">{risk?.source ?? t('common.dash')}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>{t('common.externalTier')}</span>
                      <strong className="text-slate-200">{profile?.externalRisk?.tier ?? t('common.dash')}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>{t('common.externalPeriod')}</span>
                      <strong className="text-slate-200">{profile?.externalRisk?.period ?? t('common.dash')}</strong>
                    </div>
                  </div>
                  {isRefreshing ? (
                    <p className="mt-2 text-[11px] text-slate-500">{t('common.refreshingPeriod')}</p>
                  ) : null}
                </div>
              </div>
            </section>

            <section
              className="surface-panel rounded-2xl px-3 py-4 sm:px-5 sm:py-4 md:px-6"
              aria-labelledby="style-heading"
            >
              <h2 id="style-heading" className="font-display text-lg font-semibold text-white sm:text-xl">
                {t('common.tradingProfile')}
              </h2>
              <div className="mt-3 grid gap-2 md:grid-cols-3 md:gap-3">
                <div className="rounded-xl border border-white/10 bg-black/20 p-2.5 sm:p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t('common.frequency')}
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-white sm:text-lg">
                    {snapshot?.predictionCount != null
                      ? `${formatNumber(snapshot.predictionCount)} ${t('common.predictions')}`
                      : t('common.dash')}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-500 sm:text-xs sm:leading-5">
                    {curve?.coverageDays != null
                      ? t('backtest.frequencyFootCurve', {
                          days: formatNumber(Math.round(curve.coverageDays * 10) / 10),
                        })
                      : t('backtest.frequencyFootSnapshot')}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-2.5 sm:p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t('common.candidatePeriods')}
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-white sm:text-lg">
                    {formatAvailablePeriods(summary?.candidatePeriods)}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-500 sm:text-xs sm:leading-5">
                    {t('backtest.candidateBody')}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-2.5 sm:p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t('common.metricsSource')}
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-white sm:text-lg">
                    {summary?.externalMetricsPeriod ?? t('common.dash')}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-500 sm:text-xs sm:leading-5">
                    {meta?.externalMetricsSource
                      ? t('backtest.metricsCadence', { source: meta.externalMetricsSource })
                      : t('backtest.metricsNoTopic')}
                  </p>
                </div>
              </div>
              <div className="mt-3 grid gap-2 border-t border-white/10 pt-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-2">
                <RiskMetric label={t('common.holdings')} value={formatCurrency(snapshot?.holdingsValue)} />
                <RiskMetric label={t('common.officialTotalPnl')} value={formatSignedCurrency(snapshot?.totalPnl)} />
                <RiskMetric label={t('common.totalVolume')} value={formatCurrency(snapshot?.totalVolume)} />
                <RiskMetric label={t('common.realizedPnl')} value={formatSignedCurrency(snapshot?.realizedPnl)} />
                <RiskMetric label={t('common.unrealizedPnl')} value={formatSignedCurrency(snapshot?.unrealizedPnl)} />
                <RiskMetric label={t('common.biggestWin')} value={formatSignedCurrency(snapshot?.biggestWin)} />
                <RiskMetric label={t('common.profileViews')} value={snapshot?.viewsText ?? t('common.dash')} />
                <RiskMetric label={t('common.snapshotAt')} value={formatDateTime(meta?.snapshotAt)} />
                <RiskMetric label={t('common.lastScoredAt')} value={formatDateTime(meta?.lastScoredAt)} />
                <RiskMetric
                  label={t('common.rank')}
                  value={
                    displayLeaderboardRank != null
                      ? `#${displayLeaderboardRank}`
                      : t('common.dash')
                  }
                />
              </div>
            </section>

            <section
              className="surface-panel rounded-2xl px-3 py-4 sm:px-5 sm:py-4 md:px-6"
              aria-labelledby="quality-heading"
            >
              <h2 id="quality-heading" className="font-display text-lg font-semibold text-white sm:text-xl">
                {t('common.strategyQuality')}
              </h2>
              <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px]">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-xs sm:tracking-[0.18em]">
                    {t('common.composite')}
                  </p>
                  <p className="mt-0.5 font-display text-3xl font-semibold text-[#F8D978] sm:text-4xl">
                    {formatScore(smartScoreValue)}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-3 xl:grid-cols-3">
                    <RiskMetric label={t('common.pnlQuality')} value={formatScore(summary?.pnlQuality)} />
                    <RiskMetric
                      label={t('common.consistency')}
                      value={formatScore(summary?.consistencyScore)}
                    />
                    <RiskMetric label={t('common.activity')} value={formatScore(summary?.activityScore)} />
                    <RiskMetric label={t('common.officialSource')} value={formatScore(summary?.officialCandidateScore)} />
                    <RiskMetric label={t('common.externalQuality')} value={formatScore(summary?.externalQualityScore)} />
                    <RiskMetric label={t('common.riskPenalty')} value={formatScore(summary?.riskPenalty)} />
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 rounded-xl border border-white/10 bg-black/20 p-3 sm:gap-3 sm:p-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-xs">
                      {t('common.flags')}
                    </p>
                    {flagList.length > 0 ? (
                      <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-amber-100 sm:text-sm">
                        {flagList.map((flag) => (
                          <li key={flag}>{flag}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500 sm:text-sm">{t('common.noRiskFlags')}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-xs">
                      {t('common.dataConfidence')}
                    </p>
                    <p className="mt-1 text-xs leading-snug text-slate-300 sm:text-sm sm:leading-6">
                      {dataConfidenceParts.length > 0
                        ? dataConfidenceParts.join(t('backtest.confidenceJoin'))
                        : t('common.dash')}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </main>

      <Footer
        links={[
          { href: localizePath('/'), label: t('common.home') },
          { href: `${localizePath('/')}#leaderboard`, label: t('common.leaderboard') },
          { href: `${localizePath('/')}#methodology`, label: t('common.methodology') },
        ]}
      />
    </div>
  )
}
