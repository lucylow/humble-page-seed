import { FC, useState, useEffect, useMemo, useCallback } from 'react';
import { useWeb3, SupportedChain } from '@/contexts/Web3Context';
import { useDoma } from '@/contexts/DomaContext';
import { useMetrics } from '@/contexts/MetricsContext';
import { useXMTP } from '@/contexts/XMTPContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardSkeleton, MetricCardSkeleton, DomainCardSkeleton } from './LoadingStates';
import MetricCard from './MetricCard';
import DomainTokenization from './DomainTokenization';
import OnboardingTour from './OnboardingTour';
import Logo from './Logo';
import WalletConnectionTest from './WalletConnectionTest';
import WalletConnectionHelper from './WalletConnectionHelper';
import ConnectWalletButton from './ConnectWalletButton';
import AIIntegrationPanel from './AIIntegrationPanel';
import { useNotificationHelpers } from './EnhancedNotificationSystem';
import { useDomainMarketplace } from '../hooks/useDomaSubgraph';
// Refactored components
import SimplifiedOnboarding from './Onboarding/SimplifiedOnboarding';
import DomainManagement from './Dashboard/DomainManagement';
import TokenizationWizard from './Domain/TokenizationWizard';
import VisualDashboard from './Analytics/VisualDashboard';
import GuidedTourSystem, { ContextualHelp } from './GuidedTour/TourSystem';
// Advanced Features Components
import { AIValuationPanel } from './AdvancedFeatures/AIValuationPanel';
import { FractionalizationPanel } from './AdvancedFeatures/FractionalizationPanel';
import { AMMPanel } from './AdvancedFeatures/AMMPanel';
import { AdvancedAnalyticsPanel } from './AdvancedFeatures/AdvancedAnalyticsPanel';
// Custom hooks
import { useTour } from '../hooks/useTour';
import { useAccessibility } from '../hooks/useAccessibility';
import { useAdvancedFeatures } from '../hooks/useAdvancedFeatures';
import { initAccessibility } from '../utils/accessibility';
// Types and constants
import { Domain, Transaction } from '../types';
import { APP_CONFIG, STORAGE_KEYS, SUCCESS_MESSAGES } from '../constants';

type DashboardView = 'dashboard' | 'management' | 'analytics';

const Dashboard: FC = () => {
  // Context hooks
  const { isConnected, connectWallet, account, network, isConnecting, error, clearError } = useWeb3();
  const { userDomains, marketplaceDomains, listDomain, buyDomain, refreshData, isLoading } = useDoma();
  const { metrics } = useMetrics();
  const { conversations, getUnreadCount, connectXMTP, isConnected: isXMTPConnected } = useXMTP();
  const { showSuccess, showError, showWarning, showInfo } = useNotificationHelpers();
  const { overview, trendingDomains, popularDomains, loading: marketplaceLoading } = useDomainMarketplace('testnet');
  
  // Combined loading state
  const isDataLoading = isLoading || marketplaceLoading;
  
  // Simple caching mechanism
  const [cache, setCache] = useState<Record<string, { data: any; timestamp: number }>>({});
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  const getCachedData = (key: string) => {
    const cached = cache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  };
  
  const setCachedData = (key: string, data: any) => {
    setCache(prev => ({
      ...prev,
      [key]: { data, timestamp: Date.now() }
    }));
  };
  
  // Custom hooks
  const { currentTour, isTourActive, startTour, completeTour } = useTour();
  const { aiValuation, fractionalization, amm, analytics, overallLoading, overallError } = useAdvancedFeatures();
  
  // Local state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSimplifiedOnboarding, setShowSimplifiedOnboarding] = useState(false);
  const [showTokenizationWizard, setShowTokenizationWizard] = useState(false);
  const [selectedDomainForTokenization, setSelectedDomainForTokenization] = useState<Domain | null>(null);
  const [currentView, setCurrentView] = useState<DashboardView>('dashboard');
  
  // Advanced Features State
  const [showAIValuation, setShowAIValuation] = useState(false);
  const [showFractionalization, setShowFractionalization] = useState(false);
  const [showAMM, setShowAMM] = useState(false);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [selectedDomainForAdvancedFeatures, setSelectedDomainForAdvancedFeatures] = useState<Domain | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    showInfo('Refreshing Data', 'Updating dashboard metrics and domain information...');
    
    try {
      // Clear cache to force fresh data
      setCache({});
      
      // Refresh data from all contexts and APIs with retry logic
      const refreshPromises = [];
      
      // Refresh Doma data with retry
      if (refreshData) {
        refreshPromises.push(
          retryWithBackoff(async () => {
            refreshData();
            return Promise.resolve();
          }, 2, 500, 5000)
        );
      }
      
      // Refresh marketplace data with retry
      refreshPromises.push(
        retryWithBackoff(async () => {
          // The useDomainMarketplace hook will automatically refresh when called
          return Promise.resolve();
        }, 2, 500, 5000)
      );
      
      // Refresh advanced features data with retry
      refreshPromises.push(
        retryWithBackoff(async () => {
          await analytics.getAnalyticsDashboard({ user_id: 1 });
          await analytics.getTrendingDomains({ limit: 10 });
          await analytics.getMarketTrends();
          return Promise.resolve();
        }, 2, 500, 5000)
      );
      
      // Wait for all refresh operations to complete
      await Promise.allSettled(refreshPromises);
      
      // Cache the refreshed data
      setCachedData('dashboard-refresh', { timestamp: Date.now() });
      
      showSuccess('Data Refreshed', 'Dashboard has been updated with the latest information');
    } catch (error) {
      console.error('Refresh failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showError('Refresh Failed', `Unable to update dashboard data: ${errorMessage}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Data validation utilities
  const validateDomainData = (domain: any): boolean => {
    return domain && 
           typeof domain === 'object' && 
           typeof domain.name === 'string' && 
           domain.name.length > 0 &&
           typeof domain.tokenId === 'string' &&
           domain.tokenId.length > 0;
  };

  const validateMetricsData = (metrics: any): boolean => {
    return metrics && 
           typeof metrics === 'object' &&
           typeof metrics.totalTransactions === 'number' &&
           typeof metrics.activeUsers === 'number' &&
           typeof metrics.totalRevenue === 'number';
  };

  // Retry logic utility with timeout
  const retryWithBackoff = async (
    fn: () => Promise<any>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    timeout: number = 10000
  ): Promise<any> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add timeout to the function call
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeout);
        });
        
        return await Promise.race([fn(), timeoutPromise]);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Exponential backoff: delay = baseDelay * 2^attempt
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`, error);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  };

  // Check if user is new (no domains tokenized yet)
  const isNewUser = userDomains.length === 0 && marketplaceDomains.length === 0;

  // Handle tokenization completion
  const handleTokenizationComplete = (result: any) => {
    setShowTokenizationWizard(false);
    setSelectedDomainForTokenization(null);
    showSuccess('Domain Tokenized', 'Your domain has been successfully tokenized!');
  };

  // Helper function to map domain data to expected Domain interface
  const mapToDomainInterface = (domain: any): Domain => {
    return {
      id: domain.id || domain.tokenId,
      tokenId: domain.tokenId,
      name: domain.name,
      currentPrice: domain.currentPrice || domain.price ? parseFloat(domain.price) : 0,
      registrationDate: domain.registrationDate || new Date().toISOString(),
      expirationDate: domain.expirationDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      isTokenized: domain.isTokenized || true,
      isListed: domain.isListed || false,
      isFractionalized: domain.isFractionalized || false,
      category: domain.category || 'other',
      owner: domain.owner,
      price: domain.price,
    };
  };

  // Advanced Features Handlers
  const handleOpenAIValuation = (domain: any) => {
    setSelectedDomainForAdvancedFeatures(mapToDomainInterface(domain));
    setShowAIValuation(true);
  };

  const handleOpenFractionalization = (domain: any) => {
    setSelectedDomainForAdvancedFeatures(mapToDomainInterface(domain));
    setShowFractionalization(true);
  };

  const handleOpenAMM = (domain: any) => {
    setSelectedDomainForAdvancedFeatures(mapToDomainInterface(domain));
    setShowAMM(true);
  };

  const handleOpenAdvancedAnalytics = (domain?: Domain) => {
    setSelectedDomainForAdvancedFeatures(domain || null);
    setShowAdvancedAnalytics(true);
  };

  const closeAdvancedFeatures = () => {
    setShowAIValuation(false);
    setShowFractionalization(false);
    setShowAMM(false);
    setShowAdvancedAnalytics(false);
    setSelectedDomainForAdvancedFeatures(null);
  };

  useEffect(() => {
    // Initialize accessibility features
    if (typeof window !== 'undefined') {
      // Add any initialization logic here
    }
  }, []);

  // Show onboarding for new users
  useEffect(() => {
    if (isConnected && isNewUser && !localStorage.getItem('domainfi-onboarding-completed')) {
      setShowSimplifiedOnboarding(true);
    }
  }, [isConnected, isNewUser]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative overflow-hidden">
        {/* Enhanced background decorations */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-r from-indigo-400/15 to-purple-400/15 rounded-full blur-xl animate-rotate-slow"></div>
        
        <Card className="w-full max-w-lg card-premium relative z-10 group animate-fade-in">
          {/* Enhanced card background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
          
          <CardHeader className="text-center pb-8 relative z-10">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <Logo size="lg" showText={true} showTagline={false} variant="default" className="animate-float" />
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse-glow"></div>
              </div>
            </div>
            <CardTitle className="text-4xl font-bold text-gradient-premium mb-4">
              DomainFi Protocol
            </CardTitle>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
              Transform domain ownership into liquid digital assets on the blockchain
            </p>
          </CardHeader>
          <CardContent className="space-y-8 relative z-10">
            {error && (
              <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm text-red-800 animate-slide-up">
                <AlertDescription className="flex items-center justify-between">
                  <span className="font-medium">{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearError}
                    className="text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full p-1"
                  >
                    <span className="sr-only">Close error</span>
                    ✕
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-4">
              <ConnectWalletButton />
            </div>
            <div className="text-center space-y-4">
              <div className="text-sm text-muted-foreground bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-gray-800/80 dark:to-gray-700/80 rounded-2xl p-6 border border-blue-200/30 dark:border-gray-600/30 backdrop-blur-sm">
                <p className="font-medium mb-2">🚀 Get Started in Minutes</p>
                <p className="text-xs leading-relaxed">
                  Connect your Web3 wallet (MetaMask, Coinbase Wallet, etc.) to access domain tokenization, trading, and fractional ownership features
                </p>
              </div>
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <span>Decentralized</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  <span>Transparent</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Enhanced background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-blue-400/10 via-purple-400/10 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-r from-indigo-400/10 via-cyan-400/10 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-2xl animate-float"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-xl animate-rotate-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full blur-lg animate-bounce-slow"></div>
      
      <div className="container-max py-12 space-y-12 relative z-10">
        {/* Enhanced Header - Responsive */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 lg:gap-8 animate-fade-in">
          <div className="space-y-4 lg:space-y-6 w-full xl:w-auto">
            <div className="space-y-3 lg:space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gradient-premium leading-tight tracking-tight">
                DomainFi Analytics
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
                Real-time insights into domain tokenization, trading, and fractional ownership
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-full border border-emerald-200/50 dark:border-emerald-700/50 backdrop-blur-sm">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 rounded-full animate-pulse shadow-glow-green"></div>
                <span className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
                </span>
              </div>
              {network && (
                <Badge variant="outline" className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 font-medium text-xs sm:text-sm">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse mr-1.5 sm:mr-2"></div>
                  {network.name}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full xl:w-auto">
            <Badge variant="outline" className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200/50 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300 shadow-lg text-center sm:text-left">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2 sm:mr-3"></div>
              <span className="font-semibold text-sm sm:text-base">Live Protocol Data</span>
            </Badge>
            <Button
              onClick={() => handleOpenAdvancedAnalytics()}
              variant="outline"
              size="lg"
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-700/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800/30 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 font-medium w-full sm:w-auto"
            >
              <span className="mr-2">📊</span>
              Advanced Analytics
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="lg"
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 font-medium w-full sm:w-auto"
            >
              {isRefreshing ? (
                <div className="loading-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              ) : (
                <span className="text-lg sm:text-xl">🔄</span>
              )}
              <span className="ml-2 text-sm sm:text-base">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <Button
                variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('dashboard')}
                className="px-6 py-3 rounded-lg transition-all duration-300"
              >
                <span className="mr-2">📊</span>
                Dashboard
              </Button>
              <Button
                variant={currentView === 'management' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('management')}
                className="px-6 py-3 rounded-lg transition-all duration-300"
              >
                <span className="mr-2">🏠</span>
                Management
              </Button>
              <Button
                variant={currentView === 'analytics' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('analytics')}
                className="px-6 py-3 rounded-lg transition-all duration-300"
              >
                <span className="mr-2">📈</span>
                Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isDataLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center space-y-4">
              <div className="loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        )}

        {/* Conditional Content Based on View */}
        {currentView === 'dashboard' && !isDataLoading && (
          <>
            {/* Enhanced Metrics Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-slide-up">
              <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
                <MetricCard
                  title="Total Transactions"
                  value={validateMetricsData(metrics) ? metrics.totalTransactions : 0}
                  change={validateMetricsData(metrics) ? metrics.dailyTransactions : 0}
                  changeLabel="today"
                  icon="📊"
                />
              </div>
              <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
                <MetricCard
                  title="Active Users"
                  value={validateMetricsData(metrics) ? metrics.activeUsers : 0}
                  change={15}
                  changeLabel="% growth"
                  icon="👥"
                />
              </div>
              <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
                <MetricCard
                  title="Protocol Revenue"
                  value={`$${Math.floor(validateMetricsData(metrics) ? metrics.totalRevenue : 0).toLocaleString()}`}
                  change={`$${Math.floor(validateMetricsData(metrics) ? metrics.projectedRevenue : 0)}`}
                  changeLabel="projected monthly"
                  icon="💰"
                />
              </div>
              <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
                <MetricCard
                  title="Domains Tokenized"
                  value={overview ? (overview.totalDomains as number) || 0 : (metrics?.domainStats?.totalTokenized || 0) + marketplaceDomains.length}
                  change={overview ? (overview.totalListings as number) || 0 : metrics?.domainStats?.totalListed || 0}
                  changeLabel={overview ? "active listings" : "listed for sale"}
                  icon="🌐"
                />
              </div>
            </div>
          </>
        )}

        {currentView === 'management' && (
          <DomainManagement />
        )}

        {currentView === 'analytics' && (
          <VisualDashboard 
            domains={userDomains.map(domain => ({
              id: domain.tokenId,
              name: domain.name,
              currentPrice: parseFloat(domain.price || '0'),
              isTokenized: true,
              category: domain.category,
              tokenId: domain.tokenId,
              isListed: domain.isListed,
              isFractionalized: false
            }))} 
            transactions={[]} // You would pass actual transaction data here
          />
        )}

        {/* Enhanced Main Content Grid - Responsive */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
          
          {/* Domain Tokenization */}
          <div className="lg:col-span-1 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <div className="relative">
              <DomainTokenization />
              <div className="absolute top-4 right-4">
                <ContextualHelp context="tokenization" position="left" />
              </div>
            </div>
          </div>

          {/* Enhanced User Domains */}
          <div className="lg:col-span-1 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <Card className="group relative overflow-hidden card-premium hover:shadow-premium-lg transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              {/* Enhanced background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <CardHeader className="relative z-10 pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="relative">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🏠</span>
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <span className="text-gradient-premium group-hover:text-blue-600 transition-colors duration-300">
                    Your Domains
                  </span>
                  <Badge variant="outline" className="ml-auto px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200/50 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 font-semibold">
                    {userDomains.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                {userDomains.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="relative mb-6">
                      <div className="text-6xl mb-4 opacity-60 animate-float">🌐</div>
                      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl animate-pulse-glow"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      No domains tokenized yet
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                      Start by tokenizing your first domain to unlock the power of blockchain ownership
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userDomains.filter(validateDomainData).map((domain, index) => (
                      <div 
                        key={domain.tokenId} 
                        className="group/item flex justify-between items-center p-5 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/30 dark:border-blue-700/30 hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 backdrop-blur-sm animate-fade-in"
                        style={{animationDelay: `${0.1 * index}s`}}
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-glow-blue"></div>
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-sm opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <div>
                            <span className="font-bold text-foreground group-hover/item:text-blue-600 transition-colors duration-300 text-lg">
                              {domain.name}
                            </span>
                            <div className="text-xs text-muted-foreground mt-1">
                              Token ID: {domain.tokenId}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200/50 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md hover:scale-105 transition-all duration-300 font-semibold"
                            onClick={async () => {
                              const price = prompt('Enter price in ETH:');
                              if (price && !isNaN(parseFloat(price)) && parseFloat(price) > 0) {
                                try {
                                  const result = await retryWithBackoff(async () => {
                                    return await listDomain(domain.tokenId, price);
                                  }, 2, 1000, 8000);
                                  
                                  if (result.success) {
                                    showSuccess('Domain Listed', `${domain.name} has been listed for ${price} ETH`);
                                  } else {
                                    showError('Listing Failed', result.error || 'Unable to list domain. Please try again.');
                                  }
                                } catch (error) {
                                  console.error('Listing error:', error);
                                  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                  showError('Listing Failed', `Unable to list domain: ${errorMessage}`);
                                }
                              } else if (price) {
                                showWarning('Invalid Price', 'Please enter a valid price greater than 0');
                              }
                            }}
                          >
                            <span className="mr-1">📝</span>
                            List
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-700/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800/30 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:scale-105 transition-all duration-300 font-semibold"
                            onClick={() => handleOpenAIValuation(domain)}
                          >
                            <span className="mr-1">🤖</span>
                            AI Value
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-700/50 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/30 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md hover:scale-105 transition-all duration-300 font-semibold"
                            onClick={() => handleOpenFractionalization(domain)}
                          >
                            <span className="mr-1">🔗</span>
                            Split
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200/50 dark:border-orange-700/50 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-800/30 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md hover:scale-105 transition-all duration-300 font-semibold"
                            onClick={() => handleOpenAMM(domain)}
                          >
                            <span className="mr-1">💱</span>
                            Trade
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Marketplace */}
          <div className="lg:col-span-1 animate-fade-in" style={{animationDelay: '0.5s'}}>
            <Card className="group relative overflow-hidden card-premium hover:shadow-premium-lg transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              {/* Enhanced background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <CardHeader className="relative z-10 pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="relative">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🏪</span>
                    <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <span className="text-gradient-success group-hover:text-emerald-600 transition-colors duration-300">
                    Marketplace
                  </span>
                  <Badge variant="outline" className="ml-auto px-3 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/50 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300 font-semibold">
                    {marketplaceDomains.length}
                  </Badge>
                </CardTitle>
                <div className="absolute top-4 right-4">
                  <ContextualHelp context="marketplace" position="left" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  {marketplaceDomains.filter(validateDomainData).slice(0, 5).map((domain, index) => (
                    <div 
                      key={domain.tokenId} 
                      className="group/item flex justify-between items-center p-5 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200/30 dark:border-emerald-700/30 hover:border-emerald-400/50 dark:hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 backdrop-blur-sm animate-fade-in"
                      style={{animationDelay: `${0.1 * index}s`}}
                    >
                      <div className="flex-1">
                        <div className="font-bold text-foreground group-hover/item:text-emerald-600 transition-colors duration-300 text-lg mb-2">
                          {domain.name}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="relative">
                            <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse shadow-glow-green"></div>
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-sm opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <span>Owner: {domain.owner?.slice(0, 6)}...{domain.owner?.slice(-4)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gradient-success group-hover/item:text-emerald-600 transition-colors duration-300 text-xl mb-3">
                          {domain.price} ETH
                        </div>
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white transition-all duration-300 hover:shadow-lg hover:scale-105 font-semibold rounded-xl"
                          onClick={async () => {
                            if (confirm(`Are you sure you want to buy ${domain.name} for ${domain.price} ETH?`)) {
                              try {
                                showInfo('Purchase Initiated', 'Transaction submitted. Please check your wallet for confirmation.');
                                
                                const result = await retryWithBackoff(async () => {
                                  return await buyDomain(domain.tokenId, domain.price || '0');
                                }, 2, 1000, 8000);
                                
                                if (result.success) {
                                  showSuccess('Purchase Complete', `Successfully purchased ${domain.name} for ${domain.price} ETH`);
                                } else {
                                  showError('Purchase Failed', result.error || 'Transaction failed. Please try again.');
                                }
                              } catch (error) {
                                console.error('Purchase error:', error);
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                showError('Purchase Failed', `Transaction failed: ${errorMessage}`);
                              }
                            }
                          }}
                        >
                          <span className="mr-2">🛒</span>
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Doma Subgraph Trending Domains */}
        {!isDataLoading && (trendingDomains?.length > 0 || popularDomains?.length > 0) && (
          <div className="mb-12 animate-fade-in" style={{animationDelay: '0.5s'}}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trending Domains */}
              <Card className="group relative overflow-hidden card-premium hover:shadow-premium-lg transition-all duration-500 hover:-translate-y-2 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                
                <CardHeader className="relative z-10 pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    <div className="relative">
                      <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🔥</span>
                      <div className="absolute -inset-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <span className="text-gradient-premium group-hover:text-orange-600 transition-colors duration-300">
                      Trending Domains
                    </span>
                    <Badge variant="outline" className="ml-auto px-3 py-1 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200/50 dark:border-orange-700/50 text-orange-700 dark:text-orange-300 font-semibold">
                      {trendingDomains?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  {!trendingDomains || trendingDomains.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3 opacity-50 animate-float">📈</div>
                      <p className="text-muted-foreground font-medium">No trending domains</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {trendingDomains.filter(domain => domain && typeof domain === 'object' && typeof domain.name === 'string').slice(0, 5).map((domain, index) => (
                        <div key={domain.name} className="group/item flex justify-between items-center p-4 bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/30 dark:border-orange-700/30 hover:border-orange-400/50 dark:hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 backdrop-blur-sm">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse shadow-glow-orange"></div>
                              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-sm opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div>
                              <span className="font-bold text-foreground group-hover/item:text-orange-600 transition-colors duration-300">
                                {domain.name}
                              </span>
                              <div className="text-xs text-muted-foreground mt-1">
                                Score: {(domain as Record<string, unknown>).trendScore as number || 0}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-600">
                            #{index + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Popular Domains */}
              <Card className="group relative overflow-hidden card-premium hover:shadow-premium-lg transition-all duration-500 hover:-translate-y-2 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                
                <CardHeader className="relative z-10 pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    <div className="relative">
                      <span className="text-2xl group-hover:scale-110 transition-transform duration-300">⭐</span>
                      <div className="absolute -inset-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <span className="text-gradient-premium group-hover:text-green-600 transition-colors duration-300">
                      Popular Domains
                    </span>
                    <Badge variant="outline" className="ml-auto px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-700/50 text-green-700 dark:text-green-300 font-semibold">
                      {popularDomains?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  {!popularDomains || popularDomains.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3 opacity-50 animate-float">🌟</div>
                      <p className="text-muted-foreground font-medium">No popular domains</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {popularDomains.filter(domain => domain && typeof domain === 'object' && typeof domain.name === 'string').slice(0, 5).map((domain, index) => (
                        <div key={domain.name} className="group/item flex justify-between items-center p-4 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/30 dark:border-green-700/30 hover:border-green-400/50 dark:hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 backdrop-blur-sm">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse shadow-glow-green"></div>
                              <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-sm opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div>
                              <span className="font-bold text-foreground group-hover/item:text-green-600 transition-colors duration-300">
                                {domain.name}
                              </span>
                              <div className="text-xs text-muted-foreground mt-1">
                                {(domain as Record<string, unknown>).activeOffers as number || 0} offers
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600">
                            #{index + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Enhanced Messaging Section */}
        {isConnected && (
          <div className="mb-12 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <Card className="group relative overflow-hidden card-premium hover:shadow-premium-lg transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <CardHeader className="relative z-10 pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xl font-bold">
                    <div className="relative">
                      <span className="text-2xl group-hover:scale-110 transition-transform duration-300">💬</span>
                      <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <span className="text-gradient-warning group-hover:text-purple-600 transition-colors duration-300">
                      Domain Negotiations
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {!isXMTPConnected && (
                      <Button
                        onClick={async () => {
                          try {
                            await retryWithBackoff(async () => {
                              await connectXMTP();
                              return Promise.resolve();
                            }, 2, 1000, 5000);
                            
                            showSuccess('XMTP Connected', 'Successfully connected to XMTP messaging protocol');
                          } catch (error) {
                            console.error('XMTP connection error:', error);
                            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                            showError('XMTP Connection Failed', `Unable to connect to XMTP: ${errorMessage}`);
                          }
                        }}
                        size="lg"
                        variant="outline"
                        className="px-6 py-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-700/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800/30 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
                      >
                        <span className="mr-2">🔗</span>
                        Connect XMTP
                      </Button>
                    )}
                    {isXMTPConnected && (
                      <Badge variant="outline" className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200/50 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300 font-semibold shadow-lg">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-3"></div>
                        XMTP Connected
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                {!conversations || conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3 opacity-50 animate-float">💬</div>
                    <p className="text-muted-foreground font-medium">
                      No active negotiations
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start chatting with domain sellers to negotiate deals
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversations.filter(conversation => conversation && typeof conversation === 'object' && conversation.id).slice(0, 3).map((conversation) => (
                      <div key={conversation.id} className="group/item flex justify-between items-center p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          <div>
                            <span className="font-semibold text-foreground group-hover/item:text-primary transition-colors duration-300">
                              {conversation.domainName || 'Domain Negotiation'}
                            </span>
                            <div className="text-sm text-muted-foreground">
                              {conversation.lastMessage?.content.slice(0, 50)}...
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="hover:bg-primary/10 hover:border-primary/30 hover:shadow-md hover:scale-105 transition-all duration-300 font-medium"
                            onClick={() => window.location.href = `/negotiate/${conversation.domainId}`}
                          >
                            <span className="mr-1">💬</span>
                            Chat
                          </Button>
                        </div>
                      </div>
                    ))}
                    {conversations && conversations.length > 3 && (
                      <div className="text-center pt-2">
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          View all {conversations.length} conversations
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Integration Panel */}
        {isConnected && (
          <div className="mb-12 animate-fade-in" style={{animationDelay: '0.8s'}}>
            <Card className="group relative overflow-hidden card-premium hover:shadow-premium-lg transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <CardHeader className="relative z-10 pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                  <div className="relative">
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🤖</span>
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <span className="text-gradient-premium group-hover:text-purple-600 transition-colors duration-300">
                    AI-Powered Domain Analysis
                  </span>
                </CardTitle>
                <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
                  Leverage artificial intelligence to analyze domain value, linguistic characteristics, development potential, and generate optimized content automatically.
                </p>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <AIIntegrationPanel 
                  domainName="example.com"
                  onAnalysisComplete={(results) => {
                    try {
                      console.log('AI Analysis Complete:', results);
                      if (results && typeof results === 'object') {
                        showSuccess('AI Analysis Complete', 'Domain analysis has been completed successfully!');
                      } else {
                        showWarning('AI Analysis Incomplete', 'Analysis completed but results may be incomplete');
                      }
                    } catch (error) {
                      console.error('AI Analysis error:', error);
                      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                      showError('AI Analysis Failed', `Analysis failed: ${errorMessage}`);
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Development Tools */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 space-y-6">
            <WalletConnectionHelper />
            <WalletConnectionTest />
          </div>
        )}

        {/* Enhanced Features Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-slide-up" style={{animationDelay: '0.7s'}}>
          <div className="animate-fade-in" style={{animationDelay: '0.8s'}}>
            <Card className="group relative overflow-hidden card-premium hover:shadow-premium-lg transition-all duration-500 hover:-translate-y-2 hover:scale-105 h-full">
              {/* Enhanced background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <CardHeader className="relative z-10 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="relative">
                    <span className="text-2xl animate-float group-hover:scale-110 transition-transform duration-300">🔗</span>
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <span className="text-gradient-premium group-hover:text-blue-600 transition-colors duration-300">
                    Tokenization
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-base text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300 leading-relaxed">
                  Convert domain ownership into blockchain tokens with verifiable proof of ownership and immutable records.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="animate-fade-in" style={{animationDelay: '0.9s'}}>
            <Card className="group relative overflow-hidden card-premium hover:shadow-premium-lg transition-all duration-500 hover:-translate-y-2 hover:scale-105 h-full">
              {/* Enhanced background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <CardHeader className="relative z-10 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="relative">
                    <span className="text-2xl animate-float group-hover:scale-110 transition-transform duration-300" style={{animationDelay: '1s'}}>🏪</span>
                    <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <span className="text-gradient-success group-hover:text-emerald-600 transition-colors duration-300">
                    Marketplace
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-base text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300 leading-relaxed">
                  Trade tokenized domains in a decentralized marketplace with transparent pricing and secure escrow.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="animate-fade-in" style={{animationDelay: '1.0s'}}>
            <Card className="group relative overflow-hidden card-premium hover:shadow-premium-lg transition-all duration-500 hover:-translate-y-2 hover:scale-105 h-full">
              {/* Enhanced background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-400/10 to-pink-400/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <CardHeader className="relative z-10 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="relative">
                    <span className="text-2xl animate-float group-hover:scale-110 transition-transform duration-300" style={{animationDelay: '2s'}}>🎯</span>
                    <div className="absolute -inset-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <span className="text-gradient-warning group-hover:text-orange-600 transition-colors duration-300">
                    Fractionalization
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-base text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300 leading-relaxed">
                  Split domain ownership into fractional shares for collaborative ownership and investment opportunities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Track 5: Landing Pages & Messaging Interfaces */}
        <div className="mb-12 animate-fade-in" style={{animationDelay: '1.1s'}}>
          <Card className="group relative overflow-hidden card-premium hover:shadow-premium-lg transition-all duration-500 hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <CardHeader className="relative z-10 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="relative">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🏆</span>
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <span className="text-gradient-warning group-hover:text-purple-600 transition-colors duration-300">
                  Track 5: Landing Pages & Messaging Interfaces
                </span>
              </CardTitle>
              <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
                Experience how DomaLand revolutionizes domain sales through automated landing pages, seamless orderbook integration, and secure messaging interfaces.
              </p>
            </CardHeader>
            
            <CardContent className="relative z-10 space-y-8">
              {/* Track 5 Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center p-6 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/30 dark:border-blue-700/30 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="text-3xl font-bold text-gradient-premium mb-2">{"< 2 seconds"}</div>
                  <div className="text-sm font-medium text-muted-foreground">Instant Page Generation</div>
                  <div className="text-xs text-muted-foreground mt-1">Landing pages created automatically</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200/30 dark:border-emerald-700/30 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="text-3xl font-bold text-gradient-success mb-2">+300%</div>
                  <div className="text-sm font-medium text-muted-foreground">Enhanced Visibility</div>
                  <div className="text-xs text-muted-foreground mt-1">SEO optimization increases discoverability</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200/30 dark:border-orange-700/30 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="text-3xl font-bold text-gradient-warning mb-2">100%</div>
                  <div className="text-sm font-medium text-muted-foreground">Secure Transactions</div>
                  <div className="text-xs text-muted-foreground mt-1">Blockchain-verified ownership</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/30 dark:border-purple-700/30 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="text-3xl font-bold text-gradient-warning mb-2">-60%</div>
                  <div className="text-sm font-medium text-muted-foreground">Reduced Friction</div>
                  <div className="text-xs text-muted-foreground mt-1">Streamlined purchase flow</div>
                </div>
              </div>

              {/* Interactive Feature Demo */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-center text-gradient-premium">Interactive Feature Demo</h3>
                <p className="text-center text-muted-foreground">Click on each feature to see it in action</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200/50 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg hover:scale-105 transition-all duration-300"
                    onClick={() => showInfo('Automated Landing Pages', 'SEO-optimized landing pages generated instantly for every tokenized domain')}
                  >
                    <span className="text-2xl">🌐</span>
                    <span className="text-xs font-semibold">Automated Landing Pages</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/50 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800/30 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-lg hover:scale-105 transition-all duration-300"
                    onClick={() => showInfo('Doma Orderbook Integration', 'Seamless integration with Doma Protocol orderbook for instant trading')}
                  >
                    <span className="text-2xl">📊</span>
                    <span className="text-xs font-semibold">Doma Orderbook Integration</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-700/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800/30 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg hover:scale-105 transition-all duration-300"
                    onClick={() => showInfo('XMTP Messaging Interface', 'Secure, encrypted messaging for domain negotiations')}
                  >
                    <span className="text-2xl">💬</span>
                    <span className="text-xs font-semibold">XMTP Messaging Interface</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200/50 dark:border-orange-700/50 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-800/30 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-lg hover:scale-105 transition-all duration-300"
                    onClick={() => showInfo('Advanced SEO Optimization', 'AI-powered SEO optimization for maximum domain visibility')}
                  >
                    <span className="text-2xl">🔍</span>
                    <span className="text-xs font-semibold">Advanced SEO Optimization</span>
                  </Button>
                </div>
              </div>

              {/* Automated Landing Pages Demo */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gradient-premium">Automated Landing Pages</h3>
                <p className="text-muted-foreground">SEO-optimized landing pages generated instantly for every tokenized domain</p>
                
                <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/30 dark:border-blue-700/30 p-6 backdrop-blur-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-bold text-lg">Key Features:</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          Dynamic SEO meta tags and structured data
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          Real-time domain information display
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          Integrated purchase and offer buttons
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          Social media optimization
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          Mobile-responsive design
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          Analytics and tracking
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-lg">crypto.com</span>
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Premium</Badge>
                        </div>
                        <div className="text-2xl font-bold text-gradient-success mb-4">10.5 ETH</div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                            Buy Now
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            Make Offer
                          </Button>
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground flex items-center gap-4">
                          <span>✓ SEO optimized</span>
                          <span>✓ Mobile responsive</span>
                          <span>✓ Real-time pricing</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Implementation */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gradient-premium">Technical Implementation</h3>
                <p className="text-muted-foreground">How DomaLand achieves Track 5 objectives through innovative technology</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg">Core Technologies</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
                        <span className="text-xl">⚛️</span>
                        <span className="font-medium">React + TypeScript for dynamic UI</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/30 dark:border-emerald-700/30">
                        <span className="text-xl">🔗</span>
                        <span className="font-medium">Doma Protocol smart contracts</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/30 dark:border-purple-700/30">
                        <span className="text-xl">💬</span>
                        <span className="font-medium">XMTP for encrypted messaging</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/30 dark:border-orange-700/30">
                        <span className="text-xl">🤖</span>
                        <span className="font-medium">AI-powered SEO optimization</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-50/80 to-blue-50/80 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-cyan-200/30 dark:border-cyan-700/30">
                        <span className="text-xl">⛓️</span>
                        <span className="font-medium">Real-time blockchain integration</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg">Track 5 Achievements</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/30 dark:border-green-700/30">
                        <span className="text-green-500">✓</span>
                        <span className="font-medium">Automated landing page generation</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/30 dark:border-green-700/30">
                        <span className="text-green-500">✓</span>
                        <span className="font-medium">SEO optimization for visibility</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/30 dark:border-green-700/30">
                        <span className="text-green-500">✓</span>
                        <span className="font-medium">Orderbook integration for transactions</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/30 dark:border-green-700/30">
                        <span className="text-green-500">✓</span>
                        <span className="font-medium">Secure messaging interface</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/30 dark:border-green-700/30">
                        <span className="text-green-500">✓</span>
                        <span className="font-medium">Reduced friction in domain sales</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center space-y-6 p-8 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/30 dark:border-purple-700/30 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-gradient-premium">Ready to Experience Track 5?</h3>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Explore the full DomaLand platform and see how we're revolutionizing domain sales through automated landing pages, seamless orderbook integration, and secure messaging.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white transition-all duration-300 hover:shadow-lg hover:scale-105 font-semibold rounded-xl"
                    onClick={() => showInfo('Explore Marketplace', 'Navigate to the marketplace to see live domain listings')}
                  >
                    <span className="mr-2">🏪</span>
                    Explore Marketplace
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="px-8 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200/50 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold rounded-xl"
                    onClick={() => showInfo('View Landing Page', 'See a live example of an automated domain landing page')}
                  >
                    <span className="mr-2">🌐</span>
                    View Landing Page
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Help Button */}
      <Button
        onClick={() => setShowOnboarding(true)}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full btn-premium shadow-premium-lg hover:shadow-3xl transition-all duration-500 hover:scale-110 z-50 group animate-bounce-in"
        size="sm"
      >
        <div className="relative">
          <span className="text-2xl font-bold group-hover:scale-110 transition-transform duration-300">?</span>
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </Button>

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          setShowOnboarding(false);
          localStorage.setItem('domainfi-onboarding-completed', 'true');
        }}
      />

      {/* Simplified Onboarding */}
      <SimplifiedOnboarding
        isOpen={showSimplifiedOnboarding}
        onClose={() => setShowSimplifiedOnboarding(false)}
        onComplete={() => {
          setShowSimplifiedOnboarding(false);
          localStorage.setItem('domainfi-onboarding-completed', 'true');
          showSuccess('Welcome to DomaLand!', 'You\'re all set to start tokenizing domains.');
        }}
      />

      {/* Tokenization Wizard */}
      {selectedDomainForTokenization && (
        <TokenizationWizard
          domain={selectedDomainForTokenization}
          onComplete={handleTokenizationComplete}
          onClose={() => {
            setShowTokenizationWizard(false);
            setSelectedDomainForTokenization(null);
          }}
        />
      )}

      {/* Guided Tour System */}
      <GuidedTourSystem
        currentTour={currentTour}
        isTourActive={isTourActive}
        onComplete={completeTour}
      />

      {/* Tour Start Button */}
      <Button
        onClick={() => startTour('onboarding')}
        className="fixed bottom-8 left-8 h-12 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-50 rounded-full"
        size="sm"
      >
        <span className="mr-2">🎯</span>
        Start Tour
      </Button>

      {/* Advanced Features Panels */}
      {showAIValuation && selectedDomainForAdvancedFeatures && (
        <AIValuationPanel
          domain={selectedDomainForAdvancedFeatures}
          onClose={closeAdvancedFeatures}
        />
      )}

      {showFractionalization && selectedDomainForAdvancedFeatures && (
        <FractionalizationPanel
          domain={selectedDomainForAdvancedFeatures}
          onClose={closeAdvancedFeatures}
        />
      )}

      {showAMM && selectedDomainForAdvancedFeatures && (
        <AMMPanel
          domain={selectedDomainForAdvancedFeatures}
          onClose={closeAdvancedFeatures}
        />
      )}

      {showAdvancedAnalytics && (
        <AdvancedAnalyticsPanel
          domain={selectedDomainForAdvancedFeatures || undefined}
          onClose={closeAdvancedFeatures}
        />
      )}
    </div>
  );
};

export default Dashboard;