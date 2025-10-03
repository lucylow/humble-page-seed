import { useState, useCallback, useMemo } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useDoma } from '../../contexts/DomaContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAccessibility } from '../../hooks/useAccessibility';
import { UserType, OnboardingStep } from '../../types';
import { WALLET_CONSTANTS, ACCESSIBILITY_CONSTANTS } from '../../constants';
import UserTypeSelection from './UserTypeSelection';
import WalletSelection from './WalletSelection';

interface SimplifiedOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const SimplifiedOnboarding: React.FC<SimplifiedOnboardingProps> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const { connectWallet, isConnected } = useWeb3();
  const { announceToScreenReader } = useAccessibility();
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState<UserType | ''>('');

  // Memoized user type options
  const userTypeOptions = useMemo(() => [
    {
      type: 'investor' as UserType,
      icon: '💰',
      title: 'Domain Investor',
      description: 'I want to tokenize and monetize my domain portfolio',
      color: 'blue'
    },
    {
      type: 'buyer' as UserType,
      icon: '🛒',
      title: 'Domain Buyer',
      description: 'I\'m looking to invest in tokenized domains',
      color: 'emerald'
    },
    {
      type: 'developer' as UserType,
      icon: '⚡',
      title: 'Developer',
      description: 'I want to build on the Doma protocol',
      color: 'purple'
    }
  ], []);

  // Memoized wallet options
  const walletOptions = useMemo(() => WALLET_CONSTANTS.WALLETS.map(wallet => ({
    ...wallet,
    onClick: () => handleWalletConnect(wallet.id)
  })), []);

  // Event handlers
  const handleUserTypeSelect = useCallback((type: UserType) => {
    setUserType(type);
    announceToScreenReader(`Selected user type: ${type}`);
  }, [announceToScreenReader]);

  const handleWalletConnect = useCallback((walletId: string) => {
    connectWallet(walletId as any);
    announceToScreenReader(`Connecting to ${walletId} wallet`);
  }, [connectWallet, announceToScreenReader]);

  const handleNextStep = useCallback(() => {
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
      announceToScreenReader(`Moved to step ${currentStep + 1}`);
    } else {
      onComplete();
    }
  }, [currentStep, onComplete, announceToScreenReader]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      announceToScreenReader(`Moved to step ${currentStep - 1}`);
    }
  }, [currentStep, announceToScreenReader]);

  const handleClose = useCallback(() => {
    onClose();
    announceToScreenReader('Onboarding closed');
  }, [onClose, announceToScreenReader]);

  // Memoized steps
  const steps = useMemo(() => [
    {
      id: 1,
      title: "Welcome to DomaLand",
      description: "Tokenize, trade, and grow your domain portfolio with blockchain technology.",
      component: (
        <UserTypeSelection 
          options={userTypeOptions}
          selectedType={userType}
          onSelect={handleUserTypeSelect}
        />
      )
    },
    {
      id: 2,
      title: "Connect Your Wallet",
      description: "Connect your Web3 wallet to get started with DomaLand.",
      component: (
        <WalletSelection 
          options={walletOptions}
          onConnect={handleWalletConnect}
        />
      )
    }
  ], [userTypeOptions, walletOptions, userType, handleUserTypeSelect, handleWalletConnect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentStep > index + 1 
                      ? 'bg-green-500' 
                      : currentStep === index + 1 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>
          
          <CardTitle className="text-2xl font-bold text-gradient-premium">
            {steps[currentStep - 1].title}
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            {steps[currentStep - 1].description}
          </p>
        </CardHeader>
        
        <CardContent>
          {steps[currentStep - 1].component}
          
          <div className="flex justify-between items-center mt-8">
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6"
              >
                Back
              </Button>
            )}
            
            <div className="flex-1" />
            
            <Button 
              className="px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              onClick={() => {
                if (currentStep < steps.length) {
                  setCurrentStep(currentStep + 1);
                } else {
                  onComplete();
                }
              }}
              disabled={currentStep === 1 && !userType}
            >
              {currentStep === steps.length ? 'Get Started' : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedOnboarding;
