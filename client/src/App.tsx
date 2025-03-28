import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// Pages
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import MarketPage from "@/pages/market-page";
import TradePage from "@/pages/trade-page";
import PresalePage from "@/pages/presale-page";
import KycPage from "@/pages/kyc-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/market" component={MarketPage} />
      <ProtectedRoute path="/trade/:countryCode?" component={TradePage} />
      <Route path="/presale" component={PresalePage} />
      <ProtectedRoute path="/kyc" component={KycPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { i18n } = useTranslation();

  // RTL veya LTR ayarı
  useEffect(() => {
    const language = i18n.language || 'en';
    if (language === "ar" || language === "fa") {
      document.documentElement.dir = "rtl";
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.classList.remove("rtl");
    }
  }, [i18n.language]);
  
  return (
    <AuthProvider>
      <Router />
      <Toaster />
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
