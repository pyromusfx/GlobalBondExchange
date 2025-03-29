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
      title: "Ürünler",
      links: [
        { title: "Ülke Tahvilleri", url: '/market', isExternal: false },
        { title: "Ön Satış", url: '/presale', isExternal: false },
        { title: "Kaldıraçlı İşlemler", url: '/trade', isExternal: false },
        { title: "Piyasa Verileri", url: '/market', isExternal: false },
        { title: "Referans Programı", url: '/affiliate', isExternal: false },
      ]
    },
    {
      title: "Destek",
      links: [
        { title: "Yardım Merkezi", url: '#', isExternal: true },
        { title: "KYC Rehberi", url: '/kyc', isExternal: false },
        { title: "İşlem Kuralları", url: '#', isExternal: true },
        { title: "İletişime Geç", url: '#', isExternal: true },
        { title: "Canlı Destek", url: '#', isExternal: true },
      ]
    },
    {
      title: "Yasal",
      links: [
        { title: "Kullanım Şartları", url: '#', isExternal: true },
        { title: "Gizlilik Politikası", url: '#', isExternal: true },
        { title: "Risk Bildirimi", url: '#', isExternal: true },
        { title: "İşlem Politikası", url: '#', isExternal: true },
        { title: "Çerezler", url: '#', isExternal: true },
      ]
    },
    {
      title: "Topluluk",
      links: [
        { title: "Blog", url: '#', isExternal: true },
        { title: "Haberler", url: '#', isExternal: true },
        { title: "Etkinlikler", url: '#', isExternal: true },
        { title: "Kariyer", url: '#', isExternal: true },
        { title: "Ortaklıklar", url: '#', isExternal: true },
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
              Güvenli ve profesyonel ülke tahvili alım satım platformu
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
            © {new Date().getFullYear()} Sekance. Tüm hakları saklıdır.
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
