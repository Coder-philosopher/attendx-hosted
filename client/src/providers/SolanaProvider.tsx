import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

// Add ethereum property to Window interface
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      solana?: any;
    };
    backpack?: {
      solana?: any;
    };
  }
}

// Wallet interface
interface WalletAdapter {
  publicKey: PublicKey | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
  signTransaction?: (transaction: any) => Promise<any>;
}

// Wallet types
type WalletName = 'phantom' | 'backpack' | 'metamask-solana';

interface SolanaContextType {
  connected: boolean;
  connecting: boolean;
  publicKey: PublicKey | null;
  connect: (walletName?: WalletName) => Promise<void>;
  disconnect: () => Promise<void>;
  connection: Connection;
  currentWallet: WalletName | null;
  availableWallets: WalletName[];
}

const SolanaContext = createContext<SolanaContextType | undefined>(undefined);

export const useSolana = (): SolanaContextType => {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error('useSolana must be used within a SolanaProvider');
  }
  return context;
};

export const SolanaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [adapter, setAdapter] = useState<WalletAdapter | null>(null);
  const [currentWallet, setCurrentWallet] = useState<WalletName | null>(null);
  const [availableWallets, setAvailableWallets] = useState<WalletName[]>([]);
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // Check which wallets are available
  useEffect(() => {
    const detectWallets = () => {
      const detected: WalletName[] = [];
      
      if ('phantom' in window) {
        detected.push('phantom');
      }
      
      if ('backpack' in window) {
        detected.push('backpack');
      }
      
      if (window.ethereum?.isMetaMask && ('solana' in window.ethereum)) {
        detected.push('metamask-solana');
      }
      
      setAvailableWallets(detected);
      
      // Log available wallets for debugging
      console.log('Available wallets:', detected);
    };
    
    detectWallets();
  }, []);

  // Get adapter for a specific wallet
  const getWalletAdapter = useCallback((walletName: WalletName): WalletAdapter | null => {
    try {
      switch (walletName) {
        case 'phantom':
          if ('phantom' in window) {
            return new PhantomWalletAdapter();
          }
          break;
          
        case 'backpack':
          if ('backpack' in window) {
            // Simple adapter for Backpack
            const backpack = (window as any).backpack.solana;
            return {
              publicKey: backpack.publicKey ? new PublicKey(backpack.publicKey.toString()) : null,
              connected: !!backpack.isConnected,
              connect: async () => {
                await backpack.connect();
                return;
              },
              disconnect: async () => {
                await backpack.disconnect();
                return;
              },
              signMessage: async (message: Uint8Array) => {
                return await backpack.signMessage(message);
              },
              signTransaction: async (transaction: any) => {
                return await backpack.signTransaction(transaction);
              }
            };
          }
          break;
          
        case 'metamask-solana':
          if (window.ethereum?.isMetaMask && ('solana' in window.ethereum)) {
            // Simple adapter for MetaMask Solana
            const metamaskSolana = (window.ethereum as any).solana;
            return {
              publicKey: metamaskSolana.publicKey ? new PublicKey(metamaskSolana.publicKey.toString()) : null,
              connected: !!metamaskSolana.isConnected,
              connect: async () => {
                await metamaskSolana.connect();
                return;
              },
              disconnect: async () => {
                await metamaskSolana.disconnect();
                return;
              },
              signMessage: async (message: Uint8Array) => {
                return await metamaskSolana.signMessage(message);
              },
              signTransaction: async (transaction: any) => {
                return await metamaskSolana.signTransaction(transaction);
              }
            };
          }
          break;
      }
      
      return null;
    } catch (error) {
      console.error(`Error creating adapter for ${walletName}:`, error);
      return null;
    }
  }, []);

  // Connect to wallet
  const connect = useCallback(async (walletName: WalletName = 'phantom') => {
    try {
      setConnecting(true);
      
      const newAdapter = getWalletAdapter(walletName);
      
      if (!newAdapter) {
        throw new Error(`${walletName} wallet not found. Please install the wallet extension.`);
      }
      
      await newAdapter.connect();
      
      if (newAdapter.connected && newAdapter.publicKey) {
        setAdapter(newAdapter);
        setConnected(true);
        setPublicKey(newAdapter.publicKey);
        setCurrentWallet(walletName);
        console.log(`Connected to ${walletName} wallet:`, newAdapter.publicKey.toString());
      } else {
        throw new Error(`Failed to connect to ${walletName} wallet.`);
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [getWalletAdapter]);

  // Disconnect from wallet
  const disconnect = useCallback(async () => {
    if (!adapter) {
      return;
    }

    try {
      await adapter.disconnect();
      setConnected(false);
      setPublicKey(null);
      setCurrentWallet(null);
      setAdapter(null);
    } catch (error) {
      console.error("Error disconnecting from wallet:", error);
      throw error;
    }
  }, [adapter]);

  const value = {
    connected,
    connecting,
    publicKey,
    connect,
    disconnect,
    connection,
    currentWallet,
    availableWallets,
  };

  return (
    <SolanaContext.Provider value={value}>
      {children}
    </SolanaContext.Provider>
  );
};
