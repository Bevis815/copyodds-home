import { useEffect, useLayoutEffect, useRef } from 'react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { CommunitySection } from '../components/landing/CommunitySection'
import { CtaBanner } from '../components/landing/CtaBanner'
import { LandingBackdrop } from '../components/landing/LandingBackdrop'
import { OpenSourceSection } from '../components/landing/OpenSourceSection'
import { ProductFeaturesSection } from '../components/landing/ProductFeaturesSection'
import { RoadmapSection } from '../components/landing/RoadmapSection'
import { SeoFaqSection } from '../components/landing/SeoFaqSection'
import { useDocumentSeo } from '../hooks/useDocumentSeo'

/**
 * @param {{ visible?: boolean }} props
 * `visible`：由 App 在「首页 Keep-Alive」模式下传入；为 false 时整页仍挂载在 DOM 中（hidden），用于保留滚动记忆。
 */
export function HomePage({ visible = true }) {
  const savedWindowScrollY = useRef(0)
  useDocumentSeo({ page: 'home', enabled: visible })

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

      <Header fullWidth />

      <main className="relative z-[1] flex w-full flex-col">
        <div className="landing-shell landing-hero-screen">
          <Hero />
        </div>

        <div className="landing-shell flex flex-col gap-24 pb-20 pt-8 sm:gap-28 sm:pb-24 lg:gap-32">
          <ProductFeaturesSection />
          <OpenSourceSection />
          <RoadmapSection />
          <SeoFaqSection />
          <CommunitySection />
          <CtaBanner />
        </div>
      </main>

      <Footer fullWidth />
    </div>
  )
}
