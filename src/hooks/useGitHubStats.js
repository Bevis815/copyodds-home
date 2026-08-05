import { useEffect, useState } from 'react'
import { SITE } from '../lib/site'
import { fetchGitHubStats } from '../services/github'

const FALLBACK = {
  stars: 0,
  forks: 0,
  contributors: 0,
  weeklyCommits: 0,
  license: SITE.license,
  latestRelease: null,
  recentCommits: [],
  web: null,
  services: null,
  fetchedAt: 0,
}

export function useGitHubStats() {
  const [stats, setStats] = useState(FALLBACK)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchGitHubStats()
      .then((data) => {
        if (!cancelled) {
          setStats(data)
          setError(null)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { stats, loading, error }
}
