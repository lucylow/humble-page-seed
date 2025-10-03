// @ts-nocheck
import { useState } from 'react';
import { useDoma } from '../../contexts/DomaContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Domain {
  name: string;
  registrationDate: string;
  expirationDate: string;
  tokenId?: string;
}

interface TokenizationWizardProps {
  domain: Domain;
  onComplete: (result: any) => void;
  onClose: () => void;
}

interface Metadata {
  description: string;
  category: string;
  tags: string[];
  fractionalization: boolean;
  royalties: number;
}

const TokenizationWizard: React.FC<TokenizationWizardProps> = ({ 
  domain, 
  onComplete, 
  onClose 
}) => {
  const { tokenizeDomain } = useDoma();
  const [currentStep, setCurrentStep] = useState(1);
  const [metadata, setMetadata] = useState<Metadata>({
    description: '',
    category: '',
    tags: [],
    fractionalization: false,
    royalties: 2.5
  });
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    {
      title: "Confirm Domain Details",
      description: "Review your domain information before tokenization",
      fields: []
    },
    {
      title: "Add Domain Metadata",
      description: "Help buyers understand your domain's value",
      fields: ['description', 'category', 'tags']
    },
    {
      title: "Set Tokenization Options",
      description: "Configure how your domain will be tokenized",
      fields: ['fractionalization', 'royalties']
    },
    {
      title: "Review & Confirm",
      description: "Final check before tokenizing your domain",
      fields: []
    }
  ];

  const handleTokenize = async () => {
    setIsLoading(true);
    try {
      const result = await tokenizeDomain(domain.name, metadata);
      onComplete(result);
    } catch (error) {
      console.error('Tokenization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !metadata.tags.includes(tag)) {
      setMetadata({...metadata, tags: [...metadata.tags, tag]});
    }
  };

  const removeTag = (tagToRemove: string) => {
    setMetadata({...metadata, tags: metadata.tags.filter(tag => tag !== tagToRemove)});
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 ${
                    currentStep > index + 1 ? 'text-green-600' : 
                    currentStep === index + 1 ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      currentStep > index + 1 
                        ? 'bg-green-500 text-white' 
                        : currentStep === index + 1 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {currentStep > index + 1 ? '✓' : index + 1}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>
          
          <CardTitle className="text-2xl font-bold text-gradient-premium">
            Tokenize {domain.name}
          </CardTitle>
          <p className="text-muted-foreground">
            {steps[currentStep - 1].description}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Domain Review */}
          {currentStep === 1 && (
            <div className="domain-review">
              <h3 className="text-xl font-semibold mb-4">Domain Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Domain Name:</span>
                    <span className="font-semibold">{domain.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Registration Date:</span>
                    <span>{new Date(domain.registrationDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Expiration Date:</span>
                    <span>{new Date(domain.expirationDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Status:</span>
                    <Badge variant="outline">Ready for Tokenization</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Estimated Value:</span>
                    <span className="font-semibold text-green-600">$5,000 - $15,000</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Metadata Form */}
          {currentStep === 2 && (
            <div className="metadata-form space-y-6">
              <h3 className="text-xl font-semibold">Describe Your Domain</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={metadata.description}
                    onChange={(e) => setMetadata({...metadata, description: e.target.value})}
                    placeholder="Describe what makes this domain valuable, its potential uses, and why it's a good investment..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select
                    value={metadata.category}
                    onValueChange={(value) => setMetadata({...metadata, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto">Crypto & Blockchain</SelectItem>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="health">Health & Wellness</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="space-y-3">
                    <Input
                      placeholder="Add a tag and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addTag(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    {metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {metadata.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="flex items-center gap-1"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-1 text-gray-500 hover:text-gray-700"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Tokenization Options */}
          {currentStep === 3 && (
            <div className="tokenization-options space-y-6">
              <h3 className="text-xl font-semibold">Tokenization Configuration</h3>
              
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/30 dark:border-emerald-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">Fractional Ownership</h4>
                      <p className="text-sm text-muted-foreground">Allow multiple investors to own shares of this domain</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={metadata.fractionalization}
                        onChange={(e) => setMetadata({...metadata, fractionalization: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {metadata.fractionalization && (
                    <div className="text-sm text-muted-foreground">
                      <p>✓ Enables liquidity for high-value domains</p>
                      <p>✓ Allows smaller investors to participate</p>
                      <p>✓ Increases market accessibility</p>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/30 dark:border-purple-700/30">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Creator Royalties</h4>
                      <p className="text-sm text-muted-foreground">Percentage you earn from future sales</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={metadata.royalties}
                        onChange={(e) => setMetadata({...metadata, royalties: parseFloat(e.target.value)})}
                        className="flex-1"
                      />
                      <span className="font-semibold text-lg">{metadata.royalties}%</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Recommended: 2.5% - 5% for domain royalties</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {currentStep === 4 && (
            <div className="review-confirm space-y-6">
              <h3 className="text-xl font-semibold">Review Your Tokenization</h3>
              
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4">Domain Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><span className="text-muted-foreground">Name:</span> {domain.name}</div>
                      <div><span className="text-muted-foreground">Category:</span> {metadata.category || 'Not specified'}</div>
                      <div><span className="text-muted-foreground">Description:</span> {metadata.description || 'No description'}</div>
                      <div><span className="text-muted-foreground">Tags:</span> {metadata.tags.join(', ') || 'None'}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4">Tokenization Settings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fractional Ownership:</span>
                        <span>{metadata.fractionalization ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Creator Royalties:</span>
                        <span>{metadata.royalties}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated Gas Cost:</span>
                        <span>~0.02 ETH</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t">
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isLoading}
                className="px-6"
              >
                Back
              </Button>
            )}
            
            <div className="flex-1" />
            
            {currentStep < steps.length ? (
              <Button 
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                Continue
              </Button>
            ) : (
              <Button 
                onClick={handleTokenize}
                disabled={isLoading}
                className="px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Tokenizing...
                  </div>
                ) : (
                  'Confirm & Tokenize'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenizationWizard;
