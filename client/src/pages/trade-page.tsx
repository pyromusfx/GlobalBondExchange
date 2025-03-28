import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import Header from "@/components/layout/header";
import MobileNavigation from "@/components/layout/mobile-navigation";
import Footer from "@/components/layout/footer";
import NewsTicker from "@/components/layout/news-ticker";
import TradingView from "@/components/trade/trading-view";
import TradeForm from "@/components/trade/trade-form";
import { useCountry } from "@/hooks/use-countries";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TradePage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ countryCode?: string }>('/trade/:countryCode?');
  const countryCode = params?.countryCode;
  
  const { data: country, isLoading, error } = useCountry(countryCode);
  
  // Set page title
  useEffect(() => {
    document.title = country 
      ? `Sekance - Trade ${country.countryName} (${country.countryCode})` 
      : "Sekance - Trading";
  }, [country]);
  
  // If no country code is provided, redirect to the market page to select a country
  useEffect(() => {
    if (!match && !countryCode) {
      setLocation('/market');
    }
  }, [match, countryCode, setLocation]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !country) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Country Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The country you're looking for doesn't exist or is not available for trading.
            </p>
            <Button onClick={() => setLocation('/market')}>
              View All Markets
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Trading View - Takes 3/4 width on desktop */}
            <div className="lg:col-span-3 bg-card p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <img 
                  src={`https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png`} 
                  alt={`${country.countryName} Flag`} 
                  className="w-8 h-auto mr-3"
                />
                <div>
                  <h1 className="text-2xl font-bold">{country.countryName} ({country.countryCode})</h1>
                  <p className="text-muted-foreground">Current Price: ${parseFloat(country.currentPrice || "0").toFixed(3)}</p>
                </div>
              </div>
              
              {/* TradingView Chart Component */}
              <TradingView country={country} />
            
              <div className="flex flex-col gap-4 mt-6">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <h2 className="text-lg font-medium mb-2">Country Overview</h2>
                  <p>
                    {country.countryName} bonds allow you to invest in this nation's economic future. 
                    Each country has 10 million shares available during pre-sale, priced at $0.50 each.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <h3 className="text-sm text-muted-foreground">Total Supply</h3>
                    <p className="text-lg font-medium">10,000,000</p>
                  </div>
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <h3 className="text-sm text-muted-foreground">Available</h3>
                    <p className="text-lg font-medium">{parseFloat(country.availableShares?.toString() || "0").toLocaleString()}</p>
                  </div>
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <h3 className="text-sm text-muted-foreground">Market Cap</h3>
                    <p className="text-lg font-medium">${(parseFloat(country.currentPrice || "0") * 10000000).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex justify-center items-center p-8 text-center bg-secondary/10 rounded-lg">
                  <div>
                    <img
                      src={`https://flagcdn.com/h120/${country.countryCode.toLowerCase()}.png`}
                      alt={`${country.countryName} Flag`}
                      className="mx-auto mb-4 max-h-32"
                    />
                    <a 
                      href={`https://en.wikipedia.org/wiki/${country.countryName.replace(/ /g, '_')}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center"
                    >
                      Learn more about {country.countryName}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Trade Form - Takes 1/4 width on desktop */}
            <div>
              <TradeForm country={country} />
              
              {/* User Holdings Summary (if logged in) */}
              {/* This would typically show the user's current position in this country */}
              <div className="mt-6 bg-card rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Market Sentiment</h3>
                <div className="bg-secondary rounded-lg p-3 mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Bearish</span>
                    <span>Bullish</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-primary h-full" 
                      style={{ width: `${30 + Math.random() * 50}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p>Trading data is updated in real-time. Market sentiment is based on recent buy/sell orders and volume.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Market News and Info */}
          <div className="mt-8 bg-card rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">About {country.countryName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-muted-foreground mb-4">
                  {country.countryName} has a total of 10 million shares available on Sekance. 
                  Trading is available 24/7 with leverage options up to 50x. 
                  Learn more about {country.countryName}'s economy, culture, and history through the Wikipedia link on the trading chart.
                </p>
                <a 
                  href={`https://en.wikipedia.org/wiki/${country.countryName.replace(/ /g, '_')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center"
                >
                  Read more on Wikipedia
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              
              <div className="flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-1">Current Price</h3>
                    <p className="font-medium">${parseFloat(country.currentPrice).toFixed(4)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-1">Total Supply</h3>
                    <p className="font-medium">10,000,000</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-1">Available Supply</h3>
                    <p className="font-medium">{parseInt(country.availableShares.toString()).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-1">Market Cap</h3>
                    <p className="font-medium">${(parseFloat(country.currentPrice) * 10000000).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center">
                  <img 
                    src={`https://flagcdn.com/w80/${country.countryCode.toLowerCase()}.png`} 
                    alt={`${country.countryName} Flag`} 
                    className="h-10 mr-4"
                  />
                  <div>
                    <p className="text-sm font-medium">{country.countryCode}</p>
                    <p className="text-xs text-muted-foreground">ISO Country Code</p>
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
