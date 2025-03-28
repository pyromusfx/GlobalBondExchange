import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Gift, Award } from "lucide-react";
import BonusSlotMachine from "@/components/bonus/bonus-slot-machine";

export default function BonusPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("daily-bonus");
  
  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!isAuthLoading && !user) {
      setLocation("/auth");
    }
  }, [user, isAuthLoading, setLocation]);
  
  // Check if user can claim a bonus
  const { data: canClaimData, isLoading: isCheckLoading } = useQuery({
    queryKey: ["/api/bonus/can-claim"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/bonus/can-claim");
      return await res.json();
    },
    enabled: !!user
  });
  
  // Get bonus claim history
  const { data: bonusHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["/api/bonus/history"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/bonus/history");
      return await res.json();
    },
    enabled: !!user
  });
  
  // Claim bonus mutation
  const claimBonusMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/bonus/claim");
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bonus claimed!",
        description: `You've received 1 share of ${data.countryName}!`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bonus/can-claim"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bonus/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/holdings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to claim bonus",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Bonus System</h1>
      
      <Tabs defaultValue="daily-bonus" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="daily-bonus">Daily Bonus</TabsTrigger>
          <TabsTrigger value="bonus-history">Bonus History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily-bonus">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-6 w-6 text-primary" />
                Daily Bonus
              </CardTitle>
              <CardDescription>
                Claim your daily bonus to get free shares! You can claim one bonus every 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <BonusSlotMachine 
                  isSpinning={claimBonusMutation.isPending} 
                  onSpinComplete={() => {}} 
                />
                
                <div className="mt-8">
                  <Button 
                    size="lg" 
                    className="w-full" 
                    disabled={isCheckLoading || !(canClaimData?.canClaim) || claimBonusMutation.isPending}
                    onClick={() => claimBonusMutation.mutate()}
                  >
                    {claimBonusMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Claiming...</>
                    ) : isCheckLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...</>
                    ) : canClaimData?.canClaim ? (
                      "Claim Daily Bonus"
                    ) : (
                      "Bonus Already Claimed Today"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Win a free share from a random country. Your bonus will be automatically added to your holdings.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="bonus-history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Bonus History
              </CardTitle>
              <CardDescription>
                Your past bonus claims
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isHistoryLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : bonusHistory && bonusHistory.length > 0 ? (
                <div className="space-y-4">
                  {bonusHistory.map((bonus: any) => (
                    <div key={bonus.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{bonus.countryName} ({bonus.countryCode})</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(bonus.claimDate).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg">{parseFloat(bonus.shares).toFixed(2)} shares</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  You haven't claimed any bonuses yet. Go to the Daily Bonus tab to claim your first bonus!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}