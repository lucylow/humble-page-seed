import { memo } from 'react';

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  onClick: () => void;
}

interface WalletSelectionProps {
  options: WalletOption[];
  onConnect: (walletId: string) => void;
}

const WalletSelection = memo<WalletSelectionProps>(({ options, onConnect }) => {
  const handleWalletClick = (wallet: WalletOption) => {
    onConnect(wallet.id);
  };

  const getWalletIconBg = (walletId: string) => {
    const iconClasses = {
      metamask: 'bg-orange-100 dark:bg-orange-900/30',
      walletconnect: 'bg-blue-100 dark:bg-blue-900/30',
      coinbase: 'bg-blue-100 dark:bg-blue-900/30',
    };
    return iconClasses[walletId as keyof typeof iconClasses] || 'bg-gray-100 dark:bg-gray-900/30';
  };

  return (
    <div className="onboarding-step">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((wallet) => (
          <button
            key={wallet.id}
            className="wallet-btn p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => handleWalletClick(wallet)}
            aria-label={`Connect ${wallet.name} wallet`}
          >
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto mb-3 ${getWalletIconBg(wallet.id)} rounded-lg flex items-center justify-center`}>
                <span className="text-2xl" aria-hidden="true">
                  {wallet.icon}
                </span>
              </div>
              <span className="font-semibold">{wallet.name}</span>
            </div>
          </button>
        ))}
      </div>
      
      <div className="text-center mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <p className="text-sm text-muted-foreground">
          Don't have a wallet?{' '}
          <a 
            href="#learn-more" 
            className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label="Learn how to get started with wallets"
          >
            Learn how to get started
          </a>
        </p>
      </div>
    </div>
  );
});

WalletSelection.displayName = 'WalletSelection';

export default WalletSelection;
