import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface TourStep {
  selector: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface Tour {
  id: string;
  name: string;
  steps: TourStep[];
}

interface TourSystemProps {
  currentTour?: Tour;
  isTourActive: boolean;
  onComplete: (tourId: string) => void;
}

interface ContextualHelpProps {
  context: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const GuidedTourSystem: React.FC<TourSystemProps> = ({ 
  currentTour, 
  isTourActive, 
  onComplete 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentTour && !localStorage.getItem(`tour-completed-${currentTour.id}`)) {
      setIsOpen(true);
    }
  }, [currentTour]);

  const steps = {
    onboarding: [
      {
        selector: '.portfolio-overview',
        content: 'Welcome to your domain portfolio dashboard! Here you can see all your domains and their current status.',
        position: 'bottom' as const
      },
      {
        selector: '.tokenize-button',
        content: 'Click here to tokenize a new domain and start earning from your digital assets.',
        position: 'right' as const
      },
      {
        selector: '.analytics-section',
        content: 'Track your portfolio performance and market trends with our advanced analytics tools.',
        position: 'top' as const
      }
    ],
    marketplace: [
      {
        selector: '.marketplace-filters',
        content: 'Use these filters to find exactly what you\'re looking for in the marketplace.',
        position: 'bottom' as const
      },
      {
        selector: '.domain-card',
        content: 'Each card shows key information about a domain. Click to view details or make an offer.',
        position: 'top' as const
      },
      {
        selector: '.buy-now-button',
        content: 'Ready to purchase? Click here to buy instantly at the listed price.',
        position: 'left' as const
      }
    ]
  };

  const closeTour = () => {
    setIsOpen(false);
    if (currentTour) {
      onComplete(currentTour.id);
      localStorage.setItem(`tour-completed-${currentTour.id}`, 'true');
    }
  };

  const nextStep = () => {
    if (currentTour && currentStep < steps[currentTour.id as keyof typeof steps].length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!currentTour || !steps[currentTour.id as keyof typeof steps]) {
    return null;
  }

  const tourSteps = steps[currentTour.id as keyof typeof steps];
  const currentStepData = tourSteps[currentStep];

  return (
    <>
      {isOpen && isTourActive && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Tour Content */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <Card className="w-full max-w-md shadow-2xl border-2 border-blue-500">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Progress */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Step {currentStep + 1} of {tourSteps.length}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closeTour}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </Button>
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Tour Guide</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {currentStepData.content}
                    </p>
                  </div>
                  
                  {/* Navigation */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="px-4"
                    >
                      Back
                    </Button>
                    
                    <div className="flex space-x-1">
                      {tourSteps.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentStep 
                              ? 'bg-blue-500' 
                              : index < currentStep 
                                ? 'bg-green-500' 
                                : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <Button 
                      onClick={nextStep}
                      className="px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    >
                      {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

// Contextual help system
export const ContextualHelp: React.FC<ContextualHelpProps> = ({ 
  context, 
  position = 'bottom' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const helpContent = {
    tokenization: 'Tokenizing converts your domain into a blockchain asset that can be traded, fractionalized, or used as collateral.',
    fractionalization: 'Fractional ownership allows multiple investors to own shares of a high-value domain, increasing liquidity.',
    valuation: 'Our AI-powered valuation considers market trends, domain characteristics, and historical sales data.',
    marketplace: 'The marketplace allows you to buy and sell tokenized domains with transparent pricing and secure transactions.',
    analytics: 'Analytics provide insights into your portfolio performance, market trends, and investment opportunities.',
    messaging: 'Secure messaging enables direct communication with domain sellers for negotiations and inquiries.'
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div className="contextual-help relative inline-block">
      <button 
        className="help-trigger w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors flex items-center justify-center text-sm font-semibold"
        onClick={() => setIsVisible(!isVisible)}
        aria-label="Get help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        ?
      </button>
      {isVisible && (
        <div className={`help-bubble absolute z-50 w-64 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ${positionClasses[position]}`}>
          <div className="help-content text-sm text-gray-700 dark:text-gray-300">
            {helpContent[context as keyof typeof helpContent] || 'Help content not available for this context.'}
          </div>
          <button 
            className="help-close absolute top-1 right-1 w-4 h-4 text-gray-500 hover:text-gray-700 flex items-center justify-center"
            onClick={() => setIsVisible(false)}
            aria-label="Close help"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

// Tour context for managing tour state
export const useTour = () => {
  const [currentTour, setCurrentTour] = useState<Tour | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);

  const startTour = (tourId: string) => {
    const tours = {
      onboarding: {
        id: 'onboarding',
        name: 'Onboarding Tour',
        steps: []
      },
      marketplace: {
        id: 'marketplace',
        name: 'Marketplace Tour',
        steps: []
      }
    };
    
    setCurrentTour(tours[tourId as keyof typeof tours] || null);
    setIsTourActive(true);
  };

  const completeTour = (tourId: string) => {
    setCurrentTour(null);
    setIsTourActive(false);
    localStorage.setItem(`tour-completed-${tourId}`, 'true');
  };

  const isTourCompleted = (tourId: string) => {
    return localStorage.getItem(`tour-completed-${tourId}`) === 'true';
  };

  return {
    currentTour,
    isTourActive,
    startTour,
    completeTour,
    isTourCompleted
  };
};

export default GuidedTourSystem;
