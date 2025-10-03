import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import AIValuationEngine, { DomainData, MarketContext, ValuationResult } from '../ai/DomainValuationEngine';
import NLPDomainAnalyzer, { LinguisticAnalysis } from '../ai/NLPDomainAnalyzer';
import AIDevelopmentAdvisor, { OwnerGoals, DevelopmentPlan } from '../ai/DevelopmentAdvisor';
import AIContentGenerator, { GeneratedContent } from '../ai/ContentGenerator';

interface AIInalysisResults {
  valuation: ValuationResult | null;
  linguistic: LinguisticAnalysis | null;
  developmentPlan: DevelopmentPlan | null;
  generatedContent: GeneratedContent[] | null;
  isLoading: boolean;
  error: string | null;
}

interface AIIntegrationPanelProps {
  domainName: string;
  domainData?: DomainData;
  onAnalysisComplete?: (results: AIInalysisResults) => void;
}

const AIIntegrationPanel: React.FC<AIIntegrationPanelProps> = ({
  domainName,
  domainData,
  onAnalysisComplete
}) => {
  const [results, setResults] = useState<AIInalysisResults>({
    valuation: null,
    linguistic: null,
    developmentPlan: null,
    generatedContent: null,
    isLoading: false,
    error: null
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'valuation' | 'linguistic' | 'development' | 'content'>('overview');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Initialize AI engines
  const valuationEngine = new AIValuationEngine();
  const nlpAnalyzer = new NLPDomainAnalyzer();
  const developmentAdvisor = new AIDevelopmentAdvisor();
  const contentGenerator = new AIContentGenerator();

  const runCompleteAnalysis = async () => {
    setResults(prev => ({ ...prev, isLoading: true, error: null }));
    setAnalysisProgress(0);

    try {
      console.log(`🤖 Starting complete AI analysis for: ${domainName}`);

      // Step 1: Domain Valuation (25%)
      setAnalysisProgress(25);
      const valuation = await runValuationAnalysis();
      setResults(prev => ({ ...prev, valuation }));

      // Step 2: Linguistic Analysis (50%)
      setAnalysisProgress(50);
      const linguistic = await runLinguisticAnalysis();
      setResults(prev => ({ ...prev, linguistic }));

      // Step 3: Development Planning (75%)
      setAnalysisProgress(75);
      const developmentPlan = await runDevelopmentPlanning();
      setResults(prev => ({ ...prev, developmentPlan }));

      // Step 4: Content Generation (100%)
      setAnalysisProgress(100);
      const generatedContent = await runContentGeneration();
      setResults(prev => ({ ...prev, generatedContent }));

      setResults(prev => ({ ...prev, isLoading: false }));
      
      if (onAnalysisComplete) {
        onAnalysisComplete(results);
      }

      console.log('✅ Complete AI analysis finished successfully');
    } catch (error) {
      console.error('❌ AI analysis failed:', error);
      setResults(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Analysis failed' 
      }));
    }
  };

  const runValuationAnalysis = async (): Promise<ValuationResult> => {
    const domainDataForAnalysis: DomainData = domainData || {
      name: domainName,
      tld: domainName.split('.')[1] || 'com',
      length: domainName.length,
      registrationDate: new Date(),
      priceHistory: [],
      traffic: {
        monthlyVisitors: 1000,
        bounceRate: 0.4,
        avgSessionDuration: 120
      }
    };

    const marketContext: MarketContext = {
      industryTrend: 0.7,
      marketVolatility: 0.3,
      competitorDensity: 0.4,
      searchVolume: 5000
    };

    return await valuationEngine.valuateDomain(domainDataForAnalysis, marketContext);
  };

  const runLinguisticAnalysis = async (): Promise<LinguisticAnalysis> => {
    return await nlpAnalyzer.analyzeDomainLinguistics(domainName);
  };

  const runDevelopmentPlanning = async (): Promise<DevelopmentPlan> => {
    const ownerGoals: OwnerGoals = {
      primaryObjective: 'monetization',
      targetAudience: 'Tech-savvy professionals',
      budget: 50000,
      timeline: 'medium-term',
      technicalSkills: 'intermediate',
      preferences: ['modern design', 'mobile-first', 'scalable architecture']
    };

    const marketContext = {
      industryTrend: 0.7,
      competitorAnalysis: [
        {
          name: 'Competitor 1',
          domain: 'competitor1.com',
          marketShare: 0.2,
          strengths: ['Strong brand', 'Good UX'],
          weaknesses: ['Limited features'],
          pricing: 1000
        }
      ],
      consumerInsights: {
        demographics: {
          age: '25-45',
          income: '$50k-$100k',
          location: 'Urban areas'
        },
        preferences: ['User-friendly', 'Fast loading', 'Mobile optimized'],
        painPoints: ['Complex interfaces', 'Slow performance'],
        behaviorPatterns: ['Mobile-first', 'Social sharing', 'Content consumption']
      },
      marketSize: 1000000,
      growthRate: 0.15
    };

    return await developmentAdvisor.generateDevelopmentPlan(domainName, ownerGoals, marketContext);
  };

  const runContentGeneration = async (): Promise<GeneratedContent[]> => {
    const developmentStrategy = results.developmentPlan?.strategy || {
      primaryObjective: 'monetization',
      targetAudience: 'Tech-savvy professionals'
    };

    const contentResult = await contentGenerator.generateDomainContent(
      domainName,
      developmentStrategy as Record<string, unknown>,
      'Tech-savvy professionals'
    );

    return contentResult.generatedContent;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.8) return 'text-green-600';
    if (confidence > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number): string => {
    if (confidence > 0.8) return 'High Confidence';
    if (confidence > 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <span>AI-Powered Domain Analysis</span>
            <Badge variant="outline" className="ml-auto">
              {domainName}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={runCompleteAnalysis}
              disabled={results.isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {results.isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </div>
              ) : (
                '🚀 Run Complete AI Analysis'
              )}
            </Button>
            
            {results.isLoading && (
              <div className="flex-1">
                <Progress value={analysisProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  {analysisProgress}% Complete
                </p>
              </div>
            )}
          </div>

          {results.error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {results.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'valuation', label: 'Valuation', icon: '💰' },
          { id: 'linguistic', label: 'Linguistics', icon: '🔤' },
          { id: 'development', label: 'Development', icon: '🏗️' },
          { id: 'content', label: 'Content', icon: '📝' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Valuation Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">💰 Valuation</CardTitle>
              </CardHeader>
              <CardContent>
                {results.valuation ? (
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(results.valuation.value)}
                    </div>
                    <div className={`text-sm ${getConfidenceColor(results.valuation.confidence)}`}>
                      {getConfidenceBadge(results.valuation.confidence)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {results.valuation.valueDrivers.length} value drivers
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">Not analyzed</div>
                )}
              </CardContent>
            </Card>

            {/* Linguistic Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">🔤 Linguistics</CardTitle>
              </CardHeader>
              <CardContent>
                {results.linguistic ? (
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {(results.linguistic.linguisticScore * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {results.linguistic.semanticMeaning.primaryMeaning}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {results.linguistic.keywords.primaryKeywords.length} keywords
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">Not analyzed</div>
                )}
              </CardContent>
            </Card>

            {/* Development Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">🏗️ Development</CardTitle>
              </CardHeader>
              <CardContent>
                {results.developmentPlan ? (
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {results.developmentPlan.strategy.timeline.phases.length}
                    </div>
                    <div className="text-sm text-gray-600">Phases</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatCurrency(results.developmentPlan.financialProjections.investmentRequirements.initialInvestment)}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">Not analyzed</div>
                )}
              </CardContent>
            </Card>

            {/* Content Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">📝 Content</CardTitle>
              </CardHeader>
              <CardContent>
                {results.generatedContent ? (
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {results.generatedContent.length}
                    </div>
                    <div className="text-sm text-gray-600">Sections</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {results.generatedContent.reduce((total, section) => total + section.content.length, 0)} chars
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">Not analyzed</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'valuation' && results.valuation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>💰</span>
                Domain Valuation Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Valuation Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Estimated Value:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(results.valuation.value)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span className={getConfidenceColor(results.valuation.confidence)}>
                        {(results.valuation.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Value Drivers</h3>
                  <ul className="space-y-1">
                    {results.valuation.valueDrivers.map((driver, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        • {driver}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Market Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {results.valuation.marketInsights.map((insight, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {insight}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Comparable Domains</h3>
                <div className="flex gap-2">
                  {results.valuation.comparableDomains.map((domain, index) => (
                    <Badge key={index} variant="secondary">
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'linguistic' && results.linguistic && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🔤</span>
                Linguistic Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Semantic Analysis</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Primary Meaning:</span>
                      <div className="text-sm text-gray-600">
                        {results.linguistic.semanticMeaning.primaryMeaning}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Ambiguity Score:</span>
                      <div className="text-sm text-gray-600">
                        {(results.linguistic.semanticMeaning.ambiguityScore * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Keywords</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Primary:</span>
                      <div className="flex gap-1 mt-1">
                        {results.linguistic.keywords.primaryKeywords.map((keyword, index) => (
                          <Badge key={index} variant="default" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Secondary:</span>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {results.linguistic.keywords.secondaryKeywords.slice(0, 5).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Sentiment</h3>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">Score:</span> {results.linguistic.sentiment.score.toFixed(2)}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Tone:</span> {results.linguistic.sentiment.emotionalTone}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Cultural Relevance</h3>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">Score:</span> {results.linguistic.culturalRelevance.score.toFixed(2)}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Contexts:</span> {results.linguistic.culturalRelevance.culturalContexts.join(', ')}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Industry Association</h3>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">Score:</span> {results.linguistic.industryAssociation.score.toFixed(2)}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Position:</span> {results.linguistic.industryAssociation.marketPosition}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'development' && results.developmentPlan && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🏗️</span>
                  Development Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Value Proposition</h3>
                    <p className="text-gray-600">{results.developmentPlan.strategy.valueProposition}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Target Audience</h3>
                      {results.developmentPlan.strategy.targetAudience.map((audience, index) => (
                        <div key={index} className="text-sm text-gray-600 mb-1">
                          • {audience.segment} ({audience.size.toLocaleString()} users)
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Monetization Strategies</h3>
                      {results.developmentPlan.strategy.monetizationStrategies.map((strategy, index) => (
                        <div key={index} className="text-sm text-gray-600 mb-1">
                          • {strategy.method}: {formatCurrency(strategy.revenueProjection)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>💰</span>
                  Financial Projections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Investment Required</h3>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(results.developmentPlan.financialProjections.investmentRequirements.initialInvestment)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Payback: {results.developmentPlan.financialProjections.investmentRequirements.paybackPeriod} months
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Expected ROI</h3>
                    <div className="text-2xl font-bold text-green-600">
                      {results.developmentPlan.financialProjections.roiAnalysis.expectedROI}%
                    </div>
                    <div className="text-sm text-gray-600">
                      IRR: {results.developmentPlan.financialProjections.roiAnalysis.irr}%
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Revenue Projections</h3>
                    {results.developmentPlan.financialProjections.revenueProjections.map((projection, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {projection.period}: {formatCurrency(projection.amount)}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'content' && results.generatedContent && (
          <div className="space-y-4">
            {results.generatedContent.map((content, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>📝</span>
                    {content.section.charAt(0).toUpperCase() + content.section.slice(1)} Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                        {content.content}
                      </pre>
                    </div>

                    {content.optimizationReport && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">SEO Score</h4>
                          <div className="text-lg font-bold text-green-600">
                            {(content.optimizationReport.seoScore * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Readability</h4>
                          <div className="text-lg font-bold text-blue-600">
                            {(content.optimizationReport.readabilityScore * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Engagement</h4>
                          <div className="text-lg font-bold text-purple-600">
                            {(content.optimizationReport.engagementScore * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIIntegrationPanel;
