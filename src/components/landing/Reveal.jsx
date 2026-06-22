import { useReveal } from '../../hooks/useReveal'

export function Reveal({
  children,
  className = '',
  delay = 0,
  as: Component = 'div',
  threshold,
  rootMargin,
}) {
  const { ref, visible } = useReveal({ threshold, rootMargin })

  return (
    <Component
      ref={ref}
      className={`landing-reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      {children}
    </Component>
  )
}
