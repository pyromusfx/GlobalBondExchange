import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, Time } from 'lightweight-charts';
import { apiRequest } from '@/lib/queryClient';

// Arayüzler
interface PricePoint {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface ChartOptions {
  width?: number;
  height?: number;
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
    upColor?: string;
    downColor?: string;
    borderUpColor?: string;
    borderDownColor?: string;
    wickUpColor?: string;
    wickDownColor?: string;
  };
}

export function usePriceChart(containerRef: React.RefObject<HTMLDivElement>, countryCode: string, options: ChartOptions = {}) {
  const [chartData, setChartData] = useState<PricePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Chart nesnelerini saklamak için referanslar
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  
  // Varsayılan ayarlar
  const defaultOptions = {
    width: options.width || 600,
    height: options.height || 300,
    colors: {
      backgroundColor: options.colors?.backgroundColor || 'transparent',
      lineColor: options.colors?.lineColor || '#2962FF',
      textColor: options.colors?.textColor || 'rgba(255, 255, 255, 0.5)',
      areaTopColor: options.colors?.areaTopColor || 'rgba(41, 98, 255, 0.28)',
      areaBottomColor: options.colors?.areaBottomColor || 'rgba(41, 98, 255, 0.05)',
      upColor: options.colors?.upColor || '#26a69a',
      downColor: options.colors?.downColor || '#ef5350',
      borderUpColor: options.colors?.borderUpColor || '#26a69a',
      borderDownColor: options.colors?.borderDownColor || '#ef5350',
      wickUpColor: options.colors?.wickUpColor || '#26a69a',
      wickDownColor: options.colors?.wickDownColor || '#ef5350',
    }
  };
  
  // Ülkenin fiyat verilerini API'den alma
  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout;
    
    async function fetchPriceData() {
      if (!countryCode) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fiyat geçmişi API isteği yap
        const response = await apiRequest('GET', `/api/price-history/${countryCode}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Fetched price history for ${countryCode}:`, data.length);
        
        if (isMounted) {
          if (data && data.length > 0) {
            setChartData(data);
          } else {
            console.log("No data from API, generating demo data");
            generateDemoData();
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching price data:", err);
        if (isMounted) {
          setError("Failed to load chart data");
          generateDemoData();
        }
      }
    }
    
    // Demo veri oluştur
    function generateDemoData() {
      const now = new Date();
      const data: PricePoint[] = [];
      
      // Başlangıç fiyatı $1.0 olarak ayarla (sabit fiyat politikası)
      let basePrice = 1.0;
      
      // Ülkeye özgü deterministik bir patern oluştur
      // countryCode'un ilk harfini alıp ASCII değerine göre trend belirle
      const firstCharCode = countryCode.charCodeAt(0);
      // Trend: -0.5 ile +0.5 arası
      const trendFactor = ((firstCharCode % 10) - 5) / 10;
      
      // Ülkeye özgü volatilite (0.03 ile 0.08 arası)
      const volatility = 0.03 + (firstCharCode % 5) * 0.01;
      
      // Patern uzunluğu (5-10 gün arası)
      const patternLength = 5 + (firstCharCode % 5);
      let patternDay = 0;
      let patternDir = trendFactor > 0 ? 1 : -1;
      
      // Son 30 günlük veriyi oluştur
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Her patern uzunluğunda trendi değiştir
        if (patternDay >= patternLength) {
          patternDay = 0;
          // 40% ihtimalle yön değiştir
          if (Math.random() < 0.4) {
            patternDir *= -1;
          }
        }
        
        // Günlük fiyat değişimi: trend + rastgele volatilite
        const trendComponent = patternDir * volatility * 0.5;
        const randomComponent = (Math.random() * 2 - 1) * volatility;
        const dailyChange = trendComponent + randomComponent;
        
        // Fiyatı güncelle (0.8-1.2 arası sınırla)
        basePrice = Math.max(0.8, Math.min(1.2, basePrice * (1 + dailyChange)));
        
        // O günün açılış, yüksek, düşük ve kapanış değerleri
        const open = basePrice;
        
        // Gün içi hareketler
        const dayVolatility = volatility * 0.7;
        const high = open * (1 + Math.random() * dayVolatility * (patternDir > 0 ? 1.2 : 0.8));
        const low = open * (1 - Math.random() * dayVolatility * (patternDir < 0 ? 1.2 : 0.8));
        
        // Trend yönüne göre kapanış daha olası
        const trendBias = (patternDir + 1) / 2; // 0-1 arası
        const closePosition = Math.random() * 0.6 + trendBias * 0.4; // Trende doğru eğilimli
        const close = low + (high - low) * closePosition;
        
        // Unix timestamp (saniye cinsinden)
        const timestamp = Math.floor(date.getTime() / 1000);
        
        // Veri noktasını ekle
        data.push({
          time: timestamp as Time,
          open: parseFloat(open.toFixed(4)), 
          high: parseFloat(high.toFixed(4)),
          low: parseFloat(low.toFixed(4)),
          close: parseFloat(close.toFixed(4)),
          volume: Math.floor((1000 + Math.random() * 4000) * (1 + Math.abs(dailyChange) * 10))
        });
        
        patternDay++;
      }
      
      if (isMounted) {
        setChartData(data);
        setIsLoading(false);
      }
    }
    
    fetchPriceData();
    
    return () => {
      isMounted = false;
    };
  }, [countryCode]);
  
  // Chart'ı oluştur
  useEffect(() => {
    // Container ve veri kontrolü
    if (!containerRef.current || chartData.length === 0) {
      return;
    }
    
    // Temizleme işlemi, her zaman mevcut grafiği temizle
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }
    
    // Gecikme ekleyerek DOM'un tamamen yüklenmesini sağla
    const timer = setTimeout(() => {
      try {
        // Grafiğin oluşturulacağı element hala DOM'da mı kontrol et
        if (!containerRef.current) {
          console.error("Container ref is null");
          return;
        }

        // Sabit boyutlar kullanalım (responsive olmak yerine)
        const chartWidth = 670;  // Sabit genişlik
        const chartHeight = 400; // Sabit yükseklik

        console.log("Creating chart with container dimensions:", {
          width: chartWidth,
          height: chartHeight
        });
        
        // DOM'u temizle öncelikle
        containerRef.current.innerHTML = '';
        
        console.log("Data for chart:", chartData.length, "items", chartData.length > 0 ? chartData[0] : "no data");
        
        // Grafiği oluştur - basitleştirilmiş yapılandırma
        const chart = createChart(containerRef.current, {
          width: chartWidth,
          height: chartHeight,
          layout: {
            background: { type: 'solid' as ColorType, color: '#131722' },
            textColor: '#D9D9D9',
          },
          grid: {
            vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
            horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
          },
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
          },
        });
        
        try {
          // Mum serisi (Candlestick series) oluştur
          const series = chart.addCandlestickSeries({
            upColor: defaultOptions.colors.upColor,
            downColor: defaultOptions.colors.downColor,
            borderUpColor: defaultOptions.colors.borderUpColor,
            borderDownColor: defaultOptions.colors.borderDownColor,
            wickUpColor: defaultOptions.colors.wickUpColor,
            wickDownColor: defaultOptions.colors.wickDownColor,
          });
          
          // Veriyi ayarla
          series.setData(chartData);
          
          // Referansları sakla
          seriesRef.current = series;
        } catch (err) {
          console.error("Error creating candlestick series:", err);
          // Line chart olarak fallback
          const lineSeries = chart.addLineSeries({
            color: defaultOptions.colors.lineColor,
            lineWidth: 2,
          });
          
          // Candlestick verilerini line chart formatına çevir
          const lineData = chartData.map(item => ({
            time: item.time,
            value: item.close
          }));
          
          lineSeries.setData(lineData);
          
          // Referansları sakla
          seriesRef.current = lineSeries;
        }
        
        // Referansı sakla
        chartRef.current = chart;
        
        // Scale content to fit
        chart.timeScale().fitContent();
        
        // Window rezize olduğunda grafiği yeniden ölçeklendir (sabit boyutlar koruyarak)
        const handleResize = () => {
          if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
          }
        };
        
        window.addEventListener('resize', handleResize);
        
        // Temizleme işlevi
        return () => {
          clearTimeout(timer);
          window.removeEventListener('resize', handleResize);
          
          if (chartRef.current) {
            chartRef.current.remove();
          }
          chartRef.current = null;
          seriesRef.current = null;
        };
      } catch (e) {
        console.error("There was a problem when creating the chart:", e);
        setError("Failed to create chart");
      }
    }, 200); // 200ms gecikme ile DOM'un hazır olmasını bekle
    
    return () => clearTimeout(timer);
  }, [chartData, countryCode]);
  
  // Container boyutu değişirse grafiği güncelle
  useEffect(() => {
    if (containerRef.current && chartRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      
      if (clientWidth > 0 && clientHeight > 0) {
        chartRef.current.applyOptions({
          width: clientWidth,
          height: clientHeight
        });
        
        // Yeniden çiz
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [containerRef, options.width, options.height]);
  
  // Veri güncellendiğinde seriyi güncelle
  useEffect(() => {
    if (seriesRef.current && chartData.length > 0) {
      try {
        // Candlestick için veriyi direkt kullan
        seriesRef.current.setData(chartData);
        
        // Görüntüyü boyutlandır
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
      } catch (e) {
        console.error("Error updating chart data:", e);
      }
    }
  }, [chartData]);
  
  // Yeni fiyat noktası eklemek için bir fonksiyon
  const appendNewPrice = (price: number) => {
    if (chartData.length === 0) return;
    
    const now = new Date();
    const today = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000);
    
    setChartData(prevData => {
      const lastPoint = prevData[prevData.length - 1];
      const newData = [...prevData];
      
      // Eğer bugünkü veri noktası varsa, onu güncelle
      if (lastPoint.time === today) {
        const updatedPoint = {
          ...lastPoint,
          close: price,
          high: Math.max(lastPoint.high, price),
          low: Math.min(lastPoint.low, price)
        };
        newData[newData.length - 1] = updatedPoint;
      } else {
        // Yeni bir gün ise, yeni veri noktası ekle
        newData.push({
          time: today as Time,
          open: lastPoint.close,
          high: Math.max(price, lastPoint.close),
          low: Math.min(price, lastPoint.close),
          close: price,
          volume: Math.floor(Math.random() * 10000) + 1000
        });
      }
      
      return newData;
    });
  };
  
  return { chartData, isLoading, error, appendNewPrice };
}