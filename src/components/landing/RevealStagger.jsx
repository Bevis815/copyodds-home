import { useReveal } from '../../hooks/useReveal'

export function RevealStagger({ children, className = '', stagger = 70, as: Component = 'div' }) {
  const { ref, visible } = useReveal()

  return (
    <Component
      ref={ref}
      className={`landing-reveal-stagger ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ '--stagger-step': `${stagger}ms` }}
    >
      {children}
    </Component>
  )
}
