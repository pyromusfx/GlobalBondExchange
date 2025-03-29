import React, { useEffect, useRef, useState } from 'react';
import { CountryShare } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from "lucide-react";
import { apiRequest } from '@/lib/queryClient';
import CandlestickChart from '@/components/ui/chart';

interface CountryChartProps {
  country: CountryShare;
  className?: string;
}

// Basitleştirilmiş, doğrudan çalışması gereken grafiği oluşturan component
export default function CountryChart({ country, className }: CountryChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const lastProcessedPrice = useRef<string | null>(null);
  
  // Yeni veri çekme yaklaşımı
  useEffect(() => {
    async function fetchData() {
      if (!country.countryCode) return;
      
      setIsLoading(true);
      try {
        const response = await apiRequest('GET', `/api/price-history/${country.countryCode}`);
        const data = await response.json();
        
        // API'den gelen veriyi doğrudan kullan
        if (data && Array.isArray(data) && data.length > 0) {
          console.log(`${country.countryCode} için ${data.length} veri noktası alındı`);
          console.log("Örnek veri:", data[0]);
          setChartData(data);
        } else {
          setError("Veri bulunamadı");
          console.error("API'den veri alınamadı veya veri boş");
        }
      } catch (err) {
        console.error("Veri çekerken hata:", err);
        setError("Veri çekilemedi");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [country.countryCode]);
  
  // Yeni fiyat güncellemesi
  useEffect(() => {
    if (country.currentPrice && country.currentPrice !== lastProcessedPrice.current) {
      lastProcessedPrice.current = country.currentPrice;
      // Burada yeni fiyat güncellemesi yapılabilir
    }
  }, [country.currentPrice]);

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
        
        <CardContent className="p-4">
          <div className="w-full relative" style={{ height: '400px' }}>
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-red-500">Şu anda grafik verisi çekilemiyor: {error}</p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-amber-500 mb-2">Grafik verisi bulunamadı.</p>
                <p className="text-sm text-muted-foreground">Veriler yakında güncellenecektir.</p>
              </div>
            ) : (
              // Ana grafik komponentini doğrudan kullan
              <CandlestickChart 
                data={chartData}
                height={400}
                colors={{
                  backgroundColor: '#131722',
                  textColor: '#D9D9D9',
                  lineColor: 'rgba(42, 46, 57, 0.5)',
                  upColor: '#26a69a',
                  downColor: '#ef5350',
                }}
              />
            )}
          </div>
        </CardContent>
      </Tabs>
    </Card>
  );
}