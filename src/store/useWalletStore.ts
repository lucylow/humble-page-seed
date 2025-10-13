import { create } from 'zustand';

interface WalletState {
  isConnected: boolean;
  userAddress: string | null;
  network: 'mainnet' | 'testnet';
  setConnected: (address: string) => void;
  setDisconnected: () => void;
  setNetwork: (network: 'mainnet' | 'testnet') => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  userAddress: null,
  network: 'testnet',
  setConnected: (address: string) => set({ isConnected: true, userAddress: address }),
  setDisconnected: () => set({ isConnected: false, userAddress: null }),
  setNetwork: (network: 'mainnet' | 'testnet') => set({ network }),
}));

