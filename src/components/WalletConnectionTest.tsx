import React, { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const WalletConnectionTest: React.FC = () => {
  const {
    isConnected,
    connectWallet,
    disconnectWallet,
    account,
    network,
    currentChain,
    isConnecting,
    error,
    clearError,
    isMockMode
  } = useWeb3();

  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testConnection = async () => {
    setTestResults([]);
    addTestResult('Starting wallet connection test...');
    
    try {
      addTestResult('Checking MetaMask availability...');
      if (typeof window !== 'undefined' && window.ethereum) {
        addTestResult('MetaMask detected ✓');
        
        if (window.ethereum.isMetaMask) {
          addTestResult('MetaMask is properly configured ✓');
        } else {
          addTestResult('Warning: MetaMask may not be properly configured');
        }
      } else {
        addTestResult('MetaMask not detected ✗');
        return;
      }

      addTestResult('Attempting to connect wallet...');
      const success = await connectWallet();
      
      if (success) {
        addTestResult('Wallet connected successfully ✓');
        addTestResult(`Account: ${account}`);
        addTestResult(`Network: ${network?.name || 'Unknown'}`);
        addTestResult(`Chain: ${currentChain}`);
        addTestResult(`Mock Mode: ${isMockMode ? 'Yes' : 'No'}`);
      } else {
        addTestResult('Wallet connection failed ✗');
      }
    } catch (error) {
      addTestResult(`Test failed with error: ${error}`);
    }
  };

  const testDisconnection = () => {
    addTestResult('Testing wallet disconnection...');
    disconnectWallet();
    addTestResult('Wallet disconnected ✓');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🔧</span>
          Wallet Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50 text-red-800">
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-red-600 hover:text-red-800 hover:bg-red-100"
              >
                ✕
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={testConnection}
            disabled={isConnecting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isConnecting ? 'Testing...' : 'Test Connection'}
          </Button>
          
          <Button
            onClick={testDisconnection}
            disabled={!isConnected}
            variant="outline"
          >
            Test Disconnect
          </Button>
          
          <Button
            onClick={clearResults}
            variant="ghost"
          >
            Clear Results
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            {isMockMode && (
              <Badge variant="outline" className="text-orange-600">
                Mock Mode
              </Badge>
            )}
          </div>
          
          {account && (
            <div className="text-sm">
              <span className="font-medium">Account:</span> {account}
            </div>
          )}
          
          {network && (
            <div className="text-sm">
              <span className="font-medium">Network:</span> {network.name}
            </div>
          )}
        </div>

        {testResults.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Test Results:</h4>
            <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-xs font-mono text-gray-700 mb-1">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnectionTest;


