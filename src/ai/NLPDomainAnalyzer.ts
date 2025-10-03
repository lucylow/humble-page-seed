interface LinguisticAnalysis {
  semanticMeaning: {
    embeddings: number[];
    primaryMeaning: string;
    secondaryMeanings: string[];
    ambiguityScore: number;
  };
  keywords: {
    primaryKeywords: string[];
    secondaryKeywords: string[];
    keywordDensity: number;
    semanticRichness: number;
  };
  sentiment: {
    score: number;
    confidence: number;
    emotionalTone: string;
  };
  culturalRelevance: {
    score: number;
    culturalContexts: string[];
    globalAppeal: number;
  };
  industryAssociation: {
    score: number;
    industries: string[];
    marketPosition: string;
  };
  linguisticScore: number;
}

interface SemanticCluster {
  meaning: string;
  confidence: number;
  context: string[];
}

class NLPDomainAnalyzer {
  private wordTokenizer: (text: string) => string[];
  private stemmer: (word: string) => string;
  private sentimentAnalyzer: (text: string) => { score: number; confidence: number };
  private initialized = false;

  constructor() {
    this.initializeNLP();
  }

  private initializeNLP(): void {
    // Simple tokenizer implementation
    this.wordTokenizer = (text: string) => {
      return text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 0);
    };

    // Simple stemmer implementation
    this.stemmer = (word: string) => {
      const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'sion', 'ness', 'ment'];
      for (const suffix of suffixes) {
        if (word.endsWith(suffix) && word.length > suffix.length + 2) {
          return word.slice(0, -suffix.length);
        }
      }
      return word;
    };

    // Simple sentiment analyzer
    this.sentimentAnalyzer = (text: string) => {
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'fantastic', 'awesome', 'best', 'top', 'premium', 'quality'];
      const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'poor', 'cheap', 'low', 'negative', 'problem', 'issue'];
      
      const tokens = this.wordTokenizer(text);
      let positiveCount = 0;
      let negativeCount = 0;
      
      tokens.forEach(token => {
        if (positiveWords.includes(token)) positiveCount++;
        if (negativeWords.includes(token)) negativeCount++;
      });
      
      const totalSentimentWords = positiveCount + negativeCount;
      if (totalSentimentWords === 0) {
        return { score: 0.5, confidence: 0.1 };
      }
      
      const score = positiveCount / totalSentimentWords;
      const confidence = Math.min(1, totalSentimentWords / tokens.length * 10);
      
      return { score, confidence };
    };

    this.initialized = true;
    console.log('✅ NLP Domain Analyzer initialized');
  }

  async analyzeDomainLinguistics(domainName: string): Promise<LinguisticAnalysis> {
    if (!this.initialized) {
      this.initializeNLP();
    }

    console.log(`🔍 Analyzing linguistics for domain: ${domainName}`);

    const baseName = domainName.split('.')[0];
    
    const analysis = await Promise.all([
      this.analyzeSemanticMeaning(baseName),
      this.extractKeywords(baseName),
      this.analyzeSentiment(baseName),
      this.calculateCulturalRelevance(baseName),
      this.identifyIndustryAssociation(baseName)
    ]);

    const linguisticScore = this.calculateLinguisticScore(analysis);

    return {
      semanticMeaning: analysis[0],
      keywords: analysis[1],
      sentiment: analysis[2],
      culturalRelevance: analysis[3],
      industryAssociation: analysis[4],
      linguisticScore
    };
  }

  private async analyzeSemanticMeaning(text: string): Promise<LinguisticAnalysis['semanticMeaning']> {
    const embeddings = this.generateEmbeddings(text);
    const semanticClusters = await this.clusterSemantics(embeddings);
    
    return {
      embeddings,
      primaryMeaning: this.extractPrimaryMeaning(semanticClusters),
      secondaryMeanings: this.extractSecondaryMeanings(semanticClusters),
      ambiguityScore: this.calculateAmbiguity(semanticClusters)
    };
  }

  private generateEmbeddings(text: string): number[] {
    // Simple character-based embeddings
    const embeddings = new Array(128).fill(0);
    const chars = text.toLowerCase().split('');
    
    chars.forEach((char, index) => {
      const charCode = char.charCodeAt(0);
      embeddings[charCode % 128] += 1 / (index + 1); // Position-weighted
    });
    
    // Normalize
    const sum = embeddings.reduce((acc, val) => acc + val, 0);
    return embeddings.map(val => val / sum);
  }

  private async clusterSemantics(embeddings: number[]): Promise<SemanticCluster[]> {
    // Simple semantic clustering based on domain name patterns
    const clusters: SemanticCluster[] = [];
    
    // Analyze common domain patterns
    const patterns = this.analyzeDomainPatterns(embeddings);
    
    patterns.forEach(pattern => {
      clusters.push({
        meaning: pattern.meaning,
        confidence: pattern.confidence,
        context: pattern.contexts
      });
    });
    
    return clusters;
  }

  private analyzeDomainPatterns(embeddings: number[]): Array<{
    meaning: string;
    confidence: number;
    contexts: string[];
  }> {
    const patterns = [];
    
    // Tech-related patterns
    if (this.hasTechPattern(embeddings)) {
      patterns.push({
        meaning: 'Technology/Software',
        confidence: 0.8,
        contexts: ['tech', 'software', 'app', 'platform']
      });
    }
    
    // Business patterns
    if (this.hasBusinessPattern(embeddings)) {
      patterns.push({
        meaning: 'Business/Commercial',
        confidence: 0.7,
        contexts: ['business', 'commercial', 'corporate', 'enterprise']
      });
    }
    
    // Brand patterns
    if (this.hasBrandPattern(embeddings)) {
      patterns.push({
        meaning: 'Brand/Marketing',
        confidence: 0.6,
        contexts: ['brand', 'marketing', 'advertising', 'promotion']
      });
    }
    
    return patterns.length > 0 ? patterns : [{
      meaning: 'Generic',
      confidence: 0.5,
      contexts: ['general', 'miscellaneous']
    }];
  }

  private hasTechPattern(embeddings: number[]): boolean {
    // Simple pattern detection for tech-related domains
    const techIndicators = ['app', 'tech', 'soft', 'data', 'cloud', 'ai', 'api', 'dev'];
    return this.checkEmbeddingPatterns(embeddings, techIndicators);
  }

  private hasBusinessPattern(embeddings: number[]): boolean {
    const businessIndicators = ['biz', 'corp', 'inc', 'ltd', 'group', 'company', 'enterprise'];
    return this.checkEmbeddingPatterns(embeddings, businessIndicators);
  }

  private hasBrandPattern(embeddings: number[]): boolean {
    const brandIndicators = ['brand', 'marketing', 'ad', 'promo', 'campaign', 'agency'];
    return this.checkEmbeddingPatterns(embeddings, brandIndicators);
  }

  private checkEmbeddingPatterns(embeddings: number[], indicators: string[]): boolean {
    // Simple pattern matching based on character frequency
    let score = 0;
    indicators.forEach(indicator => {
      const charCodes = indicator.split('').map(char => char.charCodeAt(0));
      charCodes.forEach(code => {
        score += embeddings[code % 128] || 0;
      });
    });
    
    return score > 0.1; // Threshold for pattern detection
  }

  private extractPrimaryMeaning(clusters: SemanticCluster[]): string {
    if (clusters.length === 0) return 'Unknown';
    
    const primaryCluster = clusters.reduce((max, cluster) => 
      cluster.confidence > max.confidence ? cluster : max
    );
    
    return primaryCluster.meaning;
  }

  private extractSecondaryMeanings(clusters: SemanticCluster[]): string[] {
    return clusters
      .filter(cluster => cluster.confidence < 0.8)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2)
      .map(cluster => cluster.meaning);
  }

  private calculateAmbiguity(clusters: SemanticCluster[]): number {
    if (clusters.length <= 1) return 0;
    
    const confidences = clusters.map(cluster => cluster.confidence);
    const maxConfidence = Math.max(...confidences);
    const avgConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    
    // Higher ambiguity when confidence is spread across multiple clusters
    return 1 - (maxConfidence - avgConfidence);
  }

  private async extractKeywords(text: string): Promise<LinguisticAnalysis['keywords']> {
    const tokens = this.wordTokenizer(text);
    const stemmedTokens = tokens.map(token => this.stemmer(token));
    
    const tfidfScores = this.calculateTFIDF(stemmedTokens);
    const keywordRanking = this.rankKeywords(tfidfScores);
    
    return {
      primaryKeywords: keywordRanking.slice(0, 3),
      secondaryKeywords: keywordRanking.slice(3, 10),
      keywordDensity: this.calculateKeywordDensity(tokens),
      semanticRichness: this.calculateSemanticRichness(keywordRanking)
    };
  }

  private calculateTFIDF(tokens: string[]): Map<string, number> {
    const tfidfScores = new Map<string, number>();
    const tokenCounts = new Map<string, number>();
    
    // Calculate term frequency
    tokens.forEach(token => {
      tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
    });
    
    // Calculate TF-IDF scores
    const totalTokens = tokens.length;
    tokenCounts.forEach((count, token) => {
      const tf = count / totalTokens;
      const idf = Math.log(totalTokens / count); // Simplified IDF
      tfidfScores.set(token, tf * idf);
    });
    
    return tfidfScores;
  }

  private rankKeywords(tfidfScores: Map<string, number>): string[] {
    return Array.from(tfidfScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
  }

  private calculateKeywordDensity(tokens: string[]): number {
    const uniqueTokens = new Set(tokens);
    return uniqueTokens.size / tokens.length;
  }

  private calculateSemanticRichness(keywordRanking: string[]): number {
    // Semantic richness based on keyword diversity and relevance
    const premiumKeywords = ['crypto', 'nft', 'ai', 'tech', 'app', 'web', 'data', 'cloud', 'api'];
    const premiumCount = keywordRanking.filter(keyword => 
      premiumKeywords.some(premium => keyword.includes(premium))
    ).length;
    
    return Math.min(1, premiumCount / keywordRanking.length * 2);
  }

  private async analyzeSentiment(text: string): Promise<LinguisticAnalysis['sentiment']> {
    const analysis = this.sentimentAnalyzer(text);
    
    let emotionalTone = 'neutral';
    if (analysis.score > 0.6) emotionalTone = 'positive';
    else if (analysis.score < 0.4) emotionalTone = 'negative';
    
    return {
      score: analysis.score,
      confidence: analysis.confidence,
      emotionalTone
    };
  }

  private async calculateCulturalRelevance(text: string): Promise<LinguisticAnalysis['culturalRelevance']> {
    const culturalContexts: string[] = [];
    let globalAppeal = 0.5;
    
    // Analyze cultural indicators
    const culturalIndicators = {
      'english': ['the', 'and', 'or', 'but', 'for', 'with', 'by'],
      'tech': ['app', 'web', 'data', 'cloud', 'api', 'dev'],
      'business': ['biz', 'corp', 'inc', 'ltd', 'group'],
      'creative': ['art', 'design', 'creative', 'studio', 'works']
    };
    
    const tokens = this.wordTokenizer(text);
    
    Object.entries(culturalIndicators).forEach(([culture, indicators]) => {
      const matches = indicators.filter(indicator => 
        tokens.some(token => token.includes(indicator))
      ).length;
      
      if (matches > 0) {
        culturalContexts.push(culture);
        globalAppeal += 0.1;
      }
    });
    
    globalAppeal = Math.min(1, globalAppeal);
    
    return {
      score: culturalContexts.length > 0 ? 0.7 : 0.3,
      culturalContexts,
      globalAppeal
    };
  }

  private async identifyIndustryAssociation(text: string): Promise<LinguisticAnalysis['industryAssociation']> {
    const industries: string[] = [];
    let marketPosition = 'emerging';
    
    const industryKeywords = {
      'technology': ['tech', 'app', 'software', 'data', 'cloud', 'ai', 'api'],
      'finance': ['bank', 'pay', 'money', 'crypto', 'defi', 'trade', 'invest'],
      'healthcare': ['health', 'medical', 'care', 'wellness', 'fitness', 'doctor'],
      'education': ['edu', 'learn', 'school', 'university', 'course', 'training'],
      'entertainment': ['game', 'music', 'video', 'stream', 'entertainment', 'media'],
      'ecommerce': ['shop', 'store', 'buy', 'sell', 'market', 'commerce', 'retail']
    };
    
    const tokens = this.wordTokenizer(text);
    
    Object.entries(industryKeywords).forEach(([industry, keywords]) => {
      const matches = keywords.filter(keyword => 
        tokens.some(token => token.includes(keyword))
      ).length;
      
      if (matches > 0) {
        industries.push(industry);
      }
    });
    
    // Determine market position based on industry and keywords
    if (industries.includes('technology') && tokens.some(token => ['ai', 'blockchain', 'web3'].includes(token))) {
      marketPosition = 'cutting-edge';
    } else if (industries.length > 1) {
      marketPosition = 'diversified';
    } else if (industries.length === 1) {
      marketPosition = 'specialized';
    }
    
    return {
      score: industries.length > 0 ? 0.8 : 0.4,
      industries,
      marketPosition
    };
  }

  private calculateLinguisticScore(analysis: Record<string, unknown>[]): number {
    const weights = {
      semantic: 0.3,
      keyword: 0.25,
      sentiment: 0.2,
      cultural: 0.15,
      industry: 0.1
    };

    const scores = {
      semantic: 1 - (Number(analysis[0]?.ambiguityScore) || 0), // Lower ambiguity = higher score
      keyword: Number(analysis[1]?.semanticRichness) || 0,
      sentiment: Number(analysis[2]?.score) || 0,
      cultural: Number(analysis[3]?.score) || 0,
      industry: Number(analysis[4]?.score) || 0
    };

    return Object.keys(weights).reduce((score, key) => {
      return score + (Number(scores[key as keyof typeof scores]) || 0) * Number(weights[key as keyof typeof weights]);
    }, 0);
  }
}

export default NLPDomainAnalyzer;
export type { LinguisticAnalysis };
