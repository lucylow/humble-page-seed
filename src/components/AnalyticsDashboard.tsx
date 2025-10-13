import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, DollarSign, BarChart3, PieChart } from 'lucide-react';

interface InvoiceData {
  id: number;
  amount: number;
  dueDate: string;
  riskScore: number;
  status: string;
  paymentHistory: {
    actualDelay: number;
    predictedDelay: number;
  };
}

interface RiskAnalysis {
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
}

interface DelayTrend {
  date: string;
  actualDelay: number;
  predictedDelay: number;
  amount: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis>({
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0
  });
  const [delayTrends, setDelayTrends] = useState<DelayTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockInvoices: InvoiceData[] = [
        {
          id: 1,
          amount: 50000,
          dueDate: '2025-12-31',
          riskScore: 8,
          status: 'pending',
          paymentHistory: { actualDelay: 5, predictedDelay: 7 }
        },
        {
          id: 2,
          amount: 25000,
          dueDate: '2025-11-30',
          riskScore: 5,
          status: 'pending',
          paymentHistory: { actualDelay: 2, predictedDelay: 3 }
        },
        {
          id: 3,
          amount: 75000,
          dueDate: '2026-01-15',
          riskScore: 3,
          status: 'active',
          paymentHistory: { actualDelay: 0, predictedDelay: 1 }
        },
        {
          id: 4,
          amount: 100000,
          dueDate: '2025-12-15',
          riskScore: 9,
          status: 'pending',
          paymentHistory: { actualDelay: 10, predictedDelay: 12 }
        },
        {
          id: 5,
          amount: 30000,
          dueDate: '2026-02-01',
          riskScore: 2,
          status: 'active',
          paymentHistory: { actualDelay: 0, predictedDelay: 0 }
        }
      ];

      setInvoiceData(mockInvoices);

      // Calculate risk analysis
      const analysis = {
        highRisk: mockInvoices.filter(inv => inv.riskScore >= 8).length,
        mediumRisk: mockInvoices.filter(inv => inv.riskScore >= 5 && inv.riskScore < 8).length,
        lowRisk: mockInvoices.filter(inv => inv.riskScore < 5).length
      };
      setRiskAnalysis(analysis);

      // Generate delay trends
      const trends: DelayTrend[] = mockInvoices.map(inv => ({
        date: inv.dueDate,
        actualDelay: inv.paymentHistory.actualDelay,
        predictedDelay: inv.paymentHistory.predictedDelay,
        amount: inv.amount
      }));
      setDelayTrends(trends);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalInvoiceValue = invoiceData.reduce((sum, inv) => sum + inv.amount, 0);
  const averageRiskScore = invoiceData.length > 0
    ? invoiceData.reduce((sum, inv) => sum + inv.riskScore, 0) / invoiceData.length
    : 0;

  const aiInsights = [
    {
      type: 'warning',
      title: 'High Risk Alert',
      message: `${riskAnalysis.highRisk} invoices require immediate attention`,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50 border-red-200'
    },
    {
      type: 'success',
      title: 'Payment Pattern',
      message: '94% accuracy in delay predictions this month',
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    {
      type: 'info',
      title: 'Liquidity Recommendation',
      message: 'Consider early discount on 3 high-value invoices',
      icon: DollarSign,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Brain className="w-10 h-10 text-purple-600" />
          AI-Powered Financial Analytics
        </h1>
        <p className="text-muted-foreground text-lg">
          Risk scoring, fraud detection, and payment predictions
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Total Portfolio</p>
                <p className="text-3xl font-bold text-purple-900">
                  ${(totalInvoiceValue / 1000).toFixed(0)}K
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Active Invoices</p>
                <p className="text-3xl font-bold text-blue-900">{invoiceData.length}</p>
              </div>
              <BarChart3 className="w-12 h-12 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Avg Risk Score</p>
                <p className="text-3xl font-bold text-green-900">
                  {averageRiskScore.toFixed(1)}/10
                </p>
              </div>
              <PieChart className="w-12 h-12 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Prediction Accuracy</p>
                <p className="text-3xl font-bold text-orange-900">94%</p>
              </div>
              <Brain className="w-12 h-12 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">AI Insights & Recommendations</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {aiInsights.map((insight, index) => (
            <Card key={index} className={`border-2 ${insight.color}`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <insight.icon className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold mb-1">{insight.title}</h3>
                    <p className="text-sm">{insight.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Portfolio Risk Analysis */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Risk Analysis</CardTitle>
            <CardDescription>Distribution of invoices by risk level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-2 border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">{riskAnalysis.highRisk}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-red-900">High Risk</h4>
                    <p className="text-sm text-red-700">Risk Score 8-10</p>
                  </div>
                </div>
                <Badge variant="destructive">Critical</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">{riskAnalysis.mediumRisk}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-yellow-900">Medium Risk</h4>
                    <p className="text-sm text-yellow-700">Risk Score 5-7</p>
                  </div>
                </div>
                <Badge className="bg-yellow-600">Monitor</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">{riskAnalysis.lowRisk}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900">Low Risk</h4>
                    <p className="text-sm text-green-700">Risk Score 0-4</p>
                  </div>
                </div>
                <Badge className="bg-green-600">Healthy</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Delay Forecasting</CardTitle>
            <CardDescription>AI predictions vs actual delays</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {delayTrends.slice(0, 5).map((trend, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-accent">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{trend.date}</span>
                    <span className="text-sm text-muted-foreground">
                      ${(trend.amount / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Actual: {trend.actualDelay}d</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Predicted: {trend.predictedDelay}d</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, Math.max(0, 100 - (Math.abs(trend.actualDelay - trend.predictedDelay) * 10)))}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Prediction accuracy: {Math.min(100, Math.max(0, 100 - (Math.abs(trend.actualDelay - trend.predictedDelay) * 10))).toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liquidity Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Liquidity Optimization Recommendations</CardTitle>
          <CardDescription>AI-powered insights for maximizing capital efficiency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {invoiceData.slice(0, 3).map((invoice) => (
              <div key={invoice.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold">Invoice #{invoice.id}</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      ${(invoice.amount / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <Badge className={
                    invoice.riskScore >= 8 ? 'bg-red-600' :
                    invoice.riskScore >= 5 ? 'bg-yellow-600' : 'bg-green-600'
                  }>
                    Risk: {invoice.riskScore}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-semibold">{invoice.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discounted Value:</span>
                    <span className="font-semibold text-green-600">
                      ${((invoice.amount * 0.88) / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Potential Savings:</span>
                    <span className="font-semibold text-orange-600">12%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;

