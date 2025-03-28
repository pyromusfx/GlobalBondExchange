import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, Time, CandlestickData, SeriesType } from 'lightweight-charts';
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
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  
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
    
    async function fetchPriceData() {
      if (!countryCode) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Burada gerçek API isteği yapılacak - şimdilik demo veri kullanıyoruz
        const response = await apiRequest('GET', `/api/price-history/${countryCode}`);
        
        if (!response.ok) {
          // Eğer API henüz hazır değilse demo veri kullanabiliriz
          console.log("API endpoint is not ready yet, using demo data");
          generateDemoData();
        } else {
          const data = await response.json();
          if (isMounted) {
            setChartData(data);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Error fetching price data:", err);
        // API isteklerini sonra ekleyeceğiz, şimdilik demo veri kullanıyoruz
        if (isMounted) {
          generateDemoData();
        }
      }
    }
    
    // Demo veri oluştur
    function generateDemoData() {
      const now = new Date();
      const data: PricePoint[] = [];
      let basePrice = 0.5; // $0.50 ile başla
      
      // Son 30 günlük veriyi oluştur
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Volatiliteye göre günlük fiyat değişimi
        const dailyChange = (Math.random() * 2 - 1) * 0.03; // +/- %3 değişim
        basePrice = basePrice * (1 + dailyChange);
        
        // OHLC (Open, High, Low, Close) veriler
        const open = basePrice;
        const high = open * (1 + Math.random() * 0.02);
        const low = open * (1 - Math.random() * 0.02);
        const close = (high + low) / 2 + (Math.random() * 0.01 - 0.005);
        
        // UTC zaman damgası (milisaniye cinsinden)
        const timestamp = Math.floor(date.getTime() / 1000);
        
        data.push({
          time: timestamp as Time,
          open,
          high,
          low,
          close,
          volume: Math.floor(Math.random() * 10000) + 1000
        });
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
    if (containerRef.current && chartData.length > 0 && !chartRef.current) {
      // Mevcut grafiği temizle
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
      
      // Grafiği oluştur
      const chart = createChart(containerRef.current, {
        width: defaultOptions.width,
        height: defaultOptions.height,
        layout: {
          background: { type: 'solid', color: defaultOptions.colors.backgroundColor },
          textColor: defaultOptions.colors.textColor,
        },
        grid: {
          vertLines: { color: 'rgba(42, 46, 57, 0.2)' },
          horzLines: { color: 'rgba(42, 46, 57, 0.2)' },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: 'rgba(151, 151, 151, 0.2)',
        },
        rightPriceScale: {
          borderColor: 'rgba(151, 151, 151, 0.2)',
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
        },
        handleScale: {
          axisPressedMouseMove: true,
          mouseWheel: true,
          pinch: true,
        },
      });
      
      // Lightweight Charts güncel API'si ile seri oluştur
      // @ts-ignore - Tip uyumsuzluğu nedeniyle
      const series = chart.addSeries({
        type: 'Area',
        lineColor: defaultOptions.colors.lineColor,
        topColor: defaultOptions.colors.areaTopColor,
        bottomColor: defaultOptions.colors.areaBottomColor,
      });
      
      // Veriyi uygun formata dönüştür ve ayarla
      const lineData = chartData.map(item => ({
        time: item.time,
        value: item.close
      }));
      series.setData(lineData);
      
      // Container boyut değişikliklerini izle
      const resizeObserver = new ResizeObserver(entries => {
        if (entries.length === 0 || !entries[0].contentRect) {
          return;
        }
        
        const { width, height } = entries[0].contentRect;
        chart.applyOptions({
          width: width,
          height: height
        });
      });
      
      resizeObserver.observe(containerRef.current);
      
      // Referansları sakla
      chartRef.current = chart;
      seriesRef.current = series;
      
      // Temizleme işlevi
      return () => {
        if (containerRef.current) {
          resizeObserver.unobserve(containerRef.current);
        }
        resizeObserver.disconnect();
        chart.remove();
        chartRef.current = null;
        seriesRef.current = null;
      };
    }
  }, [containerRef, chartData, defaultOptions, defaultOptions.colors]);
  
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
      // Veriyi uygun formata dönüştür ve ayarla
      const lineData = chartData.map(item => ({
        time: item.time,
        value: item.close
      }));
      seriesRef.current.setData(lineData);
      
      // Görüntüyü boyutlandır
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
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