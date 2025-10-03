import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface Domain {
  id: string;
  name: string;
  currentPrice: number;
  isTokenized: boolean;
  isListed: boolean;
  isFractionalized: boolean;
}

interface DomainStatsProps {
  domains: Domain[];
}

const DomainStats: React.FC<DomainStatsProps> = ({ domains }) => {
  const totalValue = domains.reduce((sum, domain) => sum + domain.currentPrice, 0);
  const tokenizedCount = domains.filter(d => d.isTokenized).length;
  const listedCount = domains.filter(d => d.isListed).length;
  const fractionalizedCount = domains.filter(d => d.isFractionalized).length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Portfolio Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
            <div className="text-2xl font-bold text-gradient-premium mb-1">
              ${totalValue.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/30 dark:border-emerald-700/30">
            <div className="text-2xl font-bold text-gradient-success mb-1">
              {tokenizedCount}
            </div>
            <div className="text-sm text-muted-foreground">Tokenized</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/30 dark:border-orange-700/30">
            <div className="text-2xl font-bold text-gradient-warning mb-1">
              {listedCount}
            </div>
            <div className="text-sm text-muted-foreground">Listed</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/30 dark:border-purple-700/30">
            <div className="text-2xl font-bold text-gradient-warning mb-1">
              {fractionalizedCount}
            </div>
            <div className="text-sm text-muted-foreground">Fractionalized</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainStats;
