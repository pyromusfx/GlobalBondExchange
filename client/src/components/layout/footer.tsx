import { Link } from "wouter";
import { FaTwitter, FaTelegram, FaDiscord, FaReddit } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-secondary pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Sekance</h3>
            <p className="text-muted-foreground mb-4">
              The world's first virtual bond exchange platform for trading country shares with leverage options.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <FaTwitter />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <FaTelegram />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <FaDiscord />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <FaReddit />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Products</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/market">
                  <a className="text-muted-foreground hover:text-white transition">Country Bonds</a>
                </Link>
              </li>
              <li>
                <Link href="/presale">
                  <a className="text-muted-foreground hover:text-white transition">Pre-Sale</a>
                </Link>
              </li>
              <li>
                <Link href="/trade">
                  <a className="text-muted-foreground hover:text-white transition">Leverage Trading</a>
                </Link>
              </li>
              <li>
                <Link href="/market">
                  <a className="text-muted-foreground hover:text-white transition">Market Data</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-white transition">Help Center</a>
              </li>
              <li>
                <Link href="/kyc">
                  <a className="text-muted-foreground hover:text-white transition">KYC Guide</a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-white transition">Trading Rules</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-white transition">Contact Us</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-white transition">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-white transition">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-white transition">Risk Disclosure</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-white transition">Trading Policy</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-muted-foreground text-sm mb-4 md:mb-0">© {new Date().getFullYear()} Sekance. All rights reserved.</div>
          <div className="text-muted-foreground text-sm">
            <span className="mr-4">English (US)</span>
            <span>USD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
