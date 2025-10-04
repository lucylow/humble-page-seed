import { LucideIcon, ArrowUp, ArrowDown } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  progress: number;
  trend: string;
  trendUp: boolean;
  variant?: 'primary' | 'warning' | 'success';
}

export const StatsCard = ({ 
  icon: Icon, 
  value, 
  label, 
  progress, 
  trend, 
  trendUp,
  variant = 'primary' 
}: StatsCardProps) => {
  const borderColors = {
    primary: 'border-l-primary',
    warning: 'border-l-accent',
    success: 'border-l-secondary',
  };

  const iconBgColors = {
    primary: 'bg-primary/10 text-primary',
    warning: 'bg-accent/10 text-accent',
    success: 'bg-secondary/10 text-secondary',
  };

  const progressColors = {
    primary: 'bg-primary',
    warning: 'bg-accent',
    success: 'bg-secondary',
  };

  return (
    <div className={`bg-card rounded-xl p-6 shadow-sm border-l-4 ${borderColors[variant]} border-r border-t border-b border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-12 h-12 rounded-lg ${iconBgColors[variant]} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
            <div className="text-sm text-muted-foreground font-medium">{label}</div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${progressColors[variant]} rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${trendUp ? 'text-secondary' : 'text-destructive'}`}>
          {trendUp ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          <span>{trend}</span>
        </div>
      </div>
    </div>
  );
};
