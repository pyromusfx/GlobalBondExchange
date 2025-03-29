import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { CountryShare } from "@shared/schema";
import { ArrowUpRight, ArrowDownRight, Search } from "lucide-react";

interface CountryTableProps {
  countries: CountryShare[];
  isLoading: boolean;
  filterType?: 'all' | 'gainers' | 'losers';
}

export default function CountryTable({ 
  countries = [], 
  isLoading,
  filterType = 'all' 
}: CountryTableProps) {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter and sort countries
  const filteredCountries = useMemo(() => {
    // First apply the search filter
    let result = countries.filter(country => 
      country.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.countryCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Then apply the tab filter
    if (filterType === 'gainers') {
      result = result.filter(country => 
        parseFloat(country.currentPrice) > parseFloat(country.previousPrice)
      );
      
      result.sort((a, b) => {
        const aChange = (parseFloat(a.currentPrice) - parseFloat(a.previousPrice)) / parseFloat(a.previousPrice);
        const bChange = (parseFloat(b.currentPrice) - parseFloat(b.previousPrice)) / parseFloat(b.previousPrice);
        return bChange - aChange;
      });
    } else if (filterType === 'losers') {
      result = result.filter(country => 
        parseFloat(country.currentPrice) < parseFloat(country.previousPrice)
      );
      
      result.sort((a, b) => {
        const aChange = (parseFloat(a.previousPrice) - parseFloat(a.currentPrice)) / parseFloat(a.previousPrice);
        const bChange = (parseFloat(b.previousPrice) - parseFloat(b.currentPrice)) / parseFloat(b.previousPrice);
        return bChange - aChange;
      });
    } else {
      // Default sort by market cap (price * total shares)
      result.sort((a, b) => {
        const aMarketCap = parseFloat(a.currentPrice) * 10000000;
        const bMarketCap = parseFloat(b.currentPrice) * 10000000;
        return bMarketCap - aMarketCap;
      });
    }
    
    return result;
  }, [countries, searchTerm, filterType]);
  
  // Helper functions
  const getChangePercentage = (current: string, previous: string) => {
    const currentValue = parseFloat(current);
    const previousValue = parseFloat(previous);
    const change = ((currentValue - previousValue) / previousValue) * 100;
    
    // Implement the new display rule for percentage changes
    if (change < 0) {
      // For negative changes, show as whole numbers (e.g., -5%)
      return Math.round(Math.abs(change)).toString();
    } else if (change > 0) {
      // For positive changes, ensure they start from 1% and show only whole numbers
      return Math.max(1, Math.round(change)).toString();
    } else {
      // For zero change
      return "0";
    }
  };

  const isPositiveChange = (current: string, previous: string) => {
    return parseFloat(current) >= parseFloat(previous);
  };
  
  const handleRowClick = (countryCode: string) => {
    navigate(`/trade/${countryCode}`);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading countries...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          className="pl-10 bg-secondary"
          placeholder="Search by country name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredCountries.length === 0 ? (
        <div className="text-center py-8 bg-card rounded-lg">
          <p className="text-muted-foreground">No countries found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm border-b border-border">
                  <th className="py-4 px-6 font-medium text-muted-foreground">Country</th>
                  <th className="py-4 px-6 font-medium text-muted-foreground">Price</th>
                  <th className="py-4 px-6 font-medium text-muted-foreground">24h Change</th>
                  <th className="py-4 px-6 font-medium text-muted-foreground hidden md:table-cell">Market Cap</th>
                  <th className="py-4 px-6 font-medium text-muted-foreground hidden lg:table-cell">Available Shares</th>
                  <th className="py-4 px-6 font-medium text-muted-foreground hidden lg:table-cell">Pre-Sale</th>
                  <th className="py-4 px-6 font-medium text-muted-foreground">Trade</th>
                </tr>
              </thead>
              <tbody>
                {filteredCountries.map(country => {
                  const changePercent = getChangePercentage(country.currentPrice, country.previousPrice);
                  const isPositive = isPositiveChange(country.currentPrice, country.previousPrice);
                  
                  // Calculate market cap
                  const marketCap = (parseFloat(country.currentPrice) * 10000000).toFixed(2);
                  const formattedMarketCap = `$${(parseFloat(marketCap) / 1000000).toFixed(2)}M`;
                  
                  // Available shares
                  const availableShares = parseInt(country.availableShares.toString());
                  const formattedAvailableShares = availableShares.toLocaleString();
                  
                  return (
                    <tr 
                      key={country.id} 
                      className="border-b border-border hover:bg-secondary cursor-pointer"
                      onClick={() => handleRowClick(country.countryCode)}
                    >
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
                      <td className="py-4 px-6 font-medium font-mono">${parseFloat(country.currentPrice).toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className={`font-mono flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                          {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                          {isPositive ? '+' : '-'}{changePercent === '0' ? '1' : changePercent}%
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono hidden md:table-cell">{formattedMarketCap}</td>
                      <td className="py-4 px-6 font-mono hidden lg:table-cell">{formattedAvailableShares}</td>
                      <td className="py-4 px-6 hidden lg:table-cell">
                        {country.isPreSale ? (
                          <span className="inline-flex items-center bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                            Pre-Sale
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-secondary text-muted-foreground text-xs px-2 py-1 rounded-full">
                            Trading
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <Button size="sm" className="bg-primary hover:bg-primary/80 text-secondary py-1 px-4 rounded text-sm font-medium">
                          Trade
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
