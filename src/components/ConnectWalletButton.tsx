import React from 'react';
import { useWeb3, SupportedChain } from '../contexts/Web3Context';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { detectWallets, hasAnyWallet } from '../utils/walletDetection';

const ConnectWalletButton: React.FC = () => {
  const { 
    isConnected, 
    account, 
    isConnecting, 
    error, 
    clearError, 
    connectWallet, 
    disconnectWallet,
    connectMockWallet,
    isMockMode
  } = useWeb3();

  const wallets = detectWallets();
  const hasWallet = hasAnyWallet();

  const handleConnect = async () => {
    clearError(); // Clear any previous errors
    const success = await connectWallet();
    if (success) {
      console.log('✅ Wallet connected successfully');
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const handleConnectWithChain = async (chain: SupportedChain) => {
    clearError();
    const success = await connectWallet(chain);
    if (success) {
      console.log(`✅ Wallet connected to ${chain}`);
    }
  };

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-green-600">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
        {isMockMode && (
          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
            Mock Mode
          </span>
        )}
        <button 
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button 
        onClick={handleConnect}
        disabled={isConnecting}
        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          isConnecting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isConnecting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Connecting...
          </div>
        ) : (
          '🔗 Connect Wallet'
        )}
      </button>
      
      {/* Chain-specific connection buttons */}
      {hasWallet && (
        <div className="flex gap-2 mt-2">
          <Button
            onClick={() => handleConnectWithChain(SupportedChain.ETHEREUM)}
            disabled={isConnecting}
            variant="outline"
            size="sm"
            className="px-3 py-1 text-xs"
          >
            🔷 Ethereum
          </Button>
          <Button
            onClick={() => handleConnectWithChain(SupportedChain.POLYGON)}
            disabled={isConnecting}
            variant="outline"
            size="sm"
            className="px-3 py-1 text-xs"
          >
            🟣 Polygon
          </Button>
        </div>
      )}
      
      {/* Development mode mock wallet */}
      {process.env.NODE_ENV === 'development' && (
        <Button
          onClick={connectMockWallet}
          variant="secondary"
          size="sm"
          className="px-3 py-1 text-xs mt-2"
        >
          🧪 Mock Wallet (Dev)
        </Button>
      )}
      
      {/* Error display */}
      {error && (
        <div className="max-w-md p-3 bg-red-100 border border-red-300 rounded-lg mt-2">
          <p className="text-sm text-red-700">{error}</p>
          <button 
            onClick={clearError}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* No wallet detected message */}
      {!hasWallet && (
        <div className="max-w-md p-3 bg-yellow-100 border border-yellow-300 rounded-lg mt-2">
          <p className="text-sm text-yellow-700">
            No Web3 wallet detected. Please install{' '}
            <a 
              href="https://metamask.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-yellow-900"
            >
              MetaMask
            </a>{' '}
            or another Web3 wallet.
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectWalletButton;
