import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { config, availableWallets } from "@/lib/web3config";
import { getAccount, connect, disconnect, watchAccount } from '@wagmi/core'

type WalletContextType = {
  isConnected: boolean;
  address: string | undefined;
  balance: string;
  connectWallet: (walletId: string) => Promise<void>;
  disconnectWallet: () => void;
  getWalletOptions: () => typeof availableWallets;
  isConnecting: boolean;
};

export const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<string>("0");
  const [isConnecting, setIsConnecting] = useState(false);

  // Cüzdan bağlantısını izle
  useEffect(() => {
    const unwatch = watchAccount(config, {
      onChange(account) {
        setAddress(account.address);
      },
    });

    return () => {
      unwatch();
    };
  }, []);

  // Sayfa yüklenirken önceki bağlantıyı kontrol et
  useEffect(() => {
    const account = getAccount(config);
    if (account.isConnected) {
      setAddress(account.address);
    }
  }, []);

  const connectWallet = async (walletId: string) => {
    try {
      setIsConnecting(true);
      
      // Bağlanacak cüzdan türünü seç
      let connector;
      if (walletId === 'metamask') {
        connector = config.connectors[0]; // injected connector
      } else if (walletId === 'walletconnect') {
        connector = config.connectors[1]; // walletConnect connector
      } else {
        throw new Error("Unsupported wallet");
      }
      
      await connect(config, { connector });
    } catch (error: any) {
      console.error('Wallet connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnect(config);
    } catch (error: any) {
      console.error('Wallet disconnection error:', error);
    }
  };

  const getWalletOptions = () => {
    return availableWallets;
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected: !!address,
        address,
        balance,
        connectWallet,
        disconnectWallet,
        getWalletOptions,
        isConnecting,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}