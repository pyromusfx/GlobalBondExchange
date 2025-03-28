import { useLocation, Link } from "wouter";
import { FaHome, FaChartLine, FaExchangeAlt, FaTag, FaUser } from "react-icons/fa";

export default function MobileNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-secondary border-t border-border z-50 md:hidden">
      <div className="flex justify-around items-center py-3">
        <Link href="/">
          <a className={`flex flex-col items-center ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}>
            <FaHome className="text-lg" />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        <Link href="/market">
          <a className={`flex flex-col items-center ${isActive("/market") ? "text-primary" : "text-muted-foreground"}`}>
            <FaChartLine className="text-lg" />
            <span className="text-xs mt-1">Market</span>
          </a>
        </Link>
        <Link href="/trade">
          <a className={`flex flex-col items-center ${isActive("/trade") || location.startsWith("/trade/") ? "text-primary" : "text-muted-foreground"}`}>
            <FaExchangeAlt className="text-lg" />
            <span className="text-xs mt-1">Trade</span>
          </a>
        </Link>
        <Link href="/presale">
          <a className={`flex flex-col items-center ${isActive("/presale") ? "text-primary" : "text-muted-foreground"}`}>
            <FaTag className="text-lg" />
            <span className="text-xs mt-1">Pre-Sale</span>
          </a>
        </Link>
        <Link href="/auth">
          <a className={`flex flex-col items-center ${isActive("/auth") || isActive("/kyc") ? "text-primary" : "text-muted-foreground"}`}>
            <FaUser className="text-lg" />
            <span className="text-xs mt-1">Account</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
