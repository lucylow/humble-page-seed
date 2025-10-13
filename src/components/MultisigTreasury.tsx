import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users, CheckCircle, XCircle, Clock, Shield, Vote } from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';

interface Proposal {
  id: number;
  title: string;
  description: string;
  amount: number;
  recipient: string;
  proposedBy: string;
  status: 'voting' | 'approved' | 'rejected' | 'executed';
  votesFor: number;
  votesAgainst: number;
  threshold: number;
  deadline: string;
}

interface Signer {
  address: string;
  name: string;
  weight: number;
  hasVoted: boolean;
  vote?: 'approve' | 'reject';
}

const MultisigTreasury: React.FC = () => {
  const { isConnected } = useWalletStore();
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    amount: '',
    recipient: ''
  });

  const proposals: Proposal[] = [
    {
      id: 1,
      title: 'Smart Contract Audit Payment',
      description: 'Payment for Q4 security audit by CertiK',
      amount: 0.85,
      recipient: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      proposedBy: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      status: 'voting',
      votesFor: 3,
      votesAgainst: 0,
      threshold: 3,
      deadline: '2025-11-15'
    },
    {
      id: 2,
      title: 'Marketing Campaign Budget',
      description: 'Q1 2026 marketing and community growth initiatives',
      amount: 1.2,
      recipient: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
      proposedBy: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      status: 'approved',
      votesFor: 5,
      votesAgainst: 0,
      threshold: 3,
      deadline: '2025-11-01'
    },
    {
      id: 3,
      title: 'Developer Grants Program',
      description: 'Fund ecosystem development grants',
      amount: 2.5,
      recipient: 'SP2H8PY27SEZ03MWRKS5XABZYQN17ETGQS3527SA5',
      proposedBy: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
      status: 'voting',
      votesFor: 2,
      votesAgainst: 1,
      threshold: 3,
      deadline: '2025-11-20'
    }
  ];

  const signers: Signer[] = [
    { address: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', name: 'Alice', weight: 1, hasVoted: true, vote: 'approve' },
    { address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', name: 'Bob', weight: 1, hasVoted: true, vote: 'approve' },
    { address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE', name: 'Charlie', weight: 1, hasVoted: false },
    { address: 'SP2H8PY27SEZ03MWRKS5XABZYQN17ETGQS3527SA5', name: 'Diana', weight: 1, hasVoted: true, vote: 'approve' },
    { address: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9', name: 'Eve', weight: 1, hasVoted: false }
  ];

  const createProposal = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!newProposal.title || !newProposal.amount || !newProposal.recipient) {
      alert('Please fill all required fields');
      return;
    }

    try {
      // In production, call smart contract
      alert('Proposal created successfully!');
      setShowCreateProposal(false);
      setNewProposal({ title: '', description: '', amount: '', recipient: '' });
    } catch (error: any) {
      console.error('Failed to create proposal:', error);
      alert('Failed to create proposal: ' + error.message);
    }
  };

  const voteOnProposal = async (proposalId: number, approve: boolean) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // In production, call smart contract
      alert(`Vote ${approve ? 'approved' : 'rejected'} successfully!`);
    } catch (error: any) {
      console.error('Failed to vote:', error);
      alert('Failed to vote: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'voting': return 'bg-blue-600';
      case 'approved': return 'bg-green-600';
      case 'rejected': return 'bg-red-600';
      case 'executed': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Users className="w-10 h-10 text-blue-600" />
          MultiSig Treasury
        </h1>
        <p className="text-muted-foreground text-lg">
          3-of-5 approval workflow for secure DAO funding
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Treasury Balance</p>
                <p className="text-3xl font-bold text-blue-900">12.5 sBTC</p>
              </div>
              <Shield className="w-12 h-12 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Total Proposals</p>
                <p className="text-3xl font-bold text-green-900">247</p>
              </div>
              <Vote className="w-12 h-12 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Active Signers</p>
                <p className="text-3xl font-bold text-purple-900">{signers.length}</p>
              </div>
              <Users className="w-12 h-12 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Approval Threshold</p>
                <p className="text-3xl font-bold text-orange-900">3/5</p>
              </div>
              <CheckCircle className="w-12 h-12 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Proposal Button */}
      <div className="mb-6">
        <Button onClick={() => setShowCreateProposal(!showCreateProposal)}>
          {showCreateProposal ? 'Cancel' : 'Create New Proposal'}
        </Button>
      </div>

      {/* Create Proposal Form */}
      {showCreateProposal && (
        <Card className="mb-6 border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Create New Proposal</CardTitle>
            <CardDescription>Submit a payment proposal for DAO approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                placeholder="e.g., Q4 Marketing Budget"
                value={newProposal.title}
                onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Detailed description of the proposal"
                value={newProposal.description}
                onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Amount (sBTC)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newProposal.amount}
                  onChange={(e) => setNewProposal({ ...newProposal, amount: e.target.value })}
                  step="0.01"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Recipient Address</label>
                <Input
                  placeholder="SP..."
                  value={newProposal.recipient}
                  onChange={(e) => setNewProposal({ ...newProposal, recipient: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={createProposal} className="w-full">
              Submit Proposal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Proposals List */}
      <div className="space-y-4 mb-8">
        <h2 className="text-2xl font-bold">Active Proposals</h2>
        {proposals.map((proposal) => (
          <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{proposal.title}</CardTitle>
                <Badge className={getStatusColor(proposal.status)}>
                  {proposal.status.toUpperCase()}
                </Badge>
              </div>
              <CardDescription>{proposal.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold text-green-600">{proposal.amount} sBTC</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Votes</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">{proposal.votesFor}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-2xl font-bold text-red-600">{proposal.votesAgainst}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Threshold</p>
                  <p className="text-2xl font-bold">
                    {proposal.threshold} required
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipient:</span>
                  <span className="font-mono">{proposal.recipient.substring(0, 12)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Proposed by:</span>
                  <span className="font-mono">{proposal.proposedBy.substring(0, 12)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deadline:</span>
                  <span className="font-semibold">{proposal.deadline}</span>
                </div>
              </div>

              {/* Vote Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress to threshold</span>
                  <span className="font-semibold">
                    {proposal.votesFor}/{proposal.threshold}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      proposal.votesFor >= proposal.threshold ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${(proposal.votesFor / proposal.threshold) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Vote Buttons */}
              {proposal.status === 'voting' && (
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => voteOnProposal(proposal.id, true)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => voteOnProposal(proposal.id, false)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}

              {proposal.status === 'approved' && (
                <Button className="w-full">
                  Execute Payment
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Signers List */}
      <Card>
        <CardHeader>
          <CardTitle>DAO Signers</CardTitle>
          <CardDescription>Authorized members with voting rights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {signers.map((signer, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-purple-600">{signer.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{signer.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {signer.address.substring(0, 16)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Weight: {signer.weight}</Badge>
                  {signer.hasVoted ? (
                    <Badge className={signer.vote === 'approve' ? 'bg-green-600' : 'bg-red-600'}>
                      {signer.vote === 'approve' ? '✓ Approved' : '✗ Rejected'}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-600">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultisigTreasury;

