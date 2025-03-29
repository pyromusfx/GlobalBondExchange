import React, { useEffect, useRef, useState } from 'react';
import { CountryShare } from '@shared/schema';
import { Loader2 } from "lucide-react";
import { apiRequest } from '@/lib/queryClient';
import CandlestickChart from '@/components/ui/chart';

interface CountryChartProps {
  country: CountryShare;
  className?: string;
}

// Basitleştirilmiş, Binance'e benzer, sadece grafik içeren bileşen
export default function CountryChart({ country, className }: CountryChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const lastProcessedPrice = useRef<string | null>(null);
  
  // Veri çekme işlemi
  useEffect(() => {
    async function fetchData() {
      if (!country.countryCode) return;
      
      setIsLoading(true);
      try {
        const response = await apiRequest('GET', `/api/price-history/${country.countryCode}`);
        const data = await response.json();
        
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
    }
  }, [country.currentPrice]);

  return (
    <div className={`w-full h-full ${className || ''}`}>
      <div className="w-full h-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0B0E11]">
            <Loader2 className="h-8 w-8 animate-spin text-[#F0B90B]" />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0B0E11]">
            <p className="text-red-500">Şu anda grafik verisi çekilemiyor</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0E11]">
            <p className="text-amber-500 mb-2">Grafik verisi bulunamadı</p>
            <p className="text-sm text-[#848E9C]">Veriler yakında güncellenecektir</p>
          </div>
        ) : (
          <CandlestickChart 
            data={chartData}
            height={520} // Daha büyük grafik
            colors={{
              backgroundColor: '#0B0E11',
              textColor: '#B7BDC6',
              lineColor: 'rgba(42, 46, 57, 0.5)',
              upColor: '#0ECB81', // Binance yeşil
              downColor: '#F6465D', // Binance kırmızı
            }}
          />
        )}
      </div>
    </div>
  );
}