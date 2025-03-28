import { createConfig, http } from '@wagmi/core'
import { mainnet, sepolia } from 'viem/chains'
import { injected, walletConnect } from '@wagmi/connectors'

// WalletConnect için projectId oluşturmanız gerekiyor (https://cloud.walletconnect.com/)
const projectId = 'YOUR_PROJECT_ID'

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    walletConnect({ projectId })
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

export const availableWallets = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '/metamask.svg',
    description: 'Popular browser extension wallet'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '/walletconnect.svg',
    description: 'Connect to Trust, Rainbow, and more'
  },
  {
    id: 'ledger',
    name: 'Ledger',
    icon: '/ledger.svg',
    description: 'Hardware wallet for secure storage'
  }
]

export const supportedChains = [
  {
    id: mainnet.id,
    name: 'Ethereum',
    icon: '/ethereum.svg'
  },
  {
    id: sepolia.id,
    name: 'Sepolia Testnet',
    icon: '/ethereum.svg'
  }
]