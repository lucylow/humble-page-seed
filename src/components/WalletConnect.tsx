import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useWalletStore } from "@/store/useWalletStore";
import { connectWallet, disconnectWallet, userSession } from "@/lib/stacks";
import { useEffect } from "react";

const WalletConnect = () => {
  const { isConnected, userAddress, setConnected, setDisconnected } = useWalletStore();

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const address = userData.profile.stxAddress.testnet;
      setConnected(address);
    }
  }, [setConnected]);

  const handleConnect = () => {
    connectWallet((address) => {
      setConnected(address);
    });
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setDisconnected();
  };

  return (
    <div className="flex items-center gap-4">
      {isConnected ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-mono">
              {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </div>
      ) : (
        <Button onClick={handleConnect}>
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default WalletConnect;

