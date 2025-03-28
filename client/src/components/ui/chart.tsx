import { useEffect, useRef } from 'react';
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

    // Clear previous children
    while (chartContainerRef.current.firstChild) {
      chartContainerRef.current.removeChild(chartContainerRef.current.firstChild);
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

      // Create line series instead if candlestick isn't available
      try {
        const candleSeries = chart.addCandlestickSeries({
          upColor: colors.upColor || '#0ECB81',
          downColor: colors.downColor || '#F6465D',
          borderVisible: false,
          wickUpColor: colors.upColor || '#0ECB81',
          wickDownColor: colors.downColor || '#F6465D',
        });
        candleSeries.setData(data);
      } catch (err) {
        // Fallback to line series if candlestick isn't available
        console.log("Falling back to line series");
        const lineSeries = chart.addLineSeries({
          color: colors.lineColor || '#2B2F36',
          lineWidth: 2,
        });
        
        // Convert candlestick data to line data
        const lineData = data.map(item => ({
          time: item.time,
          value: item.close
        }));
        
        lineSeries.setData(lineData);
      }

      // Fit content
      chart.timeScale().fitContent();

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    } catch (error) {
      console.error('There was a problem when creating the chart: ', error);
      // Display fallback message
      if (chartContainerRef.current) {
        const fallbackMsg = document.createElement('div');
        fallbackMsg.textContent = 'Chart visualization unavailable';
        fallbackMsg.style.textAlign = 'center';
        fallbackMsg.style.padding = '40px';
        fallbackMsg.style.color = colors.textColor || '#848E9C';
        chartContainerRef.current.appendChild(fallbackMsg);
      }
    }
  }, [data, colors, height]);

  return <div ref={chartContainerRef} className="w-full h-full min-h-[200px]" />;
}
