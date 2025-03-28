import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Zap, Snowflake } from 'lucide-react';
import { CountryShare } from '@shared/schema';
import { useAllCountries } from '@/hooks/use-countries';

export default function HotColdBondsSection() {
  const { t } = useTranslation();
  const { data: countries = [], isLoading } = useAllCountries();
  // Ülkeler ve fiyat değişim yüzdesi için genişletilmiş tip
  type CountryWithPriceChange = CountryShare & {
    priceChange: number;
    percentChange: number;
  };
  
  const [hotBonds, setHotBonds] = useState<CountryWithPriceChange[]>([]);
  const [coldBonds, setColdBonds] = useState<CountryWithPriceChange[]>([]);

  useEffect(() => {
    if (countries.length > 0) {
      // Güvenli bir şekilde string değerini float'a çevirir
      const safeParseFloat = (value: string | null): number => {
        if (!value) return 0;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      };

      // Ülkeleri fiyat değişimlerine göre sırala
      const sortedByPriceChange = [...countries].map(country => {
        const currentPrice = safeParseFloat(country.currentPrice);
        const previousPrice = safeParseFloat(country.previousPrice);
        const priceChange = currentPrice - previousPrice;
        const percentChange = previousPrice ? (priceChange / previousPrice) * 100 : 0;
        
        return {
          ...country,
          priceChange,
          percentChange
        } as CountryWithPriceChange;
      });

      // Yükselen ülkeler (Hot Bonds)
      const hot = sortedByPriceChange
        .filter(c => c.percentChange > 0)
        .sort((a, b) => b.percentChange - a.percentChange)
        .slice(0, 5);
      
      // Düşen ülkeler (Cold Bonds)
      const cold = sortedByPriceChange
        .filter(c => c.percentChange < 0)
        .sort((a, b) => a.percentChange - b.percentChange)
        .slice(0, 5);
      
      setHotBonds(hot);
      setColdBonds(cold);
    }
  }, [countries]);

  if (isLoading) {
    return (
      <section className="py-12 bg-card/50">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t('bonds.trending')}</h2>
          <div className="flex justify-center">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-card/50">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">{t('bonds.trending')}</h2>
        <p className="text-muted-foreground text-center mb-8">{t('bonds.trendingDescription')}</p>
        
        <Tabs defaultValue="hot" className="w-full max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="hot" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>{t('bonds.hotBonds')}</span>
              </TabsTrigger>
              <TabsTrigger value="cold" className="flex items-center gap-2">
                <Snowflake className="w-4 h-4" />
                <span>{t('bonds.coldBonds')}</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="hot">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotBonds.map(country => {
                const currentPrice = parseFloat(country.currentPrice || "0");
                const previousPrice = parseFloat(country.previousPrice || "0");
                const percentChange = country.percentChange || 0;
                
                return (
                  <Card key={country.countryCode} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <img 
                            src={`https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png`}
                            alt={country.countryName}
                            className="w-6 h-4 rounded"
                          />
                          <h3 className="font-medium">{country.countryName}</h3>
                        </div>
                        <div className="flex items-center text-green-500 font-medium">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span>+{percentChange.toFixed(2)}%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{t('bonds.currentPrice')}</p>
                          <p className="font-mono font-medium">${currentPrice.toFixed(3)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{t('bonds.previousPrice')}</p>
                          <p className="font-mono">${previousPrice.toFixed(3)}</p>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full flex items-center justify-center"
                        onClick={() => window.location.href=`/trade/${country.countryCode}`}
                      >
                        <span>{t('bonds.tradeNow')}</span>
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="cold">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coldBonds.map(country => {
                const currentPrice = parseFloat(country.currentPrice || "0");
                const previousPrice = parseFloat(country.previousPrice || "0");
                const percentChange = country.percentChange || 0;
                
                return (
                  <Card key={country.countryCode} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <img 
                            src={`https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png`}
                            alt={country.countryName}
                            className="w-6 h-4 rounded"
                          />
                          <h3 className="font-medium">{country.countryName}</h3>
                        </div>
                        <div className="flex items-center text-red-500 font-medium">
                          <TrendingDown className="w-4 h-4 mr-1" />
                          <span>{percentChange.toFixed(2)}%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{t('bonds.currentPrice')}</p>
                          <p className="font-mono font-medium">${currentPrice.toFixed(3)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{t('bonds.previousPrice')}</p>
                          <p className="font-mono">${previousPrice.toFixed(3)}</p>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full flex items-center justify-center"
                        onClick={() => window.location.href=`/trade/${country.countryCode}`}
                      >
                        <span>{t('bonds.tradeNow')}</span>
                        <ArrowDownRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}