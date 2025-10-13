import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Brain,
  Target,
  Shield,
  Zap,
  BarChart3,
  PieChart,
  DollarSign,
  Clock,
  Activity
} from 'lucide-react';

interface RiskScore {
  invoiceId: string;
  score: number;
  risk: 'low' | 'medium' | 'high';
  factors: string[];
  recommendation: string;
}

interface PredictiveInsight {
  title: string;
  description: string;
  confidence: number;
  impact: 'positive' | 'negative' | 'neutral';
  actionable: boolean;
}

const mockRiskScores: RiskScore[] = [
  {
    invoiceId: '2025-300',
    score: 92,
    risk: 'low',
    factors: ['Established payer', 'On-time history', 'Sufficient collateral'],
    recommendation: 'Safe to fund - excellent payment track record'
  },
  {
    invoiceId: '2025-299',
    score: 75,
    risk: 'medium',
    factors: ['New payer', 'Average industry metrics', 'Standard terms'],
    recommendation: 'Consider milestone-based release'
  },
  {
    invoiceId: '2025-298',
    score: 58,
    risk: 'high',
    factors: ['Delayed payments history', 'High industry default rate', 'Extended terms'],
    recommendation: 'Request additional collateral or escrow'
  },
];

const mockInsights: PredictiveInsight[] = [
  {
    title: 'Payment Delay Forecast',
    description: 'Invoice #2025-299 has 67% probability of 5-7 day delay based on payer behavior patterns',
    confidence: 67,
    impact: 'negative',
    actionable: true
  },
  {
    title: 'Yield Optimization Opportunity',
    description: 'Moving $125K to aggressive yield pool could generate +$3,200 additional returns',
    confidence: 84,
    impact: 'positive',
    actionable: true
  },
  {
    title: 'Fraud Detection Alert',
    description: 'Unusual pattern detected: 3 invoices from same region with inflated amounts',
    confidence: 91,
    impact: 'negative',
    actionable: true
  },
  {
    title: 'Market Opportunity',
    description: 'Current NFT marketplace discount average (9.2%) is 2.3% above historical mean',
    confidence: 78,
    impact: 'positive',
    actionable: true
  },
];

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Brain className="w-10 h-10 text-purple-600" />
          AI-Powered Analytics Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Predictive insights, risk scoring, and fraud detection powered by machine learning
        </p>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">AI Confidence</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Predicted Growth</p>
                <p className="text-2xl font-bold">+23%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold text-green-600">Low</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Actionable Alerts</p>
                <p className="text-2xl font-bold">7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="risk-scoring" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risk-scoring">Risk Scoring</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Insights</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio Analytics</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
        </TabsList>

        {/* Risk Scoring Tab */}
        <TabsContent value="risk-scoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Invoice Risk Assessment
              </CardTitle>
              <CardDescription>
                ML-powered risk scoring for informed funding decisions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRiskScores.map((item) => (
                <Card key={item.invoiceId} className="overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          Invoice #{item.invoiceId}
                        </h3>
                        <Badge 
                          variant={item.risk === 'low' ? 'default' : 'destructive'}
                          className={
                            item.risk === 'low' ? 'bg-green-600' :
                            item.risk === 'medium' ? 'bg-yellow-600' :
                            'bg-red-600'
                          }
                        >
                          {item.risk.toUpperCase()} RISK
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
                        <p className="text-3xl font-bold">
                          {item.score}
                          <span className="text-lg text-muted-foreground">/100</span>
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full ${
                            item.risk === 'low' ? 'bg-green-600' :
                            item.risk === 'medium' ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold mb-2">Risk Factors:</p>
                        <div className="flex flex-wrap gap-2">
                          {item.factors.map((factor, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t">
                        <p className="text-sm font-semibold mb-1">AI Recommendation:</p>
                        <p className="text-sm text-muted-foreground">
                          {item.recommendation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictive Insights Tab */}
        <TabsContent value="predictive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Predictive Insights
              </CardTitle>
              <CardDescription>
                Machine learning forecasts and actionable recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockInsights.map((insight, idx) => (
                <Card 
                  key={idx} 
                  className={`border-l-4 ${
                    insight.impact === 'positive' ? 'border-l-green-500' :
                    insight.impact === 'negative' ? 'border-l-red-500' :
                    'border-l-blue-500'
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        {insight.impact === 'positive' ? (
                          <TrendingUp className="w-5 h-5 text-green-600 mt-1" />
                        ) : insight.impact === 'negative' ? (
                          <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
                        ) : (
                          <Activity className="w-5 h-5 text-blue-600 mt-1" />
                        )}
                        <div>
                          <h3 className="font-semibold mb-1">{insight.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                    
                    {insight.actionable && (
                      <Button size="sm" variant="outline" className="mt-3">
                        Take Action
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Analytics Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Portfolio Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Active Invoices</span>
                      <span className="text-sm font-bold">$342K (45%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Yield Farming</span>
                      <span className="text-sm font-bold">$215K (28%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">NFT Marketplace</span>
                      <span className="text-sm font-bold">$128K (17%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '17%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Available Liquidity</span>
                      <span className="text-sm font-bold">$75K (10%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Portfolio Value</span>
                    <span className="text-2xl font-bold text-blue-600">$760K</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Returns (30d)</p>
                      <p className="text-2xl font-bold text-green-600">+$24,350</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Payment Time</p>
                      <p className="text-2xl font-bold text-blue-600">38 days</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold text-purple-600">98.2%</p>
                    </div>
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Yield Earnings</p>
                      <p className="text-2xl font-bold text-orange-600">$8,420</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historical Performance Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Historical Performance
              </CardTitle>
              <div className="flex gap-2">
                {['7d', '30d', '90d', '1y'].map((period) => (
                  <Button
                    key={period}
                    size="sm"
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  <LineChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Performance chart visualization</p>
                  <p className="text-sm">(Integration with charting library)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fraud Detection Tab */}
        <TabsContent value="fraud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Fraud Detection & Anomalies
              </CardTitle>
              <CardDescription>
                Real-time fraud monitoring using pattern recognition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-red-900">High Risk: Duplicate Invoice Pattern</h3>
                          <Badge variant="destructive">Critical</Badge>
                        </div>
                        <p className="text-sm text-red-800 mb-3">
                          Three invoices submitted by different parties reference the same project deliverables with overlapping dates
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="destructive">
                            Flag for Review
                          </Button>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-yellow-900">Anomaly: Unusual Amount</h3>
                          <Badge className="bg-yellow-600">Warning</Badge>
                        </div>
                        <p className="text-sm text-yellow-800 mb-3">
                          Invoice #2025-301 amount ($425K) is 3.2x higher than historical average for this vendor
                        </p>
                        <Button size="sm" variant="outline">
                          Review Invoice
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-900 mb-1">All Clear</h3>
                        <p className="text-sm text-green-800">
                          No other suspicious patterns detected in the last 30 days
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-4">Fraud Prevention Stats (Last 90 Days)</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">247</p>
                    <p className="text-sm text-muted-foreground">Transactions Monitored</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-red-600">3</p>
                    <p className="text-sm text-muted-foreground">Frauds Prevented</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">$142K</p>
                    <p className="text-sm text-muted-foreground">Amount Protected</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;

