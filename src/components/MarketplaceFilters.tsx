import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react';

interface MarketplaceFiltersProps {
  onSearch: (query: string) => void;
  onSort: (sortBy: string, direction: 'asc' | 'desc') => void;
  onFilter: (filters: FilterOptions) => void;
  searchQuery: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  filters: FilterOptions;
}

interface FilterOptions {
  priceRange: { min: number; max: number };
  domainLength: { min: number; max: number };
  tld: string[];
}

const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({
  onSearch,
  onSort,
  onFilter,
  searchQuery,
  sortBy,
  sortDirection,
  filters
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleSortChange = (newSortBy: string) => {
    const newDirection = sortBy === newSortBy && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(newSortBy, newDirection);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string | number | boolean | { min: number; max: number } | string[]) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      priceRange: { min: 0, max: 1000 },
      domainLength: { min: 1, max: 50 },
      tld: []
    };
    setLocalFilters(defaultFilters);
    onFilter(defaultFilters);
  };

  const hasActiveFilters = 
    filters.priceRange.min > 0 || 
    filters.priceRange.max < 1000 || 
    filters.domainLength.min > 1 || 
    filters.domainLength.max < 50 || 
    filters.tld.length > 0;

  return (
    <div className="space-y-4 p-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search domains..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10 pr-4"
        />
      </div>

      {/* Sort and Filter Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="length">Length</SelectItem>
            <SelectItem value="tld">TLD</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSortChange(sortBy)}
          className="flex items-center gap-1"
        >
          {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
              !
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/30">
          <h4 className="font-medium text-sm">Advanced Filters</h4>
          
          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Price Range (ETH)</label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Min"
                value={localFilters.priceRange.min}
                onChange={(e) => handleFilterChange('priceRange', {
                  ...localFilters.priceRange,
                  min: parseFloat(e.target.value) || 0
                })}
                className="w-20"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={localFilters.priceRange.max}
                onChange={(e) => handleFilterChange('priceRange', {
                  ...localFilters.priceRange,
                  max: parseFloat(e.target.value) || 1000
                })}
                className="w-20"
              />
            </div>
          </div>

          {/* Domain Length */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Domain Length</label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Min"
                value={localFilters.domainLength.min}
                onChange={(e) => handleFilterChange('domainLength', {
                  ...localFilters.domainLength,
                  min: parseInt(e.target.value) || 1
                })}
                className="w-20"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={localFilters.domainLength.max}
                onChange={(e) => handleFilterChange('domainLength', {
                  ...localFilters.domainLength,
                  max: parseInt(e.target.value) || 50
                })}
                className="w-20"
              />
            </div>
          </div>

          {/* TLD Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Top Level Domains</label>
            <div className="flex flex-wrap gap-2">
              {['.com', '.org', '.net', '.io', '.xyz', '.eth'].map((tld) => (
                <Button
                  key={tld}
                  variant={localFilters.tld.includes(tld) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newTlds = localFilters.tld.includes(tld)
                      ? localFilters.tld.filter(t => t !== tld)
                      : [...localFilters.tld, tld];
                    handleFilterChange('tld', newTlds);
                  }}
                  className="text-xs"
                >
                  {tld}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceFilters;
