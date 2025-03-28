import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';

interface ChartProps {
  data: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
    upColor?: string;
    downColor?: string;
  };
  height?: number;
}

export default function CandlestickChart({
  data,
  colors = {
    backgroundColor: 'transparent',
    lineColor: '#2B2F36',
    textColor: '#848E9C',
    areaTopColor: 'rgba(30, 156, 255, 0.2)',
    areaBottomColor: 'rgba(30, 156, 255, 0)',
    upColor: '#0ECB81',
    downColor: '#F6465D',
  },
  height = 400
}: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // Generate some demo data if none provided
  if (!data.length) {
    const demoData = [];
    const now = new Date();
    let price = 0.5; // Starting price
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      // Random price movements
      const volatility = 0.03; // 3% max move
      const change = price * volatility * (Math.random() - 0.5);
      const open = price;
      const close = price + change;
      price = close; // For next iteration
      
      // High and low with some randomness
      const high = Math.max(open, close) + price * 0.01 * Math.random();
      const low = Math.min(open, close) - price * 0.01 * Math.random();
      
      demoData.push({
        time: date.toISOString().split('T')[0],
        open,
        high,
        low,
        close,
      });
    }
    
    data = demoData;
  }

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clear previous chart if any
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      candlestickSeriesRef.current = null;
    }

    try {
      // Create chart
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: colors.backgroundColor || 'transparent' },
          textColor: colors.textColor || '#848E9C',
        },
        width: chartContainerRef.current.clientWidth,
        height: height,
        grid: {
          vertLines: { color: colors.lineColor || '#2B2F36' },
          horzLines: { color: colors.lineColor || '#2B2F36' },
        },
        timeScale: {
          borderColor: colors.lineColor || '#2B2F36',
        },
        rightPriceScale: {
          borderColor: colors.lineColor || '#2B2F36',
        },
      });

      // Check if addCandlestickSeries method exists
      if (typeof chart.addCandlestickSeries !== 'function') {
        console.error('Chart API does not have addCandlestickSeries method');
        return;
      }

      // Create candlestick series
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: colors.upColor || '#0ECB81',
        downColor: colors.downColor || '#F6465D',
        borderVisible: false,
        wickUpColor: colors.upColor || '#0ECB81',
        wickDownColor: colors.downColor || '#F6465D',
      });

      // Set data
      candlestickSeries.setData(data);

      // Fit content
      chart.timeScale().fitContent();

      // Save references
      chartRef.current = chart;
      candlestickSeriesRef.current = candlestickSeries;
    } catch (error) {
      console.error('There was a problem when fetching the data: ', error);
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, colors, height]);

  return <div ref={chartContainerRef} className="w-full" />;
}
