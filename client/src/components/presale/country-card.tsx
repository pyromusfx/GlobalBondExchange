import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CountryShare } from "@shared/schema";

interface CountryCardProps {
  country: CountryShare;
}

export default function CountryCard({ country }: CountryCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Calculate progress percentage for the progress bar
  const progressPercentage = Math.min(
    Math.round(parseFloat(country.preSaleProgress) * 100),
    100
  );
  // Get available shares (with safety check)
  const availableShares = country.availableShares !== undefined 
    ? parseInt(country.availableShares.toString()) 
    : 10000000; // Default to total supply if not available
  
  // Calculate sold shares
  const soldShares = 10000000 - availableShares;
  const soldPercentage = Math.round((soldShares / 10000000) * 100);
  
  // Calculate sold shares
  
  // Buy mutation for pre-sale purchases
  const buyMutation = useMutation({
    mutationFn: async (data: { countryCode: string, shares: number }) => {
      const response = await apiRequest("POST", "/api/trade/buy", {
        countryCode: data.countryCode,
        shares: data.shares,
        price: 0.5, // Fixed pre-sale price
        leverage: 1, // No leverage for pre-sale
        total: data.shares * 0.5
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Shares purchased!",
        description: `You've successfully purchased shares of ${country.countryName}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/holdings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/countries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/countries/featured'] });
    },
    onError: (error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handlePurchase = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to purchase shares.",
        variant: "destructive",
      });
      return;
    }
    
    // Default purchase amount - could be replaced with a modal/input
    const sharesToBuy = 100;
    
    if (parseFloat(user.walletBalance) < sharesToBuy * 0.5) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough funds to complete this purchase.",
        variant: "destructive",
      });
      return;
    }
    
    buyMutation.mutate({
      countryCode: country.countryCode,
      shares: sharesToBuy
    });
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden hover:shadow-lg transition">
      <div className="relative h-40">
        <img 
          src={`https://source.unsplash.com/featured/?${country.countryName},landscape`} 
          alt={country.countryName} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex items-center bg-black bg-opacity-50 rounded-lg px-2 py-1">
          <img 
            src={`https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png`} 
            alt={`${country.countryName} Flag`} 
            className="w-6 h-auto mr-2"
          />
          <span className="font-medium">{country.countryName}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs text-muted-foreground">Total Supply</div>
              <div className="font-medium font-mono">10,000,000</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Price Per Share</div>
              <div className="font-medium text-primary font-mono">$0.50</div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <div className="text-xs text-muted-foreground mb-1">
            Progress ({soldPercentage}% sold)
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        {user ? (
          <Button 
            className="w-full bg-primary hover:bg-primary/80 text-secondary py-2 rounded font-medium"
            onClick={handlePurchase}
            disabled={buyMutation.isPending}
          >
            {buyMutation.isPending ? "Processing..." : "Purchase Shares"}
          </Button>
        ) : (
          <Button 
            className="w-full bg-primary hover:bg-primary/80 text-secondary py-2 rounded font-medium" 
            onClick={() => window.location.href = "/auth"}
          >
            Log In to Purchase
          </Button>
        )}
      </div>
    </div>
  );
}
