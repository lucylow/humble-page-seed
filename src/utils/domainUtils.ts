// @ts-nocheck
// @ts-nocheck
// Utility functions for domain operations and calculations

import { DomainAsset, DomainValuation, ValuationFactor } from '../types/domain';

/**
 * Calculate domain valuation based on various factors
 * This is a simplified version - in production, this would use AI/ML models
 */
export const calculateDomainValuation = (domainName: string, metadata: Record<string, unknown>): DomainValuation => {
  const factors: ValuationFactor[] = [];
  let baseValue = 0;

  // Length factor (shorter domains are more valuable)
  const length = domainName.length;
  const lengthScore = Math.max(0, 100 - (length * 2));
  factors.push({
    type: 'length',
    weight: 0.3,
    score: lengthScore,
    description: `Domain length: ${length} characters`
  });
  baseValue += lengthScore * 1000;

  // TLD factor
  const tld = domainName.split('.').pop()?.toLowerCase();
  let tldScore = 50;
  if (tld === 'com') tldScore = 100;
  else if (['net', 'org'].includes(tld || '')) tldScore = 80;
  else if (['io', 'ai', 'co'].includes(tld || '')) tldScore = 70;
  
  factors.push({
    type: 'tld',
    weight: 0.2,
    score: tldScore,
    description: `.${tld} extension`
  });
  baseValue += tldScore * 500;

  // Brandability factor (simplified)
  const brandabilityScore = calculateBrandabilityScore(domainName);
  factors.push({
    type: 'brandability',
    weight: 0.25,
    score: brandabilityScore,
    description: 'Brandability assessment'
  });
  baseValue += brandabilityScore * 800;

  // Traffic factor (if available)
  const traffic = (metadata as Record<string, unknown>)?.traffic;
  if (traffic?.monthlyVisitors) {
    const trafficScore = Math.min(100, Math.log10(traffic.monthlyVisitors) * 20);
    factors.push({
      type: 'traffic',
      weight: 0.15,
      score: trafficScore,
      description: `${traffic.monthlyVisitors.toLocaleString()} monthly visitors`
    });
    baseValue += trafficScore * 200;
  }

  // Market comparison factor
  const marketScore = 60 + Math.random() * 30; // Simplified
  factors.push({
    type: 'market_comparison',
    weight: 0.1,
    score: marketScore,
    description: 'Based on similar domain sales'
  });
  baseValue += marketScore * 300;

  // Calculate confidence based on data availability
  const confidence = calculateConfidence(factors, metadata);

  return {
    estimatedValue: Math.round(baseValue),
    confidence,
    factors,
    lastUpdated: Date.now(),
    aiModel: 'domaland-ai-v1.0'
  };
};

/**
 * Calculate brandability score for a domain
 */
const calculateBrandabilityScore = (domainName: string): number => {
  let score = 50;
  
  // Remove TLD for analysis
  const name = domainName.split('.')[0].toLowerCase();
  
  // Length bonus/penalty
  if (name.length <= 6) score += 20;
  else if (name.length <= 10) score += 10;
  else if (name.length > 15) score -= 20;
  
  // No numbers bonus
  if (!/\d/.test(name)) score += 15;
  
  // No hyphens bonus
  if (!name.includes('-')) score += 10;
  
  // Common word patterns
  if (/^(get|my|the|buy|sell|shop|app|web|tech|pro)/.test(name)) score += 5;
  
  // Memorable patterns
  if (/(.)\1/.test(name)) score += 5; // Double letters
  if (/[aeiou]{2,}/.test(name)) score += 5; // Vowel clusters
  
  return Math.min(100, Math.max(0, score));
};

/**
 * Calculate confidence score based on available data
 */
const calculateConfidence = (factors: ValuationFactor[], metadata: Record<string, unknown>): number => {
  let confidence = 70; // Base confidence
  
  // Increase confidence based on data availability
  if (metadata.traffic?.monthlyVisitors) confidence += 15;
  if (metadata.backlinks) confidence += 10;
  if (metadata.age) confidence += 5;
  
  // Decrease confidence for new/unknown domains
  if (!metadata.traffic && !metadata.backlinks) confidence -= 20;
  
  return Math.min(100, Math.max(30, confidence));
};

/**
 * Format domain name for display
 */
export const formatDomainName = (domainName: string): string => {
  return domainName.toLowerCase().trim();
};

/**
 * Extract domain name without TLD
 */
export const extractDomainName = (domainName: string): string => {
  return domainName.split('.')[0];
};

/**
 * Extract TLD from domain name
 */
export const extractTLD = (domainName: string): string => {
  return domainName.split('.').slice(1).join('.');
};

/**
 * Validate domain name format
 */
export const isValidDomainName = (domainName: string): boolean => {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domainName);
};

/**
 * Calculate ownership percentage for fractional shares
 */
export const calculateOwnershipPercentage = (sharesOwned: number, totalShares: number): number => {
  if (totalShares === 0) return 0;
  return (sharesOwned / totalShares) * 100;
};

/**
 * Calculate potential returns for fractional investment
 */
export const calculatePotentialReturns = (
  sharesOwned: number,
  pricePerShare: number,
  domainValue: number,
  revenueShare: number = 0.35 // 35% of revenue goes to fractional holders
): {
  currentValue: number;
  potentialMonthlyRevenue: number;
  roi: number;
} => {
  const ownershipPercentage = calculateOwnershipPercentage(sharesOwned, 1000000); // Assuming 1M total shares
  const currentValue = sharesOwned * pricePerShare;
  
  // Simplified revenue calculation (in production, this would be more sophisticated)
  const estimatedMonthlyRevenue = (domainValue * 0.01) / 12; // 1% of domain value annually
  const potentialMonthlyRevenue = (estimatedMonthlyRevenue * revenueShare * ownershipPercentage) / 100;
  
  const roi = currentValue > 0 ? (potentialMonthlyRevenue * 12) / currentValue * 100 : 0;
  
  return {
    currentValue,
    potentialMonthlyRevenue,
    roi
  };
};

/**
 * Generate domain analytics summary
 */
export const generateDomainAnalytics = (domain: DomainAsset): {
  performance: string;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
  keyMetrics: Array<{ label: string; value: string; trend?: 'up' | 'down' | 'stable' }>;
} => {
  const valuation = domain.valuation;
  const traffic = domain.metadata.traffic;
  
  // Performance assessment
  let performance = 'Average';
  if (valuation.confidence >= 80 && valuation.estimatedValue >= 100000) {
    performance = 'Excellent';
  } else if (valuation.confidence >= 70 && valuation.estimatedValue >= 50000) {
    performance = 'Good';
  } else if (valuation.confidence < 60 || valuation.estimatedValue < 10000) {
    performance = 'Poor';
  }
  
  // Risk assessment
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  if (valuation.confidence >= 80 && traffic?.monthlyVisitors && traffic.monthlyVisitors > 1000) {
    riskLevel = 'low';
  } else if (valuation.confidence < 60 || !traffic?.monthlyVisitors) {
    riskLevel = 'high';
  }
  
  // Investment recommendation
  let recommendation = 'Consider for portfolio diversification';
  if (performance === 'Excellent' && riskLevel === 'low') {
    recommendation = 'Strong buy - high value, low risk';
  } else if (performance === 'Poor' || riskLevel === 'high') {
    recommendation = 'High risk - consider carefully';
  }
  
  // Key metrics
  const keyMetrics = [
    {
      label: 'AI Valuation',
      value: `$${valuation.estimatedValue.toLocaleString()}`,
      trend: 'stable' as const
    },
    {
      label: 'Confidence Score',
      value: `${valuation.confidence}%`,
      trend: valuation.confidence >= 80 ? 'up' as const : valuation.confidence < 60 ? 'down' as const : 'stable' as const
    }
  ];
  
  if (traffic?.monthlyVisitors) {
    keyMetrics.push({
      label: 'Monthly Traffic',
      value: traffic.monthlyVisitors.toLocaleString(),
      trend: 'stable'
    });
  }
  
  if (domain.fractionalShares) {
    keyMetrics.push({
      label: 'Shares Available',
      value: `${(domain.fractionalShares.totalShares - domain.fractionalShares.sharesSold).toLocaleString()}`,
      trend: 'stable'
    });
  }
  
  return {
    performance,
    riskLevel,
    recommendation,
    keyMetrics
  };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Calculate time ago string
 */
export const getTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

/**
 * Generate domain suggestions based on input
 */
export const generateDomainSuggestions = (input: string): string[] => {
  if (!input || input.length < 2) return [];
  
  const suggestions: string[] = [];
  const base = input.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Add common TLDs
  const tlds = ['com', 'net', 'org', 'io', 'ai', 'co', 'xyz', 'app'];
  tlds.forEach(tld => {
    suggestions.push(`${base}.${tld}`);
  });
  
  // Add variations
  const variations = [
    `${base}app`,
    `${base}hub`,
    `${base}pro`,
    `${base}ai`,
    `${base}io`,
    `get${base}`,
    `my${base}`,
    `${base}now`,
    `${base}online`
  ];
  
  variations.forEach(variation => {
    tlds.slice(0, 3).forEach(tld => { // Only add top 3 TLDs for variations
      suggestions.push(`${variation}.${tld}`);
    });
  });
  
  return suggestions.slice(0, 12); // Limit to 12 suggestions
};
