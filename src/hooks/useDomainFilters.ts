import { useState, useMemo, useCallback } from 'react';
import { Domain, FilterOptions, DomainCategory } from '../types';
import { DOMAIN_CONSTANTS } from '../constants';

interface UseDomainFiltersReturn {
  filters: FilterOptions;
  filteredDomains: Domain[];
  setFilters: (filters: Partial<FilterOptions>) => void;
  clearFilters: () => void;
  resetFilters: () => void;
  filterCount: number;
}

const DEFAULT_FILTERS: FilterOptions = {
  sortBy: 'value',
  sortOrder: 'desc',
};

export const useDomainFilters = (domains: Domain[]): UseDomainFiltersReturn => {
  const [filters, setFiltersState] = useState<FilterOptions>(DEFAULT_FILTERS);

  const setFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const filteredDomains = useMemo(() => {
    let filtered = [...domains];

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(domain => domain.category === filters.category);
    }

    // Apply tokenization filter
    if (filters.isTokenized !== undefined) {
      filtered = filtered.filter(domain => domain.isTokenized === filters.isTokenized);
    }

    // Apply listing filter
    if (filters.isListed !== undefined) {
      filtered = filtered.filter(domain => domain.isListed === filters.isListed);
    }

    // Apply fractionalization filter
    if (filters.isFractionalized !== undefined) {
      filtered = filtered.filter(domain => domain.isFractionalized === filters.isFractionalized);
    }

    // Apply price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filtered = filtered.filter(domain => {
        const price = domain.currentPrice;
        return price >= min && (max === Infinity || price <= max);
      });
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (filters.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'value':
            comparison = a.currentPrice - b.currentPrice;
            break;
          case 'date':
            comparison = new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime();
            break;
          case 'popularity':
            comparison = (a.traffic?.monthlyVisitors || 0) - (b.traffic?.monthlyVisitors || 0);
            break;
          default:
            comparison = 0;
        }

        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [domains, filters]);

  const filterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.isTokenized !== undefined) count++;
    if (filters.isListed !== undefined) count++;
    if (filters.isFractionalized !== undefined) count++;
    if (filters.priceRange) count++;
    return count;
  }, [filters]);

  return {
    filters,
    filteredDomains,
    setFilters,
    clearFilters,
    resetFilters,
    filterCount,
  };
};
