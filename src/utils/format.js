import i18n from '../i18n/i18n'

const numberFormatters = new Map()
const scoreFormatters = new Map()
const compactCurrencyFormatters = new Map()
const fullCurrencyFormatters = new Map()
const relativeFormatters = new Map()

function getNumberFormatter() {
  const lng = i18n.language || 'en'
  if (!numberFormatters.has(lng)) {
    numberFormatters.set(lng, new Intl.NumberFormat(lng === 'zh' ? 'zh-CN' : lng))
  }
  return numberFormatters.get(lng)
}

function getScoreFormatter() {
  const lng = i18n.language || 'en'
  if (!scoreFormatters.has(lng)) {
    scoreFormatters.set(
      lng,
      new Intl.NumberFormat(lng === 'zh' ? 'zh-CN' : lng, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
    )
  }
  return scoreFormatters.get(lng)
}

function getCompactCurrencyFormatter() {
  const lng = i18n.language || 'en'
  if (!compactCurrencyFormatters.has(lng)) {
    compactCurrencyFormatters.set(
      lng,
      new Intl.NumberFormat(lng === 'zh' ? 'zh-CN' : lng, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        notation: 'compact',
      })
    )
  }
  return compactCurrencyFormatters.get(lng)
}

function getFullCurrencyFormatter() {
  const lng = i18n.language || 'en'
  if (!fullCurrencyFormatters.has(lng)) {
    fullCurrencyFormatters.set(
      lng,
      new Intl.NumberFormat(lng === 'zh' ? 'zh-CN' : lng, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      })
    )
  }
  return fullCurrencyFormatters.get(lng)
}

function getRelativeFormatter() {
  const lng = i18n.language || 'en'
  if (!relativeFormatters.has(lng)) {
    relativeFormatters.set(lng, new Intl.RelativeTimeFormat(lng, { numeric: 'auto' }))
  }
  return relativeFormatters.get(lng)
}

export function abbreviateWallet(wallet) {
  if (!wallet) {
    return '--'
  }

  if (wallet.length <= 12) {
    return wallet
  }

  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
}

export function formatNumber(value) {
  if (value == null || Number.isNaN(value)) {
    return '--'
  }

  return getNumberFormatter().format(value)
}

export function formatScore(value) {
  if (value == null || Number.isNaN(value)) {
    return '--'
  }

  return getScoreFormatter().format(value)
}

export function formatCurrency(value) {
  if (value == null || Number.isNaN(value)) {
    return '--'
  }

  const absolute = Math.abs(value)
  if (absolute >= 1000) {
    return getCompactCurrencyFormatter().format(value)
  }

  return getFullCurrencyFormatter().format(value)
}

export function formatPercent(value) {
  if (value == null || Number.isNaN(value)) {
    return '--'
  }

  const normalized = Math.abs(value) <= 1 ? value * 100 : value
  return `${getScoreFormatter().format(normalized)}%`
}

export function formatSignedCurrency(value) {
  if (value == null || Number.isNaN(value)) {
    return '--'
  }

  const formatted = formatCurrency(Math.abs(value))
  return value > 0 ? `+${formatted}` : value < 0 ? `-${formatted}` : formatted
}

export function formatSignedPercent(value) {
  if (value == null || Number.isNaN(value)) {
    return '--'
  }

  const formatted = formatPercent(Math.abs(value))
  return value > 0 ? `+${formatted}` : value < 0 ? `-${formatted}` : formatted
}

/**
 * `risk.returnRatio` / external `totalReturn` from some sources are 0–1 fractions (treated as %),
 * while Predicting-style payloads use large unitless scores (e.g. 1e6). Above ~500 we show a
 * compact signed count instead of a bogus percent.
 */
export function formatSignedReturnOrPercent(value) {
  if (value == null || Number.isNaN(value)) {
    return '--'
  }

  const magnitude = Math.abs(value)
  if (magnitude <= 1) {
    return formatSignedPercent(value)
  }
  if (magnitude >= 500) {
    const body = new Intl.NumberFormat(i18n.language || 'en', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(magnitude)
    return value > 0 ? `+${body}` : value < 0 ? `-${body}` : body
  }
  return formatSignedPercent(value)
}

export function formatRatio(value) {
  if (value == null || Number.isNaN(value)) {
    return '--'
  }

  return `${getScoreFormatter().format(value)}x`
}

export function formatRelativeTime(isoString) {
  if (!isoString) {
    return i18n.t('format.notSynced')
  }

  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) {
    return i18n.t('format.invalidTime')
  }

  const diffMs = date.getTime() - Date.now()
  const diffMinutes = Math.round(diffMs / 60000)

  if (Math.abs(diffMinutes) < 60) {
    return getRelativeFormatter().format(diffMinutes, 'minute')
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 48) {
    return getRelativeFormatter().format(diffHours, 'hour')
  }

  const diffDays = Math.round(diffHours / 24)
  return getRelativeFormatter().format(diffDays, 'day')
}

export function formatDateTime(isoString) {
  if (!isoString) {
    return '--'
  }

  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) {
    return '--'
  }

  const lng = i18n.language || 'en'
  return date.toLocaleString(lng === 'zh' ? 'zh-CN' : lng, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatPeriodLabel(period) {
  if (!period) {
    return i18n.t('common.dash')
  }

  const normalized = period.toUpperCase()
  if (normalized === 'WEEK') {
    return i18n.t('periods.week')
  }
  if (normalized === 'MONTH') {
    return i18n.t('periods.month')
  }
  if (normalized === 'ALL') {
    return i18n.t('periods.all')
  }
  return normalized
}

export function getScoreTone(score) {
  if (score == null || Number.isNaN(score)) {
    return 'neutral'
  }

  if (score >= 80) {
    return 'positive'
  }

  if (score >= 60) {
    return 'warm'
  }

  if (score >= 40) {
    return 'neutral'
  }

  return 'risk'
}

/** Sharpe 类比率：高分偏绿、中档琥珀、偏低/负偏红 */
export function getSharpeTone(value) {
  if (value == null || Number.isNaN(value)) {
    return 'neutral'
  }
  if (value >= 2) {
    return 'positive'
  }
  if (value >= 1) {
    return 'warm'
  }
  if (value >= 0) {
    return 'neutral'
  }
  return 'risk'
}
