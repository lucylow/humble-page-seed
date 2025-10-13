import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, ArrowRight, AlertCircle, FileText, Brain } from "lucide-react";
import { AIParsedInvoice } from '../types';
import { invoiceService } from '../services/invoiceService';
import { useNavigate } from 'react-router-dom';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [description, setDescription] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [contractorAddress, setContractorAddress] = useState('');
  const [arbitratorAddress, setArbitratorAddress] = useState('');
  const [aiPreview, setAiPreview] = useState<AIParsedInvoice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<any>(null);

  const steps = [
    { id: 0, name: 'Describe', description: 'Tell us about your project' },
    { id: 1, name: 'Review', description: 'Check AI-generated contract' },
    { id: 2, name: 'Deploy', description: 'Deploy to blockchain' },
    { id: 3, name: 'Success', description: 'Invoice created' },
  ];

  // Auto-generate AI preview when description is ready
  useEffect(() => {
    if (description && description.length > 30 && currentStep === 0) {
      const timer = setTimeout(async () => {
        try {
          const preview = await invoiceService.getAIPreview(description);
          setAiPreview(preview);
        } catch (error) {
          console.error('AI preview failed:', error);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [description, currentStep]);

  const handleStep1Submit = () => {
    if (!aiPreview || !description || !contractorAddress) {
      alert('Please fill in all required fields and wait for AI processing');
      return;
    }
    setCurrentStep(1);
  };

  const handleStep2Submit = async () => {
    setIsProcessing(true);
    setCurrentStep(2);
    
    try {
      const result = await invoiceService.createSmartInvoice({
        description,
        projectTitle: projectTitle || aiPreview?.project_title || 'Untitled Project',
        clientWallet: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
        contractorAddress,
        arbitratorAddress: arbitratorAddress || 'SP1KFJXJ8Q9HV7YP3WGH98JN3JKZM7RQ2TKXHXF4N',
      });
      
      setDeploymentResult(result);
      setCurrentStep(3);
    } catch (error: any) {
      alert(`Deployment failed: ${error.message}`);
      setCurrentStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Smart Invoice with AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your project description into a secure, blockchain-powered smart contract
          </p>
        </div>

        {/* Step Indicator */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      index < currentStep
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                        : index === currentStep
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 ring-4 ring-blue-100'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <div
                      className={`text-sm font-medium ${
                        index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 mt-6 rounded-full transition-all duration-300 min-w-[80px] ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-2 border-gray-200">
            <CardContent className="p-8">
              {/* Step 0: Describe Project */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., Website Redesign for Marketing DAO"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe Your Project in Detail <span className="text-orange-500">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={8}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      placeholder="Example: Create a responsive website for our DAO with 3 milestones: 
1. Design approval (30% - 1,500 sBTC)
2. Frontend development (50% - 2,500 sBTC)  
3. Backend integration and launch (20% - 1,000 sBTC)
Total budget: 5,000 sBTC. Timeline: 6 weeks."
                    />
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm">
                        {description.length < 30 ? (
                          <span className="text-orange-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Provide more details (minimum 30 characters)
                          </span>
                        ) : (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            AI is processing your description...
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{description.length} characters</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contractor Wallet Address <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={contractorAddress}
                      onChange={(e) => setContractorAddress(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm"
                      placeholder="SP3FGQ8Z7JY..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arbitrator Address (Optional)
                    </label>
                    <input
                      type="text"
                      value={arbitratorAddress}
                      onChange={(e) => setArbitratorAddress(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm"
                      placeholder="SP3FGQ8Z7JY... (Leave empty for default)"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      An independent third party to resolve disputes
                    </p>
                  </div>

                  {/* AI Preview */}
                  {aiPreview && (
                    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900">
                          <Brain className="w-5 h-5" />
                          AI Preview
                          <Badge className="ml-2 bg-green-500">
                            {Math.round(aiPreview.confidence * 100)}% Confidence
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <span className="font-medium text-gray-700">Total Amount:</span>
                            <div className="text-lg font-bold text-blue-900">
                              {aiPreview.total_amount} {aiPreview.currency}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Milestones:</span>
                            <div className="text-lg font-bold text-purple-900">
                              {aiPreview.milestones.length} milestones detected
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Project Scope:</span>
                          <p className="text-sm text-gray-700 mt-1">{aiPreview.project_scope}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <Button
                      onClick={handleStep1Submit}
                      disabled={!aiPreview || description.length < 30 || !contractorAddress}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      Continue to Review
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 1: Review Contract */}
              {currentStep === 1 && aiPreview && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Contract Terms</h2>
                    <p className="text-gray-600">Verify the AI-generated smart contract details</p>
                  </div>

                  <Card className="bg-gray-50">
                    <CardHeader>
                      <CardTitle>Project Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Project Title:</span>
                        <span className="font-semibold">{projectTitle || aiPreview.project_title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Budget:</span>
                        <span className="font-semibold">{aiPreview.total_amount} {aiPreview.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timeline:</span>
                        <span className="font-semibold">{aiPreview.timeline}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contractor:</span>
                        <span className="font-mono text-xs">{contractorAddress.slice(0, 12)}...</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50">
                    <CardHeader>
                      <CardTitle>Milestones ({aiPreview.milestones.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {aiPreview.milestones.map((milestone, index) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-white rounded-r-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold text-gray-900">
                                Milestone {index + 1}
                              </span>
                              <div className="text-right">
                                <div className="text-blue-600 font-bold">
                                  {milestone.amount} {aiPreview.currency}
                                </div>
                                <div className="text-xs text-gray-500">{milestone.percentage}%</div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">{milestone.description}</p>
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">Condition:</span> {milestone.condition}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between pt-6 border-t border-gray-200">
                    <Button
                      onClick={() => setCurrentStep(0)}
                      variant="outline"
                      size="lg"
                    >
                      Back to Edit
                    </Button>
                    <Button
                      onClick={handleStep2Submit}
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
                    >
                      <CheckCircle2 className="mr-2 w-5 h-5" />
                      Deploy Smart Contract
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Deploying */}
              {currentStep === 2 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Deploying Contract</h2>
                  <p className="text-gray-600 mb-4">
                    Please confirm the transaction in your wallet...
                  </p>
                  <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-900 font-medium">Processing on Stacks blockchain</span>
                  </div>
                </div>
              )}

              {/* Step 3: Success */}
              {currentStep === 3 && deploymentResult && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Invoice Created Successfully!
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Your smart contract has been deployed to the Stacks blockchain
                  </p>

                  <Card className="bg-gray-50 max-w-md mx-auto mb-8">
                    <CardContent className="pt-6">
                      <div className="space-y-3 text-left">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Invoice ID:</span>
                          <span className="font-mono font-semibold">{deploymentResult.invoiceId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contract:</span>
                          <span className="font-mono text-xs">{deploymentResult.contractAddress}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => navigate('/invoices')}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      <FileText className="mr-2 w-5 h-5" />
                      View All Invoices
                    </Button>
                    <Button
                      onClick={() => {
                        setCurrentStep(0);
                        setDescription('');
                        setProjectTitle('');
                        setContractorAddress('');
                        setArbitratorAddress('');
                        setAiPreview(null);
                        setDeploymentResult(null);
                      }}
                      variant="outline"
                      size="lg"
                    >
                      Create Another
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
