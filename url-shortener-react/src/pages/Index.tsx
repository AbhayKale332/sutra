import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import FeatureCards from "@/components/landing/FeatureCards";
import LandingFooter from "@/components/landing/LandingFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <HeroSection />
      <FeatureCards />
      <LandingFooter />
    </div>
  );
};

export default Index;
