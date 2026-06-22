/** @typedef {'WEEK' | 'MONTH' | 'ALL'} SmartMoneyRankBy */
/** @typedef {'1D' | '1W' | '1M' | 'ALL'} SmartMoneyRiskPeriod */

const LEADERBOARD_PREVIEW_KEY = 'copyodds:smartMoneyListPreview:v1'
const PROFILE_TTL_MS = 10 * 60 * 1000

/**
 * @typedef {object} SmartMoneyListPreview
 * @property {string | null} displayName
 * @property {string | null} profileImage
 * @property {number | null} rank
 * @property {string | null} score
 * @property {SmartMoneyRankBy | null} [rankBy]
 */

/** @type {Map<string, { profile: object, savedAt: number }>} */
const profileByKey = new Map()

function normalizeWallet(wallet) {
  return String(wallet ?? '')
    .trim()
    .toLowerCase()
}

function profileCacheKey(wallet, period) {
  return `${normalizeWallet(wallet)}:${period}`
}

/**
 * @param {string} wallet
 * @param {SmartMoneyListPreview} preview
 */
export function setSmartMoneyListPreview(wallet, preview) {
  const key = normalizeWallet(wallet)
  if (!key) {
    return
  }
  try {
    const raw = sessionStorage.getItem(LEADERBOARD_PREVIEW_KEY)
    let map = {}
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        map = parsed
      }
    }
    map[key] = { ...preview, savedAt: Date.now() }
    sessionStorage.setItem(LEADERBOARD_PREVIEW_KEY, JSON.stringify(map))
  } catch {
    /* quota / private mode */
  }
}

/**
 * @param {string} wallet
 * @returns {SmartMoneyListPreview | null}
 */
export function getSmartMoneyListPreview(wallet) {
  const key = normalizeWallet(wallet)
  if (!key) {
    return null
  }
  try {
    const raw = sessionStorage.getItem(LEADERBOARD_PREVIEW_KEY)
    if (!raw) {
      return null
    }
    const map = JSON.parse(raw)
    const entry = map?.[key]
    if (!entry || typeof entry !== 'object') {
      return null
    }
    const { savedAt: _savedAt, ...preview } = entry
    return preview
  } catch {
    return null
  }
}

/**
 * @param {string} wallet
 * @param {SmartMoneyRiskPeriod} period
 * @returns {object | null}
 */
export function getCachedSmartMoneyProfile(wallet, period) {
  const entry = profileByKey.get(profileCacheKey(wallet, period))
  if (!entry) {
    return null
  }
  if (Date.now() - entry.savedAt > PROFILE_TTL_MS) {
    profileByKey.delete(profileCacheKey(wallet, period))
    return null
  }
  return entry.profile
}

/**
 * @param {string} wallet
 * @param {SmartMoneyRiskPeriod} period
 * @param {object} profile
 */
export function setCachedSmartMoneyProfile(wallet, period, profile) {
  profileByKey.set(profileCacheKey(wallet, period), {
    profile,
    savedAt: Date.now(),
  })
}

/**
 * @param {string} wallet
 * @returns {Partial<Record<SmartMoneyRiskPeriod, object>>}
 */
export function hydrateSmartMoneyPeriodCache(wallet) {
  /** @type {Partial<Record<SmartMoneyRiskPeriod, object>>} */
  const out = {}
  for (const period of /** @type {const} */ (['1D', '1W', '1M', 'ALL'])) {
    const profile = getCachedSmartMoneyProfile(wallet, period)
    if (profile) {
      out[period] = profile
    }
  }
  return out
}

export function clearSmartMoneyProfileCacheForWallet(wallet) {
  const prefix = `${normalizeWallet(wallet)}:`
  for (const key of profileByKey.keys()) {
    if (key.startsWith(prefix)) {
      profileByKey.delete(key)
    }
  }
}
