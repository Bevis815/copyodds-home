import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

/**
 * Counts from 0 (or previous) to `value` when scrolled into view.
 * @param {{ value: number, duration?: number, decimals?: number, format?: (n: number) => string, className?: string }} props
 */
export function AnimatedNumber({
  value,
  duration = 1200,
  decimals = 0,
  format,
  className = '',
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(0)
  const startRef = useRef(0)
  const fromRef = useRef(0)

  useEffect(() => {
    if (!Number.isFinite(value)) {
      return undefined
    }
    if (reduceMotion || !inView) {
      if (reduceMotion) setDisplay(value)
      return undefined
    }

    fromRef.current = display
    startRef.current = performance.now()
    let frame = 0

    const tick = (now) => {
      const progress = Math.min(1, (now - startRef.current) / duration)
      const next = fromRef.current + (value - fromRef.current) * easeOutCubic(progress)
      setDisplay(next)
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        setDisplay(value)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // Only re-run when target value / visibility changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inView, reduceMotion, duration])

  const rounded =
    decimals > 0 ? Number(display.toFixed(decimals)) : Math.round(display)
  const text = format ? format(rounded) : String(rounded)

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  )
}
