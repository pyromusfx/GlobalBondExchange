import { Link } from "wouter";
import { FaTwitter, FaTelegram, FaDiscord, FaReddit, FaYoutube, FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

export default function Footer() {
  const { t } = useTranslation();
  
  // Dinamik sosyal medya bağlantıları için sonradan veritabanına bağlanacak
  const { data: socialLinks } = useQuery<any[]>({
    queryKey: ["/api/social-links"],
    queryFn: () => Promise.resolve([]), // Şimdilik boş dizi
  });
  
  // Dinamik footer bağlantıları için sonradan veritabanına bağlanacak
  const { data: footerLinks } = useQuery<any[]>({
    queryKey: ["/api/footer-links"],
    queryFn: () => Promise.resolve([]), // Şimdilik boş dizi
  });
  
  // Sosyal medya ikonlarını belirle
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return <FaTwitter size={20} aria-label="Twitter" />;
      case 'telegram': return <FaTelegram size={20} aria-label="Telegram" />;
      case 'discord': return <FaDiscord size={20} aria-label="Discord" />;
      case 'reddit': return <FaReddit size={20} aria-label="Reddit" />;
      case 'youtube': return <FaYoutube size={20} aria-label="YouTube" />;
      case 'instagram': return <FaInstagram size={20} aria-label="Instagram" />;
      case 'facebook': return <FaFacebook size={20} aria-label="Facebook" />;
      case 'linkedin': return <FaLinkedin size={20} aria-label="LinkedIn" />;
      default: return <FaTwitter size={20} aria-label="Social" />;
    }
  };
  
  // Footer kategorileri
  const categories = [
    {
      title: t('footer.products.title'),
      links: [
        { title: t('footer.products.countryBonds'), url: '/market', isExternal: false },
        { title: t('footer.products.preSale'), url: '/presale', isExternal: false },
        { title: t('footer.products.leverageTrading'), url: '/trade', isExternal: false },
        { title: t('footer.products.marketData'), url: '/market', isExternal: false },
        { title: t('footer.products.affiliate'), url: '/affiliate', isExternal: false },
      ]
    },
    {
      title: t('footer.support.title'),
      links: [
        { title: t('footer.support.helpCenter'), url: '#', isExternal: true },
        { title: t('footer.support.kycGuide'), url: '/kyc', isExternal: false },
        { title: t('footer.support.tradingRules'), url: '#', isExternal: true },
        { title: t('footer.support.contactUs'), url: '#', isExternal: true },
        { title: t('footer.support.liveChat'), url: '#', isExternal: true },
      ]
    },
    {
      title: t('footer.legal.title'),
      links: [
        { title: t('footer.legal.terms'), url: '#', isExternal: true },
        { title: t('footer.legal.privacy'), url: '#', isExternal: true },
        { title: t('footer.legal.riskDisclosure'), url: '#', isExternal: true },
        { title: t('footer.legal.tradingPolicy'), url: '#', isExternal: true },
        { title: t('footer.legal.cookies'), url: '#', isExternal: true },
      ]
    },
    {
      title: t('footer.community.title'),
      links: [
        { title: t('footer.community.blog'), url: '#', isExternal: true },
        { title: t('footer.community.news'), url: '#', isExternal: true },
        { title: t('footer.community.events'), url: '#', isExternal: true },
        { title: t('footer.community.careers'), url: '#', isExternal: true },
        { title: t('footer.community.partners'), url: '#', isExternal: true },
      ]
    }
  ];
  
  return (
    <footer className="bg-secondary pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-white mb-4">Sekance</h3>
            <p className="text-muted-foreground mb-6">
              {t('footer.description')}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <FaTwitter size={20} aria-label="Twitter" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <FaTelegram size={20} aria-label="Telegram" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <FaDiscord size={20} aria-label="Discord" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <FaReddit size={20} aria-label="Reddit" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <FaYoutube size={20} aria-label="YouTube" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <FaInstagram size={20} aria-label="Instagram" />
              </a>
            </div>
          </div>
          
          {categories.map((category, index) => (
            <div key={index}>
              <h4 className="font-bold mb-4">{category.title}</h4>
              <ul className="space-y-2">
                {category.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.isExternal ? (
                      <a 
                        href={link.url} 
                        className="text-muted-foreground hover:text-white transition"
                        target={link.url !== '#' ? "_blank" : undefined}
                        rel={link.url !== '#' ? "noopener noreferrer" : undefined}
                      >
                        {link.title}
                      </a>
                    ) : (
                      <Link href={link.url} className="text-muted-foreground hover:text-white transition">
                        {link.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-muted-foreground text-sm mb-4 md:mb-0">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </div>
          <div className="text-muted-foreground text-sm flex items-center">
            <div className="flex items-center space-x-3 mr-4">
              <span>USD</span>
              <span>English</span>
            </div>
            <div className="flex items-center space-x-3">
              <span>Light</span>
              <span>•</span>
              <span>Dark</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
