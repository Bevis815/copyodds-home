function isPoint(value) {
  if (!value || typeof value !== 'object') return false
  return Number.isFinite(value.t) && Number.isFinite(value.v)
}

export function resolveSparkline(raw) {
  if (!Array.isArray(raw)) return []
  return raw.filter(isPoint).sort((a, b) => a.t - b.t)
}

export function PnlSparkline({ points, className = '', width = 92, height = 28 }) {
  const series = resolveSparkline(points)
  if (series.length < 2) {
    return <span className={`hero-board__spark-empty ${className}`.trim()} aria-hidden />
  }

  const values = series.map((p) => p.v)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const tMin = series[0].t
  const tMax = series[series.length - 1].t
  const tRange = tMax - tMin || 1
  const pad = 2
  const innerW = width - pad * 2
  const innerH = height - pad * 2
  const coords = series.map((p) => ({
    x: pad + ((p.t - tMin) / tRange) * innerW,
    y: pad + innerH - ((p.v - min) / range) * innerH,
  }))
  const polyline = coords.map((c) => `${c.x},${c.y}`).join(' ')
  const first = coords[0]
  const last = coords[coords.length - 1]
  const area = `${polyline} ${last.x},${height - pad} ${first.x},${height - pad}`
  const up = series[series.length - 1].v >= series[0].v
  const stroke = up ? '#4ade80' : '#f87171'
  const fill = up ? 'rgba(74, 222, 128, 0.16)' : 'rgba(248, 113, 113, 0.14)'

  return (
    <svg
      className={`hero-board__spark ${className}`.trim()}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polygon fill={fill} points={area} />
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        points={polyline}
      />
    </svg>
  )
}
