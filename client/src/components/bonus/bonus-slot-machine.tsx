import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BonusSlotMachineProps {
  isSpinning: boolean;
  onSpinComplete: () => void;
}

export default function BonusSlotMachine({ isSpinning, onSpinComplete }: BonusSlotMachineProps) {
  const [visibleCountries, setVisibleCountries] = useState<{ code: string; name: string }[]>([]);
  const [spinning, setSpinning] = useState(false);
  
  // Fetch country data for the slot machine
  const { data: countries, isLoading } = useQuery({
    queryKey: ["/api/countries"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/countries");
      return await res.json();
    },
  });
  
  // Initialize with random countries
  useEffect(() => {
    if (!isLoading && countries && countries.length > 0) {
      const randomCountries = getRandomCountries(countries, 3);
      setVisibleCountries(randomCountries);
    }
  }, [isLoading, countries]);
  
  // Handle spinning effect
  useEffect(() => {
    if (isSpinning && !spinning && countries && countries.length > 0) {
      setSpinning(true);
      
      // Speed of rotation (ms)
      const spinSpeed = 100;
      // Duration of spinning (ms)
      const spinDuration = 3000;
      // Start time
      const startTime = Date.now();
      
      const spinInterval = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        
        // Update countries
        setVisibleCountries(getRandomCountries(countries, 3));
        
        // Stop spinning after duration
        if (elapsed >= spinDuration) {
          clearInterval(spinInterval);
          setSpinning(false);
          onSpinComplete();
        }
      }, spinSpeed);
      
      return () => clearInterval(spinInterval);
    }
  }, [isSpinning, spinning, countries, onSpinComplete]);
  
  // Helper function to get random countries
  const getRandomCountries = (countries: any[], count: number) => {
    const shuffled = [...countries].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(country => ({
      code: country.countryCode,
      name: country.countryName
    }));
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="border-4 border-primary rounded-lg p-4 bg-muted">
        <div className="flex justify-center mb-2">
          <div className="text-xl font-bold text-primary">
            Daily Bonus Slot
          </div>
        </div>
        
        {/* Slot machine window */}
        <div className="bg-background rounded-md p-4 relative overflow-hidden">
          {/* Display frame with highlight in the center */}
          <div className="relative h-48 flex flex-col">
            {/* Shading at top and bottom */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-background to-transparent z-10"></div>
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent z-10"></div>
            
            {/* Center highlight */}
            <div className="absolute top-1/2 left-0 right-0 h-16 -translate-y-1/2 border-y-2 border-primary/30 bg-primary/5 z-0"></div>
            
            {/* Spinning countries */}
            <div className={cn(
              "flex flex-col gap-8 items-center justify-center h-full transition-transform",
              spinning ? "duration-100" : "duration-500"
            )}>
              {visibleCountries.map((country, index) => (
                <div 
                  key={`${country.code}-${index}`} 
                  className="flex items-center gap-3 p-2 min-w-64 bg-card rounded-md shadow-sm"
                >
                  <span className="text-2xl">{countryFlagEmoji(country.code)}</span>
                  <span className="font-medium">{country.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to convert country code to flag emoji
function countryFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
    
  return String.fromCodePoint(...codePoints);
}