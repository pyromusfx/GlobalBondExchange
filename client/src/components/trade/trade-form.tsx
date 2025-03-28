import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CountryShare } from "@shared/schema";
import { Link } from "wouter";

interface TradeFormProps {
  country: CountryShare;
}

export default function TradeForm({ country }: TradeFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [leverageMode, setLeverageMode] = useState(false);
  const [leverage, setLeverage] = useState(10); // Default to 10x leverage
  const [amount, setAmount] = useState<string>("");
  const [total, setTotal] = useState<string>("");
  
  // Recalculate total when amount changes
  useEffect(() => {
    if (amount) {
      const totalValue = parseFloat(amount) * parseFloat(country.currentPrice);
      setTotal(totalValue.toFixed(2));
    } else {
      setTotal("");
    }
  }, [amount, country.currentPrice]);
  
  // Update amount when total changes (for reverse calculation)
  useEffect(() => {
    if (total && parseFloat(country.currentPrice) > 0) {
      const amountValue = parseFloat(total) / parseFloat(country.currentPrice);
      setAmount(amountValue.toFixed(2));
    }
  }, [total, country.currentPrice]);
  
  // Trading mutations
  const buyMutation = useMutation({
    mutationFn: async (data: { countryCode: string, shares: number, leverage: number }) => {
      const response = await apiRequest("POST", "/api/trade/buy", {
        countryCode: data.countryCode,
        shares: data.shares,
        price: country.currentPrice,
        leverage: data.leverage,
        total: parseFloat(total)
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase successful!",
        description: `You've successfully purchased ${amount} shares of ${country.countryName}.`,
      });
      setAmount("");
      setTotal("");
      queryClient.invalidateQueries({ queryKey: ['/api/holdings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/countries'] });
    },
    onError: (error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const sellMutation = useMutation({
    mutationFn: async (data: { countryCode: string, shares: number, leverage: number }) => {
      const response = await apiRequest("POST", "/api/trade/sell", {
        countryCode: data.countryCode,
        shares: data.shares,
        price: country.currentPrice,
        leverage: data.leverage,
        total: parseFloat(total)
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sale successful!",
        description: `You've successfully sold ${amount} shares of ${country.countryName}.`,
      });
      setAmount("");
      setTotal("");
      queryClient.invalidateQueries({ queryKey: ['/api/holdings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/countries'] });
    },
    onError: (error) => {
      toast({
        title: "Sale failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to trade.",
        variant: "destructive",
      });
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to trade.",
        variant: "destructive",
      });
      return;
    }
    
    const leverageValue = leverageMode ? leverage : 1;
    
    if (tradeType === "buy") {
      // Check if user has enough funds
      const requiredFunds = parseFloat(total) / leverageValue;
      if (parseFloat(user.walletBalance) < requiredFunds) {
        toast({
          title: "Insufficient funds",
          description: `You need ${requiredFunds.toFixed(2)} USD to make this purchase with ${leverageValue}x leverage.`,
          variant: "destructive",
        });
        return;
      }
      
      buyMutation.mutate({
        countryCode: country.countryCode,
        shares: parseFloat(amount),
        leverage: leverageValue
      });
    } else {
      // Sell logic (would need to check holdings in a real app)
      sellMutation.mutate({
        countryCode: country.countryCode,
        shares: parseFloat(amount),
        leverage: leverageValue
      });
    }
  };
  
  const setAmountPercentage = (percentage: number) => {
    if (!user) return;
    
    if (tradeType === "buy") {
      // Calculate max amount based on wallet balance
      const leverageValue = leverageMode ? leverage : 1;
      const maxFunds = parseFloat(user.walletBalance) * leverageValue;
      const maxAmount = maxFunds / parseFloat(country.currentPrice);
      setAmount((maxAmount * percentage / 100).toFixed(2));
    } else {
      // For selling, would need to know user's current holdings
      // This is simplified for demo purposes
      const maxSellAmount = 1000; // Placeholder, would be determined from user holdings
      setAmount((maxSellAmount * percentage / 100).toFixed(2));
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-border p-2">
        <div className="flex space-x-1">
          <Button 
            variant={leverageMode ? "secondary" : "default"} 
            className="flex-1"
            onClick={() => setLeverageMode(false)}
          >
            Spot
          </Button>
          <Button 
            variant={leverageMode ? "default" : "secondary"} 
            className={`flex-1 ${leverageMode ? 'bg-primary text-secondary' : ''}`}
            onClick={() => setLeverageMode(true)}
          >
            Leverage
          </Button>
        </div>
      </div>
      
      {/* Leverage Options */}
      {leverageMode && (
        <div className="p-4 border-b border-border">
          <div className="text-xs text-muted-foreground mb-2">Leverage</div>
          <div className="grid grid-cols-4 gap-2">
            <Button 
              variant={leverage === 3 ? "default" : "secondary"} 
              size="sm" 
              className={`py-1 px-1 text-xs ${leverage === 3 ? 'bg-primary text-secondary' : ''}`}
              onClick={() => setLeverage(3)}
            >
              3x
            </Button>
            <Button 
              variant={leverage === 10 ? "default" : "secondary"} 
              size="sm" 
              className={`py-1 px-1 text-xs ${leverage === 10 ? 'bg-primary text-secondary' : ''}`}
              onClick={() => setLeverage(10)}
            >
              10x
            </Button>
            <Button 
              variant={leverage === 20 ? "default" : "secondary"} 
              size="sm" 
              className={`py-1 px-1 text-xs ${leverage === 20 ? 'bg-primary text-secondary' : ''}`}
              onClick={() => setLeverage(20)}
            >
              20x
            </Button>
            <Button 
              variant={leverage === 50 ? "default" : "secondary"} 
              size="sm" 
              className={`py-1 px-1 text-xs ${leverage === 50 ? 'bg-primary text-secondary' : ''}`}
              onClick={() => setLeverage(50)}
            >
              50x
            </Button>
          </div>
        </div>
      )}
      
      {/* Trading Form */}
      <div className="p-4">
        <Tabs 
          defaultValue="buy" 
          onValueChange={(value) => setTradeType(value as "buy" | "sell")}
          value={tradeType}
        >
          <div className="flex space-x-1 mb-4">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="buy" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                Buy
              </TabsTrigger>
              <TabsTrigger value="sell" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                Sell
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="buy" className="space-y-3 mt-0">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Price (USD)</div>
              <Input
                type="text"
                value={parseFloat(country.currentPrice).toFixed(4)}
                className="w-full bg-secondary p-2 rounded text-right font-mono"
                readOnly
              />
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground mb-1">Amount ({country.countryCode})</div>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-secondary p-2 rounded text-right font-mono"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                className="text-xs"
                onClick={() => setAmountPercentage(25)}
              >
                25%
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                className="text-xs"
                onClick={() => setAmountPercentage(50)}
              >
                50%
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                className="text-xs"
                onClick={() => setAmountPercentage(75)}
              >
                75%
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                className="text-xs"
                onClick={() => setAmountPercentage(100)}
              >
                Max
              </Button>
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground mb-1">Total (USD)</div>
              <Input
                type="number"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="0"
                className="w-full bg-secondary p-2 rounded text-right font-mono"
              />
            </div>
            
            {user ? (
              <Button 
                className="w-full bg-green-500 hover:bg-green-600 mt-4"
                onClick={handleSubmit}
                disabled={buyMutation.isPending}
              >
                {buyMutation.isPending ? "Processing..." : `Buy ${country.countryCode}`}
              </Button>
            ) : (
              <Link href="/auth">
                <Button className="w-full bg-primary text-secondary mt-4">
                  Log In to Trade
                </Button>
              </Link>
            )}
          </TabsContent>
          
          <TabsContent value="sell" className="space-y-3 mt-0">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Price (USD)</div>
              <Input
                type="text"
                value={parseFloat(country.currentPrice).toFixed(4)}
                className="w-full bg-secondary p-2 rounded text-right font-mono"
                readOnly
              />
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground mb-1">Amount ({country.countryCode})</div>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-secondary p-2 rounded text-right font-mono"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                className="text-xs"
                onClick={() => setAmountPercentage(25)}
              >
                25%
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                className="text-xs"
                onClick={() => setAmountPercentage(50)}
              >
                50%
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                className="text-xs"
                onClick={() => setAmountPercentage(75)}
              >
                75%
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                className="text-xs"
                onClick={() => setAmountPercentage(100)}
              >
                Max
              </Button>
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground mb-1">Total (USD)</div>
              <Input
                type="number"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="0"
                className="w-full bg-secondary p-2 rounded text-right font-mono"
              />
            </div>
            
            {user ? (
              <Button 
                className="w-full bg-red-500 hover:bg-red-600 mt-4"
                onClick={handleSubmit}
                disabled={sellMutation.isPending}
              >
                {sellMutation.isPending ? "Processing..." : `Sell ${country.countryCode}`}
              </Button>
            ) : (
              <Link href="/auth">
                <Button className="w-full bg-primary text-secondary mt-4">
                  Log In to Trade
                </Button>
              </Link>
            )}
          </TabsContent>
        </Tabs>
        
        {user && (
          <div className="mt-4 px-2 py-2 bg-secondary/30 rounded text-sm text-muted-foreground">
            Available Balance: <span className="font-medium text-white">${parseFloat(user.walletBalance).toFixed(2)}</span>
            {leverageMode && (
              <div className="mt-1">
                <span className="text-primary font-medium">{leverage}x</span> leverage multiplies your buying power to <span className="font-medium text-white">${(parseFloat(user.walletBalance) * leverage).toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
