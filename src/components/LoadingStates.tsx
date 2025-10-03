import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Enhanced skeleton with shimmer effect
const ShimmerSkeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <Skeleton className="h-full w-full" />
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  </div>
);

export const MetricCardSkeleton: React.FC = () => (
  <Card className="card-elevated group">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <ShimmerSkeleton className="h-4 w-24" />
      <ShimmerSkeleton className="h-6 w-6 rounded-full" />
    </CardHeader>
    <CardContent>
      <ShimmerSkeleton className="h-8 w-16 mb-2" />
      <ShimmerSkeleton className="h-3 w-20" />
    </CardContent>
  </Card>
);

export const DomainCardSkeleton: React.FC = () => (
  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border/50 animate-pulse">
    <div className="space-y-2">
      <ShimmerSkeleton className="h-4 w-24" />
      <ShimmerSkeleton className="h-3 w-16" />
    </div>
    <div className="space-y-2">
      <ShimmerSkeleton className="h-4 w-12" />
      <ShimmerSkeleton className="h-6 w-12" />
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-32" />
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="card-elevated">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <DomainCardSkeleton key={j} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

export const LandingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-background text-foreground">
    {/* Header Skeleton */}
    <header className="fixed top-0 w-full bg-card border-b border-border z-50">
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center py-4">
          <Skeleton className="h-8 w-24" />
          <div className="hidden md:flex gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-16" />
            ))}
          </div>
          <Skeleton className="h-10 w-24" />
        </nav>
      </div>
    </header>

    {/* Hero Section Skeleton */}
    <section className="pt-32 pb-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 text-center">
        <Skeleton className="h-16 w-96 mx-auto mb-6" />
        <Skeleton className="h-6 w-80 mx-auto mb-8" />
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    </section>

    {/* Features Section Skeleton */}
    <section className="py-20 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-card p-6 rounded-lg border border-border">
              <Skeleton className="h-12 w-12 mb-4" />
              <Skeleton className="h-6 w-32 mb-3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  </div>
);
