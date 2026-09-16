import LandingNavbar from "@/components/landing/LandingNavbar"
import HeroSection from "@/components/landing/HeroSection"
import SourcesMarquee from "@/components/landing/SourcesMarquee"
import FeaturesBento from "@/components/landing/FeaturesBento"
import HowItWorks from "@/components/landing/HowItWorks"
import StatsSection from "@/components/landing/StatsSection"
import TestimonialsSection from "@/components/landing/TestimonialsSection"
import PricingSection from "@/components/landing/PricingSection"
import FaqSection from "@/components/landing/FaqSection"
import CtaFinalSection from "@/components/landing/CtaFinalSection"
import LandingFooter from "@/components/landing/LandingFooter"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />
      <main>
        <HeroSection />
        <SourcesMarquee />
        <FeaturesBento />
        <HowItWorks />
        <StatsSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <CtaFinalSection />
      </main>
      <LandingFooter />
    </div>
  )
}