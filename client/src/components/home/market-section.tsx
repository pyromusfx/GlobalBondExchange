import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CountryShare } from "@shared/schema";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function MarketSection() {
  const [activeTab, setActiveTab] = useState<'all' | 'gainers' | 'losers'>('all');

  const { data: countries = [], isLoading } = useQuery<CountryShare[]>({
    queryKey: ['/api/countries'],
  });

  // Filter and sort countries based on active tab
  const filteredCountries = () => {
    if (isLoading) return [];

    if (activeTab === 'gainers') {
      return [...countries]
        .filter(country => parseFloat(country.currentPrice) > parseFloat(country.previousPrice))
        .sort((a, b) => {
          const aChange = (parseFloat(a.currentPrice) - parseFloat(a.previousPrice)) / parseFloat(a.previousPrice);
          const bChange = (parseFloat(b.currentPrice) - parseFloat(b.previousPrice)) / parseFloat(b.previousPrice);
          return bChange - aChange;
        })
        .slice(0, 4);
    } 
    
    if (activeTab === 'losers') {
      return [...countries]
        .filter(country => parseFloat(country.currentPrice) < parseFloat(country.previousPrice))
        .sort((a, b) => {
          const aChange = (parseFloat(a.previousPrice) - parseFloat(a.currentPrice)) / parseFloat(a.previousPrice);
          const bChange = (parseFloat(b.previousPrice) - parseFloat(b.currentPrice)) / parseFloat(b.previousPrice);
          return bChange - aChange;
        })
        .slice(0, 4);
    }

    // Default: all
    return countries.slice(0, 4);
  };

  const getChangePercentage = (current: string, previous: string) => {
    const currentValue = parseFloat(current);
    const previousValue = parseFloat(previous);
    const change = ((currentValue - previousValue) / previousValue) * 100;
    return change.toFixed(2);
  };

  const isPositiveChange = (current: string, previous: string) => {
    return parseFloat(current) >= parseFloat(previous);
  };

  return (
    <section className="py-16 bg-secondary/50" id="market">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <h2 className="text-3xl font-bold mb-4 md:mb-0">Market Highlights</h2>
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
        </div>
        
        {/* Market Table */}
        <div className="bg-card rounded-lg overflow-hidden shadow-lg mb-10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm border-b border-border">
                  <th className="py-4 px-6 font-medium text-muted-foreground">Country</th>
                  <th className="py-4 px-6 font-medium text-muted-foreground">Price</th>
                  <th className="py-4 px-6 font-medium text-muted-foreground">24h Change</th>
                  <th className="py-4 px-6 font-medium text-muted-foreground hidden md:table-cell">Market Cap</th>
                  <th className="py-4 px-6 font-medium text-muted-foreground hidden lg:table-cell">Volume</th>
                  <th className="py-4 px-6 font-medium text-muted-foreground hidden lg:table-cell">Chart (7d)</th>
                  <th className="py-4 px-6 font-medium text-muted-foreground">Trade</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-4 px-6 text-center">Loading countries...</td>
                  </tr>
                ) : (
                  filteredCountries().map(country => {
                    const changePercent = getChangePercentage(country.currentPrice, country.previousPrice);
                    const isPositive = isPositiveChange(country.currentPrice, country.previousPrice);
                    
                    // Calculate market cap and volume
                    const marketCap = (parseFloat(country.currentPrice) * 10000000).toFixed(2);
                    const formattedMarketCap = `$${(parseFloat(marketCap) / 1000000).toFixed(2)}M`;
                    
                    // Mock volume as 2-5% of market cap
                    const volumePercent = 0.02 + Math.random() * 0.03;
                    const volume = parseFloat(marketCap) * volumePercent;
                    const formattedVolume = volume > 1000000 
                      ? `$${(volume / 1000000).toFixed(1)}M` 
                      : `$${(volume / 1000).toFixed(1)}K`;
                    
                    return (
                      <tr key={country.id} className="border-b border-border hover:bg-secondary cursor-pointer">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <img 
                              src={`https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png`} 
                              alt={`${country.countryName} Flag`} 
                              className="w-8 h-auto mr-3"
                            />
                            <div>
                              <div className="font-medium">{country.countryName}</div>
                              <div className="text-muted-foreground text-xs">{country.countryCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium font-mono">${parseFloat(country.currentPrice).toFixed(3)}</td>
                        <td className="py-4 px-6">
                          <span className={`font-mono flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                            {isPositive ? '+' : ''}{changePercent}%
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono hidden md:table-cell">{formattedMarketCap}</td>
                        <td className="py-4 px-6 font-mono hidden lg:table-cell">{formattedVolume}</td>
                        <td className="py-4 px-6 hidden lg:table-cell">
                          <div className="h-8 flex items-center">
                            {/* Simple chart representation */}
                            <div className="flex items-end h-6 space-x-px">
                              {Array.from({ length: 7 }).map((_, i) => {
                                const isUp = Math.random() > 0.5;
                                const height = 1 + Math.random() * 5;
                                return (
                                  <div 
                                    key={i} 
                                    className={`h-${Math.round(height)} w-1 ${isUp ? 'bg-green-500' : 'bg-red-500'}`}
                                    style={{ height: `${height * 4}px` }}
                                  ></div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Link href={`/trade/${country.countryCode}`}>
                            <Button size="sm" className="bg-primary hover:bg-primary/80 text-secondary py-1 px-4 rounded text-sm font-medium">
                              Trade
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="text-center">
          <Link href="/market">
            <Button variant="outline" className="inline-flex items-center text-primary hover:text-primary hover:bg-primary/10">
              <span>View All Markets (193 Countries)</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
