import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, DollarSign } from "lucide-react";
import WalletConnect from "@/components/WalletConnect";
import MilestoneTracker from "@/components/MilestoneTracker";
import DisputeResolution from "@/components/DisputeResolution";

const InvoiceDetails = () => {
  const { id } = useParams();
  const [showDispute, setShowDispute] = useState(false);

  // Mock invoice data (in real app, fetch from blockchain)
  const invoice = {
    id: id || "INV-001",
    status: "in-progress",
    amount: "$12,500",
    dao: "DeFi DAO",
    issuer: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    client: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    arbitrator: "SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159",
    totalAmount: 12500,
    releasedAmount: 5000,
    createdAt: "2025-01-15",
    milestones: [
      { id: 1, description: "Initial design mockups", amount: 5000, status: "released" },
      { id: 2, description: "Frontend implementation", amount: 5000, status: "approved" },
      { id: 3, description: "Testing and deployment", amount: 2500, status: "pending" },
    ],
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      "completed": "default",
      "in-progress": "secondary",
      "pending": "outline",
      "disputed": "destructive",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <WalletConnect />
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Invoice {invoice.id}</CardTitle>
                    <CardDescription>{invoice.dao}</CardDescription>
                  </div>
                  {getStatusBadge(invoice.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Issuer</p>
                      <p className="text-xs font-mono bg-secondary p-2 rounded">
                        {invoice.issuer}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Client</p>
                      <p className="text-xs font-mono bg-secondary p-2 rounded">
                        {invoice.client}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Arbitrator</p>
                    <p className="text-xs font-mono bg-secondary p-2 rounded">
                      {invoice.arbitrator}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Created</p>
                    <p className="text-sm">{invoice.createdAt}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <MilestoneTracker milestones={invoice.milestones} invoiceId={invoice.id} />

            {showDispute && (
              <DisputeResolution 
                invoiceId={invoice.id} 
                onClose={() => setShowDispute(false)} 
              />
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-2xl font-bold">${invoice.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Released</p>
                  <p className="text-xl font-semibold text-green-600">
                    ${invoice.releasedAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                  <p className="text-xl font-semibold">
                    ${(invoice.totalAmount - invoice.releasedAmount).toLocaleString()}
                  </p>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(invoice.releasedAmount / invoice.totalAmount) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {Math.round((invoice.releasedAmount / invoice.totalAmount) * 100)}% Complete
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Fund Invoice
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowDispute(true)}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Raise Dispute
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;

