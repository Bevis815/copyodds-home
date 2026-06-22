import { useId } from 'react'

const PATHS = {
  up: 'M0,28 C20,26 35,18 55,16 S95,8 120,10 S160,4 180,6',
  mid: 'M0,20 C25,18 45,22 70,16 S110,12 140,18 S165,14 180,10',
  calm: 'M0,22 C30,20 50,24 80,18 S120,16 150,20 S170,17 180,15',
  steady: 'M0,24 C35,22 60,20 95,21 S130,19 155,18 S175,17 180,16',
  climb: 'M0,26 C28,24 52,20 78,17 S125,12 155,14 S175,10 180,8',
}

export function MiniSparkline({ variant = 'up', className = '' }) {
  const fillId = useId()
  const path = PATHS[variant] ?? PATHS.up

  return (
    <svg className={`landing-sparkline ${className}`.trim()} viewBox="0 0 180 32" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(245,197,66,0.22)" />
          <stop offset="100%" stopColor="rgba(245,197,66,0)" />
        </linearGradient>
      </defs>
      <path className="landing-sparkline-fill" d={`${path} L180,32 L0,32 Z`} fill={`url(#${fillId})`} />
      <path className="landing-sparkline-line" d={path} fill="none" stroke="#F5C542" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
