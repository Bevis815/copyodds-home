/** Decorative full-page background — pointer-events none */
export function LandingBackdrop() {
  return (
    <div className="landing-backdrop" aria-hidden>
      <div className="landing-backdrop__glow landing-backdrop__glow--a" />
      <div className="landing-backdrop__glow landing-backdrop__glow--b" />
      <div className="landing-backdrop__grid" />
      <div className="landing-backdrop__noise" />
    </div>
  )
}
