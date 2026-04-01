import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import URLShortenAnimation from "@/components/landing/URLShortenAnimation";
import SocialProof from "@/components/landing/SocialProof";
import FeatureCards from "@/components/landing/FeatureCards";
import HowItWorks from "@/components/landing/HowItWorks";
import AnalyticsPreview from "@/components/landing/AnalyticsPreview";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <HeroSection />
      <URLShortenAnimation />
      <FeatureCards />
      <HowItWorks />
      <AnalyticsPreview />
      <CTASection />
      <LandingFooter />
    </div>
  );
};

export default Index;
