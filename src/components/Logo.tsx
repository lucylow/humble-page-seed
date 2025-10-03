import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  variant?: 'default' | 'minimal' | 'full';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  showTagline = false, 
  className,
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const taglineSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn('relative', sizeClasses[size])}>
          {/* Crown */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-blue-600 to-blue-800 rounded-t-sm">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
            <div className="absolute top-0 left-0 w-0.5 h-1 bg-yellow-400 rounded-l-sm"></div>
            <div className="absolute top-0 right-0 w-0.5 h-1 bg-yellow-400 rounded-r-sm"></div>
          </div>
          
          {/* Shield */}
          <div className="w-full h-full bg-gradient-to-b from-slate-600 to-slate-800 rounded-sm border border-slate-400 relative overflow-hidden">
            {/* Circuit Brain */}
            <div className="absolute inset-1">
              <svg viewBox="0 0 40 40" className="w-full h-full">
                {/* Brain outline */}
                <path
                  d="M8 12 Q12 8, 20 8 Q28 8, 32 12 Q32 16, 30 20 Q32 24, 30 28 Q28 32, 20 32 Q12 32, 10 28 Q8 24, 10 20 Q8 16, 8 12 Z"
                  fill="none"
                  stroke="#60A5FA"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
                {/* Circuit nodes */}
                <circle cx="12" cy="15" r="1" fill="#60A5FA" className="animate-pulse" />
                <circle cx="20" cy="12" r="1" fill="#60A5FA" className="animate-pulse" />
                <circle cx="28" cy="15" r="1" fill="#60A5FA" className="animate-pulse" />
                <circle cx="15" cy="20" r="1" fill="#60A5FA" className="animate-pulse" />
                <circle cx="25" cy="20" r="1" fill="#60A5FA" className="animate-pulse" />
                <circle cx="12" cy="25" r="1" fill="#60A5FA" className="animate-pulse" />
                <circle cx="20" cy="28" r="1" fill="#60A5FA" className="animate-pulse" />
                <circle cx="28" cy="25" r="1" fill="#60A5FA" className="animate-pulse" />
                {/* .com text */}
                <text x="20" y="22" textAnchor="middle" className="text-[6px] fill-[#60A5FA] font-bold">.com</text>
              </svg>
            </div>
          </div>
        </div>
        {showText && (
          <span className={cn('font-bold text-foreground', textSizeClasses[size])}>
            DomaLand.AI
          </span>
        )}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={cn('flex flex-col items-center gap-4', className)}>
        <div className={cn('relative', sizeClasses[size])}>
          {/* Crown */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-blue-600 to-blue-800 rounded-t-lg shadow-lg">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full shadow-sm"></div>
            <div className="absolute top-0 left-1 w-1 h-2 bg-yellow-400 rounded-l-lg"></div>
            <div className="absolute top-0 right-1 w-1 h-2 bg-yellow-400 rounded-r-lg"></div>
            <div className="absolute top-1 left-2 w-0.5 h-1 bg-yellow-300 rounded"></div>
            <div className="absolute top-1 right-2 w-0.5 h-1 bg-yellow-300 rounded"></div>
          </div>
          
          {/* Shield */}
          <div className="w-full h-full bg-slate-700 rounded-lg border-2 border-slate-400 shadow-xl relative overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full" style={{
                backgroundImage: `
                  linear-gradient(rgba(96, 165, 250, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(96, 165, 250, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '8px 8px'
              }}></div>
            </div>
            
            {/* Circuit Brain */}
            <div className="absolute inset-2">
              <svg viewBox="0 0 40 40" className="w-full h-full">
                {/* Brain outline */}
                <path
                  d="M8 12 Q12 8, 20 8 Q28 8, 32 12 Q32 16, 30 20 Q32 24, 30 28 Q28 32, 20 32 Q12 32, 10 28 Q8 24, 10 20 Q8 16, 8 12 Z"
                  fill="none"
                  stroke="#60A5FA"
                  strokeWidth="2"
                  className="animate-pulse drop-shadow-lg"
                />
                {/* Circuit connections */}
                <path d="M12 15 L20 12 L28 15" stroke="#60A5FA" strokeWidth="1" className="animate-pulse" />
                <path d="M15 20 L25 20" stroke="#60A5FA" strokeWidth="1" className="animate-pulse" />
                <path d="M12 25 L20 28 L28 25" stroke="#60A5FA" strokeWidth="1" className="animate-pulse" />
                <path d="M20 12 L20 28" stroke="#60A5FA" strokeWidth="1" className="animate-pulse" />
                {/* Circuit nodes */}
                <circle cx="12" cy="15" r="1.5" fill="#60A5FA" className="animate-pulse drop-shadow-sm" />
                <circle cx="20" cy="12" r="1.5" fill="#60A5FA" className="animate-pulse drop-shadow-sm" />
                <circle cx="28" cy="15" r="1.5" fill="#60A5FA" className="animate-pulse drop-shadow-sm" />
                <circle cx="15" cy="20" r="1.5" fill="#60A5FA" className="animate-pulse drop-shadow-sm" />
                <circle cx="25" cy="20" r="1.5" fill="#60A5FA" className="animate-pulse drop-shadow-sm" />
                <circle cx="12" cy="25" r="1.5" fill="#60A5FA" className="animate-pulse drop-shadow-sm" />
                <circle cx="20" cy="28" r="1.5" fill="#60A5FA" className="animate-pulse drop-shadow-sm" />
                <circle cx="28" cy="25" r="1.5" fill="#60A5FA" className="animate-pulse drop-shadow-sm" />
                {/* .com text */}
                <text x="20" y="22" textAnchor="middle" className="text-[8px] fill-[#60A5FA] font-bold drop-shadow-sm">.com</text>
              </svg>
            </div>
          </div>
        </div>
        
        {showText && (
          <div className="text-center">
            <h1 className={cn('font-bold text-foreground mb-2', textSizeClasses[size])}>
              DomaLand.AI
            </h1>
            {showTagline && (
              <p className={cn('text-blue-600 font-medium uppercase tracking-wide', taglineSizeClasses[size])}>
                WHERE DOMAINS BECOME DYNAMIC DIGITAL ASSETS POWERED BY AI
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        {/* Crown */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-3 bg-gradient-to-b from-blue-600 to-blue-800 rounded-t-md shadow-sm">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
          <div className="absolute top-0 left-0.5 w-0.5 h-1.5 bg-yellow-400 rounded-l-md"></div>
          <div className="absolute top-0 right-0.5 w-0.5 h-1.5 bg-yellow-400 rounded-r-md"></div>
        </div>
        
        {/* Shield */}
        <div className="w-full h-full bg-gradient-to-b from-slate-600 to-slate-800 rounded-md border border-slate-400 shadow-md relative overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(rgba(96, 165, 250, 0.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(96, 165, 250, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '6px 6px'
            }}></div>
          </div>
          
          {/* Circuit Brain */}
          <div className="absolute inset-1">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              {/* Brain outline */}
              <path
                d="M8 12 Q12 8, 20 8 Q28 8, 32 12 Q32 16, 30 20 Q32 24, 30 28 Q28 32, 20 32 Q12 32, 10 28 Q8 24, 10 20 Q8 16, 8 12 Z"
                fill="none"
                stroke="#60A5FA"
                strokeWidth="1.5"
                className="animate-pulse"
              />
              {/* Circuit connections */}
              <path d="M12 15 L20 12 L28 15" stroke="#60A5FA" strokeWidth="1" className="animate-pulse" />
              <path d="M15 20 L25 20" stroke="#60A5FA" strokeWidth="1" className="animate-pulse" />
              <path d="M12 25 L20 28 L28 25" stroke="#60A5FA" strokeWidth="1" className="animate-pulse" />
              {/* Circuit nodes */}
              <circle cx="12" cy="15" r="1" fill="#60A5FA" className="animate-pulse" />
              <circle cx="20" cy="12" r="1" fill="#60A5FA" className="animate-pulse" />
              <circle cx="28" cy="15" r="1" fill="#60A5FA" className="animate-pulse" />
              <circle cx="15" cy="20" r="1" fill="#60A5FA" className="animate-pulse" />
              <circle cx="25" cy="20" r="1" fill="#60A5FA" className="animate-pulse" />
              <circle cx="12" cy="25" r="1" fill="#60A5FA" className="animate-pulse" />
              <circle cx="20" cy="28" r="1" fill="#60A5FA" className="animate-pulse" />
              <circle cx="28" cy="25" r="1" fill="#60A5FA" className="animate-pulse" />
              {/* .com text */}
              <text x="20" y="22" textAnchor="middle" className="text-[6px] fill-[#60A5FA] font-bold">.com</text>
            </svg>
          </div>
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-bold text-foreground', textSizeClasses[size])}>
            DomaLand.AI
          </span>
          {showTagline && (
            <span className={cn('text-blue-600 font-medium uppercase tracking-wide', taglineSizeClasses[size])}>
              DYNAMIC DIGITAL ASSETS
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
