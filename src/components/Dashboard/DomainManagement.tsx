// @ts-nocheck
import { useState } from 'react';
import { useDoma } from '../../contexts/DomaContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import DomainCard from '../Domain/DomainCard';
import QuickActions from '../Domain/QuickActions';
import DomainStats from '../Metrics/DomainStats';

interface Domain {
  id: string;
  name: string;
  tokenId: string;
  currentPrice: number;
  registrationDate: string;
  expirationDate: string;
  isTokenized: boolean;
  isListed: boolean;
  isFractionalized: boolean;
  traffic?: {
    monthlyVisitors: number;
  };
}

const DomainManagement: React.FC = () => {
  const { userDomains, isLoading } = useDoma();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('value');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  const filteredDomains = userDomains.filter(domain => {
    if (filter === 'all') return true;
    if (filter === 'tokenized') return domain.isTokenized;
    if (filter === 'listed') return domain.isListed;
    if (filter === 'fractionalized') return domain.isFractionalized;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'value') return b.currentPrice - a.currentPrice;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'date') return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
    return 0;
  });

  const handleDomainSelect = (domainId: string) => {
    setSelectedDomains(prev => 
      prev.includes(domainId) 
        ? prev.filter(id => id !== domainId)
        : [...prev, domainId]
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on domains:`, selectedDomains);
    // Implement bulk actions
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your domains...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="domain-management space-y-6">
      {/* Header with Quick Actions */}
      <div className="dashboard-header">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient-premium">My Domain Portfolio</h1>
            <p className="text-muted-foreground mt-2">Manage and monitor your tokenized domains</p>
          </div>
          <QuickActions />
        </div>
      </div>

      {/* Portfolio Overview */}
      <DomainStats domains={userDomains} />

      {/* Filter and Sort Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className="transition-all duration-300"
              >
                All Domains
                <Badge variant="secondary" className="ml-2">{userDomains.length}</Badge>
              </Button>
              <Button 
                variant={filter === 'tokenized' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('tokenized')}
                className="transition-all duration-300"
              >
                Tokenized
                <Badge variant="secondary" className="ml-2">{userDomains.filter(d => d.isTokenized).length}</Badge>
              </Button>
              <Button 
                variant={filter === 'listed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('listed')}
                className="transition-all duration-300"
              >
                Listed
                <Badge variant="secondary" className="ml-2">{userDomains.filter(d => d.isListed).length}</Badge>
              </Button>
              <Button 
                variant={filter === 'fractionalized' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('fractionalized')}
                className="transition-all duration-300"
              >
                Fractionalized
                <Badge variant="secondary" className="ml-2">{userDomains.filter(d => d.isFractionalized).length}</Badge>
              </Button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm font-medium text-muted-foreground">Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-background text-foreground"
              >
                <option value="value">Value</option>
                <option value="name">Name</option>
                <option value="date">Date</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domains Grid */}
      <div className="domains-grid">
        {filteredDomains.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4 opacity-60">🌐</div>
              <h3 className="text-xl font-semibold mb-2">No domains found</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any domains that match your current filters.
              </p>
              <Button 
                onClick={() => setFilter('all')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                View All Domains
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDomains.map((domain, index) => (
              <DomainCard 
                key={domain.id} 
                domain={domain}
                isSelected={selectedDomains.includes(domain.id)}
                onSelect={() => handleDomainSelect(domain.id)}
                className="animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bulk Actions for multiple domains */}
      {selectedDomains.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Bulk Actions</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedDomains.length} domain{selectedDomains.length > 1 ? 's' : ''} selected
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleBulkAction('list')}
                  disabled={selectedDomains.length === 0}
                >
                  List Selected
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleBulkAction('update-prices')}
                  disabled={selectedDomains.length === 0}
                >
                  Update Prices
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleBulkAction('export')}
                  disabled={selectedDomains.length === 0}
                >
                  Export Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DomainManagement;
