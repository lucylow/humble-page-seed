// Performance optimization utilities for DomaLand

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';

// Debounce hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: any[]) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
};

// Virtual scrolling hook
export const useVirtualScroll = (
  items: any[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);

  const totalHeight = items.length * itemHeight;
  const offsetY = Math.floor(scrollTop / itemHeight) * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  };
};

// Memoized selector hook
export const useMemoizedSelector = <T, R>(
  selector: (state: T) => R,
  state: T,
  deps?: React.DependencyList
): R => {
  return useMemo(() => selector(state), deps ? [state, ...deps] : [state]);
};

// Batch updates hook
export const useBatchedUpdates = () => {
  const updatesRef = useRef<(() => void)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchUpdate = useCallback((update: () => void) => {
    updatesRef.current.push(update);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const updates = updatesRef.current;
      updatesRef.current = [];

      // Batch all updates
      React.startTransition(() => {
        updates.forEach(update => update());
      });
    }, 0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
};

// Image lazy loading hook
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setIsError(true);
    };
    
    img.src = src;
  }, [src]);

  return { imageSrc, isLoaded, isError };
};

// Performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const renderStart = useRef<number>();
  const renderCount = useRef(0);

  useEffect(() => {
    renderStart.current = performance.now();
    renderCount.current += 1;

    return () => {
      if (renderStart.current) {
        const renderTime = performance.now() - renderStart.current;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
        }

        // Log slow renders
        if (renderTime > 16) { // 60fps threshold
          console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
      }
    };
  });
};

// Bundle size optimization
export const lazyImport = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> => {
  return React.lazy(importFunc);
};

// Memory optimization
export const useMemoryOptimization = () => {
  const cleanupFunctions = useRef<(() => void)[]>([]);

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.push(cleanup);
  }, []);

  useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach(cleanup => cleanup());
      cleanupFunctions.current = [];
    };
  }, []);

  return addCleanup;
};

// Cache utilities
export const createCache = <K, V>(maxSize: number = 100) => {
  const cache = new Map<K, V>();
  const accessOrder = new Map<K, number>();
  let accessCounter = 0;

  const get = (key: K): V | undefined => {
    if (cache.has(key)) {
      accessOrder.set(key, ++accessCounter);
      return cache.get(key);
    }
    return undefined;
  };

  const set = (key: K, value: V): void => {
    if (cache.size >= maxSize && !cache.has(key)) {
      // Remove least recently used item
      let lruKey: K | undefined;
      let minAccess = Infinity;

      for (const [k, access] of accessOrder.entries()) {
        if (access < minAccess) {
          minAccess = access;
          lruKey = k;
        }
      }

      if (lruKey !== undefined) {
        cache.delete(lruKey);
        accessOrder.delete(lruKey);
      }
    }

    cache.set(key, value);
    accessOrder.set(key, ++accessCounter);
  };

  const clear = (): void => {
    cache.clear();
    accessOrder.clear();
    accessCounter = 0;
  };

  return { get, set, clear, size: () => cache.size };
};

// Bundle analyzer helper
export const analyzeBundle = () => {
  if (process.env.NODE_ENV === 'development') {
    // This would integrate with webpack-bundle-analyzer
    console.log('Bundle analysis available in development mode');
  }
};

// Performance metrics
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`${name} took ${(end - start).toFixed(2)} milliseconds`);
  }
  
  return end - start;
};

// Async performance measurement
export const measureAsyncPerformance = async (name: string, fn: () => Promise<any>) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`${name} took ${(end - start).toFixed(2)} milliseconds`);
  }
  
  return { result, duration: end - start };
};
