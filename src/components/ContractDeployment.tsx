import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { deployContract, estimateDeploymentGas, DeploymentConfig } from '../services/contractDeployment';
import { DomaLandABI, DomaLandBytecode } from '../contracts/DomaLandContract';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface DeploymentState {
  isDeploying: boolean;
  isEstimating: boolean;
  estimatedGas?: string;
  deployedAddress?: string;
  transactionHash?: string;
  error?: string;
}

export const ContractDeployment: React.FC = () => {
  const { signer, isConnected, account } = useWeb3();
  const [deploymentState, setDeploymentState] = useState<DeploymentState>({
    isDeploying: false,
    isEstimating: false
  });

  const handleEstimateGas = async () => {
    if (!signer) return;

    setDeploymentState(prev => ({ ...prev, isEstimating: true, error: undefined }));

    try {
      const config: DeploymentConfig = {
        contractABI: DomaLandABI as unknown as Record<string, unknown>,
        contractBytecode: DomaLandBytecode,
        constructorArgs: []
      };

      const gasEstimate = await estimateDeploymentGas(signer, config);
      setDeploymentState(prev => ({
        ...prev,
        estimatedGas: gasEstimate.toString(),
        isEstimating: false
      }));
    } catch (error: unknown) {
      setDeploymentState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Gas estimation failed',
        isEstimating: false
      }));
    }
  };

  const handleDeploy = async () => {
    if (!signer) return;

    setDeploymentState(prev => ({ ...prev, isDeploying: true, error: undefined }));

    try {
      const config: DeploymentConfig = {
        contractABI: DomaLandABI as unknown as Record<string, unknown>,
        contractBytecode: DomaLandBytecode,
        constructorArgs: [],
        gasLimit: deploymentState.estimatedGas ? parseInt(deploymentState.estimatedGas) * 2 : undefined
      };

      const result = await deployContract(signer, config);
      
      setDeploymentState(prev => ({
        ...prev,
        deployedAddress: result.address,
        transactionHash: result.transactionHash,
        isDeploying: false
      }));
    } catch (error: unknown) {
      setDeploymentState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Deployment failed',
        isDeploying: false
      }));
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contract Deployment</CardTitle>
          <CardDescription>Deploy the DomaLand smart contract</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to deploy contracts.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deploy DomaLand Contract</CardTitle>
        <CardDescription>
          Deploy the DomaLand smart contract to the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Connected Account</Label>
          <Input value={account || ''} readOnly />
        </div>

        {deploymentState.estimatedGas && (
          <div className="space-y-2">
            <Label>Estimated Gas</Label>
            <Input value={deploymentState.estimatedGas} readOnly />
          </div>
        )}

        {deploymentState.deployedAddress && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div>Contract deployed successfully!</div>
                <div className="text-sm">
                  <strong>Address:</strong> {deploymentState.deployedAddress}
                </div>
                {deploymentState.transactionHash && (
                  <div className="text-sm">
                    <strong>Transaction:</strong> {deploymentState.transactionHash}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {deploymentState.error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{deploymentState.error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleEstimateGas}
            disabled={deploymentState.isEstimating || deploymentState.isDeploying}
            variant="outline"
          >
            {deploymentState.isEstimating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Estimating...
              </>
            ) : (
              'Estimate Gas'
            )}
          </Button>

          <Button
            onClick={handleDeploy}
            disabled={deploymentState.isDeploying || !deploymentState.estimatedGas}
          >
            {deploymentState.isDeploying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              'Deploy Contract'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
