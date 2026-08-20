import { APP_URL, loginUrl, leaderboardUrl } from './app-links'

/** Official open-source repos and community links for the marketing site. */
const BANNER_IMAGE =
  'https://copyodds-media-1442243915.cos.ap-singapore.myqcloud.com/images/copyodds-banner.png?v=1920x1080'

export const SITE = {
  name: 'CopyOdds',
  tagline: 'Open Source AI Trading Platform for Polymarket',
  url: 'https://copyodds.io',
  logo: 'https://copyodds.io/logo.jpg',
  bannerImage: BANNER_IMAGE,
  bannerWidth: 1920,
  bannerHeight: 1080,
  ogImage: BANNER_IMAGE,
  twitterHandle: '@copyodds',
  appUrl: APP_URL,
  loginUrl: loginUrl(),
  leaderboardUrl: leaderboardUrl(),
  license: 'Apache-2.0',
  github: {
    org: 'Copyodds',
    orgUrl: 'https://github.com/Copyodds',
    web: {
      owner: 'Copyodds',
      repo: 'copyodds-web',
      url: 'https://github.com/Copyodds/copyodds-web',
    },
    services: {
      owner: 'Copyodds',
      repo: 'copyodds-services',
      url: 'https://github.com/Copyodds/copyodds-services',
    },
  },
  social: {
    x: import.meta.env.VITE_X_URL || 'https://x.com/copyodds',
    /** Official Telegram bot (@copyodds_bot). Support stays in `lib/support.js`. */
    telegram: import.meta.env.VITE_TELEGRAM_URL || 'https://t.me/copyodds_bot',
    discord: import.meta.env.VITE_DISCORD_URL || '',
  },
  docs: {
    home: 'https://github.com/Copyodds/copyodds-web/tree/main/docs',
    api: 'https://github.com/Copyodds/copyodds-services/tree/main/docs',
    partners: '/partners',
    roadmap: 'https://github.com/Copyodds/copyodds-web/issues',
    blog: 'https://github.com/Copyodds/copyodds-web#readme',
    releases: 'https://github.com/Copyodds/copyodds-web/releases',
    license: 'https://github.com/Copyodds/copyodds-web/blob/main/LICENSE',
    privacy: '/privacy',
    terms: '#terms',
  },
}

export function githubRepoApiUrl(owner, repo) {
  return `https://api.github.com/repos/${owner}/${repo}`
}

export function githubCommitsApiUrl(owner, repo, sinceIso) {
  const base = `https://api.github.com/repos/${owner}/${repo}/commits`
  return sinceIso ? `${base}?since=${encodeURIComponent(sinceIso)}&per_page=1` : `${base}?per_page=5`
}
