import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import WorldMap from "@/components/ui/world-map";
import { CountryShare } from "@shared/schema";

export default function MapSection() {
  const [colorMode, setColorMode] = useState<'region' | 'performance' | 'volume'>('region');
  
  const { data: countries } = useQuery<CountryShare[]>({
    queryKey: ['/api/countries'],
  });

  // Count countries by region (simplified data for UI)
  const regionCounts = {
    "North America": { count: 35, change: "+1.87%" },
    "Europe": { count: 44, change: "+0.54%" },
    "Asia": { count: 48, change: "-0.23%" },
    "Africa": { count: 54, change: "+2.15%" }
  };

  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Explore World Markets</h2>
        
        <div className="bg-card rounded-lg p-4 overflow-hidden shadow-lg relative">
          <div className="absolute top-4 right-4 z-10 flex space-x-2">
            <Button 
              variant={colorMode === 'region' ? 'default' : 'ghost'} 
              className={colorMode === 'region' ? 'bg-secondary' : 'bg-secondary/60'} 
              size="sm"
              onClick={() => setColorMode('region')}
            >
              Region
            </Button>
            <Button 
              variant={colorMode === 'performance' ? 'default' : 'ghost'} 
              className={colorMode === 'performance' ? 'bg-secondary' : 'bg-secondary/60'} 
              size="sm"
              onClick={() => setColorMode('performance')}
            >
              Performance
            </Button>
            <Button 
              variant={colorMode === 'volume' ? 'default' : 'ghost'} 
              className={colorMode === 'volume' ? 'bg-secondary' : 'bg-secondary/60'} 
              size="sm"
              onClick={() => setColorMode('volume')}
            >
              Volume
            </Button>
          </div>
          
          {/* World Map Component */}
          <div className="h-96 w-full">
            <WorldMap colorBy={colorMode} />
          </div>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(regionCounts).map(([region, data]) => (
              <div key={region} className="bg-secondary p-3 rounded">
                <div className="text-xs text-muted-foreground mb-1">{region}</div>
                <div className="font-medium">{data.count} Countries</div>
                <div className={data.change.startsWith('+') ? 'text-green-500' : 'text-red-500'} style={{ fontSize: '0.875rem' }}>
                  {data.change} Avg
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
