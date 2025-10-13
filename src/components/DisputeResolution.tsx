import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { useWalletStore } from "@/store/useWalletStore";

interface DisputeResolutionProps {
  invoiceId: string;
  onClose: () => void;
}

const DisputeResolution = ({ invoiceId, onClose }: DisputeResolutionProps) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isConnected, userAddress } = useWalletStore();

  const handleRaiseDispute = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for the dispute");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // In real implementation, call smart contract
      // await raiseDispute(invoiceId, reason, network);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Dispute raised successfully. The arbitrator will review it.");
      onClose();
    } catch (error) {
      console.error("Error raising dispute:", error);
      toast.error("Failed to raise dispute");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <CardTitle>Raise a Dispute</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          Explain the issue with this invoice. The arbitrator will review and make a decision.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Dispute Reason
            </label>
            <textarea
              className="w-full h-32 p-3 border border-border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-destructive"
              placeholder="Describe the issue in detail..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={512}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {reason.length}/512 characters
            </p>
          </div>

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-destructive font-semibold mb-2">⚠️ Important</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Raising a dispute will pause all milestone payments</li>
              <li>The arbitrator will review both parties' claims</li>
              <li>The decision will be final and binding</li>
              <li>False disputes may affect your reputation</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRaiseDispute}
              disabled={isSubmitting || !reason.trim() || !isConnected}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Raise Dispute"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DisputeResolution;

