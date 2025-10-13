/**
 * Smart Invoice Demo Component
 * Step-by-step workflow for AI-powered invoice creation and escrow
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  Sparkles, 
  FileText,
  Wallet,
  ArrowRight,
  Check,
} from 'lucide-react';

import { 
  parseInvoiceWithOpenAI, 
  parseInvoiceWithClaude,
  validateInvoiceData,
  InvoiceData 
} from '@/lib/aiInvoiceParser';
import {
  connectWallet,
  createInvoice,
  transferTokensToEscrow,
  acknowledgeDeposit,
  releaseFunds,
  getInvoice,
  satoshisToBtc,
  getInvoiceStatusString,
} from '@/lib/stacksIntegration';

type Step = 'parse' | 'review' | 'create' | 'deposit' | 'acknowledge' | 'release' | 'complete';

const STEPS: { id: Step; label: string; description: string }[] = [
  { id: 'parse', label: 'AI Parse Invoice', description: 'Extract data from natural language' },
  { id: 'review', label: 'Review & Edit', description: 'Verify extracted information' },
  { id: 'create', label: 'Create Invoice', description: 'Deploy on-chain' },
  { id: 'deposit', label: 'Deposit sBTC', description: 'Transfer to escrow' },
  { id: 'acknowledge', label: 'Acknowledge Deposit', description: 'Mark as funded' },
  { id: 'release', label: 'Release Funds', description: 'Complete payment' },
  { id: 'complete', label: 'Complete', description: 'Invoice settled' },
];

export default function SmartInvoiceDemo() {
  const [currentStep, setCurrentStep] = useState<Step>('parse');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Invoice data
  const [invoiceText, setInvoiceText] = useState(
    `Invoice #2024-001
To: SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7 (Alice)
From: WebGuild DAO
Description: UX redesign and deliverables: wireframes + responsive pages
Amount: 0.05 sBTC due on 2025-12-31
Milestones: Initial mockups (50%) | Final delivery (50%)
Arbiter: SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE`
  );
  const [parsedData, setParsedData] = useState<InvoiceData | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [aiProvider, setAiProvider] = useState<'openai' | 'claude'>('openai');
  
  // Transaction data
  const [txHash, setTxHash] = useState<string | null>(null);
  const [invoiceStatus, setInvoiceStatus] = useState<string>('');

  /**
   * Step 1: Parse invoice with AI
   */
  const handleParseInvoice = async () => {
    setLoading(true);
    setError(null);

    try {
      let parsed: InvoiceData;
      
      if (aiProvider === 'openai') {
        parsed = await parseInvoiceWithOpenAI(invoiceText, apiKey);
      } else {
        parsed = await parseInvoiceWithClaude(invoiceText, apiKey);
      }

      const validation = validateInvoiceData(parsed);
      if (!validation.valid) {
        setError(`Validation errors: ${validation.errors.join(', ')}`);
        return;
      }

      setParsedData(parsed);
      setCurrentStep('review');
    } catch (err: any) {
      setError(err.message || 'Failed to parse invoice');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Review and proceed to create
   */
  const handleReviewComplete = () => {
    setCurrentStep('create');
  };

  /**
   * Step 3: Create invoice on-chain
   */
  const handleCreateInvoice = async () => {
    if (!parsedData) return;
    
    setLoading(true);
    setError(null);

    try {
      await createInvoice(
        parsedData.invoice_id,
        parsedData.payee || '',
        parsedData.amount,
        parsedData.token_contract || '',
        parsedData.arbiter || '',
        99999999, // Deadline in block height
        null // User session
      );

      setCurrentStep('deposit');
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 4: Deposit tokens to escrow
   */
  const handleDepositTokens = async () => {
    if (!parsedData) return;
    
    setLoading(true);
    setError(null);

    try {
      await transferTokensToEscrow(
        parsedData.amount,
        parsedData.payer || '',
        null
      );

      setCurrentStep('acknowledge');
    } catch (err: any) {
      setError(err.message || 'Failed to deposit tokens');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 5: Acknowledge deposit
   */
  const handleAcknowledgeDeposit = async () => {
    if (!parsedData) return;
    
    setLoading(true);
    setError(null);

    try {
      await acknowledgeDeposit(parsedData.invoice_id, null);
      setInvoiceStatus('FUNDED');
      setCurrentStep('release');
    } catch (err: any) {
      setError(err.message || 'Failed to acknowledge deposit');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 6: Release funds
   */
  const handleReleaseFunds = async () => {
    if (!parsedData) return;
    
    setLoading(true);
    setError(null);

    try {
      await releaseFunds(parsedData.invoice_id, null);
      setInvoiceStatus('RELEASED');
      setCurrentStep('complete');
    } catch (err: any) {
      setError(err.message || 'Failed to release funds');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render step indicator
   */
  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
      {STEPS.map((step, index) => {
        const stepIndex = STEPS.findIndex(s => s.id === currentStep);
        const isComplete = index < stepIndex;
        const isCurrent = step.id === currentStep;
        
        return (
          <div key={step.id} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                ${isComplete ? 'bg-green-500 border-green-500' : ''}
                ${isCurrent ? 'bg-blue-500 border-blue-500' : ''}
                ${!isComplete && !isCurrent ? 'bg-gray-100 border-gray-300' : ''}
              `}>
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : isCurrent ? (
                  <Circle className="w-5 h-5 text-white fill-current" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <span className={`
                mt-2 text-xs font-medium text-center max-w-[100px]
                ${isCurrent ? 'text-blue-600' : 'text-gray-500'}
              `}>
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`
                w-12 h-0.5 mx-2 mt-[-20px]
                ${isComplete ? 'bg-green-500' : 'bg-gray-300'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
          Smart Invoice Deals for DAOs
        </h1>
        <p className="text-gray-600">AI-powered Bitcoin-native invoicing on Stacks</p>
      </div>

      {renderStepIndicator()}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Parse Invoice */}
      {currentStep === 'parse' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Invoice Parser
            </CardTitle>
            <CardDescription>
              Paste your invoice text below and let AI extract the structured data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select AI Provider</label>
              <div className="flex gap-2">
                <Button
                  variant={aiProvider === 'openai' ? 'default' : 'outline'}
                  onClick={() => setAiProvider('openai')}
                >
                  OpenAI GPT-4
                </Button>
                <Button
                  variant={aiProvider === 'claude' ? 'default' : 'outline'}
                  onClick={() => setAiProvider('claude')}
                >
                  Anthropic Claude
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">API Key</label>
              <Input
                type="password"
                placeholder={`Enter your ${aiProvider === 'openai' ? 'OpenAI' : 'Anthropic'} API key`}
                value={apiKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Invoice Text</label>
              <Textarea
                rows={10}
                placeholder="Paste your invoice text here..."
                value={invoiceText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInvoiceText(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            <Button 
              onClick={handleParseInvoice} 
              disabled={loading || !apiKey}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Parsing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Parse Invoice with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review Parsed Data */}
      {currentStep === 'review' && parsedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Review Extracted Data
            </CardTitle>
            <CardDescription>
              Verify the information extracted by AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Invoice ID</label>
                <p className="text-lg font-semibold">{parsedData.invoice_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Amount</label>
                <p className="text-lg font-semibold">
                  {satoshisToBtc(parsedData.amount)} sBTC
                  <span className="text-sm text-gray-500 ml-2">
                    ({parsedData.amount.toLocaleString()} sats)
                  </span>
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Payee</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded">{parsedData.payee}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Arbiter</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded">{parsedData.arbiter}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Milestone Description</label>
                <p className="text-sm bg-gray-50 p-2 rounded">{parsedData.milestone_description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Deadline</label>
                <p className="text-sm">{parsedData.deadline || 'No deadline'}</p>
              </div>
            </div>

            <Button onClick={handleReviewComplete} className="w-full">
              Looks Good, Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Steps 3-6: Transaction Steps */}
      {['create', 'deposit', 'acknowledge', 'release'].includes(currentStep) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              {STEPS.find(s => s.id === currentStep)?.label}
            </CardTitle>
            <CardDescription>
              {STEPS.find(s => s.id === currentStep)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsedData && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Invoice ID:</span>
                  <span className="font-mono font-semibold">#{parsedData.invoice_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="font-semibold">{satoshisToBtc(parsedData.amount)} sBTC</span>
                </div>
                {invoiceStatus && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant={invoiceStatus === 'RELEASED' ? 'default' : 'secondary'}>
                      {invoiceStatus}
                    </Badge>
                  </div>
                )}
              </div>
            )}

            <Button 
              onClick={
                currentStep === 'create' ? handleCreateInvoice :
                currentStep === 'deposit' ? handleDepositTokens :
                currentStep === 'acknowledge' ? handleAcknowledgeDeposit :
                handleReleaseFunds
              }
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {STEPS.find(s => s.id === currentStep)?.label}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 7: Complete */}
      {currentStep === 'complete' && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Check className="w-6 h-6" />
              Invoice Complete!
            </CardTitle>
            <CardDescription>
              Funds have been successfully released to the payee
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsedData && (
              <div className="bg-green-50 p-6 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Invoice ID:</span>
                  <span className="font-mono font-bold text-lg">#{parsedData.invoice_id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount Transferred:</span>
                  <span className="font-bold text-lg text-green-600">
                    {satoshisToBtc(parsedData.amount)} sBTC
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className="bg-green-500">RELEASED</Badge>
                </div>
              </div>
            )}

            <Button 
              variant="outline"
              onClick={() => {
                setCurrentStep('parse');
                setParsedData(null);
                setError(null);
                setInvoiceStatus('');
              }}
              className="w-full"
            >
              Create Another Invoice
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

