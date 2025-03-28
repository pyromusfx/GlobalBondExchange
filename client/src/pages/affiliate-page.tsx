import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, Users, DollarSign, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AffiliatePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [referralLink, setReferralLink] = useState("");
  
  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!isAuthLoading && !user) {
      setLocation("/auth");
    }
  }, [user, isAuthLoading, setLocation]);
  
  // Set referral link when user loads
  useEffect(() => {
    if (user?.referralCode) {
      const baseUrl = window.location.origin;
      setReferralLink(`${baseUrl}/auth?ref=${user.referralCode}`);
    }
  }, [user]);
  
  // Get referral data
  const { data: referralData, isLoading: isReferralLoading } = useQuery({
    queryKey: ["/api/referrals"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/referrals");
      return await res.json();
    },
    enabled: !!user
  });
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };
  
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Affiliate Program</h1>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="referrals">Your Referrals</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isReferralLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    referralData?.referrals?.length || 0
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isReferralLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    `$${parseFloat(referralData?.totalEarned || "0").toFixed(2)}`
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  Commission Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5%</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-6 w-6 text-primary" />
                Your Referral Link
              </CardTitle>
              <CardDescription>
                Share this link to invite friends. You'll receive 5% of their initial balance when they register.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input 
                  value={referralLink} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Referral code: <span className="font-mono">{user?.referralCode}</span>
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Your Referrals
              </CardTitle>
              <CardDescription>
                People who registered using your referral link
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isReferralLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : referralData?.referrals && referralData.referrals.length > 0 ? (
                <div className="space-y-4">
                  {referralData.referrals.map((referral: any) => (
                    <div key={referral.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{referral.username}</h3>
                        <p className="text-sm text-muted-foreground">
                          {referral.fullName || "Anonymous"}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Joined: {new Date(referral.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  You don't have any referrals yet. Share your referral link to start earning!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                Your Commissions
              </CardTitle>
              <CardDescription>
                Earnings from your referrals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isReferralLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : referralData?.commissions && referralData.commissions.length > 0 ? (
                <div className="space-y-4">
                  {referralData.commissions.map((commission: any) => (
                    <div key={commission.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Referral Commission</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(commission.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg">${parseFloat(commission.amount).toFixed(2)}</span>
                        <p className="text-xs text-muted-foreground">{commission.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  You haven't earned any commissions yet. Refer friends to start earning!
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                You earn 5% of your referrals' initial balance when they register.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}