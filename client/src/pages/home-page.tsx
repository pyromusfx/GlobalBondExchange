import { useEffect } from "react";
import Header from "@/components/layout/header";
import MobileNavigation from "@/components/layout/mobile-navigation";
import Footer from "@/components/layout/footer";
import NewsTicker from "@/components/layout/news-ticker";
import HeroSection from "@/components/home/hero-section";
import PreSaleSection from "@/components/home/pre-sale-section";
import MarketSection from "@/components/home/market-section";
import MapSection from "@/components/home/map-section";
import FeaturesSection from "@/components/home/features-section";

export default function HomePage() {
  // Set page title
  useEffect(() => {
    document.title = "Sekance - Virtual Bond Exchange";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <HeroSection />
        <PreSaleSection />
        <MarketSection />
        <MapSection />
        <FeaturesSection />
      </main>
      
      <NewsTicker />
      <Footer />
      <MobileNavigation />
    </div>
  );
}
