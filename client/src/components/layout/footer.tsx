import { Link } from "wouter";
import { FaTwitter, FaTelegram, FaDiscord, FaReddit } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-secondary pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Sekance</h3>
            <p className="text-muted-foreground mb-4">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <FaTwitter aria-label="Twitter" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <FaTelegram aria-label="Telegram" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <FaDiscord aria-label="Discord" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <FaReddit aria-label="Reddit" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">{t('footer.products.title')}</h4>
            <ul className="space-y-2">
              <li>
                <span 
                  className="text-muted-foreground hover:text-white transition cursor-pointer"
                  onClick={() => window.location.href = "/market"}
                >
                  {t('footer.products.countryBonds')}
                </span>
              </li>
              <li>
                <span 
                  className="text-muted-foreground hover:text-white transition cursor-pointer"
                  onClick={() => window.location.href = "/presale"}
                >
                  {t('footer.products.preSale')}
                </span>
              </li>
              <li>
                <Link href="/trade">
                  <a className="text-muted-foreground hover:text-white transition">{t('footer.products.leverageTrading')}</a>
                </Link>
              </li>
              <li>
                <Link href="/market">
                  <a className="text-muted-foreground hover:text-white transition">{t('footer.products.marketData')}</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">{t('footer.support.title')}</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-white transition">{t('footer.support.helpCenter')}</a>
              </li>
              <li>
                <Link href="/kyc">
                  <a className="text-muted-foreground hover:text-white transition">{t('footer.support.kycGuide')}</a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-white transition">{t('footer.support.tradingRules')}</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-white transition">{t('footer.support.contactUs')}</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">{t('footer.legal.title')}</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-white transition">{t('footer.legal.terms')}</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-white transition">{t('footer.legal.privacy')}</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-white transition">{t('footer.legal.riskDisclosure')}</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-white transition">{t('footer.legal.tradingPolicy')}</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-muted-foreground text-sm mb-4 md:mb-0">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </div>
          <div className="text-muted-foreground text-sm">
            <span className="mr-4">USD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
