import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import CountryCard from "../presale/country-card";
import { CountryShare } from "@shared/schema";

export default function PreSaleSection() {
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 8,
    minutes: 34,
    seconds: 12
  });

  const { data: featuredCountries, isLoading } = useQuery<CountryShare[]>({
    queryKey: ['/api/countries/featured'],
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft.seconds > 0) {
        setTimeLeft(prev => ({ ...prev, seconds: prev.seconds - 1 }));
      } else if (timeLeft.minutes > 0) {
        setTimeLeft(prev => ({ ...prev, minutes: prev.minutes - 1, seconds: 59 }));
      } else if (timeLeft.hours > 0) {
        setTimeLeft(prev => ({ ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }));
      } else if (timeLeft.days > 0) {
        setTimeLeft(prev => ({ ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }));
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Placeholder countries if data is loading
  const placeholderCountries = [
    { id: 1, countryCode: "US", countryName: "United States", preSaleProgress: "0.45" },
    { id: 2, countryCode: "CN", countryName: "China", preSaleProgress: "0.68" },
    { id: 3, countryCode: "DE", countryName: "Germany", preSaleProgress: "0.32" }
  ];

  const displayCountries = isLoading ? placeholderCountries : (featuredCountries || []).slice(0, 3);

  return (
    <section className="py-16 bg-secondary" id="presale">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-primary/20 text-primary px-4 py-1 rounded-full text-sm font-medium mb-4">
            LIMITED TIME ONLY
          </span>
          <h2 className="text-3xl font-bold mb-4">Country Bond Pre-Sale</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Invest in country bonds at a fixed price of $0.50 per share during our exclusive pre-sale period.
            Each country has 10 million shares available.
          </p>
        </div>
        
        {/* PreSale Timer */}
        <div className="flex justify-center mb-10">
          <div className="bg-card rounded-lg p-6 flex space-x-4 text-center shadow-lg">
            <div>
              <div className="text-3xl font-bold font-mono">{timeLeft.days.toString().padStart(2, '0')}</div>
              <div className="text-muted-foreground text-sm">Days</div>
            </div>
            <div className="text-2xl font-bold pt-1">:</div>
            <div>
              <div className="text-3xl font-bold font-mono">{timeLeft.hours.toString().padStart(2, '0')}</div>
              <div className="text-muted-foreground text-sm">Hours</div>
            </div>
            <div className="text-2xl font-bold pt-1">:</div>
            <div>
              <div className="text-3xl font-bold font-mono">{timeLeft.minutes.toString().padStart(2, '0')}</div>
              <div className="text-muted-foreground text-sm">Minutes</div>
            </div>
            <div className="text-2xl font-bold pt-1">:</div>
            <div>
              <div className="text-3xl font-bold font-mono">{timeLeft.seconds.toString().padStart(2, '0')}</div>
              <div className="text-muted-foreground text-sm">Seconds</div>
            </div>
          </div>
        </div>
        
        {/* Featured Pre-Sale Countries */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {displayCountries.map((country) => (
            <CountryCard key={country.id} country={country} />
          ))}
        </div>
        
        <div className="text-center">
          <Link href="/presale">
            <Button variant="outline" className="inline-flex items-center text-primary hover:text-primary hover:bg-primary/10">
              <span>View All Pre-Sale Countries</span>
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
