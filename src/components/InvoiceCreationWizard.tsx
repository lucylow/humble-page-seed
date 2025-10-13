import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, FileText, Zap, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useWalletStore } from "@/store/useWalletStore";
import { getNetwork } from "@/lib/stacks";

interface Milestone {
  id: number;
  description: string;
  amount: number;
}

interface InvoiceData {
  client: string;
  arbitrator: string;
  totalAmount: number;
  milestones: Milestone[];
  description: string;
}

const InvoiceCreationWizard = () => {
  const [step, setStep] = useState(1);
  const [aiInput, setAiInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const { isConnected, userAddress, network } = useWalletStore();

  // Simulate AI processing of natural language input
  const processAIInput = async () => {
    if (!aiInput.trim()) {
      toast.error("Please describe your invoice");
      return;
    }

    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Parse the input (in real implementation, this would call GPT-4/Claude)
    const mockParsedData: InvoiceData = {
      client: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
      arbitrator: "SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159",
      totalAmount: 5000,
      milestones: [
        { id: 1, description: "Initial design mockups", amount: 1500 },
        { id: 2, description: "Frontend implementation", amount: 2000 },
        { id: 3, description: "Testing and deployment", amount: 1500 },
      ],
      description: aiInput,
    };

    setInvoiceData(mockParsedData);
    setIsProcessing(false);
    setStep(2);
    toast.success("Invoice parsed successfully!");
  };

  const createInvoice = async () => {
    if (!isConnected || !invoiceData) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsProcessing(true);
      
      // In real implementation, this would call the smart contract
      // const result = await createInvoice(
      //   invoiceData.client,
      //   invoiceData.arbitrator,
      //   invoiceData.totalAmount,
      //   invoiceData.milestones.length,
      //   getNetwork(network === 'mainnet')
      // );

      // Simulate contract creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Invoice created successfully!");
      setStep(3);
      setIsProcessing(false);
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
      setIsProcessing(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setAiInput("");
    setInvoiceData(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className={`text-sm font-medium ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
              Describe Invoice
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-secondary mx-4" />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
              <FileText className="w-4 h-4" />
            </div>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
              Review Details
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-secondary mx-4" />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className={`text-sm font-medium ${step >= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
              Complete
            </span>
          </div>
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              AI-Powered Invoice Creation
            </CardTitle>
            <CardDescription>
              Describe your invoice in natural language, and our AI will structure it for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Describe your invoice
                </label>
                <textarea
                  className="w-full h-32 p-3 border border-border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Example: I need to create an invoice for building a website for DeFi DAO. The total is $5,000 with 3 milestones: design ($1,500), development ($2,000), and deployment ($1,500). The client is SP2J6... and arbitrator is SP3FGQ..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                />
              </div>
              <Button 
                onClick={processAIInput} 
                disabled={isProcessing || !aiInput.trim()}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-pulse" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Invoice
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && invoiceData && (
        <Card>
          <CardHeader>
            <CardTitle>Review Invoice Details</CardTitle>
            <CardDescription>
              Verify the AI-generated invoice structure before creating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{invoiceData.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-sm">Client Address</h3>
                  <p className="text-xs font-mono bg-secondary p-2 rounded">
                    {invoiceData.client}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-sm">Arbitrator Address</h3>
                  <p className="text-xs font-mono bg-secondary p-2 rounded">
                    {invoiceData.arbitrator}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Total Amount</h3>
                <p className="text-2xl font-bold">${invoiceData.totalAmount.toLocaleString()}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Milestones ({invoiceData.milestones.length})</h3>
                <div className="space-y-3">
                  {invoiceData.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{milestone.id}</Badge>
                        <span className="text-sm">{milestone.description}</span>
                      </div>
                      <span className="font-semibold">${milestone.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back to Edit
                </Button>
                <Button 
                  onClick={createInvoice} 
                  disabled={isProcessing || !isConnected}
                  className="flex-1"
                >
                  {isProcessing ? "Creating..." : "Create Invoice"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              Invoice Created Successfully!
            </CardTitle>
            <CardDescription>
              Your invoice has been deployed to the Stacks blockchain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Invoice ID</p>
                <p className="font-mono font-semibold">#INV-{Math.floor(Math.random() * 10000)}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm">✅ Smart contract deployed</p>
                <p className="text-sm">✅ Milestones configured</p>
                <p className="text-sm">✅ Escrow initialized</p>
              </div>

              <Button onClick={resetWizard} className="w-full">
                Create Another Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvoiceCreationWizard;

