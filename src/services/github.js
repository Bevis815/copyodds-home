import { SITE, githubRepoApiUrl } from '../lib/site'

const CACHE_TTL_MS = 10 * 60 * 1000
let cache = null
let inflight = null

const emptyRepo = {
  stars: 0,
  forks: 0,
  watchers: 0,
  openIssues: 0,
  license: null,
  pushedAt: null,
  description: null,
  latestRelease: null,
  contributors: 0,
  weeklyCommits: 0,
  recentCommits: [],
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  })
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}`)
  }
  return response.json()
}

async function fetchRepoBundle({ owner, repo }) {
  const repoUrl = githubRepoApiUrl(owner, repo)
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [repoData, commits, release, contributors] = await Promise.all([
    fetchJson(repoUrl),
    fetchJson(`${repoUrl}/commits?since=${encodeURIComponent(since)}&per_page=100`).catch(() => []),
    fetchJson(`${repoUrl}/releases/latest`).catch(() => null),
    fetchJson(`${repoUrl}/contributors?per_page=100`).catch(() => []),
  ])

  const recentCommits = Array.isArray(commits)
    ? commits.slice(0, 5).map((c) => ({
        sha: c.sha?.slice(0, 7) ?? '',
        message: (c.commit?.message ?? '').split('\n')[0],
        author: c.commit?.author?.name ?? c.author?.login ?? 'unknown',
        date: c.commit?.author?.date ?? null,
        url: c.html_url ?? `${SITE.github.orgUrl}/${repo}`,
      }))
    : []

  return {
    stars: Number(repoData.stargazers_count) || 0,
    forks: Number(repoData.forks_count) || 0,
    watchers: Number(repoData.subscribers_count) || 0,
    openIssues: Number(repoData.open_issues_count) || 0,
    license: repoData.license?.spdx_id ?? SITE.license,
    pushedAt: repoData.pushed_at ?? null,
    description: repoData.description ?? null,
    latestRelease: release?.tag_name
      ? {
          tag: release.tag_name,
          name: release.name ?? release.tag_name,
          url: release.html_url,
          publishedAt: release.published_at,
        }
      : null,
    contributors: Array.isArray(contributors) ? contributors.length : 0,
    weeklyCommits: Array.isArray(commits) ? commits.length : 0,
    recentCommits,
  }
}

function sumStats(web, services) {
  return {
    stars: web.stars + services.stars,
    forks: web.forks + services.forks,
    contributors: Math.max(web.contributors, services.contributors),
    weeklyCommits: web.weeklyCommits + services.weeklyCommits,
    license: web.license || services.license || SITE.license,
    latestRelease: web.latestRelease || services.latestRelease,
    recentCommits: [...(web.recentCommits || []), ...(services.recentCommits || [])]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 6),
    web,
    services,
    fetchedAt: Date.now(),
  }
}

/**
 * Aggregates live stats from copyodds-web + copyodds-services.
 * Cached in-memory for 10 minutes to stay polite with GitHub rate limits.
 */
export async function fetchGitHubStats() {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache
  }
  if (inflight) {
    return inflight
  }

  inflight = Promise.all([
    fetchRepoBundle(SITE.github.web).catch(() => ({ ...emptyRepo, license: SITE.license })),
    fetchRepoBundle(SITE.github.services).catch(() => ({ ...emptyRepo, license: SITE.license })),
  ])
    .then(([web, services]) => {
      cache = sumStats(web, services)
      return cache
    })
    .catch(() => {
      const fallback = sumStats({ ...emptyRepo, license: SITE.license }, { ...emptyRepo })
      cache = fallback
      return fallback
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}
