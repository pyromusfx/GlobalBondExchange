import { useState } from "react";
import { Button } from "@/components/ui/button";
import WalletModal from "./wallet-modal";
import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";

// Geçici olarak bir mockup wallet connect butonu oluşturalım
// Gerçek wallet entegrasyonu için projeye Web3Modal veya RainbowKit gibi
// tamamlanmış UI kütüphanelerini entegre etmek daha uygun olacaktır
export default function WalletConnectButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const { t } = useTranslation();

  // Wallet bağlantısı yapıldığında bu fonksiyon çağrılacak
  const handleWalletConnected = (address: string) => {
    setIsConnected(true);
    setWalletAddress(address);
  };
  
  // Cüzdan adresini kısaltır (0x1234...5678 formatında)
  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      {isConnected ? (
        <div className="flex items-center gap-2">
          <div className="bg-green-500 w-2 h-2 rounded-full"></div>
          <span className="font-mono hidden sm:inline">{truncateAddress(walletAddress)}</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsConnected(false)}
            className="text-red-500 hover:text-red-600 p-1"
          >
            <span className="sr-only">{t('wallet.disconnect')}</span>
            {/* Sadeleştirilmiş disconnect ikonu */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-primary hover:bg-primary/10"
          onClick={() => setIsModalOpen(true)}
        >
          <Wallet className="h-4 w-4" />
          <span>{t('wallet.connectWallet') || "Wallet Connect"}</span>
        </Button>
      )}

      <WalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onConnect={handleWalletConnected}
      />
    </>
  );
}