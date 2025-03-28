import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <a className="text-primary font-bold text-2xl">Sekance</a>
          </Link>
          <nav className="hidden md:flex ml-10">
            <Link href="/">
              <a className={`mx-3 hover:text-primary transition ${isActive("/") ? "text-white" : "text-muted-foreground"}`}>
                Home
              </a>
            </Link>
            <Link href="/market">
              <a className={`mx-3 hover:text-primary transition ${isActive("/market") ? "text-white" : "text-muted-foreground"}`}>
                Market
              </a>
            </Link>
            <Link href="/trade">
              <a className={`mx-3 hover:text-primary transition ${isActive("/trade") ? "text-white" : "text-muted-foreground"}`}>
                Trade
              </a>
            </Link>
            <Link href="/presale">
              <a className={`mx-3 hover:text-primary transition ${isActive("/presale") ? "text-white" : "text-muted-foreground"}`}>
                Pre-Sale
              </a>
            </Link>
            {user && !user.isKycVerified && (
              <Link href="/kyc">
                <a className={`mx-3 hover:text-primary transition ${isActive("/kyc") ? "text-white" : "text-muted-foreground"}`}>
                  KYC
                </a>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center">
          {user ? (
            <div className="hidden md:flex items-center">
              <span className="mr-4 text-sm text-muted-foreground">
                Balance: <span className="text-primary font-mono font-medium">${parseFloat(user.walletBalance).toFixed(2)}</span>
              </span>
              <Button variant="outline" size="sm" className="mr-2">
                {user.username}
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                Log Out
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex space-x-2">
              <Link href="/auth">
                <Button className="bg-primary hover:bg-primary/80 text-secondary py-2 px-4 rounded font-medium">
                  Log In
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 py-2 px-4 rounded font-medium">
                  Register
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
                  <a className="text-lg py-2 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                    Home
                  </a>
                </Link>
                <Link href="/market">
                  <a className="text-lg py-2 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                    Market
                  </a>
                </Link>
                <Link href="/trade">
                  <a className="text-lg py-2 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                    Trade
                  </a>
                </Link>
                <Link href="/presale">
                  <a className="text-lg py-2 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                    Pre-Sale
                  </a>
                </Link>
                {user && !user.isKycVerified && (
                  <Link href="/kyc">
                    <a className="text-lg py-2 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                      KYC
                    </a>
                  </Link>
                )}
                
                <div className="border-t border-border pt-4 mt-4">
                  {user ? (
                    <>
                      <div className="text-sm mb-4 text-muted-foreground">
                        Logged in as <span className="text-primary">{user.username}</span>
                      </div>
                      <Button 
                        variant="destructive" 
                        className="w-full" 
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        disabled={logoutMutation.isPending}
                      >
                        Log Out
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/auth">
                        <Button className="w-full bg-primary text-secondary" onClick={() => setMobileMenuOpen(false)}>
                          Log In
                        </Button>
                      </Link>
                      <Link href="/auth">
                        <Button variant="outline" className="w-full border-primary text-primary" onClick={() => setMobileMenuOpen(false)}>
                          Register
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
