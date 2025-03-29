import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { RadioProvider, useRadio } from "@/context/RadioContext";
import { ProtectedRoute } from "./lib/protected-route";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// Components
import LiveSupport from "@/components/support/live-support";
import RadioPlayer from "@/components/media/RadioPlayer";

// Pages
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import MarketPage from "@/pages/market-page";
import TradePage from "@/pages/trade-page";
import PresalePage from "@/pages/presale-page";
import KycPage from "@/pages/kyc-page";
import BonusPage from "@/pages/bonus-page";
import AffiliatePage from "@/pages/affiliate-page";
import ProfilePage from "@/pages/profile-page";
import RadioPage from "@/pages/radio-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/market" component={MarketPage} />
      <Route path="/trade/:countryCode?" component={TradePage} />
      <Route path="/presale" component={PresalePage} />
      <Route path="/radio" component={RadioPage} />
      <Route path="/kyc" component={KycPage} />
      <Route path="/bonus" component={BonusPage} />
      <Route path="/affiliate" component={AffiliatePage} />
      <Route path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { i18n } = useTranslation();
  const { isRadioOpen, closeRadio } = useRadio();

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
      <RadioPlayer isOpen={isRadioOpen} onClose={closeRadio} />
      <LiveSupport />
      <Toaster />
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RadioProvider>
        <AppContent />
      </RadioProvider>
    </QueryClientProvider>
  );
}

export default App;
