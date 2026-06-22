/** Decorative full-page background — pointer-events none */
export function LandingBackdrop() {
  return (
    <div className="landing-backdrop" aria-hidden>
      <div className="landing-backdrop__mesh" />
      <div className="landing-backdrop__grid" />
      <div className="landing-backdrop__dots" />
      <div className="landing-backdrop__beam landing-backdrop__beam--a" />
      <div className="landing-backdrop__beam landing-backdrop__beam--b" />
      <div className="landing-backdrop__orb landing-backdrop__orb--hero" />
      <div className="landing-backdrop__orb landing-backdrop__orb--mid" />
      <div className="landing-backdrop__orb landing-backdrop__orb--low" />
      <div className="landing-backdrop__ring" />
      <div className="landing-backdrop__band landing-backdrop__band--leaderboard" />
      <div className="landing-backdrop__band landing-backdrop__band--copy" />
      <div className="landing-backdrop__band landing-backdrop__band--cta" />
    </div>
  )
}
