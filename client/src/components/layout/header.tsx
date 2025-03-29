import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useRadio } from "@/context/RadioContext";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Radio } from "lucide-react";
import LanguageSwitcher from "./language-switcher";
import WalletConnectButton from "@/components/wallet/wallet-connect-button";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toggleRadio } = useRadio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-secondary border-b border-border">
      <div className="container mx-auto flex justify-between items-center py-3 px-4">
        <div className="flex items-center">
          <Link href="/">
            <div className="text-primary font-bold text-2xl cursor-pointer">Sekance</div>
          </Link>
          <nav className="hidden md:flex ml-10">
            <Link href="/">
              <div className={`mx-3 hover:text-primary transition cursor-pointer ${isActive("/") ? "text-white" : "text-muted-foreground"}`}>
                {t('header.home')}
              </div>
            </Link>
            <Link href="/market">
              <div className={`mx-3 hover:text-primary transition cursor-pointer ${isActive("/market") ? "text-white" : "text-muted-foreground"}`}>
                {t('header.market')}
              </div>
            </Link>
            <Link href="/trade">
              <div className={`mx-3 hover:text-primary transition cursor-pointer ${isActive("/trade") ? "text-white" : "text-muted-foreground"}`}>
                {t('header.trade')}
              </div>
            </Link>
            <Link href="/presale">
              <div className={`mx-3 hover:text-primary transition cursor-pointer ${isActive("/presale") ? "text-white" : "text-muted-foreground"}`}>
                {t('header.presale')}
              </div>
            </Link>
            <Link href="/radio">
              <div className={`mx-3 hover:text-primary transition cursor-pointer ${isActive("/radio") ? "text-white" : "text-muted-foreground"}`}>
                {t('header.radio')}
              </div>
            </Link>
            {user && (
              <>
                {!user.isKycVerified && (
                  <Link href="/kyc">
                    <div className={`mx-3 hover:text-primary transition cursor-pointer ${isActive("/kyc") ? "text-white" : "text-muted-foreground"}`}>
                      {t('header.kyc')}
                    </div>
                  </Link>
                )}
                <Link href="/bonus">
                  <div className={`mx-3 hover:text-primary transition cursor-pointer ${isActive("/bonus") ? "text-white" : "text-muted-foreground"}`}>
                    Bonus
                  </div>
                </Link>
                <Link href="/affiliate">
                  <div className={`mx-3 hover:text-primary transition cursor-pointer ${isActive("/affiliate") ? "text-white" : "text-muted-foreground"}`}>
                    Affiliate
                  </div>
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            className="text-primary hover:text-primary hover:bg-primary/5"
            onClick={toggleRadio}
            title={t('header.radio')}
          >
            <Radio className="h-5 w-5" />
          </Button>
          
          <LanguageSwitcher />
          
          {/* Wallet Connect Butonu */}
          <div className="hidden md:block">
            <WalletConnectButton />
          </div>
          
          {user ? (
            <div className="hidden md:flex items-center">
              <span className="mr-4 text-sm text-muted-foreground">
                {t('header.balance')}: <span className="text-primary font-mono font-medium">${user && user.walletBalance ? parseFloat(user.walletBalance).toFixed(2) : "0.00"}</span>
              </span>
              <Link href="/profile">
                <Button variant="outline" size="sm" className="mr-2">
                  {user.username}
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {t('header.logout')}
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex space-x-2">
              <Link href="/auth">
                <Button className="bg-primary hover:bg-primary/80 text-secondary py-2 px-4 rounded font-medium">
                  {t('header.login')}
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 py-2 px-4 rounded font-medium">
                  {t('header.register')}
                </Button>
              </Link>
            </div>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-card">
              <div className="flex flex-col mt-8 space-y-4">
                <Link href="/">
                  <div className="text-lg py-2 hover:text-primary cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                    {t('header.home')}
                  </div>
                </Link>
                <Link href="/market">
                  <div className="text-lg py-2 hover:text-primary cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                    {t('header.market')}
                  </div>
                </Link>
                <Link href="/trade">
                  <div className="text-lg py-2 hover:text-primary cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                    {t('header.trade')}
                  </div>
                </Link>
                <Link href="/presale">
                  <div className="text-lg py-2 hover:text-primary cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                    {t('header.presale')}
                  </div>
                </Link>
                <Link href="/radio">
                  <div className="text-lg py-2 hover:text-primary cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                    {t('header.radio')}
                  </div>
                </Link>
                {user && (
                  <>
                    {!user.isKycVerified && (
                      <Link href="/kyc">
                        <div className="text-lg py-2 hover:text-primary cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                          {t('header.kyc')}
                        </div>
                      </Link>
                    )}
                    <Link href="/bonus">
                      <div className="text-lg py-2 hover:text-primary cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                        Bonus
                      </div>
                    </Link>
                    <Link href="/affiliate">
                      <div className="text-lg py-2 hover:text-primary cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                        Affiliate
                      </div>
                    </Link>
                  </>
                )}
                
                {/* Mobil görünümde Wallet Connect */}
                <div className="py-2">
                  <WalletConnectButton />
                </div>
                
                {/* Mobile Radio Button */}
                <div className="py-2">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2"
                    onClick={() => {
                      toggleRadio();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Radio className="h-5 w-5 mr-2" />
                    <span>{t('header.radio')}</span>
                  </Button>
                </div>
                
                {user ? (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {t('header.balance')}: <span className="text-primary font-mono font-medium">${user && user.walletBalance ? parseFloat(user.walletBalance).toFixed(2) : "0.00"}</span>
                    </div>
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full mb-2">
                        {t('header.profile')}
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      disabled={logoutMutation.isPending}
                      className="w-full"
                    >
                      {t('header.logout')}
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    <Link href="/auth">
                      <Button className="w-full bg-primary hover:bg-primary/80 text-secondary" onClick={() => setMobileMenuOpen(false)}>
                        {t('header.login')}
                      </Button>
                    </Link>
                    <Link href="/auth">
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10" onClick={() => setMobileMenuOpen(false)}>
                        {t('header.register')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
