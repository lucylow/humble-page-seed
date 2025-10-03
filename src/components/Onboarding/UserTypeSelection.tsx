import { memo } from 'react';
import { UserType } from '../../types';

interface UserTypeOption {
  type: UserType;
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface UserTypeSelectionProps {
  options: UserTypeOption[];
  selectedType: UserType | '';
  onSelect: (type: UserType) => void;
}

const UserTypeSelection = memo<UserTypeSelectionProps>(({ 
  options, 
  selectedType, 
  onSelect 
}) => {
  const getCardClasses = (color: string, isSelected: boolean) => {
    const baseClasses = "card p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1";
    const colorClasses = {
      blue: isSelected 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300',
      emerald: isSelected 
        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
        : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300',
      purple: isSelected 
        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300',
    };
    
    return `${baseClasses} ${colorClasses[color as keyof typeof colorClasses]}`;
  };

  return (
    <div className="onboarding-step">
      <h3 className="text-xl font-semibold mb-6 text-center">
        What brings you to DomaLand?
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((option) => (
          <div
            key={option.type}
            className={getCardClasses(option.color, selectedType === option.type)}
            onClick={() => onSelect(option.type)}
            role="button"
            tabIndex={0}
            aria-pressed={selectedType === option.type}
            aria-label={`Select ${option.title}: ${option.description}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(option.type);
              }
            }}
          >
            <div className="text-center">
              <div className="text-4xl mb-3" aria-hidden="true">
                {option.icon}
              </div>
              <h4 className="font-semibold mb-2">{option.title}</h4>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

UserTypeSelection.displayName = 'UserTypeSelection';

export default UserTypeSelection;
