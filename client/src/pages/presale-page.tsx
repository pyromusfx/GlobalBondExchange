import { useEffect, useState } from "react";
import { usePresaleCountries } from "@/hooks/use-countries";
import Header from "@/components/layout/header";
import MobileNavigation from "@/components/layout/mobile-navigation";
import Footer from "@/components/layout/footer";
import NewsTicker from "@/components/layout/news-ticker";
import CountryCard from "@/components/presale/country-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";
import { regions } from "@shared/countries";

export default function PresalePage() {
  const { data: countries, isLoading } = usePresaleCountries();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  
  // Set page title
  useEffect(() => {
    document.title = "Sekance - Country Bonds Pre-Sale";
  }, []);
  
  // Filter countries based on search and region
  const filteredCountries = countries?.filter(country => {
    // Apply search filter
    const matchesSearch = country.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         country.countryCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply region filter
    const matchesRegion = selectedRegion === "all" || 
                          (selectedRegion in regions && 
                           (regions as any)[selectedRegion].includes(country.countryCode));
    
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-2">Country Bonds Pre-Sale</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Invest early in country bonds at a fixed price of $0.50 per share. 
              Each country has a total supply of 10 million shares available during pre-sale.
            </p>
          </div>
          
          {/* Pre-sale Timer */}
          <div className="flex justify-center mb-10">
            <div className="bg-card rounded-lg p-6 flex space-x-4 text-center shadow-lg">
              <div>
                <div className="text-3xl font-bold font-mono">14</div>
                <div className="text-muted-foreground text-sm">Days</div>
              </div>
              <div className="text-2xl font-bold pt-1">:</div>
              <div>
                <div className="text-3xl font-bold font-mono">08</div>
                <div className="text-muted-foreground text-sm">Hours</div>
              </div>
              <div className="text-2xl font-bold pt-1">:</div>
              <div>
                <div className="text-3xl font-bold font-mono">34</div>
                <div className="text-muted-foreground text-sm">Minutes</div>
              </div>
              <div className="text-2xl font-bold pt-1">:</div>
              <div>
                <div className="text-3xl font-bold font-mono">12</div>
                <div className="text-muted-foreground text-sm">Seconds</div>
              </div>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                className="pl-10 bg-secondary"
                placeholder="Search by country name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue placeholder="Filter by region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {Object.keys(regions).map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Countries Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading pre-sale countries...</p>
            </div>
          ) : filteredCountries?.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg">
              <p className="text-xl mb-2">No countries found</p>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredCountries?.map(country => (
                <CountryCard key={country.id} country={country} />
              ))}
            </div>
          )}
          
          {/* Pre-sale Info */}
          <div className="bg-card rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold mb-4">Pre-Sale Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">How It Works</h3>
                <p className="text-muted-foreground">
                  During the pre-sale phase, all country bonds are available at a fixed price of $0.50 per share.
                  Once the pre-sale period ends, country bonds will transition to market-based pricing determined by supply and demand.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Benefits of Pre-Sale</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Guaranteed fixed price of $0.50 per share</li>
                  <li>Early access to all 193 UN countries</li>
                  <li>Potential for value appreciation after pre-sale</li>
                  <li>No price fluctuations during pre-sale period</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Note: Pre-sale purchases are final and cannot be sold until the pre-sale period ends. Trading will be enabled after the pre-sale concludes.</p>
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
