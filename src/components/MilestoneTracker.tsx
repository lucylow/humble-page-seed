import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useWalletStore } from "@/store/useWalletStore";

interface Milestone {
  id: number;
  description: string;
  amount: number;
  status: string;
}

interface MilestoneTrackerProps {
  milestones: Milestone[];
  invoiceId: string;
}

const MilestoneTracker = ({ milestones, invoiceId }: MilestoneTrackerProps) => {
  const { isConnected } = useWalletStore();

  const handleApproveMilestone = async (milestoneId: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      // In real implementation, call smart contract
      toast.success(`Milestone ${milestoneId} approved!`);
    } catch (error) {
      toast.error("Failed to approve milestone");
    }
  };

  const handleReleaseMilestone = async (milestoneId: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      // In real implementation, call smart contract
      toast.success(`Payment for milestone ${milestoneId} released!`);
    } catch (error) {
      toast.error("Failed to release payment");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "released":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "disputed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      "released": "default",
      "approved": "secondary",
      "pending": "outline",
      "disputed": "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestones ({milestones.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{getStatusIcon(milestone.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">Milestone {milestone.id}</h4>
                      {getStatusBadge(milestone.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {milestone.description}
                    </p>
                    <p className="text-lg font-bold">${milestone.amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {milestone.status === "pending" && (
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    onClick={() => handleApproveMilestone(milestone.id)}
                    disabled={!isConnected}
                  >
                    Approve
                  </Button>
                </div>
              )}

              {milestone.status === "approved" && (
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    onClick={() => handleReleaseMilestone(milestone.id)}
                    disabled={!isConnected}
                  >
                    Release Payment
                  </Button>
                </div>
              )}

              {milestone.status === "released" && (
                <div className="mt-3">
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Payment released successfully
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MilestoneTracker;

