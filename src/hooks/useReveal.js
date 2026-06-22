import { useEffect, useRef, useState } from 'react'

export function useReveal({ threshold = 0.12, rootMargin = '0px 0px -6% 0px', once = true } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return undefined
    }

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return
        }
        setVisible(true)
        if (once) {
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [once, rootMargin, threshold])

  return { ref, visible }
}
