import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/layout/header";
import MobileNavigation from "@/components/layout/mobile-navigation";
import Footer from "@/components/layout/footer";
import NewsTicker from "@/components/layout/news-ticker";
import HeroSection from "@/components/home/hero-section";
import PreSaleSection from "@/components/home/pre-sale-section";
import MarketSection from "@/components/home/market-section";
import MapSection from "@/components/home/map-section";
import FeaturesSection from "@/components/home/features-section";
import HotColdBondsSection from "@/components/home/hot-cold-bonds-section";

export default function HomePage() {
  const { t } = useTranslation();
  
  // Set page title
  useEffect(() => {
    document.title = "Sekance - " + t('home.pageTitle');
  }, [t]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <HeroSection />
        <PreSaleSection />
        <HotColdBondsSection />
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
