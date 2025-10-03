import React, { Suspense, ComponentType } from 'react';

interface LazyWrapperProps<P = Record<string, unknown>> {
  component: ComponentType<P>;
  fallback?: React.ReactNode;
  props?: P;
}

const LazyWrapper = <P extends Record<string, unknown>>({ 
  component: Component, 
  fallback = <div>Loading...</div>, 
  props 
}: LazyWrapperProps<P>) => {
  return (
    <Suspense fallback={fallback}>
      <Component {...(props || {} as P)} />
    </Suspense>
  );
};

export default LazyWrapper;