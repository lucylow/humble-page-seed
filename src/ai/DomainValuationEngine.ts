// Optional TensorFlow.js import - will use fallback if not available
let tf: unknown = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  tf = require('@tensorflow/tfjs');
} catch (error) {
  console.warn('TensorFlow.js not available, using fallback models');
}

interface DomainData {
  name: string;
  registrationDate?: Date;
  priceHistory?: number[];
  traffic?: {
    monthlyVisitors?: number;
    bounceRate?: number;
    avgSessionDuration?: number;
  };
  tld: string;
  length: number;
}

interface MarketContext {
  industryTrend: number;
  marketVolatility: number;
  competitorDensity: number;
  searchVolume: number;
}

interface ValuationFeatures {
  linguistic: {
    length: number;
    syllableCount: number;
    keywordDensity: number;
    brandabilityScore: number;
    phoneticScore: number;
  };
  market: {
    tldPopularity: number;
    industryTrend: number;
    searchVolume: number;
    competitorDensity: number;
  };
  historical: {
    age: number;
    previousSales: number[];
    priceAppreciation: number;
  };
  technical: {
    trafficQuality: number;
    seoPotential: number;
    mobileScore: number;
  };
}

interface ValuationResult {
  value: number;
  confidence: number;
  valueDrivers: string[];
  comparableDomains: string[];
  marketInsights: string[];
}

class AIValuationEngine {
  private valuationModel: unknown = null;
  private keywordModel: unknown = null;
  private trendModel: unknown = null;
  private initialized = false;

  constructor() {
    this.initializeModels();
  }

  private async initializeModels(): Promise<void> {
    try {
      console.log('🧠 Initializing AI Valuation Engine...');
      
      if (tf) {
        // Load pre-trained valuation model
        this.valuationModel = await (tf as any).loadLayersModel(
          'https://storage.googleapis.com/domaland-models/valuation/v2/model.json'
        );
        
        // Load complementary models
        this.keywordModel = await this.loadKeywordAnalysisModel();
        this.trendModel = await this.loadMarketTrendModel();
        
        this.initialized = true;
        console.log('✅ AI Valuation Engine initialized successfully');
      } else {
        this.initializeFallbackModels();
      }
    } catch (error) {
      console.warn('⚠️ Using fallback valuation model:', error);
      this.initializeFallbackModels();
    }
  }

  private async loadKeywordAnalysisModel(): Promise<unknown> {
    if (!tf) return null;
    
    // Fallback keyword analysis model
    const model = (tf as any).sequential({
      layers: [
        (tf as any).layers.dense({ inputShape: [10], units: 32, activation: 'relu' }),
        (tf as any).layers.dense({ units: 16, activation: 'relu' }),
        (tf as any).layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });
    return model;
  }

  private async loadMarketTrendModel(): Promise<unknown> {
    if (!tf) return null;
    
    // Fallback trend analysis model
    const model = (tf as any).sequential({
      layers: [
        (tf as any).layers.dense({ inputShape: [8], units: 24, activation: 'relu' }),
        (tf as any).layers.dense({ units: 12, activation: 'relu' }),
        (tf as any).layers.dense({ units: 1, activation: 'linear' })
      ]
    });
    return model;
  }

  private initializeFallbackModels(): void {
    this.initialized = true;
    console.log('🔄 Using fallback AI models for valuation');
  }

  async valuateDomain(domainData: DomainData, marketContext: MarketContext): Promise<ValuationResult> {
    if (!this.initialized) {
      await this.initializeModels();
    }

    console.log(`🔍 Valuating domain: ${domainData.name}`);

    // Extract multi-dimensional features
    const features = await this.extractValuationFeatures(domainData, marketContext);
    
    // Get predictions from ensemble of models
    const [baseValue, trendAdjustment, sentimentScore] = await Promise.all([
      this.predictBaseValue(features),
      this.calculateTrendAdjustment(features),
      this.analyzeMarketSentiment(features)
    ]);

    // Calculate final valuation with confidence scoring
    const finalValuation = this.calculateFinalValuation(
      baseValue, 
      trendAdjustment, 
      sentimentScore
    );

    const result: ValuationResult = {
      value: finalValuation,
      confidence: this.calculateConfidenceScore(features),
      valueDrivers: this.extractValueDrivers(features),
      comparableDomains: this.findComparables(domainData.name),
      marketInsights: this.generateMarketInsights(features)
    };

    console.log(`💰 Domain ${domainData.name} valued at $${finalValuation.toFixed(2)}`);
    return result;
  }

  private async extractValuationFeatures(domainData: DomainData, marketContext: MarketContext): Promise<ValuationFeatures> {
    const baseName = domainData.name.split('.')[0];
    
    const features: ValuationFeatures = {
      linguistic: {
        length: domainData.name.length,
        syllableCount: this.countSyllables(baseName),
        keywordDensity: this.analyzeKeywords(baseName),
        brandabilityScore: this.calculateBrandability(baseName),
        phoneticScore: this.analyzePhonetics(baseName)
      },
      
      market: {
        tldPopularity: await this.getTLDPopularity(domainData.tld),
        industryTrend: marketContext.industryTrend,
        searchVolume: marketContext.searchVolume,
        competitorDensity: marketContext.competitorDensity
      },
      
      historical: {
        age: this.calculateDomainAge(domainData.registrationDate),
        previousSales: domainData.priceHistory || [],
        priceAppreciation: this.calculateAppreciation(domainData.priceHistory || [])
      },
      
      technical: {
        trafficQuality: domainData.traffic?.bounceRate ? 1 - domainData.traffic.bounceRate : 0.5,
        seoPotential: this.calculateSEOPotential(baseName),
        mobileScore: this.analyzeMobileFriendliness(baseName)
      }
    };

    return features;
  }

  private countSyllables(word: string): number {
    const vowels = 'aeiouy';
    let count = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i].toLowerCase());
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }
    
    return Math.max(1, count);
  }

  private analyzeKeywords(domainName: string): number {
    const premiumKeywords = ['crypto', 'nft', 'meta', 'web3', 'defi', 'blockchain', 'ai', 'tech', 'app', 'hub'];
    const baseName = domainName.toLowerCase();
    
    let score = 0;
    premiumKeywords.forEach(keyword => {
      if (baseName.includes(keyword)) {
        score += 0.2;
      }
    });
    
    return Math.min(1, score);
  }

  private calculateBrandability(domainName: string): number {
    const baseName = domainName.split('.')[0];
    
    const brandableFactors = {
      length: Math.max(0, 1 - (baseName.length - 6) / 10), // Optimal 6 characters
      pronounceability: this.analyzePronounceability(baseName),
      memorability: this.calculateMemorability(baseName),
      uniqueness: this.calculateUniqueness(baseName)
    };
    
    return Object.values(brandableFactors).reduce((sum, score) => sum + score, 0) / 
           Object.values(brandableFactors).length;
  }

  private analyzePronounceability(word: string): number {
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    const vowels = 'aeiou';
    let consonantClusters = 0;
    
    for (let i = 0; i < word.length - 1; i++) {
      if (consonants.includes(word[i]) && consonants.includes(word[i + 1])) {
        consonantClusters++;
      }
    }
    
    return Math.max(0, 1 - consonantClusters / word.length);
  }

  private calculateMemorability(word: string): number {
    const uniqueChars = new Set(word.toLowerCase()).size;
    const length = word.length;
    
    // Optimal memorability: 4-8 characters with good character diversity
    const lengthScore = Math.max(0, 1 - Math.abs(length - 6) / 6);
    const diversityScore = uniqueChars / length;
    
    return (lengthScore + diversityScore) / 2;
  }

  private calculateUniqueness(word: string): number {
    // Simple uniqueness based on character patterns
    const patterns = this.extractCharacterPatterns(word);
    return 1 - (patterns.repeated / word.length);
  }

  private extractCharacterPatterns(word: string): { repeated: number; unique: number } {
    const charCount: { [key: string]: number } = {};
    
    for (const char of word.toLowerCase()) {
      charCount[char] = (charCount[char] || 0) + 1;
    }
    
    const repeated = Object.values(charCount).filter(count => count > 1).length;
    const unique = Object.keys(charCount).length;
    
    return { repeated, unique };
  }

  private analyzePhonetics(word: string): number {
    // Simple phonetic analysis based on vowel-consonant patterns
    const vowels = 'aeiou';
    let vowelCount = 0;
    
    for (const char of word.toLowerCase()) {
      if (vowels.includes(char)) {
        vowelCount++;
      }
    }
    
    const vowelRatio = vowelCount / word.length;
    return Math.max(0, 1 - Math.abs(vowelRatio - 0.4)); // Optimal vowel ratio ~40%
  }

  private async getTLDPopularity(tld: string): Promise<number> {
    const tldPopularity: { [key: string]: number } = {
      'com': 1.0,
      'org': 0.8,
      'net': 0.7,
      'io': 0.9,
      'ai': 0.95,
      'eth': 0.85,
      'crypto': 0.9,
      'nft': 0.9,
      'web3': 0.9,
      'defi': 0.85
    };
    
    return tldPopularity[tld.toLowerCase()] || 0.5;
  }

  private calculateDomainAge(registrationDate?: Date): number {
    if (!registrationDate) return 0;
    
    const now = new Date();
    const ageInYears = (now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    // Age score: peaks at 5 years, then slightly decreases
    return Math.min(1, ageInYears / 5);
  }

  private calculateAppreciation(priceHistory: number[]): number {
    if (priceHistory.length < 2) return 0;
    
    const firstPrice = priceHistory[0];
    const lastPrice = priceHistory[priceHistory.length - 1];
    
    return (lastPrice - firstPrice) / firstPrice;
  }

  private calculateSEOPotential(domainName: string): number {
    const seoFactors = {
      keywordRelevance: this.analyzeKeywords(domainName),
      length: Math.max(0, 1 - (domainName.length - 10) / 20), // Optimal 10 chars
      readability: this.analyzeReadability(domainName),
      brandability: this.calculateBrandability(domainName)
    };
    
    return Object.values(seoFactors).reduce((sum, score) => sum + score, 0) / 
           Object.values(seoFactors).length;
  }

  private analyzeReadability(word: string): number {
    const syllables = this.countSyllables(word);
    const length = word.length;
    
    // Flesch Reading Ease approximation
    const score = 206.835 - (1.015 * length) - (84.6 * syllables / length);
    return Math.max(0, Math.min(1, score / 100));
  }

  private analyzeMobileFriendliness(domainName: string): number {
    const length = domainName.length;
    const hasNumbers = /\d/.test(domainName);
    const hasHyphens = domainName.includes('-');
    
    let score = 1;
    if (length > 15) score -= 0.3;
    if (hasNumbers) score -= 0.2;
    if (hasHyphens) score -= 0.1;
    
    return Math.max(0, score);
  }

  private async predictBaseValue(features: ValuationFeatures): Promise<number> {
    if (this.valuationModel) {
      try {
        const inputTensor = this.featuresToTensor(features);
        const prediction = (this.valuationModel as any).predict(inputTensor) as any;
        const value = await prediction.data();
        prediction.dispose();
        (inputTensor as any).dispose();
        return value[0] * 10000; // Scale to USD
      } catch (error) {
        console.warn('Model prediction failed, using fallback:', error);
      }
    }
    
    // Fallback calculation
    return this.calculateFallbackValue(features);
  }

  private featuresToTensor(features: ValuationFeatures): unknown {
    if (!tf) return null;
    
    const featureArray = [
      features.linguistic.length,
      features.linguistic.syllableCount,
      features.linguistic.keywordDensity,
      features.linguistic.brandabilityScore,
      features.linguistic.phoneticScore,
      features.market.tldPopularity,
      features.market.industryTrend,
      features.market.searchVolume,
      features.market.competitorDensity,
      features.historical.age,
      features.historical.priceAppreciation,
      features.technical.trafficQuality,
      features.technical.seoPotential,
      features.technical.mobileScore
    ];
    
    return (tf as any).tensor2d([featureArray], [1, featureArray.length]);
  }

  private calculateFallbackValue(features: ValuationFeatures): number {
    const baseValue = 1000; // Base value in USD
    
    const multipliers = {
      brandability: features.linguistic.brandabilityScore * 3,
      keyword: features.linguistic.keywordDensity * 2,
      tld: features.market.tldPopularity * 2,
      age: features.historical.age * 1.5,
      seo: features.technical.seoPotential * 1.5,
      traffic: features.technical.trafficQuality * 2
    };
    
    const totalMultiplier = Object.values(multipliers).reduce((sum, mult) => sum + mult, 1);
    
    return baseValue * totalMultiplier;
  }

  private async calculateTrendAdjustment(features: ValuationFeatures): Promise<number> {
    // Simple trend adjustment based on market factors
    const trendFactors = {
      industryTrend: features.market.industryTrend,
      searchVolume: Math.min(1, features.market.searchVolume / 10000),
      competitorDensity: 1 - features.market.competitorDensity
    };
    
    const trendScore = Object.values(trendFactors).reduce((sum, factor) => sum + factor, 0) / 
                      Object.values(trendFactors).length;
    
    return trendScore * 0.2; // 20% max adjustment
  }

  private async analyzeMarketSentiment(features: ValuationFeatures): Promise<number> {
    // Simple sentiment analysis based on domain characteristics
    const sentimentFactors = {
      brandability: features.linguistic.brandabilityScore,
      keywordRelevance: features.linguistic.keywordDensity,
      marketPosition: 1 - features.market.competitorDensity,
      technicalQuality: features.technical.seoPotential
    };
    
    return Object.values(sentimentFactors).reduce((sum, factor) => sum + factor, 0) / 
           Object.values(sentimentFactors).length;
  }

  private calculateFinalValuation(baseValue: number, trendAdjustment: number, sentimentScore: number): number {
    const adjustedValue = baseValue * (1 + trendAdjustment);
    const sentimentMultiplier = 0.8 + (sentimentScore * 0.4); // 0.8 to 1.2 range
    
    return adjustedValue * sentimentMultiplier;
  }

  private calculateConfidenceScore(features: ValuationFeatures): number {
    const confidenceFactors = {
      dataCompleteness: this.calculateDataCompleteness(features),
      marketStability: 1 - features.market.competitorDensity,
      historicalData: features.historical.previousSales.length > 0 ? 1 : 0.5,
      technicalMetrics: features.technical.trafficQuality > 0 ? 1 : 0.7
    };
    
    return Object.values(confidenceFactors).reduce((sum, factor) => sum + factor, 0) / 
           Object.values(confidenceFactors).length;
  }

  private calculateDataCompleteness(features: ValuationFeatures): number {
    let completeness = 0;
    let totalFactors = 0;
    
    // Check each feature category
    Object.values(features).forEach(category => {
      Object.values(category).forEach(value => {
        totalFactors++;
        if (value !== undefined && value !== null && typeof value === 'number' && !isNaN(value)) {
          completeness++;
        }
      });
    });
    
    return completeness / totalFactors;
  }

  private extractValueDrivers(features: ValuationFeatures): string[] {
    const drivers: string[] = [];
    
    if (features.linguistic.brandabilityScore > 0.7) {
      drivers.push('High brandability potential');
    }
    
    if (features.linguistic.keywordDensity > 0.5) {
      drivers.push('Strong keyword relevance');
    }
    
    if (features.market.tldPopularity > 0.8) {
      drivers.push('Premium TLD extension');
    }
    
    if (features.historical.age > 0.5) {
      drivers.push('Established domain age');
    }
    
    if (features.technical.seoPotential > 0.7) {
      drivers.push('Excellent SEO potential');
    }
    
    if (features.technical.trafficQuality > 0.6) {
      drivers.push('Quality traffic metrics');
    }
    
    return drivers.length > 0 ? drivers : ['Standard domain characteristics'];
  }

  private findComparables(domainName: string): string[] {
    // Simple comparable domain suggestions
    const baseName = domainName.split('.')[0];
    const tld = domainName.split('.')[1];
    
    const comparables = [
      `${baseName}.com`,
      `${baseName}.org`,
      `${baseName}.net`,
      `${baseName}.io`
    ].filter(domain => domain !== domainName);
    
    return comparables.slice(0, 3);
  }

  private generateMarketInsights(features: ValuationFeatures): string[] {
    const insights: string[] = [];
    
    if (features.market.industryTrend > 0.7) {
      insights.push('Strong upward industry trend');
    }
    
    if (features.market.searchVolume > 5000) {
      insights.push('High search volume indicates market demand');
    }
    
    if (features.market.competitorDensity < 0.3) {
      insights.push('Low competition in this niche');
    }
    
    if (features.historical.priceAppreciation > 0.2) {
      insights.push('Positive price appreciation trend');
    }
    
    return insights.length > 0 ? insights : ['Standard market conditions'];
  }
}

export default AIValuationEngine;
export type { DomainData, MarketContext, ValuationResult };
