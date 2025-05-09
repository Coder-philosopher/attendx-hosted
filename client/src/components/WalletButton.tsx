import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSolana } from '../providers/SolanaProvider';
import { truncateAddress } from '../lib/solana';

const WalletButton: React.FC = () => {
  const { connected, publicKey, connect, disconnect, currentWallet, availableWallets } = useSolana();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowWalletMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleConnectWallet = async (walletName: 'phantom' | 'backpack' | 'metamask-solana') => {
    try {
      setIsConnecting(true);
      setShowWalletMenu(false);
      await connect(walletName);
      toast({
        title: `${walletName.charAt(0).toUpperCase() + walletName.slice(1)} wallet connected`,
        description: "Your wallet has been connected successfully.",
        variant: "default",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      
      if (errorMessage.includes("wallet not found")) {
        let walletUrl = "https://phantom.app/";
        if (walletName === 'backpack') walletUrl = "https://www.backpack.app/";
        if (walletName === 'metamask-solana') walletUrl = "https://metamask.io/";
        
        toast({
          title: `${walletName.charAt(0).toUpperCase() + walletName.slice(1)} wallet not found`,
          description: (
            <div>
              <p className="mb-2">Please install the {walletName} wallet extension to connect.</p>
              <a 
                href={walletUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline text-white hover:text-gray-200"
              >
                Get {walletName.charAt(0).toUpperCase() + walletName.slice(1)} Wallet
              </a>
            </div>
          ),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
      console.error(error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected.",
        variant: "default",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getWalletIcon = (wallet: string) => {
    switch (wallet) {
      case 'phantom':
        return (
          <svg width="20" height="20" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <rect width="128" height="128" rx="64" fill="#AB9FF2" />
            <path d="M110.584 64.9142H99.142C99.142 41.7651 80.173 23 56.7724 23C33.7716 23 15 41.4056 15 64.9142C15 87.7032 32.7594 105.989 54.8702 106.931V96.1851C39.0358 95.2432 26.736 81.5555 26.736 64.9142C26.736 48.2729 40.3804 34.9117 56.7724 34.9117C73.5644 34.9117 87.0106 47.5945 87.4062 63.7424H75.6747C75.2791 54.3117 67.0108 46.8235 56.7724 46.8235C45.9351 46.8235 37.2712 54.9069 37.2712 64.9142C37.2712 74.9215 45.5395 83.0049 56.7724 83.0049C63.2521 83.0049 68.9338 79.9432 72.4951 75.1339H86.1373C81.7869 86.6483 70.1594 94.896 56.7724 94.896C56.1744 94.896 55.5764 94.896 54.9783 94.8151V106.931C55.5764 106.931 56.1744 107.013 56.7724 107.013C84.0435 107.013 106.232 85.093 106.232 64.9142H110.584V64.9142Z" fill="#FEFEFE" />
          </svg>
        );
      case 'backpack':
        return (
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <path d="M18.8 3H12.7C11.2 3 10 4.2 10 5.7V9H21.5V5.7C21.5 4.2 20.3 3 18.8 3Z" fill="#23C1AA" />
            <path d="M21.5 9H10v12.1c0 2.2 1.8 4 4 4h3.5c2.2 0 4-1.8 4-4V9z" fill="#1B998B" />
            <path d="M27.3 9h-6v4h4v12.7c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3V23h-4.1v2.7c0 3.5 2.9 6.4 6.4 6.4s6.4-2.9 6.4-6.4V10.1c-.1-.6-.6-1.1-1.2-1.1H27.3z" fill="#136F63" />
          </svg>
        );
      case 'metamask-solana':
        return (
          <svg width="20" height="20" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <path d="M32.9582 1L19.8241 10.7183L22.2667 5.01311L32.9582 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.04183 1L15.0252 10.809L12.7331 5.01309L2.04183 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M28.2292 23.5334L24.7655 28.872L32.2845 30.9323L34.4886 23.6545L28.2292 23.5334Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M0.52771 23.6545L2.71603 30.9323L10.2315 28.872L6.77423 23.5334L0.52771 23.6545Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getWalletName = (wallet: string) => {
    switch (wallet) {
      case 'phantom':
        return 'Phantom';
      case 'backpack':
        return 'Backpack';
      case 'metamask-solana':
        return 'MetaMask';
      default:
        return wallet;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {connected && publicKey ? (
        <button
          onClick={handleDisconnect}
          className="ml-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center"
          disabled={isConnecting}
        >
          {getWalletIcon(currentWallet || 'phantom')}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {truncateAddress(publicKey.toString())}
        </button>
      ) : (
        <>
          <button
            onClick={() => setShowWalletMenu(!showWalletMenu)}
            className="ml-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center"
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#9945FF]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
                Connect Wallet
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>

          {showWalletMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-200">Select a wallet</div>
                {availableWallets.length > 0 ? (
                  availableWallets.map((wallet) => (
                    <button
                      key={wallet}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                      onClick={() => handleConnectWallet(wallet)}
                    >
                      {getWalletIcon(wallet)}
                      {getWalletName(wallet)}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">No wallet extensions found</div>
                )}
                {!availableWallets.includes('phantom') && (
                  <a
                    href="https://phantom.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                  >
                    + Install Phantom
                  </a>
                )}
                {!availableWallets.includes('backpack') && (
                  <a
                    href="https://www.backpack.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                  >
                    + Install Backpack
                  </a>
                )}
                {!availableWallets.includes('metamask-solana') && (
                  <a
                    href="https://metamask.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                  >
                    + Install MetaMask
                  </a>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WalletButton;
