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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
                <Tabs defaultValue="chart" key={`chart-tabs-${countryKey}`}>
                  <TabsList className="inline-flex border-b border-[#2B2F36] bg-transparent">
                    <TabsTrigger value="chart" className="rounded-none border-0 text-sm">Chart</TabsTrigger>
                    <TabsTrigger value="info" className="rounded-none border-0 text-sm">Info</TabsTrigger>
                    <TabsTrigger value="trading-data" className="rounded-none border-0 text-sm">Trading Data</TabsTrigger>
                    <TabsTrigger value="square" className="rounded-none border-0 text-sm">Square</TabsTrigger>
                  </TabsList>

                  <TabsContent value="chart" className="mt-3">
                    <div className="h-[520px] relative">
                      <EnhancedTradingView country={safeCountry} />
                    </div>
                  </TabsContent>

                  <TabsContent value="info" className="mt-3">
                    <div className="h-[520px] p-4 overflow-y-auto">
                      <h3 className="text-lg font-semibold mb-4">{safeCountry.countryName} Information</h3>
                      <div className="space-y-4 text-sm">
                        <p>
                          {safeCountry.countryName} bonds represent a unique opportunity to invest in the economic future of this country.
                          These financial instruments are backed by the government and provide exposure to the country's economic performance.
                        </p>
                        <h4 className="font-medium">Economic Overview</h4>
                        <p>
                          {safeCountry.countryName}'s economy is influenced by various factors including geographic location, natural resources,
                          political stability, and global economic trends. Price changes reflect market sentiment driven by news, policy changes,
                          and economic indicators.
                        </p>
                        <h4 className="font-medium">Trading Information</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Bond Code: {safeCountry.countryCode}</li>
                          <li>Bond Type: Sovereign</li>
                          <li>Starting Price: $1.00 USD</li>
                          <li>Leverage Options: 1x, 3x, 10x, 20x, 50x</li>
                          <li>Trading Fee: 0.1%</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="trading-data" className="mt-3">
                    <div className="h-[520px] p-4 overflow-y-auto">
                      <h3 className="text-lg font-semibold mb-4">{safeCountry.countryCode} Trading Data</h3>
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-2">Price Statistics (24h)</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
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
                              <span className="text-[#848E9C]">24h Volume (Bonds):</span>
                              <span>{Math.floor(Math.random() * 500000 + 100000).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#848E9C]">24h Volume (USDT):</span>
                              <span>${Math.floor(Math.random() * 500000 + 100000).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Additional Information</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#848E9C]">Market Cap:</span>
                              <span>${(parseFloat(safeCountry.currentPrice || "0") * 10000000).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#848E9C]">Available Supply:</span>
                              <span>{(safeCountry.availableShares).toLocaleString()} {safeCountry.countryCode}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#848E9C]">Total Supply:</span>
                              <span>{(safeCountry.totalShares).toLocaleString()} {safeCountry.countryCode}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#848E9C]">All-Time High:</span>
                              <span>${(parseFloat(safeCountry.currentPrice || "0") * 1.25).toFixed(5)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#848E9C]">All-Time Low:</span>
                              <span>${(parseFloat(safeCountry.currentPrice || "0") * 0.75).toFixed(5)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#848E9C]">Price at Launch:</span>
                              <span>$1.00000</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="square" className="mt-3">
                    <div className="h-[520px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="mb-4 text-[#848E9C]">Square view coming soon</div>
                        <p className="text-xs text-[#848E9C] max-w-md">
                          An alternative visualization for {safeCountry.countryName} bond trading data will be available in this tab soon.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            {/* Emir alanı bölümü */}
            <div className="lg:w-1/3 p-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Trade {safeCountry.countryCode}/USDT</h2>
                <Tabs defaultValue="buy" key={`trade-form-${countryKey}`}>
                  <TabsList className="grid grid-cols-2 gap-2 bg-transparent p-0 h-auto">
                    <TabsTrigger 
                      value="buy" 
                      className="rounded text-green-500 border border-green-500 hover:bg-green-500/10 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500 data-[state=active]:shadow-none">
                      Buy
                    </TabsTrigger>
                    <TabsTrigger 
                      value="sell" 
                      className="rounded text-red-500 border border-red-500 hover:bg-red-500/10 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-500 data-[state=active]:shadow-none">
                      Sell
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Buy Form */}
                  <TabsContent value="buy" className="mt-4 space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium">Amount</h3>
                        <div className="text-xs text-[#848E9C]">
                          Available: <span className="text-white">0.00 USDT</span>
                        </div>
                      </div>
                      
                      <div className="flex rounded-md border border-[#2B2F36] bg-[#1C212B] overflow-hidden">
                        <Input
                          className="bg-transparent border-none flex-grow"
                          placeholder="0.00"
                          type="number"
                          id="buy-amount"
                        />
                        <div className="px-3 py-2 border-l border-[#2B2F36] flex items-center bg-[#12161C]">
                          <span className="text-sm mr-1">USDT</span>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {[25, 50, 75, 100].map((percent) => (
                          <button 
                            key={`buy-${percent}`}
                            onClick={() => {
                              // This would calculate the amount based on the percentage of available balance
                              const buyAmountInput = document.getElementById('buy-amount') as HTMLInputElement | null;
                            if (buyAmountInput) {
                              buyAmountInput.value = (0 * percent / 100).toString();
                            }
                            }}
                            className="text-xs text-[#848E9C] py-1 px-2 bg-[#1C212B] rounded hover:bg-[#2B2F36]">
                            {percent}%
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium">Total</h3>
                        <div className="text-xs text-[#848E9C]">≈ <span id="buy-estimate-usd">$0.00</span></div>
                      </div>
                      
                      <div className="flex rounded-md border border-[#2B2F36] bg-[#1C212B] overflow-hidden">
                        <Input
                          className="bg-transparent border-none flex-grow"
                          placeholder="0.00"
                          type="number"
                          id="buy-total"
                          onChange={(e) => {
                            const price = parseFloat(safeCountry.currentPrice || "0");
                            const total = parseFloat(e.target.value || "0");
                            const amount = price > 0 ? total / price : 0;
                            const buyAmountInput = document.getElementById('buy-amount') as HTMLInputElement | null;
                            if (buyAmountInput) {
                              buyAmountInput.value = amount.toFixed(4);
                            }
                          }}
                        />
                        <div className="px-3 py-2 border-l border-[#2B2F36] flex items-center bg-[#12161C]">
                          <span className="text-sm mr-1">{safeCountry.countryCode}</span>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Leverage</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {[1, 3, 10, 20, 50].map((leverage) => (
                          <button 
                            key={`leverage-${leverage}`}
                            onClick={() => {
                              // This would set the active leverage
                              const buttons = document.querySelectorAll('#leverage-buttons button');
                              buttons.forEach((btn) => {
                                btn.classList.remove('bg-green-500/20', 'border-green-500');
                                btn.classList.add('bg-[#1C212B]', 'border-[#2B2F36]');
                              });
                              const currentBtn = document.getElementById(`leverage-${leverage}`);
                              if (currentBtn) {
                                currentBtn.classList.remove('bg-[#1C212B]', 'border-[#2B2F36]');
                                currentBtn.classList.add('bg-green-500/20', 'border-green-500');
                              }
                            }}
                            id={`leverage-${leverage}`}
                            className={`text-xs py-1 px-3 rounded border ${
                              leverage === 10 
                                ? 'bg-green-500/20 border-green-500' 
                                : 'bg-[#1C212B] border-[#2B2F36] hover:bg-[#2B2F36]'
                            }`}>
                            {leverage}x
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-green-500 hover:bg-green-600 text-white" 
                      onClick={() => {
                        // This would submit the buy order
                        alert('Buy order placed (demo)');
                      }}>
                      Buy {safeCountry.countryCode}
                    </Button>
                  </TabsContent>
                  
                  {/* Sell Form */}
                  <TabsContent value="sell" className="mt-4 space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium">Amount</h3>
                        <div className="text-xs text-[#848E9C]">
                          Available: <span className="text-white">0.00 {safeCountry.countryCode}</span>
                        </div>
                      </div>
                      
                      <div className="flex rounded-md border border-[#2B2F36] bg-[#1C212B] overflow-hidden">
                        <Input
                          className="bg-transparent border-none flex-grow"
                          placeholder="0.00"
                          type="number"
                          id="sell-amount"
                        />
                        <div className="px-3 py-2 border-l border-[#2B2F36] flex items-center bg-[#12161C]">
                          <span className="text-sm mr-1">{safeCountry.countryCode}</span>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {[25, 50, 75, 100].map((percent) => (
                          <button 
                            key={`sell-${percent}`}
                            onClick={() => {
                              // This would calculate the amount based on the percentage of available holdings
                              const sellAmountInput = document.getElementById('sell-amount') as HTMLInputElement | null;
                              if (sellAmountInput) {
                                sellAmountInput.value = (0 * percent / 100).toString();
                              }
                            }}
                            className="text-xs text-[#848E9C] py-1 px-2 bg-[#1C212B] rounded hover:bg-[#2B2F36]">
                            {percent}%
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium">Total</h3>
                        <div className="text-xs text-[#848E9C]">≈ <span id="sell-estimate-usd">$0.00</span></div>
                      </div>
                      
                      <div className="flex rounded-md border border-[#2B2F36] bg-[#1C212B] overflow-hidden">
                        <Input
                          className="bg-transparent border-none flex-grow"
                          placeholder="0.00"
                          type="number"
                          id="sell-total"
                          onChange={(e) => {
                            const price = parseFloat(safeCountry.currentPrice || "0");
                            const amount = parseFloat(e.target.value || "0");
                            const total = price * amount;
                            const sellEstimateElement = document.getElementById('sell-estimate-usd');
                            if (sellEstimateElement) {
                              sellEstimateElement.textContent = `$${total.toFixed(2)}`;
                            }
                          }}
                        />
                        <div className="px-3 py-2 border-l border-[#2B2F36] flex items-center bg-[#12161C]">
                          <span className="text-sm mr-1">USDT</span>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Leverage</h3>
                      <div className="flex flex-wrap gap-2 mb-2" id="sell-leverage-buttons">
                        {[1, 3, 10, 20, 50].map((leverage) => (
                          <button 
                            key={`sell-leverage-${leverage}`}
                            onClick={() => {
                              // This would set the active leverage
                              const buttons = document.querySelectorAll('#sell-leverage-buttons button');
                              buttons.forEach((btn) => {
                                btn.classList.remove('bg-red-500/20', 'border-red-500');
                                btn.classList.add('bg-[#1C212B]', 'border-[#2B2F36]');
                              });
                              const currentBtn = document.getElementById(`sell-leverage-${leverage}`);
                              if (currentBtn) {
                                currentBtn.classList.remove('bg-[#1C212B]', 'border-[#2B2F36]');
                                currentBtn.classList.add('bg-red-500/20', 'border-red-500');
                              }
                            }}
                            id={`sell-leverage-${leverage}`}
                            className={`text-xs py-1 px-3 rounded border ${
                              leverage === 10 
                                ? 'bg-red-500/20 border-red-500' 
                                : 'bg-[#1C212B] border-[#2B2F36] hover:bg-[#2B2F36]'
                            }`}>
                            {leverage}x
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-red-500 hover:bg-red-600 text-white" 
                      onClick={() => {
                        // This would submit the sell order
                        alert('Sell order placed (demo)');
                      }}>
                      Sell {safeCountry.countryCode}
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="mt-6 p-3 bg-[#1C212B] rounded-md text-xs">
                <div className="mb-2 font-medium text-[#F0B90B]">Trading Information</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[#848E9C]">
                    <span>Price:</span>
                    <span className="text-white">${parseFloat(safeCountry.currentPrice || "0").toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between text-[#848E9C]">
                    <span>Fee:</span>
                    <span className="text-white">0.1%</span>
                  </div>
                  <div className="flex justify-between text-[#848E9C]">
                    <span>Daily Volume:</span>
                    <span className="text-white">${Math.floor(Math.random() * 5000000 + 1000000).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Post-trade information section */}
              <div className="mt-4 p-3 bg-[#1C212B] rounded-md text-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Recent Activity</span>
                  <button className="text-[#F0B90B] hover:underline text-xs">View All</button>
                </div>
                <div className="text-center text-[#848E9C] py-4">
                  <p>No recent trades</p>
                  <p className="mt-1 text-xs">Your trading activity will appear here</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Alt bölüm - Emir defteri ve işlemler */}
          <div className="border-t border-[#2B2F36] p-4">
            <Tabs defaultValue="order-book" key={`trade-tabs-${countryKey}`}>
              <TabsList className="inline-flex border-b border-[#2B2F36] bg-transparent">
                <TabsTrigger value="order-book" className="rounded-none border-0 text-sm">Order Book</TabsTrigger>
                <TabsTrigger value="trades" className="rounded-none border-0 text-sm">Trades</TabsTrigger>
                <TabsTrigger value="positions" className="rounded-none border-0 text-sm">Positions</TabsTrigger>
                <TabsTrigger value="orders" className="rounded-none border-0 text-sm">Orders</TabsTrigger>
              </TabsList>
              
              <TabsContent value="order-book" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  
                  {/* Piyasa bilgileri */}
                  <div className="col-span-1 lg:col-span-2">
                    <h3 className="text-sm font-medium mb-3">Market Information</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3">
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
                      </div>
                      
                      <div className="space-y-3 text-xs">
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
                      </div>
                      
                      <div className="lg:col-span-2 pt-3 mt-3 border-t border-[#2B2F36]">
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
              </TabsContent>
              
              <TabsContent value="trades" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>
              </TabsContent>
              
              <TabsContent value="positions" className="mt-4">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="text-[#848E9C] mb-2">No open positions</div>
                  <p className="text-xs text-[#848E9C] max-w-md text-center">
                    You don't have any open positions. Buy or sell {safeCountry.countryCode} to start trading.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="orders" className="mt-4">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="text-[#848E9C] mb-2">No active orders</div>
                  <p className="text-xs text-[#848E9C] max-w-md text-center">
                    You don't have any active orders. Place a limit order to buy or sell {safeCountry.countryCode}.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <NewsTicker />
      <Footer />
      <MobileNavigation />
    </div>
  );
}
