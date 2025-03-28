import React, { useEffect, useRef } from 'react';
import { usePriceChart } from '@/hooks/use-price-chart';
import { CountryShare } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from "lucide-react";

interface CountryChartProps {
  country: CountryShare;
  className?: string;
}

export default function CountryChart({ country, className }: CountryChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Son işlenen fiyatı takip etmek için bir ref tanımlıyoruz (Component üst seviyesinde)
  const lastProcessedPrice = useRef<string | null>(null);
  const uniqueChartId = useRef(`chart-${country.countryCode}-${Math.random().toString(36).substring(2, 9)}`);
  
  const { chartData, isLoading, error, appendNewPrice } = usePriceChart(containerRef, country.countryCode, {
    width: 670, // Sabit genişlik
    height: 400, // Sabit yükseklik
    colors: {
      upColor: '#4caf50',
      downColor: '#ef5350',
      borderUpColor: '#4caf50',
      borderDownColor: '#ef5350',
      wickUpColor: '#4caf50',
      wickDownColor: '#ef5350',
    }
  });

  // Yeni fiyat geldiğinde grafiği güncelle
  useEffect(() => {
    if (country.currentPrice && chartData.length > 0) {
      // Sadece fiyat değiştiyse güncelle, aynı fiyatı tekrar tekrar ekleme
      if (country.currentPrice !== lastProcessedPrice.current) {
        const price = parseFloat(country.currentPrice);
        if (!isNaN(price)) {
          appendNewPrice(price);
          lastProcessedPrice.current = country.currentPrice;
        }
      }
    }
  }, [country.currentPrice, appendNewPrice, chartData.length]);

  return (
    <Card className={`overflow-hidden ${className || ''}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <img 
              src={`https://flagcdn.com/24x18/${country.countryCode.toLowerCase()}.png`} 
              alt={country.countryName} 
              className="mr-1 h-5"
            />
            {country.countryName} ({country.countryCode})
          </CardTitle>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">
              Price: ${parseFloat(country.currentPrice || "0").toFixed(4)}
            </span>
            {country.previousPrice && country.currentPrice && (
              <span className={`text-xs px-1 py-0.5 rounded-sm ${
                parseFloat(country.currentPrice) > parseFloat(country.previousPrice) 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {parseFloat(country.currentPrice) > parseFloat(country.previousPrice) ? '▲' : '▼'}
                {Math.abs(
                  ((parseFloat(country.currentPrice) - parseFloat(country.previousPrice)) / 
                  parseFloat(country.previousPrice)) * 100
                ).toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="1M">
        <div className="px-4 pb-0">
          <TabsList className="h-8">
            <TabsTrigger value="1D" className="h-7 text-xs">1D</TabsTrigger>
            <TabsTrigger value="1W" className="h-7 text-xs">1W</TabsTrigger>
            <TabsTrigger value="1M" className="h-7 text-xs">1M</TabsTrigger>
            <TabsTrigger value="3M" className="h-7 text-xs">3M</TabsTrigger>
            <TabsTrigger value="1Y" className="h-7 text-xs">1Y</TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="p-0 pt-4">
          {/* Only show one chart container, all tabs use the same data */}
          <div className="w-full h-[400px] relative p-2">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <div 
                id={uniqueChartId.current}
                ref={containerRef} 
                className="w-full h-full" 
                style={{ minHeight: '400px' }}
              />
            )}
          </div>
        </CardContent>
      </Tabs>
    </Card>
  );
}