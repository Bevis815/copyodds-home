/** Web app (SPA) — override via VITE_APP_URL at build time */
export const APP_URL = (import.meta.env.VITE_APP_URL ?? 'https://app.copyodds.io').replace(/\/$/, '')

export const LEADERBOARD_PATH = '/smart-money'

export function appPath(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${APP_URL}${normalized}`
}

export function leaderboardUrl() {
  return appPath(LEADERBOARD_PATH)
}

export function loginUrl() {
  return appPath('/login')
}
