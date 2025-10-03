// src/mockData/fractional.js
export const mockFractionalData = [
  {
    domainId: 2,
    domainName: "nftgallery.io",
    totalShares: 1000,
    availableShares: 350,
    pricePerShare: 48,
    totalValue: 48000,
    marketCap: 48000,
    dividendYield: 0.08,
    shareholders: [
      {
        address: "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c",
        shares: 650,
        percentage: 65,
        joined: "2023-09-15T10:30:00Z",
        totalInvested: 31200,
        currentValue: 31200,
        roi: 0.0
      },
      {
        address: "0x8a4e3f8a7d1b2c5d6e4f4a3b2c1d5e6f4a3b2c1",
        shares: 250,
        percentage: 25,
        joined: "2023-09-28T09:15:42Z",
        totalInvested: 12000,
        currentValue: 12000,
        roi: 0.0
      },
      {
        address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        shares: 100,
        percentage: 10,
        joined: "2023-10-05T14:15:23Z",
        totalInvested: 4800,
        currentValue: 4800,
        roi: 0.0
      }
    ],
    revenueDistribution: [
      {
        date: "2023-09-30",
        amount: 1250,
        currency: "USDC",
        description: "Advertising revenue Q3 2023",
        perShare: 1.25
      },
      {
        date: "2023-06-30",
        amount: 980,
        currency: "USDC",
        description: "Advertising revenue Q2 2023",
        perShare: 0.98
      },
      {
        date: "2023-03-31",
        amount: 750,
        currency: "USDC",
        description: "Advertising revenue Q1 2023",
        perShare: 0.75
      }
    ],
    governance: {
      totalProposals: 3,
      activeProposals: 1,
      votingPower: {
        "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c": 65,
        "0x8a4e3f8a7d1b2c5d6e4f4a3b2c1d5e6f4a3b2c1": 25,
        "0x742d35Cc6634C0532925a3b844Bc454e4438f44e": 10
      }
    }
  },
  {
    domainId: 4,
    domainName: "defiwallet.app",
    totalShares: 500,
    availableShares: 225,
    pricePerShare: 37,
    totalValue: 18500,
    marketCap: 18500,
    dividendYield: 0.12,
    shareholders: [
      {
        address: "0x8a4e3f8a7d1b2c5d6e4f4a3b2c1d5e6f4a3b2c1",
        shares: 275,
        percentage: 55,
        joined: "2023-10-01T12:45:00Z",
        totalInvested: 10175,
        currentValue: 10175,
        roi: 0.0
      },
      {
        address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        shares: 120,
        percentage: 24,
        joined: "2023-10-08T11:20:35Z",
        totalInvested: 4440,
        currentValue: 4440,
        roi: 0.0
      },
      {
        address: "0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3",
        shares: 80,
        percentage: 16,
        joined: "2023-10-10T15:30:18Z",
        totalInvested: 2960,
        currentValue: 2960,
        roi: 0.0
      }
    ],
    revenueDistribution: [
      {
        date: "2023-10-15",
        amount: 420,
        currency: "USDC",
        description: "Initial partnership revenue",
        perShare: 0.84
      }
    ],
    governance: {
      totalProposals: 1,
      activeProposals: 0,
      votingPower: {
        "0x8a4e3f8a7d1b2c5d6e4f4a3b2c1d5e6f4a3b2c1": 55,
        "0x742d35Cc6634C0532925a3b844Bc454e4438f44e": 24,
        "0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3": 16
      }
    }
  },
  {
    domainId: 5,
    domainName: "metaversehub.net",
    totalShares: 800,
    availableShares: 600,
    pricePerShare: 18.75,
    totalValue: 15000,
    marketCap: 15000,
    dividendYield: 0.05,
    shareholders: [
      {
        address: "0x9b5f4c8e2a7d1b3c6e9f2a5b8c1d4e7f0a3b6c9",
        shares: 200,
        percentage: 25,
        joined: "2023-10-14T13:25:00Z",
        totalInvested: 3750,
        currentValue: 3750,
        roi: 0.0
      }
    ],
    revenueDistribution: [],
    governance: {
      totalProposals: 0,
      activeProposals: 0,
      votingPower: {
        "0x9b5f4c8e2a7d1b3c6e9f2a5b8c1d4e7f0a3b6c9": 25
      }
    }
  }
];

export const mockFractionalTransactions = [
  {
    id: "frac_txn_001",
    domainId: 2,
    domainName: "nftgallery.io",
    type: "share_purchase",
    buyer: "0x8a4e3f8a7d1b2c5d6e4f4a3b2c1d5e6f4a3b2c1",
    seller: "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c",
    shares: 250,
    pricePerShare: 48,
    totalAmount: 12000,
    currency: "USDC",
    timestamp: "2023-09-28T09:15:42Z",
    status: "completed"
  },
  {
    id: "frac_txn_002",
    domainId: 4,
    domainName: "defiwallet.app",
    type: "share_purchase",
    buyer: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    seller: "0x8a4e3f8a7d1b2c5d6e4f4a3b2c1d5e6f4a3b2c1",
    shares: 120,
    pricePerShare: 37,
    totalAmount: 4440,
    currency: "USDC",
    timestamp: "2023-10-08T11:20:35Z",
    status: "completed"
  },
  {
    id: "frac_txn_003",
    domainId: 4,
    domainName: "defiwallet.app",
    type: "share_purchase",
    buyer: "0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3",
    seller: "0x8a4e3f8a7d1b2c5d6e4f4a3b2c1d5e6f4a3b2c1",
    shares: 80,
    pricePerShare: 37,
    totalAmount: 2960,
    currency: "USDC",
    timestamp: "2023-10-10T15:30:18Z",
    status: "completed"
  },
  {
    id: "frac_txn_004",
    domainId: 5,
    domainName: "metaversehub.net",
    type: "share_purchase",
    buyer: "0x9b5f4c8e2a7d1b3c6e9f2a5b8c1d4e7f0a3b6c9",
    seller: "0x3c7f9e2b5d8a1c4f7e0b3d6c9f2a5b8e1c4f7a0",
    shares: 200,
    pricePerShare: 18.75,
    totalAmount: 3750,
    currency: "USDC",
    timestamp: "2023-10-14T13:25:00Z",
    status: "completed"
  }
];

export const mockGovernanceProposals = [
  {
    id: "prop_001",
    domainId: 2,
    domainName: "nftgallery.io",
    title: "Increase advertising revenue sharing",
    description: "Proposal to increase the percentage of advertising revenue shared with shareholders from 80% to 90%.",
    proposer: "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c",
    type: "revenue_sharing",
    status: "active",
    created: "2023-10-10T14:30:00Z",
    expires: "2023-10-17T14:30:00Z",
    votes: {
      for: 75,
      against: 25,
      abstain: 0
    },
    totalVotes: 100,
    quorum: 60,
    threshold: 50
  },
  {
    id: "prop_002",
    domainId: 2,
    domainName: "nftgallery.io",
    title: "Domain development roadmap",
    description: "Proposal to allocate 20% of revenue for domain development and marketing initiatives.",
    proposer: "0x8a4e3f8a7d1b2c5d6e4f4a3b2c1d5e6f4a3b2c1",
    type: "development",
    status: "passed",
    created: "2023-09-20T10:15:00Z",
    expires: "2023-09-27T10:15:00Z",
    votes: {
      for: 85,
      against: 15,
      abstain: 0
    },
    totalVotes: 100,
    quorum: 60,
    threshold: 50
  },
  {
    id: "prop_003",
    domainId: 2,
    domainName: "nftgallery.io",
    title: "Partnership with major NFT marketplace",
    description: "Proposal to enter into a partnership agreement with a major NFT marketplace for increased revenue.",
    proposer: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    type: "partnership",
    status: "rejected",
    created: "2023-08-15T16:45:00Z",
    expires: "2023-08-22T16:45:00Z",
    votes: {
      for: 40,
      against: 60,
      abstain: 0
    },
    totalVotes: 100,
    quorum: 60,
    threshold: 50
  }
];

export const mockFractionalStats = {
  totalFractionalizedDomains: 145,
  totalSharesOutstanding: 125000,
  totalMarketCap: 2500000,
  averageDividendYield: 0.08,
  totalDividendsPaid: 125000,
  activeShareholders: 2345,
  averageSharesPerHolder: 53.2,
  topPerformingDomains: [
    { domainName: "nftgallery.io", roi: 0.15, dividendYield: 0.08 },
    { domainName: "defiwallet.app", roi: 0.12, dividendYield: 0.12 },
    { domainName: "cryptotrading.io", roi: 0.10, dividendYield: 0.06 },
    { domainName: "web3tools.com", roi: 0.09, dividendYield: 0.05 },
    { domainName: "metaversehub.net", roi: 0.07, dividendYield: 0.05 }
  ]
};
