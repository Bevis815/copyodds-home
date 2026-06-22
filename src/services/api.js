const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
const API_KEY = import.meta.env.VITE_API_KEY?.trim() ?? ''

function resolveUrl(path) {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  if (!API_BASE_URL) {
    return path
  }

  const normalizedBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers ?? {})

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  if (API_KEY && !headers.has('x-api-key')) {
    headers.set('x-api-key', API_KEY)
  }

  const response = await fetch(resolveUrl(path), {
    ...options,
    headers,
  })

  let payload = null

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const message =
      payload?.data?.message ??
      payload?.message ??
      `Request failed with status ${response.status}`
    throw new Error(message)
  }

  if (payload?.code !== 0) {
    throw new Error(payload?.data?.message ?? 'API returned an unexpected response.')
  }

  return payload.data
}
