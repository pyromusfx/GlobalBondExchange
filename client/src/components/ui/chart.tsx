import { useEffect, useRef, useMemo } from 'react';
import { createChart } from 'lightweight-charts';

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

// Standardize data format for Chart library
const normalizeChartData = (data: ChartProps['data']) => {
  if (!data || !data.length) return [];
  
  return data.map(item => ({
    time: typeof item.time === 'string' ? item.time : String(item.time),
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close
  }));
};

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
  console.log("CandlestickChart rendered with data length:", data?.length);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  // Generate demo data if none provided
  const chartData = useMemo(() => {
    if (data && data.length) {
      return normalizeChartData(data);
    }
    
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
    
    return demoData;
  }, [data]);

  useEffect(() => {
    // Safety check
    if (!chartContainerRef.current) return;
    
    // Size check
    const containerWidth = chartContainerRef.current.clientWidth || 300;
    const containerHeight = height || 300;
    
    if (containerWidth <= 0 || containerHeight <= 0) {
      console.warn('Chart container has invalid dimensions:', { containerWidth, containerHeight });
      return;
    }

    // Clean up previous chart instance if it exists
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // Clear previous children
    while (chartContainerRef.current.firstChild) {
      chartContainerRef.current.removeChild(chartContainerRef.current.firstChild);
    }

    try {
      // Create chart with explicit dimensions
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: 'solid' as any, color: colors.backgroundColor || 'transparent' },
          textColor: colors.textColor || '#848E9C',
        },
        width: containerWidth,
        height: containerHeight,
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
      
      chartRef.current = chart;

      // Add price series (try candlestick first, fallback to line)
      try {
        const candleSeries = chart.addCandlestickSeries({
          upColor: colors.upColor || '#0ECB81',
          downColor: colors.downColor || '#F6465D',
          borderVisible: false,
          wickUpColor: colors.upColor || '#0ECB81',
          wickDownColor: colors.downColor || '#F6465D',
        });
        
        if (chartData && chartData.length > 0) {
          candleSeries.setData(chartData);
        }
      } catch (err) {
        console.log("Falling back to line series", err);
        const lineSeries = chart.addLineSeries({
          color: colors.lineColor || '#2B2F36',
          lineWidth: 2,
        });
        
        // Convert candlestick data to line data
        const lineData = chartData.map(item => ({
          time: item.time,
          value: item.close
        }));
        
        lineSeries.setData(lineData);
      }

      // Fit content to view and resize
      chart.timeScale().fitContent();

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          const { clientWidth } = chartContainerRef.current;
          if (clientWidth > 0) {
            chartRef.current.applyOptions({
              width: clientWidth,
            });
            chartRef.current.timeScale().fitContent();
          }
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
    } catch (error) {
      console.error('There was a problem when creating the chart: ', error);
      // Display fallback message
      if (chartContainerRef.current) {
        const fallbackMsg = document.createElement('div');
        fallbackMsg.textContent = 'Loading chart...';
        fallbackMsg.style.textAlign = 'center';
        fallbackMsg.style.padding = '40px';
        fallbackMsg.style.color = colors.textColor || '#848E9C';
        chartContainerRef.current.appendChild(fallbackMsg);
      }
    }
  }, [chartData, colors, height]);

  return <div ref={chartContainerRef} className="w-full h-full min-h-[300px]" style={{ height: `${height}px` }} />;
}
