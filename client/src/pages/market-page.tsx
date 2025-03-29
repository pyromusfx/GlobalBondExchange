import { useEffect, useState } from "react";
import Header from "@/components/layout/header";
import MobileNavigation from "@/components/layout/mobile-navigation";
import Footer from "@/components/layout/footer";
import NewsTicker from "@/components/layout/news-ticker";
import CountryTable from "@/components/market/country-table";
import { Button } from "@/components/ui/button";
import { useAllCountries } from "@/hooks/use-countries";

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'gainers' | 'losers'>('all');
  const { data: countries, isLoading } = useAllCountries();
  
  // Set page title
  useEffect(() => {
    document.title = "Sekance - Market Overview";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Market Overview</h1>
            <p className="text-muted-foreground">
              Explore and trade bonds from 193 UN countries. Filter by performance to find the best opportunities.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex space-x-2">
              <Button 
                variant={activeTab === 'all' ? 'default' : 'ghost'} 
                className={activeTab === 'all' ? 'bg-card' : ''}
                onClick={() => setActiveTab('all')}
              >
                All Markets
              </Button>
              <Button 
                variant={activeTab === 'gainers' ? 'default' : 'ghost'} 
                className={activeTab === 'gainers' ? 'bg-card' : 'text-muted-foreground'}
                onClick={() => setActiveTab('gainers')}
              >
                Top Gainers
              </Button>
              <Button 
                variant={activeTab === 'losers' ? 'default' : 'ghost'} 
                className={activeTab === 'losers' ? 'bg-card' : 'text-muted-foreground'}
                onClick={() => setActiveTab('losers')}
              >
                Top Losers
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <span className="text-primary font-medium">{countries?.length || 193}</span> countries available for trading
            </div>
          </div>
          
          <CountryTable 
            countries={countries || []}
            isLoading={isLoading}
            filterType={activeTab}
          />
          
          <div className="mt-8 bg-card rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Market Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Market Status</h3>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="font-medium">Open</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm text-muted-foreground mb-1">24h Volume</h3>
                <p className="font-medium">$34,582,124</p>
              </div>
              
              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Fixed Price Status</h3>
                <p className="font-medium text-primary">Active ($1.00 per share)</p>
              </div>
              
              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Total Countries</h3>
                <p className="font-medium">193</p>
              </div>
            </div>
            
            <div className="mt-6 text-sm text-muted-foreground">
              <p className="mb-2">Trading hours: 24/7</p>
              <p>
                All country bonds are priced in USD with a fixed price of $1.00 per share.
                Market prices will fluctuate based on news and global events affecting each country.
              </p>
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
