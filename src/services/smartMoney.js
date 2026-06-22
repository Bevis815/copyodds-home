import { apiFetch } from './api'

/** 同一 query 并发只打一条网络（如 React StrictMode 双跑 effect），避免 Abort 在 Network 里显示「已取消」。 */
const profileRiskInflight = new Map()

/**
 * 从路径段解析标准 EVM 地址。支持 `0x`+40hex 后紧跟其它字符（如 Polymarket 的 `0x...-1772569391020`），
 * 避免整段被误判为 displayName。
 * @returns {string|null} 小写钱包地址，或 null
 */
export function extractWalletFromSegment(value) {
  const s = String(value ?? '').trim()
  const m = s.match(/^(0x[a-fA-F0-9]{40})/i)
  return m ? m[1].toLowerCase() : null
}

function nullableString(value) {
  if (value == null || value === '') {
    return null
  }
  const s = String(value).trim()
  return s === '' ? null : s
}

function toNumber(value) {
  if (value == null || value === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** 曲线点 value：兼容字符串、千分位、部分 JSON 数字串 */
function parseCurvePointValue(value) {
  if (value == null || value === '') {
    return null
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '').trim()
    if (cleaned === '') {
      return null
    }
    const parsed = Number(cleaned)
    return Number.isFinite(parsed) ? parsed : null
  }
  return toNumber(value)
}

/** 统一为 ISO 字符串，供图表与 Date 解析；兼容数字秒/毫秒时间戳 */
function normalizeCurvePointTs(ts) {
  if (ts == null || ts === '') {
    return null
  }
  if (typeof ts === 'number' && Number.isFinite(ts)) {
    const ms = ts < 1e12 ? ts * 1000 : ts
    const d = new Date(ms)
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
  }
  const s = String(ts).trim()
  if (s === '') {
    return null
  }
  const t = Date.parse(s)
  return Number.isNaN(t) ? s : new Date(t).toISOString()
}

function normalizeCurvePoints(points) {
  if (!Array.isArray(points)) {
    return []
  }

  return points
    .map((point) => ({
      ts: normalizeCurvePointTs(point?.ts),
      value: parseCurvePointValue(point?.value),
    }))
    .filter((point) => point.ts != null && point.ts !== '' && point.value != null)
}

function normalizeWindowPeakDrawdown(raw) {
  if (!raw || typeof raw !== 'object') {
    return null
  }
  const drawdownValue = toNumber(raw.drawdownValue)
  if (drawdownValue == null || drawdownValue <= 0) {
    return null
  }
  return {
    drawdownValue,
    drawdownRatio: toNumber(raw.drawdownRatio),
    peakValue: toNumber(raw.peakValue),
    troughValue: toNumber(raw.troughValue),
    peakTs: nullableString(raw.peakTs),
    troughTs: nullableString(raw.troughTs),
  }
}

function normalizeBacktestDay(day) {
  if (!day) {
    return null
  }

  return {
    date: day?.date ?? null,
    startTs: day?.startTs ?? null,
    endTs: day?.endTs ?? null,
    openValue: toNumber(day?.openValue),
    closeValue: toNumber(day?.closeValue),
    highValue: toNumber(day?.highValue),
    lowValue: toNumber(day?.lowValue),
    pointCount: day?.pointCount ?? 0,
    changeValue: toNumber(day?.changeValue),
    changeRatio: toNumber(day?.changeRatio),
    intradayMaxDrawdownValue: toNumber(day?.intradayMaxDrawdownValue),
    intradayMaxDrawdownRatio: toNumber(day?.intradayMaxDrawdownRatio),
    intradayPeakValue: toNumber(day?.intradayPeakValue),
    intradayPeakTs: day?.intradayPeakTs ?? null,
    intradayTroughValue: toNumber(day?.intradayTroughValue),
    intradayTroughTs: day?.intradayTroughTs ?? null,
  }
}

function normalizeRollingWindow(window) {
  if (!window) {
    return null
  }

  return {
    windowDays: window?.windowDays ?? null,
    startDate: window?.startDate ?? null,
    endDate: window?.endDate ?? null,
    startTs: window?.startTs ?? null,
    endTs: window?.endTs ?? null,
    openValue: toNumber(window?.openValue),
    closeValue: toNumber(window?.closeValue),
    changeValue: toNumber(window?.changeValue),
    changeRatio: toNumber(window?.changeRatio),
    sampledDayCount: window?.sampledDayCount ?? 0,
    calendarDaySpan: window?.calendarDaySpan ?? 0,
    hasFullWindow: typeof window?.hasFullWindow === 'boolean' ? window.hasFullWindow : null,
  }
}

function normalizeDistributionBucket(bucket) {
  if (!bucket) {
    return null
  }

  return {
    id: bucket?.id ?? null,
    label: bucket?.label ?? null,
    count: bucket?.count ?? 0,
    ratio: toNumber(bucket?.ratio),
  }
}

/** @param {Record<string, unknown>} item */
function normalizeSmartMoneyItem(item) {
  return {
    rank: item.rank ?? null,
    wallet: item.wallet,
    displayName: item.displayName ?? null,
    profileSlug: item.profileSlug ?? null,
    /** 头像 URL；优先主页解析，缺失时回退官方榜缓存 */
    profileImage: nullableString(item.profileImage),
    /** X 用户名；优先主页解析，缺失时回退官方榜缓存 */
    xUsername: nullableString(item.xUsername),
    joinedAtText: item.joinedAtText ?? null,
    score: toNumber(item.score) ?? 0,
    pnlQuality: toNumber(item.pnlQuality),
    activityScore: toNumber(item.activityScore),
    consistencyScore: toNumber(item.consistencyScore),
    officialCandidateScore: toNumber(item.officialCandidateScore),
    externalQualityScore: toNumber(item.externalQualityScore),
    riskPenalty: toNumber(item.riskPenalty),
    eligible: Boolean(item.eligible),
    predictionCount: item.predictionCount ?? null,
    holdingsValue: toNumber(item.holdingsValue),
    totalPnl: toNumber(item.totalPnl),
    totalVolume: toNumber(item.totalVolume),
    sourceRankWeek: item.sourceRankWeek ?? null,
    sourceRankMonth: item.sourceRankMonth ?? null,
    sourceRankAll: item.sourceRankAll ?? null,
    officialSourceRankWeek: item.officialSourceRankWeek ?? null,
    officialSourceRankMonth: item.officialSourceRankMonth ?? null,
    officialSourceRankAll: item.officialSourceRankAll ?? null,
    externalSourceRankWeek: item.externalSourceRankWeek ?? null,
    externalSourceRankMonth: item.externalSourceRankMonth ?? null,
    externalSourceRankAll: item.externalSourceRankAll ?? null,
    externalWinRate: toNumber(item.externalWinRate),
    externalSharpeRatio: toNumber(item.externalSharpeRatio),
    externalTotalReturn: toNumber(item.externalTotalReturn),
    externalMetricsPeriod: item.externalMetricsPeriod ?? null,
    externalMetricsSource: item.externalMetricsSource ?? null,
    candidatePeriods: Array.isArray(item.candidatePeriods) ? item.candidatePeriods : [],
    flags: Array.isArray(item.flags)
      ? item.flags
      : Array.isArray(item.riskFlags)
        ? item.riskFlags
        : [],
    scoreExplain: item.scoreExplain ?? null,
    lastScoredAt: item.lastScoredAt ?? null,
    sourceFetchedAt: item.sourceFetchedAt ?? null,
    syncedAt: item.syncedAt ?? null,
  }
}

function normalizeRiskProfilePayload(payload) {
  const w = payload?.wallet ?? ''
  const summaryRaw = payload?.summary
  const summary = summaryRaw
    ? {
        ...normalizeSmartMoneyItem(summaryRaw),
        candidatePeriods: Array.isArray(summaryRaw.candidatePeriods)
          ? summaryRaw.candidatePeriods
          : [],
      }
    : null
  return {
    wallet: typeof w === 'string' ? w.toLowerCase() : '',
    summary,
    profile: {
      displayName: payload?.profile?.displayName ?? null,
      profileSlug: payload?.profile?.profileSlug ?? null,
      profileImage: nullableString(payload?.profile?.profileImage),
      xUsername: nullableString(payload?.profile?.xUsername),
      joinedAtText: payload?.profile?.joinedAtText ?? null,
      viewsText: payload?.profile?.viewsText ?? null,
      holdingsValue: toNumber(payload?.profile?.holdingsValue),
      biggestWin: toNumber(payload?.profile?.biggestWin),
      predictionCount: payload?.profile?.predictionCount ?? null,
      totalPnl: toNumber(payload?.profile?.totalPnl),
      totalVolume: toNumber(payload?.profile?.totalVolume),
      realizedPnl: toNumber(payload?.profile?.realizedPnl),
      unrealizedPnl: toNumber(payload?.profile?.unrealizedPnl),
    },
    curve: {
      period: payload?.curve?.period ?? 'ALL',
      resolvedPeriod: ['1D', '1W', '1M', 'ALL'].includes(payload?.curve?.resolvedPeriod)
        ? payload.curve.resolvedPeriod
        : ['1D', '1W', '1M', 'ALL'].includes(payload?.curve?.period)
          ? payload.curve.period
          : 'ALL',
      activePeriod: ['1D', '1W', '1M', 'ALL'].includes(payload?.curve?.activePeriod)
        ? payload.curve.activePeriod
        : undefined,
      curveType: payload?.curve?.curveType ?? null,
      availablePeriods: Array.isArray(payload?.curve?.availablePeriods)
        ? payload.curve.availablePeriods
        : [],
      points: normalizeCurvePoints(payload?.curve?.points),
      startTs: payload?.curve?.startTs ?? null,
      endTs: payload?.curve?.endTs ?? null,
      coverageDays: toNumber(payload?.curve?.coverageDays),
      requestedPeriodDays: toNumber(payload?.curve?.requestedPeriodDays),
      hasFullRequestedWindow:
        typeof payload?.curve?.hasFullRequestedWindow === 'boolean'
          ? payload.curve.hasFullRequestedWindow
          : null,
      startValue: toNumber(payload?.curve?.startValue),
      latestValue: toNumber(payload?.curve?.latestValue),
      changeValue: toNumber(payload?.curve?.changeValue),
    },
    backtest: {
      sampledDayCount: payload?.backtest?.sampledDayCount ?? 0,
      positiveDayRatio: toNumber(payload?.backtest?.positiveDayRatio),
      negativeDayRatio: toNumber(payload?.backtest?.negativeDayRatio),
      maxStepGainValue: toNumber(payload?.backtest?.maxStepGainValue),
      maxStepLossValue: toNumber(payload?.backtest?.maxStepLossValue),
      bestDay: normalizeBacktestDay(payload?.backtest?.bestDay),
      worstDay: normalizeBacktestDay(payload?.backtest?.worstDay),
      worstIntradayDrawdownDay: normalizeBacktestDay(payload?.backtest?.worstIntradayDrawdownDay),
      windowPeakDrawdown: normalizeWindowPeakDrawdown(payload?.backtest?.windowPeakDrawdown),
      rollingWorst7D: normalizeRollingWindow(payload?.backtest?.rollingWorst7D),
      rollingWorst30D: normalizeRollingWindow(payload?.backtest?.rollingWorst30D),
      losingStreaks: {
        longestLosingStreakDays: payload?.backtest?.losingStreaks?.longestLosingStreakDays ?? 0,
        longestLosingStreakStartDate:
          payload?.backtest?.losingStreaks?.longestLosingStreakStartDate ?? null,
        longestLosingStreakEndDate:
          payload?.backtest?.losingStreaks?.longestLosingStreakEndDate ?? null,
        currentLosingStreakDays: payload?.backtest?.losingStreaks?.currentLosingStreakDays ?? 0,
        currentLosingStreakStartDate:
          payload?.backtest?.losingStreaks?.currentLosingStreakStartDate ?? null,
      },
      dailyReturnDistribution: {
        sampledDayCount: payload?.backtest?.dailyReturnDistribution?.sampledDayCount ?? 0,
        meanReturn: toNumber(payload?.backtest?.dailyReturnDistribution?.meanReturn),
        medianReturn: toNumber(payload?.backtest?.dailyReturnDistribution?.medianReturn),
        buckets: Array.isArray(payload?.backtest?.dailyReturnDistribution?.buckets)
          ? payload.backtest.dailyReturnDistribution.buckets
              .map(normalizeDistributionBucket)
              .filter(Boolean)
          : [],
      },
    },
    risk: {
      source: payload?.risk?.source ?? null,
      riskScore: toNumber(payload?.risk?.riskScore),
      riskLevel: payload?.risk?.riskLevel ?? 'UNKNOWN',
      maxDrawdownPercent: toNumber(payload?.risk?.maxDrawdownPercent),
      currentDrawdown: toNumber(payload?.risk?.currentDrawdown),
      returnRatio: toNumber(payload?.risk?.returnRatio),
      sharpeLike: toNumber(payload?.risk?.sharpeLike),
      sortinoLike: toNumber(payload?.risk?.sortinoLike),
      winRateProxy: toNumber(payload?.risk?.winRateProxy),
      volatilityProxy: toNumber(payload?.risk?.volatilityProxy),
    },
    externalRisk: payload?.externalRisk
      ? {
          period: payload.externalRisk.period ?? null,
          rank: payload.externalRisk.rank ?? null,
          smartScore: toNumber(payload.externalRisk.smartScore),
          maxDrawdownPercent: toNumber(payload.externalRisk.maxDrawdownPercent),
          currentDrawdown: toNumber(payload.externalRisk.currentDrawdown),
          totalReturn: toNumber(payload.externalRisk.totalReturn),
          sharpeRatio: toNumber(payload.externalRisk.sharpeRatio),
          sortinoRatio: toNumber(payload.externalRisk.sortinoRatio),
          winRate: toNumber(payload.externalRisk.winRate),
          rSquared: toNumber(payload.externalRisk.rSquared),
          tier: payload.externalRisk.tier ?? null,
          calculatedAt: payload.externalRisk.calculatedAt ?? null,
        }
      : null,
    meta: {
      snapshotAt: payload?.meta?.snapshotAt ?? null,
      sourceFetchedAt: payload?.meta?.sourceFetchedAt ?? null,
      lastScoredAt: payload?.meta?.lastScoredAt ?? null,
      syncedAt: payload?.meta?.syncedAt ?? null,
      externalMetricsSource: payload?.meta?.externalMetricsSource ?? null,
      curveDataSource: payload?.meta?.curveDataSource ?? null,
      curvePeriodFallback: Boolean(payload?.meta?.curvePeriodFallback),
      liveUpstreamError: payload?.meta?.liveUpstreamError ?? null,
    },
  }
}

/** @typedef {'WEEK' | 'MONTH' | 'ALL'} SmartMoneyRankBy */

/**
 * GET /api/polymarket/smart-money/cached — offset + limit 分页；响应含 offset、limit、total。
 * 下一页：offset += 上一页 items.length。是否还有下一页：offset + items.length < total。
 *
 * 与 polymarket-frontend 一致：`rankBy` 控制按 sourceRank* 排序；`candidatePeriod` 缩小候选集。
 * 周期 Tab 时两者传同一值（ALL / WEEK / MONTH）。列表展示名次用 offset+index+1，勿用 API 的 `rank`。
 */
export async function fetchSmartMoneyLeaderboard({
  limit = 100,
  offset = 0,
  eligibleOnly = true,
  rankBy,
  candidatePeriod,
  sortBy,
  sortDir,
} = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    eligibleOnly: String(eligibleOnly),
  })
  if (rankBy) {
    params.set('rankBy', rankBy)
  }
  if (candidatePeriod) {
    params.set('candidatePeriod', candidatePeriod)
  }
  if (sortBy) {
    params.set('sortBy', sortBy)
  }
  if (sortDir) {
    params.set('sortDir', sortDir)
  }

  const data = await apiFetch(`/api/polymarket/smart-money/cached?${params.toString()}`)

  return {
    items: Array.isArray(data?.items) ? data.items.map(normalizeSmartMoneyItem) : [],
    total: typeof data?.total === 'number' ? data.total : 0,
    limit: typeof data?.limit === 'number' ? data.limit : limit,
    offset: typeof data?.offset === 'number' ? data.offset : offset,
    eligibleOnly: Boolean(data?.eligibleOnly),
    rankBy: data?.rankBy ?? rankBy ?? null,
    scoreVersion: data?.scoreVersion ?? '',
    candidateSource: Array.isArray(data?.candidateSource) ? data.candidateSource : [],
    syncedAt: data?.syncedAt ?? null,
  }
}

export async function fetchSmartMoneyRiskProfile(identifier, period = 'ALL') {
  const params = new URLSearchParams({ period })
  const trimmed = String(identifier ?? '').trim()
  const wallet = extractWalletFromSegment(trimmed)
  if (wallet) {
    params.set('wallet', wallet)
  } else {
    params.set('displayName', trimmed)
  }

  params.set('live', 'true')
  const query = params.toString()
  const pending = profileRiskInflight.get(query)
  if (pending) {
    return pending
  }

  const promise = (async () => {
    try {
      const data = await apiFetch(`/api/polymarket/smart-money/profile-risk?${query}`)
      return normalizeRiskProfilePayload(data)
    } finally {
      profileRiskInflight.delete(query)
    }
  })()

  profileRiskInflight.set(query, promise)
  return promise
}
