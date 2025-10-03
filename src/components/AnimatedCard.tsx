import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  hover = true,
  delay = 0,
  direction = 'up'
}) => {
  const directionClasses = {
    up: 'animate-slide-up',
    down: 'animate-slide-down',
    left: 'animate-slide-left',
    right: 'animate-slide-right'
  };

  const hoverClasses = hover ? 'hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10' : '';

  return (
    <Card
      className={cn(
        'transition-all duration-300 ease-out',
        directionClasses[direction],
        hoverClasses,
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }}
    >
      {children}
    </Card>
  );
};

export default AnimatedCard;
