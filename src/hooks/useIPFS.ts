/**
 * React Hook for IPFS data fetching
 */

import { useState, useCallback } from 'react';
import { fetchIPFSJson, isValidIPFSHash } from '@/services/publicApis';

export function useIPFS<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (hash: string) => {
    if (!isValidIPFSHash(hash)) {
      setError('Invalid IPFS hash format');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchIPFSJson<T>(hash);
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch from IPFS';
      setError(message);
      console.error('IPFS fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    fetchData,
    reset
  };
}

