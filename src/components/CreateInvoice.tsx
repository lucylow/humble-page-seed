/**
 * CreateInvoice Component
 * 
 * Example React component demonstrating how to integrate the
 * smart-invoice-escrow contract with your UI.
 */

import React, { useState } from 'react';
import { 
  createInvoice, 
  addMilestone, 
  fundInvoice,
  stxToMicroStx 
} from '@/lib/contract-integration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { 
  validateWalletAddress, 
  validateAmount, 
  validateMilestone,
  sanitizeString,
  formatValidationError
} from '@/lib/validation';
import { executeBlockchainTransaction } from '@/lib/blockchainErrorHandler';
import { TransactionStatus, type TransactionState } from '@/components/TransactionStatus';
import { useWalletStore } from '@/store/useWalletStore';

interface Milestone {
  id: string;
  description: string;
  amount: string;
}

export default function CreateInvoice() {
  const { network } = useWalletStore();
  const [loading, setLoading] = useState(false);
  const [contractorAddress, setContractorAddress] = useState('');
  const [arbitratorAddress, setArbitratorAddress] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: '1', description: '', amount: '' }
  ]);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<number | null>(null);
  const [step, setStep] = useState<'create' | 'milestones' | 'fund'>('create');
  const [txState, setTxState] = useState<TransactionState>('idle');
  const [txId, setTxId] = useState<string | undefined>();
  const [txError, setTxError] = useState<any>();

  // Calculate total amount
  const totalAmount = milestones.reduce((sum, m) => {
    const amount = parseFloat(m.amount) || 0;
    return sum + amount;
  }, 0);

  // Add a new milestone
  const addMilestoneField = () => {
    setMilestones([
      ...milestones,
      { id: Date.now().toString(), description: '', amount: '' }
    ]);
  };

  // Remove a milestone
  const removeMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter(m => m.id !== id));
    }
  };

  // Update milestone
  const updateMilestone = (id: string, field: 'description' | 'amount', value: string) => {
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  // Step 1: Create invoice
  const handleCreateInvoice = async () => {
    // Validate contractor address
    const contractorValidation = validateWalletAddress(contractorAddress, network === 'mainnet' ? 'mainnet' : 'testnet');
    if (!contractorValidation.isValid) {
      toast.error(formatValidationError('Contractor address', contractorValidation));
      return;
    }

    // Validate arbitrator address if provided
    if (arbitratorAddress && arbitratorAddress.trim()) {
      const arbitratorValidation = validateWalletAddress(arbitratorAddress, network === 'mainnet' ? 'mainnet' : 'testnet');
      if (!arbitratorValidation.isValid) {
        toast.error(formatValidationError('Arbitrator address', arbitratorValidation));
        return;
      }
    }

    // Validate total amount
    const amountValidation = validateAmount(totalAmount, 0);
    if (!amountValidation.isValid) {
      toast.error(formatValidationError('Total amount', amountValidation));
      return;
    }

    setTxState('pending');
    setLoading(true);
    setTxError(undefined);

    const result = await executeBlockchainTransaction(
      async () => {
        const totalMicroStx = stxToMicroStx(totalAmount);
        return new Promise((resolve, reject) => {
          createInvoice(
            sanitizeString(contractorAddress),
            totalMicroStx,
            arbitratorAddress ? sanitizeString(arbitratorAddress) : undefined,
            (data) => {
              setCreatedInvoiceId(0); // Get from actual result in production
              resolve({ txId: data?.txId, data });
            },
            () => reject(new Error('User rejected transaction'))
          );
        });
      },
      {
        onSuccess: (result: any) => {
          setTxState('success');
          setTxId(result?.txId);
          toast.success('Invoice created successfully!');
          setTimeout(() => {
            setStep('milestones');
            setTxState('idle');
            setLoading(false);
          }, 2000);
        },
        onError: (error) => {
          setTxState('error');
          setTxError(error);
          setLoading(false);
          if (error.type !== 'user_rejected') {
            toast.error(error.message);
          }
        }
      }
    );
  };

  // Step 2: Add milestones
  const handleAddMilestones = async () => {
    if (createdInvoiceId === null) {
      toast.error('No invoice ID found');
      return;
    }

    // Validate all milestones
    for (const milestone of milestones) {
      const validation = validateMilestone(milestone.description, milestone.amount);
      if (!validation.isValid) {
        toast.error(validation.error || 'Invalid milestone data');
        return;
      }
    }

    setTxState('pending');
    setLoading(true);
    setTxError(undefined);

    let successCount = 0;

    for (const milestone of milestones) {
      const result = await executeBlockchainTransaction(
        async () => {
          return new Promise((resolve, reject) => {
            addMilestone(
              createdInvoiceId,
              sanitizeString(milestone.description),
              stxToMicroStx(parseFloat(milestone.amount)),
              (data) => resolve({ txId: data?.txId, data }),
              () => reject(new Error('User rejected transaction'))
            );
          });
        },
        {
          onSuccess: () => {
            successCount++;
            if (successCount === milestones.length) {
              setTxState('success');
              toast.success('All milestones added successfully!');
              setTimeout(() => {
                setStep('fund');
                setTxState('idle');
                setLoading(false);
              }, 2000);
            }
          },
          onError: (error) => {
            setTxState('error');
            setTxError(error);
            setLoading(false);
            if (error.type !== 'user_rejected') {
              toast.error(`Failed to add milestone: ${error.message}`);
            }
          }
        }
      );

      if (!result.success) break;
    }
  };

  // Step 3: Fund invoice
  const handleFundInvoice = async () => {
    if (createdInvoiceId === null) {
      toast.error('No invoice ID found');
      return;
    }

    // Get user address (you'd need to get this from your auth state)
    const userAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Placeholder

    setLoading(true);

    try {
      await fundInvoice(
        createdInvoiceId,
        stxToMicroStx(totalAmount),
        userAddress,
        (data) => {
          console.log('Invoice funded:', data);
          toast.success('Invoice funded successfully! 🎉');
          setLoading(false);
          // Reset form or redirect
        },
        () => {
          toast.error('Funding cancelled');
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error funding invoice:', error);
      toast.error('Failed to fund invoice');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Create Smart Invoice</h2>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          <div className={`flex items-center ${step === 'create' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 font-medium">Details</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div className={`h-full ${step !== 'create' ? 'bg-blue-600' : ''}`} />
          </div>
          <div className={`flex items-center ${step === 'milestones' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'milestones' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 font-medium">Milestones</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div className={`h-full ${step === 'fund' ? 'bg-blue-600' : ''}`} />
          </div>
          <div className={`flex items-center ${step === 'fund' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'fund' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2 font-medium">Fund</span>
          </div>
        </div>

        {/* Step 1: Create Invoice */}
        {step === 'create' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Contractor Address *
              </label>
              <Input
                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                value={contractorAddress}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContractorAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be a valid Stacks {network === 'mainnet' ? 'mainnet (SP)' : 'testnet (ST)'} address
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Arbitrator Address (Optional)
              </label>
              <Input
                placeholder="SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"
                value={arbitratorAddress}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArbitratorAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional third-party for dispute resolution
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Milestones</h3>
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="mb-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Milestone {index + 1}</span>
                    {milestones.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(milestone.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    className="mb-2"
                    placeholder="Description"
                    value={milestone.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMilestone(milestone.id, 'description', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Amount in STX"
                    value={milestone.amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMilestone(milestone.id, 'amount', e.target.value)}
                    step="0.000001"
                    min="0"
                  />
                </div>
              ))}

              <Button
                variant="outline"
                onClick={addMilestoneField}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {totalAmount.toFixed(6)} STX
                </span>
              </div>
            </div>

            <Button
              onClick={handleCreateInvoice}
              disabled={loading || txState === 'pending'}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Invoice...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>

            {txState !== 'idle' && (
              <TransactionStatus
                state={txState}
                txId={txId}
                error={txError}
                title="Creating Invoice"
                successMessage="Invoice created successfully!"
                pendingMessage="Creating invoice on blockchain..."
                onRetry={handleCreateInvoice}
                onClose={() => setTxState('idle')}
              />
            )}
          </div>
        )}

        {/* Step 2: Add Milestones (shown after creation) */}
        {step === 'milestones' && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <p className="text-green-800">
                ✅ Invoice created successfully! Invoice ID: {createdInvoiceId}
              </p>
            </div>

            <p className="text-gray-600">
              Now confirm the transaction to add all milestones to the invoice.
            </p>

            <div className="space-y-2">
              {milestones.map((m, index) => (
                <div key={m.id} className="p-3 border rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">Milestone {index + 1}</span>
                    <span className="text-blue-600">{m.amount} STX</span>
                  </div>
                  <p className="text-sm text-gray-600">{m.description}</p>
                </div>
              ))}
            </div>

            <Button
              onClick={handleAddMilestones}
              disabled={loading || txState === 'pending'}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding Milestones...
                </>
              ) : (
                'Add Milestones'
              )}
            </Button>

            {txState !== 'idle' && (
              <TransactionStatus
                state={txState}
                txId={txId}
                error={txError}
                title="Adding Milestones"
                successMessage="All milestones added successfully!"
                pendingMessage="Adding milestones to blockchain..."
                onRetry={handleAddMilestones}
                onClose={() => setTxState('idle')}
              />
            )}
          </div>
        )}

        {/* Step 3: Fund Invoice */}
        {step === 'fund' && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <p className="text-green-800">
                ✅ All milestones added! Ready to fund the invoice.
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-yellow-800">
                <strong>⚠️ Important:</strong> You are about to lock{' '}
                <strong>{totalAmount.toFixed(6)} STX</strong> in escrow. These funds
                will be held until milestones are completed and approved.
              </p>
            </div>

            <Button
              onClick={handleFundInvoice}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Funding Invoice...
                </>
              ) : (
                `Fund Invoice (${totalAmount.toFixed(6)} STX)`
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

