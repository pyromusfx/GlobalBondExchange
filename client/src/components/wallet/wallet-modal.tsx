import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (address: string) => void;
}

// Bu mockup'ta gerçek bir wallet bağlantısı yapmıyoruz
// Arayüz, kullanıcı deneyimini göstermek için hazırlanmıştır
export default function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Örnek wallet seçenekleri
  const walletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      description: t('wallet.metamaskDesc') || 'En popüler tarayıcı cüzdanı'
    },
    {
      id: 'trustwallet',
      name: 'Trust Wallet',
      description: t('wallet.trustDesc') || 'Mobil ve masaüstü kullanım için'
    },
    {
      id: 'ledger',
      name: 'Ledger',
      description: t('wallet.ledgerDesc') || 'Donanım cüzdanı ile güvenli erişim'
    }
  ];

  const handleConnect = async (walletId: string) => {
    setSelectedWalletId(walletId);
    setIsConnecting(true);
    
    // Bağlantı işlemini simüle ediyoruz
    setTimeout(() => {
      setIsConnecting(false);
      
      // Rastgele bir Ethereum adresi oluştur
      const randomAddress = `0x${Array.from({length: 40}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      if (onConnect) {
        onConnect(randomAddress);
      }
      
      toast({
        title: t('wallet.connected') || "Wallet Connected",
        description: t('wallet.connectionSuccessful') || `Successfully connected with ${walletId}`,
      });
      
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('wallet.connectWallet') || "Wallet Connect"}</DialogTitle>
          <DialogDescription>
            {t('wallet.connectDescription') || "Choose your preferred wallet to connect with our platform."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {walletOptions.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className="flex justify-between items-center py-6 px-4"
              onClick={() => handleConnect(wallet.id)}
              disabled={isConnecting}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 flex items-center justify-center mr-3 bg-secondary rounded-full">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                    {wallet.name.charAt(0)}
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-medium">{wallet.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {wallet.description}
                  </div>
                </div>
              </div>
              {isConnecting && selectedWalletId === wallet.id && (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}