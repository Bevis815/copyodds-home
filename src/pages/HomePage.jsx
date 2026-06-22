import { useEffect, useLayoutEffect, useRef } from 'react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { BacktestShowcase } from '../components/landing/BacktestShowcase'
import { CopyTradingShowcase } from '../components/landing/CopyTradingShowcase'
import { CtaBanner } from '../components/landing/CtaBanner'
import { HowItWorksSection } from '../components/landing/HowItWorksSection'
import { LeaderboardShowcase } from '../components/landing/LeaderboardShowcase'
import { LandingBackdrop } from '../components/landing/LandingBackdrop'
import { WhyCopyOddsSection } from '../components/landing/WhyCopyOddsSection'

/**
 * @param {{ visible?: boolean }} props
 * `visible`：由 App 在「首页 Keep-Alive」模式下传入；为 false 时整页仍挂载在 DOM 中（hidden），用于保留滚动记忆。
 */
export function HomePage({ visible = true }) {
  const savedWindowScrollY = useRef(0)

  useEffect(() => {
    if (!visible) {
      return
    }
    const onScroll = () => {
      savedWindowScrollY.current = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [visible])

  useLayoutEffect(() => {
    if (!visible) {
      return
    }
    const y = savedWindowScrollY.current
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, left: 0, behavior: 'auto' })
    })
  }, [visible])

  return (
    <div className="landing-page relative min-h-screen w-full">
      <LandingBackdrop />

      <Header badges={[]} navigation={[]} fullWidth />

      <main className="relative z-[1] flex w-full flex-col">
        <div className="landing-hero-screen-wrap">
          <div className="landing-shell landing-hero-screen">
            <Hero />
          </div>
        </div>

        <div className="landing-shell flex flex-col gap-16 pb-12 pt-4 sm:gap-20 sm:pb-14 sm:pt-8 lg:gap-24">
          <div className="landing-section-glow landing-section-glow--a">
            <LeaderboardShowcase />
          </div>
          <BacktestShowcase />
          <div className="landing-section-glow landing-section-glow--b">
            <CopyTradingShowcase />
          </div>
          <HowItWorksSection />
          <WhyCopyOddsSection />
          <CtaBanner />
        </div>
      </main>

      <Footer fullWidth />
    </div>
  )
}
