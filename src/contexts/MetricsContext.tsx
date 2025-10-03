import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import { useWeb3 } from './Web3Context';

interface Metrics {
  totalTransactions: number;
  dailyTransactions: number;
  weeklyTransactions: number;
  activeUsers: number;
  totalRevenue: number;
  projectedRevenue: number;
  domainStats: {
    totalTokenized: number;
    totalListed: number;
    totalFractionalized: number;
  };
}

interface MetricsContextType {
  metrics: Metrics;
  incrementTransaction: () => void;
  updateRevenue: (amount: number) => void;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
};

interface MetricsProviderProps {
  children: ReactNode;
}

export const MetricsProvider: FC<MetricsProviderProps> = ({ children }) => {
  const { account } = useWeb3();
  
  const [metrics, setMetrics] = useState<Metrics>({
    totalTransactions: 1247,
    dailyTransactions: 23,
    weeklyTransactions: 156,
    activeUsers: 892,
    totalRevenue: 45230,
    projectedRevenue: 67800,
    domainStats: {
      totalTokenized: 0,
      totalListed: 0,
      totalFractionalized: 0
    }
  });

  // Update domain statistics (mock data for now)
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      domainStats: {
        totalTokenized: 15,
        totalListed: 8,
        totalFractionalized: 3
      }
    }));
  }, [account]);

  // Calculate revenue projections (mock data for now)
  useEffect(() => {
    const calculateRevenue = () => {
      const listedDomains = 8;
      const avgPrice = 7.5;
      
      const estimatedRevenue = listedDomains * avgPrice * 0.03; // 3% platform fee
      const projectedMonthly = estimatedRevenue * 30;
      
      setMetrics(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue + estimatedRevenue,
        projectedRevenue: projectedMonthly
      }));
    };

    calculateRevenue();
  }, [account]);

  // Simulate real-time growth
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 5),
        dailyTransactions: prev.dailyTransactions + Math.floor(Math.random() * 3)
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const incrementTransaction = () => {
    setMetrics(prev => ({
      ...prev,
      totalTransactions: prev.totalTransactions + 1,
      dailyTransactions: prev.dailyTransactions + 1
    }));
  };

  const updateRevenue = (amount: number) => {
    setMetrics(prev => ({
      ...prev,
      totalRevenue: prev.totalRevenue + amount,
      projectedRevenue: prev.projectedRevenue + (amount * 30)
    }));
  };

  const value: MetricsContextType = {
    metrics,
    incrementTransaction,
    updateRevenue
  };

  return (
    <MetricsContext.Provider value={value}>
      {children}
    </MetricsContext.Provider>
  );
};