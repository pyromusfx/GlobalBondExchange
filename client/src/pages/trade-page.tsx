import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import Header from "@/components/layout/header";
import MobileNavigation from "@/components/layout/mobile-navigation";
import Footer from "@/components/layout/footer";
import NewsTicker from "@/components/layout/news-ticker";
import EnhancedTradingView from "@/components/trade/enhanced-trading-view";
import TradeForm from "@/components/trade/trade-form";
import { useAllCountries, useCountry } from "@/hooks/use-countries";
import { Loader2, ArrowUpRight, ArrowDownRight, ChevronDown, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CountryShare } from "@shared/schema";

// Market değişimini gösteren arabirim
interface PriceChangeProps {
  current: string;
  previous: string;
}

const PriceChange = ({ current, previous }: PriceChangeProps) => {
  const curr = parseFloat(current || "0");
  const prev = parseFloat(previous || "0");
  
  if (!previous || prev === 0) return null;
  
  const isPositive = curr >= prev;
  const changePercent = Math.abs(((curr - prev) / prev) * 100).toFixed(2);
  
  return (
    <span className={`text-xs px-1 py-0.5 rounded-sm flex items-center ${
      isPositive ? 'text-green-500' : 'text-red-500'
    }`}>
      {isPositive ? (
        <>
          <ArrowUpRight className="h-3 w-3 mr-1" />
          +{changePercent}%
        </>
      ) : (
        <>
          <ArrowDownRight className="h-3 w-3 mr-1" />
          -{changePercent}%
        </>
      )}
    </span>
  );
};

export default function TradePage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ countryCode?: string }>('/trade/:countryCode?');
  const countryCode = params?.countryCode;
  
  const { data: country, isLoading, error } = useCountry(countryCode);
  const { data: allCountries = [] } = useAllCountries();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCountries, setFilteredCountries] = useState<CountryShare[]>([]);
  // Force rerender when country code changes
  const [currentCountryCode, setCurrentCountryCode] = useState<string | undefined>(countryCode);

  // Set page title
  useEffect(() => {
    document.title = country 
      ? `Sekance - Trade ${country.countryName} (${country.countryCode})` 
      : "Sekance - Trading";
  }, [country]);
  
  // Filter countries by search
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCountries(allCountries.slice(0, 15));
    } else {
      const filtered = allCountries.filter(c => 
        c.countryName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.countryCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCountries(filtered.slice(0, 15));
    }
  }, [searchQuery, allCountries]);
  
  // Tüm hook çağrılarını, herhangi bir koşullu return'den önce tanımlayalım
  // Varsayılan olarak ABD'ye git (veya kullanılabilir ilk ülke)  
  useEffect(() => {
    const setDefaultCountry = async () => {
      if (!match || !countryCode) {
        // Hiç ülke kodu yoksa ABD'ye git, o da yoksa ilk mevcut ülkeye
        const defaultCountry = allCountries.find(c => c.countryCode === 'US') || allCountries[0];
        if (defaultCountry) {
          setLocation(`/trade/${defaultCountry.countryCode}`);
        } else {
          // Eğer hiç ülke yoksa market sayfasına yönlendir
          setLocation('/market');
        }
      }
    };
    
    if (allCountries.length > 0) {
      setDefaultCountry();
    }
  }, [match, countryCode, allCountries, setLocation]);
  
  // Eğer ülke bulunamadıysa, hata göstermek yerine varsayılan ülkeye yönlendir
  useEffect(() => {
    if (error || !country) {
      const defaultCountry = allCountries.find(c => c.countryCode === 'US') || allCountries[0];
      if (defaultCountry) {
        setLocation(`/trade/${defaultCountry.countryCode}`);
      }
    }
  }, [error, country, allCountries, setLocation]);
  
  // Update currentCountryCode when countryCode changes
  useEffect(() => {
    if (countryCode && countryCode !== currentCountryCode) {
      setCurrentCountryCode(countryCode);
    }
  }, [countryCode, currentCountryCode]);
  
  // Tüm hook çağrıları tamamlandıktan sonra, yükleme kontrolü yapabiliriz
  if (isLoading || !allCountries.length) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0B0E11] text-[#EAECEF]">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#F0B90B]" />
        </main>
        <Footer />
      </div>
    );
  }
  
  // TypeScript için varsayılan değerlerle güvenli bir country objesi oluşturalım
  // Force component to update when country code changes
  // This helps ensure that the UI reflects the latest country data
  const countryKey = currentCountryCode || 'default';
  
  const safeCountry = country || allCountries[0] || {
    id: 0,
    countryCode: 'US',
    countryName: 'United States',
    currentPrice: '1.0',
    previousPrice: '1.0',
    availableShares: 10000000,
    totalShares: 10000000,
    isPreSale: false,
    preSaleProgress: '0'
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0E11] text-[#EAECEF]">
      <Header />
      
      {/* Üst bilgi çubuğu - Market bilgisi */}
      <div className="border-b border-[#2B2F36] py-2 px-4">
        <div className="flex items-center gap-4 overflow-x-auto">
          <div className="flex items-center space-x-2 min-w-max">
            <div className="flex items-center">
              <img 
                src={`https://flagcdn.com/24x18/${safeCountry.countryCode.toLowerCase()}.png`} 
                alt={safeCountry.countryName} 
                className="h-5 mr-2"
              />
              <span className="font-semibold">{safeCountry.countryCode}/USDT</span>
            </div>
            <span className="text-lg font-semibold">${parseFloat(safeCountry.currentPrice || "0").toFixed(5)}</span>
            
            <PriceChange current={safeCountry.currentPrice || "0"} previous={safeCountry.previousPrice || "0"} />
          </div>
          
          <div className="hidden md:flex items-center gap-5 text-xs text-[#848E9C]">
            <div>
              <span>24h Change</span>
              <div className={parseFloat(safeCountry.currentPrice || "0") > parseFloat(safeCountry.previousPrice || "0") ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(((parseFloat(safeCountry.currentPrice || "0") - parseFloat(safeCountry.previousPrice || "0")) / parseFloat(safeCountry.previousPrice || "1")) * 100).toFixed(2)}%
              </div>
            </div>
            
            <div>
              <span>24h High</span>
              <div>${(parseFloat(safeCountry.currentPrice || "0") * 1.05).toFixed(5)}</div>
            </div>
            
            <div>
              <span>24h Low</span>
              <div>${(parseFloat(safeCountry.currentPrice || "0") * 0.95).toFixed(5)}</div>
            </div>
            
            <div>
              <span>24h Volume (Bonds)</span>
              <div>{Math.floor(Math.random() * 500000 + 100000).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="flex-grow flex flex-col lg:flex-row">
        {/* Sol sidebar - Market listesi */}
        <div className="w-full lg:w-64 border-r border-[#2B2F36] bg-[#12161C]">
          <div className="p-3 border-b border-[#2B2F36]">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium">Markets</h3>
              <div className="flex space-x-1 text-[#848E9C]">
                <button className="p-1 hover:text-white"><Search className="w-4 h-4" /></button>
                <button className="p-1 hover:text-white"><Clock className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="relative">
              <Input
                className="bg-[#1C212B] border-none text-sm h-8 pl-8"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-2 top-2 w-4 h-4 text-[#848E9C]" />
            </div>
          </div>
          
          <Tabs defaultValue="all">
            <TabsList className="flex border-b border-[#2B2F36] bg-transparent">
              <TabsTrigger value="all" className="flex-1 rounded-none border-0 text-sm">All</TabsTrigger>
              <TabsTrigger value="favorites" className="flex-1 rounded-none border-0 text-sm">Favorites</TabsTrigger>
              <TabsTrigger value="regions" className="flex-1 rounded-none border-0 text-sm">Regions</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="overflow-y-auto h-[calc(100vh-300px)]">
            <div className="sticky top-0 bg-[#12161C] p-2 border-b border-[#2B2F36] text-xs text-[#848E9C] grid grid-cols-12">
              <div className="col-span-5">Pair</div>
              <div className="col-span-4 text-right">Price</div>
              <div className="col-span-3 text-right">Change</div>
            </div>
            
            <div className="divide-y divide-[#2B2F36] text-sm">
              {filteredCountries.map((c) => (
                <button 
                  key={c.countryCode}
                  onClick={() => setLocation(`/trade/${c.countryCode}`)}
                  className={`w-full p-2 hover:bg-[#1C212B] grid grid-cols-12 items-center ${c.countryCode === safeCountry.countryCode ? 'bg-[#1C212B]' : ''}`}
                >
                  <div className="col-span-5 flex items-center">
                    <img 
                      src={`https://flagcdn.com/24x18/${c.countryCode.toLowerCase()}.png`}
                      alt={c.countryName}
                      className="h-4 mr-2"
                    />
                    <span>{c.countryCode}</span>
                  </div>
                  <div className="col-span-4 text-right">${parseFloat(c.currentPrice || "0").toFixed(5)}</div>
                  <div className={`col-span-3 text-right ${parseFloat(c.currentPrice || "0") >= parseFloat(c.previousPrice || "0") ? 'text-green-500' : 'text-red-500'}`}>
                    {c.previousPrice && parseFloat(c.previousPrice || "0") > 0 
                      ? `${parseFloat(c.currentPrice || "0") >= parseFloat(c.previousPrice || "0") ? '+' : ''}${Math.abs(((parseFloat(c.currentPrice || "0") - parseFloat(c.previousPrice || "0")) / parseFloat(c.previousPrice || "0")) * 100).toFixed(2)}%` 
                      : '0.00%'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Ana içerik */}
        <div className="flex-grow">
          <div className="flex flex-col lg:flex-row">
            {/* Grafik bölümü */}
            <div className="lg:w-2/3 border-b lg:border-b-0 lg:border-r border-[#2B2F36] p-4">
              <div className="mb-4">
                <Tabs defaultValue="chart">
                  <TabsList className="inline-flex border-b border-[#2B2F36] bg-transparent">
                    <TabsTrigger value="chart" className="rounded-none border-0 text-sm">Chart</TabsTrigger>
                    <TabsTrigger value="info" className="rounded-none border-0 text-sm">Info</TabsTrigger>
                    <TabsTrigger value="trading-data" className="rounded-none border-0 text-sm">Trading Data</TabsTrigger>
                    <TabsTrigger value="square" className="rounded-none border-0 text-sm">Square</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="h-[520px] relative">
                <EnhancedTradingView country={safeCountry} />
              </div>
            </div>
            
            {/* Emir alanı bölümü */}
            <div className="lg:w-1/3 p-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Trade {safeCountry.countryCode}/USDT</h2>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="text-green-500 border-green-500 hover:bg-green-500/10">
                    Buy
                  </Button>
                  <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-500/10">
                    Sell
                  </Button>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Amount</h3>
                <div className="flex rounded-md border border-[#2B2F36] bg-[#1C212B] overflow-hidden">
                  <Input
                    className="bg-transparent border-none flex-grow"
                    placeholder="0.00"
                    type="number"
                  />
                  <div className="px-3 py-2 border-l border-[#2B2F36] flex items-center bg-[#12161C]">
                    <span className="text-sm mr-1">USDT</span>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 mt-3">
                <button className="text-xs text-[#848E9C] py-1 px-2 bg-[#1C212B] rounded hover:bg-[#2B2F36]">25%</button>
                <button className="text-xs text-[#848E9C] py-1 px-2 bg-[#1C212B] rounded hover:bg-[#2B2F36]">50%</button>
                <button className="text-xs text-[#848E9C] py-1 px-2 bg-[#1C212B] rounded hover:bg-[#2B2F36]">75%</button>
                <button className="text-xs text-[#848E9C] py-1 px-2 bg-[#1C212B] rounded hover:bg-[#2B2F36]">100%</button>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Leverage</h3>
                <div className="flex space-x-2 mb-2">
                  <button className="text-xs py-1 px-3 bg-[#1C212B] rounded hover:bg-[#2B2F36] border border-[#2B2F36]">1x</button>
                  <button className="text-xs py-1 px-3 bg-[#1C212B] rounded hover:bg-[#2B2F36] border border-[#2B2F36]">3x</button>
                  <button className="text-xs py-1 px-3 bg-green-500/20 rounded border border-green-500">10x</button>
                  <button className="text-xs py-1 px-3 bg-[#1C212B] rounded hover:bg-[#2B2F36] border border-[#2B2F36]">20x</button>
                  <button className="text-xs py-1 px-3 bg-[#1C212B] rounded hover:bg-[#2B2F36] border border-[#2B2F36]">50x</button>
                </div>
              </div>
              
              <div className="mt-6">
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                  Buy {safeCountry.countryCode}
                </Button>
              </div>
              
              <div className="mt-6 p-3 bg-[#1C212B] rounded-md text-xs text-[#848E9C]">
                <div className="flex justify-between mb-2">
                  <span>Available Balance:</span>
                  <span>0.00 USDT</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee:</span>
                  <span>0.1%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Alt bölüm - Emir defteri ve işlemler */}
          <div className="border-t border-[#2B2F36] p-4">
            <Tabs defaultValue="order-book">
              <TabsList className="inline-flex border-b border-[#2B2F36] bg-transparent">
                <TabsTrigger value="order-book" className="rounded-none border-0 text-sm">Order Book</TabsTrigger>
                <TabsTrigger value="trades" className="rounded-none border-0 text-sm">Trades</TabsTrigger>
                <TabsTrigger value="positions" className="rounded-none border-0 text-sm">Positions</TabsTrigger>
                <TabsTrigger value="orders" className="rounded-none border-0 text-sm">Orders</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Emir defteri */}
              <div className="col-span-1">
                <div className="text-xs text-[#848E9C] flex justify-between mb-2">
                  <span>Price (USDT)</span>
                  <span>Amount ({safeCountry.countryCode})</span>
                  <span>Total</span>
                </div>
                
                <div className="space-y-1">
                  {/* Satış emirleri - kırmızı */}
                  {Array.from({ length: 8 }).map((_, i) => {
                    const price = parseFloat(safeCountry.currentPrice || "0") * (1 + (0.01 * (8 - i)));
                    const amount = Math.random() * 10 + 0.1;
                    return (
                      <div key={`sell-${i}`} className="grid grid-cols-3 text-xs relative">
                        <div className="z-10 text-red-500">${price.toFixed(5)}</div>
                        <div className="z-10 text-right">{amount.toFixed(4)}</div>
                        <div className="z-10 text-right">${(price * amount).toFixed(2)}</div>
                        <div className="absolute right-0 h-full bg-red-500/10" style={{ width: `${amount * 10}%` }}></div>
                      </div>
                    );
                  })}
                  
                  {/* Orta fiyat */}
                  <div className="py-1 text-center text-sm font-semibold">${parseFloat(safeCountry.currentPrice || "0").toFixed(5)}</div>
                  
                  {/* Alış emirleri - yeşil */}
                  {Array.from({ length: 8 }).map((_, i) => {
                    const price = parseFloat(safeCountry.currentPrice || "0") * (1 - (0.01 * (i + 1)));
                    const amount = Math.random() * 10 + 0.1;
                    return (
                      <div key={`buy-${i}`} className="grid grid-cols-3 text-xs relative">
                        <div className="z-10 text-green-500">${price.toFixed(5)}</div>
                        <div className="z-10 text-right">{amount.toFixed(4)}</div>
                        <div className="z-10 text-right">${(price * amount).toFixed(2)}</div>
                        <div className="absolute right-0 h-full bg-green-500/10" style={{ width: `${amount * 10}%` }}></div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Son işlemler */}
              <div className="col-span-1">
                <div className="text-xs text-[#848E9C] flex justify-between mb-2">
                  <span>Price (USDT)</span>
                  <span>Amount ({safeCountry.countryCode})</span>
                  <span>Time</span>
                </div>
                
                <div className="space-y-1">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const isBuy = Math.random() > 0.5;
                    const price = parseFloat(safeCountry.currentPrice || "0") * (1 + (isBuy ? 1 : -1) * (Math.random() * 0.01));
                    const amount = Math.random() * 5 + 0.1;
                    const minutes = Math.floor(Math.random() * 60);
                    const seconds = Math.floor(Math.random() * 60);
                    return (
                      <div key={`trade-${i}`} className="grid grid-cols-3 text-xs">
                        <div className={isBuy ? 'text-green-500' : 'text-red-500'}>${price.toFixed(5)}</div>
                        <div className="text-right">{amount.toFixed(4)}</div>
                        <div className="text-right text-[#848E9C]">{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Piyasa bilgileri */}
              <div className="col-span-1">
                <h3 className="text-sm font-medium mb-3">Market Information</h3>
                
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">Country Code:</span>
                    <span>{safeCountry.countryCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">Country Name:</span>
                    <span>{safeCountry.countryName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">Current Price:</span>
                    <span>${parseFloat(safeCountry.currentPrice || "0").toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">24h Change:</span>
                    <span className={parseFloat(safeCountry.currentPrice || "0") > parseFloat(safeCountry.previousPrice || "0") ? 'text-green-500' : 'text-red-500'}>
                      {parseFloat(safeCountry.currentPrice || "0") > parseFloat(safeCountry.previousPrice || "0") ? '+' : '-'}
                      {Math.abs(((parseFloat(safeCountry.currentPrice || "0") - parseFloat(safeCountry.previousPrice || "0")) / parseFloat(safeCountry.previousPrice || "1")) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">24h High:</span>
                    <span>${(parseFloat(safeCountry.currentPrice || "0") * 1.05).toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">24h Low:</span>
                    <span>${(parseFloat(safeCountry.currentPrice || "0") * 0.95).toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">24h Volume:</span>
                    <span>{Math.floor(Math.random() * 500000 + 100000).toLocaleString()} {safeCountry.countryCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">Market Cap:</span>
                    <span>${(parseFloat(safeCountry.currentPrice || "0") * 10000000).toLocaleString()}</span>
                  </div>
                  
                  <div className="pt-3 mt-3 border-t border-[#2B2F36]">
                    <a 
                      href={`https://en.wikipedia.org/wiki/${safeCountry.countryName.replace(/ /g, '_')}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      Learn more about {safeCountry.countryName}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <NewsTicker />
      <Footer />
      <MobileNavigation />
    </div>
  );
}
