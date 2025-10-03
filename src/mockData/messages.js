// src/mockData/messages.js
export const mockMessages = [
  {
    id: "msg_001",
    domainId: 3,
    domainName: "web3developers.com",
    from: "0x8a4e3f8a7d1b2c5d6e4f4a3b2c1d5e6f4a3b2c1",
    to: "0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3",
    type: "offer",
    subject: "Offer for web3developers.com",
    message: "I'm interested in purchasing web3developers.com for 30,000 USDC. Would you consider this offer?",
    amount: 30000,
    currency: "USDC",
    timestamp: "2023-10-12T16:45:23Z",
    status: "pending",
    read: false,
    priority: "high"
  },
  {
    id: "msg_002",
    domainId: 1,
    domainName: "cryptoqueen.xyz",
    from: "system",
    to: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    type: "notification",
    subject: "Domain viewed",
    message: "Your domain cryptoqueen.xyz was viewed by a potential buyer.",
    amount: null,
    currency: null,
    timestamp: "2023-10-15T08:12:57Z",
    status: "read",
    read: true,
    priority: "low"
  },
  {
    id: "msg_003",
    domainId: 2,
    domainName: "nftgallery.io",
    from: "system",
    to: "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c",
    type: "notification",
    subject: "Revenue distributed",
    message: "Revenue of 1250 USDC has been distributed to nftgallery.io shareholders.",
    amount: 1250,
    currency: "USDC",
    timestamp: "2023-09-30T14:30:00Z",
    status: "read",
    read: true,
    priority: "medium"
  },
  {
    id: "msg_004",
    domainId: 4,
    domainName: "defiwallet.app",
    from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    to: "0x8a4e3f8a7d1b2c5d6e4f4a3b2c1d5e6f4a3b2c1",
    type: "message",
    subject: "Partnership opportunity",
    message: "Hi! I noticed you own defiwallet.app. I'm building a DeFi platform and would love to discuss a potential partnership or acquisition.",
    amount: null,
    currency: null,
    timestamp: "2023-10-14T11:30:15Z",
    status: "pending",
    read: false,
    priority: "high"
  },
  {
    id: "msg_005",
    domainId: 1,
    domainName: "cryptoqueen.xyz",
    from: "0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3",
    to: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    type: "offer",
    subject: "Counter offer for cryptoqueen.xyz",
    message: "Thank you for your response. I can increase my offer to 24,000 USDC. This is my final offer.",
    amount: 24000,
    currency: "USDC",
    timestamp: "2023-10-13T15:45:30Z",
    status: "pending",
    read: false,
    priority: "high"
  },
  {
    id: "msg_006",
    domainId: 2,
    domainName: "nftgallery.io",
    from: "system",
    to: "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c",
    type: "notification",
    subject: "New shareholder joined",
    message: "A new shareholder has purchased 100 shares of nftgallery.io.",
    amount: 100,
    currency: "shares",
    timestamp: "2023-10-05T14:15:23Z",
    status: "read",
    read: true,
    priority: "medium"
  },
  {
    id: "msg_007",
    domainId: 6,
    domainName: "blockchainacademy.org",
    from: "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c",
    to: "0x3c7f9e2b5d8a1c4f7e0b3d6c9f2a5b8e1c4f7a0",
    type: "offer",
    subject: "Offer for blockchainacademy.org",
    message: "I'm building an educational platform and this domain would be perfect. I can offer 26,000 USDC.",
    amount: 26000,
    currency: "USDC",
    timestamp: "2023-10-11T11:20:00Z",
    status: "accepted",
    read: true,
    priority: "high"
  },
  {
    id: "msg_008",
    domainId: 5,
    domainName: "metaversehub.net",
    from: "system",
    to: "0x9b5f4c8e2a7d1b3c6e9f2a5b8c1d4e7f0a3b6c9",
    type: "notification",
    subject: "Auction ending soon",
    message: "Your auction for metaversehub.net ends in 2 hours. Current bid: 13,500 USDC",
    amount: 13500,
    currency: "USDC",
    timestamp: "2023-10-15T09:20:00Z",
    status: "read",
    read: true,
    priority: "high"
  }
];

export const mockNotifications = [
  {
    id: "notif_001",
    type: "domain_sale",
    title: "Domain Sold!",
    message: "Your domain cryptoqueen.xyz has been sold for 25,000 USDC",
    timestamp: "2023-10-05T14:32:18Z",
    read: true,
    action: {
      type: "view_transaction",
      data: { transactionId: "txn_001" }
    }
  },
  {
    id: "notif_002",
    type: "new_offer",
    title: "New Offer Received",
    message: "You received a new offer of 30,000 USDC for web3developers.com",
    timestamp: "2023-10-12T16:45:23Z",
    read: false,
    action: {
      type: "view_offer",
      data: { offerId: "offer_003" }
    }
  },
  {
    id: "notif_003",
    type: "revenue_distribution",
    title: "Revenue Distributed",
    message: "1,250 USDC has been distributed to nftgallery.io shareholders",
    timestamp: "2023-09-30T14:30:00Z",
    read: true,
    action: {
      type: "view_distribution",
      data: { domainId: 2 }
    }
  },
  {
    id: "notif_004",
    type: "auction_ending",
    title: "Auction Ending Soon",
    message: "Your auction for defiwallet.app ends in 1 hour",
    timestamp: "2023-10-19T10:20:00Z",
    read: false,
    action: {
      type: "view_auction",
      data: { listingId: "list_003" }
    }
  },
  {
    id: "notif_005",
    type: "share_purchase",
    title: "Shares Purchased",
    message: "You purchased 120 shares of defiwallet.app for 4,440 USDC",
    timestamp: "2023-10-08T11:20:35Z",
    read: true,
    action: {
      type: "view_shares",
      data: { domainId: 4 }
    }
  },
  {
    id: "notif_006",
    type: "governance_vote",
    title: "Vote Required",
    message: "New proposal for nftgallery.io requires your vote",
    timestamp: "2023-10-10T14:30:00Z",
    read: false,
    action: {
      type: "view_proposal",
      data: { proposalId: "prop_001" }
    }
  }
];

export const mockMessageTypes = [
  { type: "offer", label: "Offer", icon: "💰", color: "#F59E0B" },
  { type: "message", label: "Message", icon: "💬", color: "#3B82F6" },
  { type: "notification", label: "Notification", icon: "🔔", color: "#10B981" },
  { type: "system", label: "System", icon: "⚙️", color: "#6B7280" }
];

export const mockNotificationTypes = [
  { type: "domain_sale", label: "Domain Sale", icon: "💰", color: "#10B981" },
  { type: "new_offer", label: "New Offer", icon: "📝", color: "#F59E0B" },
  { type: "revenue_distribution", label: "Revenue", icon: "💸", color: "#3B82F6" },
  { type: "auction_ending", label: "Auction", icon: "🔨", color: "#EF4444" },
  { type: "share_purchase", label: "Shares", icon: "🔗", color: "#8B5CF6" },
  { type: "governance_vote", label: "Governance", icon: "🗳️", color: "#6366F1" }
];

export const mockMessageStats = {
  totalMessages: 1247,
  unreadMessages: 23,
  totalNotifications: 892,
  unreadNotifications: 5,
  messageTypes: [
    { type: "offer", count: 456, percentage: 36.6 },
    { type: "message", count: 345, percentage: 27.7 },
    { type: "notification", count: 234, percentage: 18.8 },
    { type: "system", count: 212, percentage: 17.0 }
  ],
  averageResponseTime: "4.2 hours",
  userSatisfaction: 4.6
};
