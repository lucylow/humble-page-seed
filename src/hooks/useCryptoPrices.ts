/**
 * React Hook for fetching and caching cryptocurrency prices
 */

import { useState, useEffect } from 'react';
import { fetchBitcoinPriceCached, fetchStacksPriceCached } from '@/services/publicApis';

interface PriceData {
  btc: number | null;
  stx: number | null;
}

export function useCryptoPrices(autoFetch: boolean = true, intervalMs: number = 60000) {
  const [prices, setPrices] = useState<PriceData>({ btc: null, stx: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);

      const [btcPrice, stxPrice] = await Promise.all([
        fetchBitcoinPriceCached(),
        fetchStacksPriceCached()
      ]);

      setPrices({ btc: btcPrice, stx: stxPrice });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      console.error('Price fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchPrices();

      // Set up interval for automatic updates
      const interval = setInterval(fetchPrices, intervalMs);

      return () => clearInterval(interval);
    }
  }, [autoFetch, intervalMs]);

  return {
    prices,
    loading,
    error,
    refetch: fetchPrices
  };
}

