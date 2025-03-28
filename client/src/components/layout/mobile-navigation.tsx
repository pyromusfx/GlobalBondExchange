import { useLocation, Link } from "wouter";
import { FaHome, FaChartLine, FaExchangeAlt, FaTag, FaUser, FaGift, FaUserFriends } from "react-icons/fa";
import { useAuth } from "@/hooks/use-auth";

export default function MobileNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-secondary border-t border-border z-50 md:hidden">
      <div className="flex justify-around items-center py-3">
        <Link href="/" className={`flex flex-col items-center ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}>
          <FaHome className="text-lg" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/market" className={`flex flex-col items-center ${isActive("/market") ? "text-primary" : "text-muted-foreground"}`}>
          <FaChartLine className="text-lg" />
          <span className="text-xs mt-1">Market</span>
        </Link>
        <Link href="/trade" className={`flex flex-col items-center ${isActive("/trade") || location.startsWith("/trade/") ? "text-primary" : "text-muted-foreground"}`}>
          <FaExchangeAlt className="text-lg" />
          <span className="text-xs mt-1">Trade</span>
        </Link>
        <Link href="/presale" className={`flex flex-col items-center ${isActive("/presale") ? "text-primary" : "text-muted-foreground"}`}>
          <FaTag className="text-lg" />
          <span className="text-xs mt-1">Pre-Sale</span>
        </Link>
        {user ? (
          <>
            <Link href="/bonus" className={`flex flex-col items-center ${isActive("/bonus") ? "text-primary" : "text-muted-foreground"}`}>
              <FaGift className="text-lg" />
              <span className="text-xs mt-1">Bonus</span>
            </Link>
            <Link href="/affiliate" className={`flex flex-col items-center ${isActive("/affiliate") ? "text-primary" : "text-muted-foreground"}`}>
              <FaUserFriends className="text-lg" />
              <span className="text-xs mt-1">Affiliate</span>
            </Link>
          </>
        ) : (
          <Link href="/auth" className={`flex flex-col items-center ${isActive("/auth") || isActive("/kyc") ? "text-primary" : "text-muted-foreground"}`}>
            <FaUser className="text-lg" />
            <span className="text-xs mt-1">Account</span>
          </Link>
        )}
      </div>
    </div>
  );
}
