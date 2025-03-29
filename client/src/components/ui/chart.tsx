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
      // Log data for debugging
      console.log("Creating generic chart with data:", chartData.length);
      if (chartData.length > 0) {
        console.log("Sample data:", chartData[0]);
      }
      
      // Create chart with explicit dimensions - basitleştirilmiş konfigürasyon
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: 'solid' as any, color: colors.backgroundColor || '#131722' },
          textColor: colors.textColor || '#D9D9D9',
        },
        width: containerWidth,
        height: containerHeight,
        grid: {
          vertLines: { color: colors.lineColor || 'rgba(42, 46, 57, 0.5)' },
          horzLines: { color: colors.lineColor || 'rgba(42, 46, 57, 0.5)' },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: 'rgba(151, 151, 151, 0.2)',
        },
      });
      
      chartRef.current = chart;

      // Add price series
      try {
        if (chartData && chartData.length > 0) {
          console.log("Setting candlestick data...");
          
          // Make sure data has the exact format we want - time özelliği için UTCTimestamp kullan
          const formattedData = chartData.map(item => {
            // Time string ise DateTimeFormat ile parse et
            let timeValue: number;
            if (typeof item.time === 'string') {
              if (item.time.includes('-')) {
                // ISO date format (YYYY-MM-DD)
                const parts = item.time.split('-');
                const utcDate = Date.UTC(
                  parseInt(parts[0]), // year
                  parseInt(parts[1]) - 1, // month (0-indexed)
                  parseInt(parts[2]) // day
                );
                timeValue = utcDate / 1000; // Convert to seconds
              } else {
                // Unix timestamp format
                timeValue = parseInt(item.time);
              }
            } else {
              timeValue = Number(item.time);
            }
            
            return {
              time: timeValue as any, // as UTCTimestamp,
              open: Number(item.open),
              high: Number(item.high),
              low: Number(item.low),
              close: Number(item.close)
            };
          });
          
          console.log("Formatted data sample:", formattedData[0]);
          
          // Candlestick ekle
          const candleSeries = chart.addCandlestickSeries({
            upColor: colors.upColor || '#26a69a',  // Daha belirgin yeşil
            downColor: colors.downColor || '#ef5350', // Daha belirgin kırmızı
            borderVisible: false,
            wickUpColor: colors.upColor || '#26a69a',
            wickDownColor: colors.downColor || '#ef5350',
          });
          
          // Set data
          candleSeries.setData(formattedData);
          console.log("Candlestick data set successfully!");
        } else {
          throw new Error("No chart data available");
        }
      } catch (err) {
        console.error("Candlestick series error:", err);
        console.log("Falling back to line series");
        
        try {
          const lineSeries = chart.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
          });
          
          // Convert to line data format - ISO format işle
          const lineData = chartData.map(item => {
            let timeValue: number;
            if (typeof item.time === 'string') {
              if (item.time.includes('-')) {
                // ISO date format (YYYY-MM-DD)
                const parts = item.time.split('-');
                const utcDate = Date.UTC(
                  parseInt(parts[0]), // year
                  parseInt(parts[1]) - 1, // month (0-indexed)
                  parseInt(parts[2]) // day
                );
                timeValue = utcDate / 1000; // Convert to seconds
              } else {
                // Unix timestamp format
                timeValue = parseInt(item.time);
              }
            } else {
              timeValue = Number(item.time);
            }
            
            return {
              time: timeValue as any,
              value: Number(item.close)
            };
          });
          
          lineSeries.setData(lineData);
          console.log("Line series fallback successful");
        } catch (lineErr) {
          console.error("Line series error:", lineErr);
        }
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
