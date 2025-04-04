import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function HeroSection() {
  const { t } = useTranslation();
  
  return (
    <section className="relative overflow-hidden" id="home">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary to-transparent opacity-70 z-10"></div>
      <div className="container mx-auto px-4 py-16 relative z-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('home.hero.title')}</h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t('home.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth">
              <Button className="bg-primary hover:bg-primary/80 text-secondary py-3 px-6 rounded font-medium">
                {t('home.hero.startTrading')}
              </Button>
            </Link>
            <Link href="/market">
              <Button variant="outline" className="bg-transparent border border-primary text-primary hover:bg-primary/10 py-3 px-6 rounded font-medium">
                {t('market.title')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {/* Background gradient instead of world map */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
    </section>
  );
}
