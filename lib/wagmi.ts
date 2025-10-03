import { createConfig, http } from 'wagmi'
import { mainnet, polygon, bsc, arbitrum, optimism } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Doma Testnet configuration (placeholder - replace with actual testnet details)
const domaTestnet = {
  id: 1001, // Replace with actual Doma testnet chain ID
  name: 'Doma Testnet',
  network: 'doma-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Doma',
    symbol: 'DOMA',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_DOMA_RPC_URL || 'https://rpc.doma-testnet.xyz'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_DOMA_RPC_URL || 'https://rpc.doma-testnet.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Doma Explorer',
      url: 'https://explorer.doma-testnet.xyz',
    },
  },
  testnet: true,
} as const

export const config = createConfig({
  chains: [domaTestnet, mainnet, polygon, bsc, arbitrum, optimism],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    }),
  ],
  transports: {
    [domaTestnet.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

