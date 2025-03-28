import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CandlestickChart from "@/components/ui/chart";
import TradingViewWidget from './tradingview-widget';
import { getForexSymbol, getStockMarketSymbol } from '@/lib/currency-utils';
import { CountryShare } from "@shared/schema";
import { FaStar, FaInfoCircle, FaWikipediaW } from "react-icons/fa";

interface TradingViewProps {
  country: CountryShare;
}

export default function TradingView({ country }: TradingViewProps) {
  const [timeframe, setTimeframe] = useState('1h');

  // Generate chart data based on country price and some randomness
  const [chartData, setChartData] = useState<any[]>([]);

  // Güvenli bir şekilde string değerini float'a çevirir
  const safeParseFloat = (value: string | null): number => {
    if (!value) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Güvenli bir şekilde değeri sayıya çevirir ve varsayılan değer döndürür
  const safeGetNumber = (value: number | null, defaultValue = 0): number => {
    if (value === null || isNaN(value)) return defaultValue;
    return value;
  };

  // Güvenli bir şekilde ülkenin değerlerini alırız
  const currentPrice = safeParseFloat(country.currentPrice);
  const previousPrice = safeParseFloat(country.previousPrice);
  const availableShares = safeGetNumber(country.availableShares, 0);
  const preSaleProgress = safeParseFloat(country.preSaleProgress || "0");

  useEffect(() => {
    // Generate historical data points based on current price
    const generateChartData = () => {
      const demoData = [];
      const now = new Date();
      let price = currentPrice;
      
      // Go back from current price to create historical data
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        
        // Random price movements
        const volatility = 0.03; // 3% max move
        const change = price * volatility * (Math.random() - 0.5);
        const open = price * (1 - 0.01 * Math.random());
        const close = open + change;
        
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
        
        // Use close as the next open
        price = close;
      }
      
      // Ensure the last price matches the current price
      const lastPoint = demoData[demoData.length - 1];
      lastPoint.close = currentPrice;
      lastPoint.high = Math.max(lastPoint.high, lastPoint.close);
      
      return demoData;
    };
    
    setChartData(generateChartData());
  }, [country, currentPrice]);

  // Calculate price change
  const priceChange = (currentPrice - previousPrice).toFixed(3);
  const percentChange = ((parseFloat(priceChange) / previousPrice) * 100).toFixed(2);
  const isPositive = parseFloat(priceChange) >= 0;

  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center">
          <img 
            src={`https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png`} 
            alt={`${country.countryName} Flag`} 
            className="w-8 h-auto mr-3"
          />
          <div>
            <div className="font-medium text-lg">{country.countryName} ({country.countryCode})</div>
            <div className="flex items-center">
              <span className="font-mono font-medium">${currentPrice.toFixed(3)}</span>
              <span className={`text-sm ml-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{priceChange} ({isPositive ? '+' : ''}{percentChange}%)
              </span>
            </div>
          </div>
          <div className="ml-auto flex space-x-2">
            <Button variant="secondary" size="sm" className="bg-secondary">
              <FaStar className="text-muted-foreground" />
            </Button>
            <Button variant="secondary" size="sm" className="bg-secondary">
              <FaInfoCircle className="text-muted-foreground" />
            </Button>
            <Button asChild variant="secondary" size="sm" className="bg-secondary flex items-center">
              <a 
                href={`https://en.wikipedia.org/wiki/${country.countryName.replace(/ /g, '_')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <FaWikipediaW className="mr-1 text-muted-foreground" />
                <span className="text-muted-foreground">Wiki</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
            
      {/* Chart Area */}
      <div className="border-b border-border h-[400px] relative">
        <Tabs defaultValue="tradingview" className="w-full">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <TabsList className="bg-transparent">
              <TabsTrigger value="tradingview" className="data-[state=active]:bg-secondary data-[state=active]:text-white">TradingView</TabsTrigger>
              <TabsTrigger value="basic" className="data-[state=active]:bg-secondary data-[state=active]:text-white">Basic Chart</TabsTrigger>
            </TabsList>
            
            {/* Timeframe Controls */}
            <div className="flex space-x-2">
              <Button 
                variant={timeframe === '15m' ? 'default' : 'secondary'} 
                size="sm" 
                className="text-xs"
                onClick={() => setTimeframe('15m')}
              >
                15m
              </Button>
              <Button 
                variant={timeframe === '1h' ? 'default' : 'secondary'} 
                size="sm" 
                className={`text-xs ${timeframe === '1h' ? 'bg-primary text-secondary' : ''}`}
                onClick={() => setTimeframe('1h')}
              >
                1h
              </Button>
              <Button 
                variant={timeframe === '4h' ? 'default' : 'secondary'} 
                size="sm" 
                className="text-xs"
                onClick={() => setTimeframe('4h')}
              >
                4h
              </Button>
              <Button 
                variant={timeframe === '1d' ? 'default' : 'secondary'} 
                size="sm" 
                className="text-xs"
                onClick={() => setTimeframe('1d')}
              >
                1d
              </Button>
              <Button 
                variant={timeframe === '1w' ? 'default' : 'secondary'} 
                size="sm" 
                className="text-xs"
                onClick={() => setTimeframe('1w')}
              >
                1w
              </Button>
            </div>
          </div>
          
          <TabsContent value="tradingview" className="mt-0 h-[350px]">
            <TradingViewWidget 
              symbol={getForexSymbol(country.countryCode) || "FX:EURUSD"}
              height={350}
              interval={timeframe === "15m" ? "15" : timeframe === "1h" ? "60" : timeframe === "4h" ? "240" : timeframe === "1d" ? "D" : "W"}
              theme="dark"
            />
          </TabsContent>
          
          <TabsContent value="basic" className="mt-0 h-[350px] p-1">
            <CandlestickChart data={chartData} height={350} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Order Book and Recent Trades Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-border">
        <div className="border-r border-border">
          <Tabs defaultValue="book" className="w-full">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <TabsList className="bg-transparent">
                <TabsTrigger value="book" className="data-[state=active]:bg-secondary data-[state=active]:text-white">Order Book</TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-secondary data-[state=active]:text-white">Market History</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="book" className="mt-0">
              <div className="h-60 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-border">
                    <tr className="text-muted-foreground">
                      <th className="py-2 px-4 text-left">Price (USD)</th>
                      <th className="py-2 px-4 text-right">Amount ({country.countryCode})</th>
                      <th className="py-2 px-4 text-right">Total (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Generate some sell orders (red) */}
                    {Array.from({ length: 8 }).map((_, i) => {
                      const basePrice = currentPrice * 1.05;
                      const price = (basePrice + (0.02 * (8 - i) * basePrice)).toFixed(4);
                      const amount = (100 + Math.random() * 900).toFixed(2);
                      const total = (parseFloat(price) * parseFloat(amount)).toFixed(2);
                      
                      return (
                        <tr key={`sell-${i}`} className="text-red-500">
                          <td className="py-1 px-4 font-mono">{price}</td>
                          <td className="py-1 px-4 text-right font-mono">{amount}</td>
                          <td className="py-1 px-4 text-right font-mono">{total}</td>
                        </tr>
                      );
                    })}
                    
                    {/* Current price row */}
                    <tr className="border-y border-border bg-secondary/40">
                      <td className="py-2 px-4 font-mono font-medium">{currentPrice.toFixed(4)}</td>
                      <td className="py-2 px-4 text-right font-mono"></td>
                      <td className="py-2 px-4 text-right font-mono"></td>
                    </tr>
                    
                    {/* Generate some buy orders (green) */}
                    {Array.from({ length: 8 }).map((_, i) => {
                      const basePrice = currentPrice * 0.95;
                      const price = (basePrice - (0.01 * i * basePrice)).toFixed(4);
                      const amount = (100 + Math.random() * 1200).toFixed(2);
                      const total = (parseFloat(price) * parseFloat(amount)).toFixed(2);
                      
                      return (
                        <tr key={`buy-${i}`} className="text-green-500">
                          <td className="py-1 px-4 font-mono">{price}</td>
                          <td className="py-1 px-4 text-right font-mono">{amount}</td>
                          <td className="py-1 px-4 text-right font-mono">{total}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <div className="h-60 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-border">
                    <tr className="text-muted-foreground">
                      <th className="py-2 px-4 text-left">Time</th>
                      <th className="py-2 px-4 text-left">Type</th>
                      <th className="py-2 px-4 text-right">Price (USD)</th>
                      <th className="py-2 px-4 text-right">Amount ({country.countryCode})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Generate some historical trades */}
                    {Array.from({ length: 20 }).map((_, i) => {
                      const time = new Date(Date.now() - i * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const type = Math.random() > 0.5 ? 'Buy' : 'Sell';
                      const price = (currentPrice * (0.98 + Math.random() * 0.04)).toFixed(4);
                      const amount = (50 + Math.random() * 500).toFixed(2);
                      
                      return (
                        <tr key={i} className={type === 'Buy' ? 'text-green-500' : 'text-red-500'}>
                          <td className="py-1 px-4">{time}</td>
                          <td className="py-1 px-4">{type}</td>
                          <td className="py-1 px-4 text-right font-mono">{price}</td>
                          <td className="py-1 px-4 text-right font-mono">{amount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Market Info Tab */}
        <div>
          <Tabs defaultValue="info" className="w-full">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <TabsList className="bg-transparent">
                <TabsTrigger value="info" className="data-[state=active]:bg-secondary data-[state=active]:text-white">Market Info</TabsTrigger>
                <TabsTrigger value="recent" className="data-[state=active]:bg-secondary data-[state=active]:text-white">Recent Trades</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="info" className="mt-0 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">24h High</p>
                  <p className="font-mono font-medium">${(currentPrice * 1.05).toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">24h Low</p>
                  <p className="font-mono font-medium">${(currentPrice * 0.95).toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
                  <p className="font-mono font-medium">${(10000 + Math.random() * 100000).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
                  <p className="font-mono font-medium">${(currentPrice * 10000000).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Supply</p>
                  <p className="font-mono font-medium">10,000,000</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Available Supply</p>
                  <p className="font-mono font-medium">{availableShares.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Pre-Sale Status</p>
                  <p className="font-medium">
                    {country.isPreSale ? (
                      <span className="text-primary">Active - {(preSaleProgress * 100).toFixed(0)}% Sold</span>
                    ) : (
                      <span>Completed</span>
                    )}
                  </p>
                </div>
                <div className="col-span-2 mt-2">
                  <a
                    href={`https://en.wikipedia.org/wiki/${country.countryName.replace(/ /g, '_')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Learn more about {country.countryName} on Wikipedia
                  </a>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="recent" className="mt-0">
              <div className="h-48 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-border">
                    <tr className="text-muted-foreground">
                      <th className="py-2 px-4 text-left">Price (USD)</th>
                      <th className="py-2 px-4 text-right">Amount ({country.countryCode})</th>
                      <th className="py-2 px-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Generate some recent trades */}
                    {Array.from({ length: 10 }).map((_, i) => {
                      const isBuy = Math.random() > 0.5;
                      const price = (currentPrice * (0.98 + Math.random() * 0.04)).toFixed(4);
                      const amount = (50 + Math.random() * 500).toFixed(2);
                      const minutes = Math.floor(Math.random() * 60);
                      
                      return (
                        <tr key={i} className={isBuy ? 'text-green-500' : 'text-red-500'}>
                          <td className="py-1 px-4 font-mono">{price}</td>
                          <td className="py-1 px-4 text-right font-mono">{amount}</td>
                          <td className="py-1 px-4 text-right">{minutes} min ago</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
