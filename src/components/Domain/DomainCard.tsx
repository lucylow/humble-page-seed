import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface Domain {
  id: string;
  name: string;
  currentPrice: number;
  isTokenized: boolean;
  isListed: boolean;
  isFractionalized: boolean;
  category?: string;
  traffic?: {
    monthlyVisitors: number;
  };
}

interface DomainCardProps {
  domain: Domain;
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const DomainCard: React.FC<DomainCardProps> = ({ 
  domain, 
  isSelected = false, 
  onSelect,
  className = '',
  style 
}) => {
  return (
    <Card 
      className={`domain-card group hover:shadow-lg transition-all duration-300 cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
      } ${className}`}
      style={style}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gradient-premium group-hover:text-blue-600 transition-colors duration-300">
            {domain.name}
          </CardTitle>
          <div className="flex gap-2">
            {domain.isTokenized && (
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                Tokenized
              </Badge>
            )}
            {domain.isListed && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Listed
              </Badge>
            )}
            {domain.isFractionalized && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                Fractionalized
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="domain-metrics">
          <div className="metric">
            <div className="metric-value">${domain.currentPrice.toLocaleString()}</div>
            <div className="metric-label">Current Value</div>
          </div>
          <div className="metric">
            <div className="metric-value">{domain.traffic?.monthlyVisitors || 0}</div>
            <div className="metric-label">Monthly Visitors</div>
          </div>
        </div>
        
        {domain.category && (
          <div className="text-sm text-muted-foreground">
            Category: <span className="font-medium">{domain.category}</span>
          </div>
        )}
        
        <div className="domain-actions">
          <Button 
            size="sm" 
            className="btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              // Handle tokenize action
            }}
          >
            Tokenize
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="btn-secondary"
            onClick={(e) => {
              e.stopPropagation();
              // Handle view details action
            }}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainCard;
