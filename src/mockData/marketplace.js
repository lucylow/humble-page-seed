// src/mockData/marketplace.js
export const mockMarketplaceListings = [
  {
    id: "list_001",
    domainId: 1,
    domainName: "cryptoqueen.xyz",
    seller: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    price: 25000,
    currency: "USDC",
    listingType: "fixed_price",
    created: "2023-10-05T14:30:00Z",
    expires: "2023-12-05T14:30:00Z",
    isAuction: false,
    auctionEnd: null,
    currentBid: null,
    minBid: null,
    views: 142,
    offers: 3,
    status: "active",
    featured: true,
    category: "crypto",
    description: "Premium crypto domain perfect for women-led blockchain projects and communities."
  },
  {
    id: "list_002",
    domainId: 3,
    domainName: "web3developers.com",
    seller: "0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3",
    price: 32000,
    currency: "USDC",
    listingType: "fixed_price",
    created: "2023-10-10T09:45:00Z",
    expires: "2024-01-10T09:45:00Z",
    isAuction: false,
    auctionEnd: null,
    currentBid: null,
    minBid: null,
    views: 89,
    offers: 2,
    status: "active",
    featured: false,
    category: "web3",
    description: "Ideal domain for Web3 developer community, resources, and educational platforms."
  },
  {
    id: "list_003",
    domainId: 4,
    domainName: "defiwallet.app",
    seller: "0x8a4e3f8a7d1b2c5d6e4f4a3b2c1d5e6f4a3b2c1",
    price: 18500,
    currency: "USDC",
    listingType: "auction",
    created: "2023-10-12T11:20:00Z",
    expires: "2023-10-19T11:20:00Z",
    isAuction: true,
    auctionEnd: "2023-10-19T11:20:00Z",
    currentBid: 16200,
    minBid: 15000,
    views: 67,
    offers: 5,
    status: "active",
    featured: false,
    category: "defi",
    description: "Perfect domain for DeFi wallet applications and decentralized finance platforms."
  },
  {
    id: "list_004",
    domainId: 6,
    domainName: "blockchainacademy.org",
    seller: "0x3c7f9e2b5d8a1c4f7e0b3d6c9f2a5b8e1c4f7a0",
    price: 28000,
    currency: "USDC",
    listingType: "fixed_price",
    created: "2023-10-08T16:15:00Z",
    expires: "2024-01-08T16:15:00Z",
    isAuction: false,
    auctionEnd: null,
    currentBid: null,
    minBid: null,
    views: 156,
    offers: 4,
    status: "active",
    featured: true,
    category: "education",
    description: "Educational platform domain for blockchain and cryptocurrency learning resources."
  },
  {
    id: "list_005",
    domainId: 5,
    domainName: "metaversehub.net",
    seller: "0x9b5f4c8e2a7d1b3c6e9f2a5b8c1d4e7f0a3b6c9",
    price: 15000,
    currency: "USDC",
    listingType: "auction",
    created: "2023-10-14T10:00:00Z",
    expires: "2023-10-21T10:00:00Z",
    isAuction: true,
    auctionEnd: "2023-10-21T10:00:00Z",
    currentBid: 13500,
    minBid: 12000,
    views: 43,
    offers: 2,
    status: "active",
    featured: false,
    category: "metaverse",
    description: "Central hub domain for metaverse experiences, virtual worlds, and communities."
  }
];

export const mockAuctionBids = [
  {
    id: "bid_001",
    listingId: "list_003",
    domainName: "defiwallet.app",
    bidder: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    amount: 16200,
    currency: "USDC",
    timestamp: "2023-10-15T14:30:00Z",
    status: "active",
    isWinning: true
  },
  {
    id: "bid_002",
    listingId: "list_003",
    domainName: "defiwallet.app",
    bidder: "0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3",
    amount: 15800,
    currency: "USDC",
    timestamp: "2023-10-15T12:15:00Z",
    status: "outbid",
    isWinning: false
  },
  {
    id: "bid_003",
    listingId: "list_003",
    domainName: "defiwallet.app",
    bidder: "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c",
    amount: 15000,
    currency: "USDC",
    timestamp: "2023-10-15T10:00:00Z",
    status: "outbid",
    isWinning: false
  },
  {
    id: "bid_004",
    listingId: "list_005",
    domainName: "metaversehub.net",
    bidder: "0x8a4e3f8a7d1b2c5d6e4f4a3b2c1d5e6f4a3b2c1",
    amount: 13500,
    currency: "USDC",
    timestamp: "2023-10-15T16:45:00Z",
    status: "active",
    isWinning: true
  },
  {
    id: "bid_005",
    listingId: "list_005",
    domainName: "metaversehub.net",
    bidder: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    amount: 12000,
    currency: "USDC",
    timestamp: "2023-10-15T14:20:00Z",
    status: "outbid",
    isWinning: false
  }
];

export const mockOffers = [
  {
    id: "offer_001",
    listingId: "list_001",
    domainName: "cryptoqueen.xyz",
    offerer: "0x8a4e3f8a7d1b2c5d6e4f4a3b2c1d5e6f4a3b2c1",
    amount: 23000,
    currency: "USDC",
    message: "I'm interested in this domain for my new crypto project. Would you consider this offer?",
    timestamp: "2023-10-14T09:30:00Z",
    status: "pending",
    expires: "2023-10-21T09:30:00Z"
  },
  {
    id: "offer_002",
    listingId: "list_001",
    domainName: "cryptoqueen.xyz",
    offerer: "0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3",
    amount: 24000,
    currency: "USDC",
    message: "Great domain! I'd like to make an offer for my women-led blockchain initiative.",
    timestamp: "2023-10-13T15:45:00Z",
    status: "pending",
    expires: "2023-10-20T15:45:00Z"
  },
  {
    id: "offer_003",
    listingId: "list_002",
    domainName: "web3developers.com",
    offerer: "0x8a4e3f8a7d1b2c5d6e4f4a3b2c1d5e6f4a3b2c1",
    amount: 30000,
    currency: "USDC",
    message: "Perfect domain for my Web3 developer community platform. Let's discuss!",
    timestamp: "2023-10-12T16:45:00Z",
    status: "pending",
    expires: "2023-10-19T16:45:00Z"
  },
  {
    id: "offer_004",
    listingId: "list_004",
    domainName: "blockchainacademy.org",
    offerer: "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c",
    amount: 26000,
    currency: "USDC",
    message: "I'm building an educational platform and this domain would be perfect.",
    timestamp: "2023-10-11T11:20:00Z",
    status: "accepted",
    expires: "2023-10-18T11:20:00Z"
  }
];

export const mockMarketplaceStats = {
  totalListings: 1247,
  activeListings: 892,
  soldListings: 355,
  totalVolume: 12500000,
  averageListingPrice: 18500,
  averageTimeToSale: "45 days",
  topCategories: [
    { category: "crypto", count: 245, avgPrice: 22000 },
    { category: "web3", count: 189, avgPrice: 18500 },
    { category: "defi", count: 156, avgPrice: 16500 },
    { category: "nft", count: 134, avgPrice: 19500 },
    { category: "education", count: 87, avgPrice: 12500 }
  ],
  listingTypes: [
    { type: "fixed_price", count: 678, percentage: 76.0 },
    { type: "auction", count: 214, percentage: 24.0 }
  ]
};
