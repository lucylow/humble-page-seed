// src/mockData/analytics.js
export const mockAnalytics = {
  platformMetrics: {
    totalDomains: 1250,
    tokenizedDomains: 890,
    fractionalizedDomains: 145,
    totalTransactions: 5678,
    totalVolume: 12500000,
    activeUsers: 2345,
    dailyTransactions: 45,
    weeklyTransactions: 315,
    monthlyTransactions: 1350,
    averageTransactionValue: 2200,
    platformFee: 0.025
  },
  revenueMetrics: {
    totalRevenue: 187500,
    platformFees: 56250,
    projectedMonthlyRevenue: 62500,
    revenueStreams: {
      transactionFees: 37500,
      premiumServices: 12500,
      marketplaceFees: 6250,
      subscriptionFees: 0
    },
    monthlyRevenue: [
      { month: "2023-01", revenue: 45000 },
      { month: "2023-02", revenue: 52000 },
      { month: "2023-03", revenue: 48000 },
      { month: "2023-04", revenue: 55000 },
      { month: "2023-05", revenue: 62000 },
      { month: "2023-06", revenue: 58000 },
      { month: "2023-07", revenue: 65000 },
      { month: "2023-08", revenue: 70000 },
      { month: "2023-09", revenue: 68000 },
      { month: "2023-10", revenue: 75000 }
    ]
  },
  userGrowth: {
    dailyActiveUsers: 234,
    weeklyActiveUsers: 1234,
    monthlyActiveUsers: 2345,
    newUsersDaily: 23,
    newUsersWeekly: 161,
    newUsersMonthly: 690,
    retentionRate: 0.78,
    churnRate: 0.05,
    userGrowthRate: 0.12
  },
  domainMetrics: {
    averageDomainValue: 15000,
    highestSale: 250000,
    mostActiveCategory: "crypto",
    topTld: ".com",
    averageTimeToSale: "45 days",
    domainAgeDistribution: {
      "0-1 years": 234,
      "1-3 years": 456,
      "3-5 years": 345,
      "5+ years": 215
    },
    categoryDistribution: {
      "crypto": 245,
      "web3": 189,
      "defi": 156,
      "nft": 134,
      "education": 87,
      "gaming": 76,
      "finance": 65,
      "other": 298
    }
  },
  performanceMetrics: {
    averagePageLoadTime: 1.2,
    uptime: 99.9,
    apiResponseTime: 150,
    errorRate: 0.01,
    userSatisfaction: 4.7,
    supportTickets: 45,
    averageResolutionTime: "2.5 hours"
  }
};

export const mockHistoricalData = {
  dailyTransactions: [
    { date: "2023-10-15", count: 52, volume: 125000 },
    { date: "2023-10-14", count: 48, volume: 112000 },
    { date: "2023-10-13", count: 41, volume: 98000 },
    { date: "2023-10-12", count: 56, volume: 145000 },
    { date: "2023-10-11", count: 39, volume: 89000 },
    { date: "2023-10-10", count: 45, volume: 102000 },
    { date: "2023-10-09", count: 37, volume: 85000 },
    { date: "2023-10-08", count: 43, volume: 95000 },
    { date: "2023-10-07", count: 38, volume: 88000 },
    { date: "2023-10-06", count: 44, volume: 105000 },
    { date: "2023-10-05", count: 51, volume: 120000 },
    { date: "2023-10-04", count: 47, volume: 110000 },
    { date: "2023-10-03", count: 42, volume: 98000 },
    { date: "2023-10-02", count: 46, volume: 108000 }
  ],
  userGrowth: [
    { date: "2023-10-15", users: 2345 },
    { date: "2023-10-08", users: 2289 },
    { date: "2023-10-01", users: 2156 },
    { date: "2023-09-24", users: 2034 },
    { date: "2023-09-17", users: 1923 },
    { date: "2023-09-10", users: 1789 },
    { date: "2023-09-03", users: 1654 },
    { date: "2023-08-27", users: 1523 },
    { date: "2023-08-20", users: 1398 },
    { date: "2023-08-13", users: 1287 },
    { date: "2023-08-06", users: 1156 },
    { date: "2023-07-30", users: 1034 },
    { date: "2023-07-23", users: 923 },
    { date: "2023-07-16", users: 812 }
  ],
  revenue: [
    { date: "2023-10-15", amount: 6250 },
    { date: "2023-10-14", amount: 5800 },
    { date: "2023-10-13", amount: 5120 },
    { date: "2023-10-12", amount: 7100 },
    { date: "2023-10-11", amount: 4850 },
    { date: "2023-10-10", amount: 5400 },
    { date: "2023-10-09", amount: 4650 },
    { date: "2023-10-08", amount: 5200 },
    { date: "2023-10-07", amount: 4800 },
    { date: "2023-10-06", amount: 5500 },
    { date: "2023-10-05", amount: 6200 },
    { date: "2023-10-04", amount: 5800 },
    { date: "2023-10-03", amount: 5200 },
    { date: "2023-10-02", amount: 5600 }
  ],
  domainSales: [
    { date: "2023-10-15", sales: 8, volume: 125000 },
    { date: "2023-10-14", sales: 6, volume: 89000 },
    { date: "2023-10-13", sales: 5, volume: 75000 },
    { date: "2023-10-12", sales: 9, volume: 145000 },
    { date: "2023-10-11", sales: 4, volume: 62000 },
    { date: "2023-10-10", sales: 7, volume: 98000 },
    { date: "2023-10-09", sales: 3, volume: 45000 },
    { date: "2023-10-08", sales: 6, volume: 85000 },
    { date: "2023-10-07", sales: 5, volume: 72000 },
    { date: "2023-10-06", sales: 8, volume: 115000 },
    { date: "2023-10-05", sales: 10, volume: 150000 },
    { date: "2023-10-04", sales: 7, volume: 105000 },
    { date: "2023-10-03", sales: 6, volume: 88000 },
    { date: "2023-10-02", sales: 8, volume: 120000 }
  ]
};

export const mockTopPerformers = {
  topDomains: [
    { name: "cryptoqueen.xyz", value: 25000, roi: 1983.33, category: "crypto" },
    { name: "nftgallery.io", value: 48000, roi: 1820.0, category: "nft" },
    { name: "web3developers.com", value: 32000, roi: 1677.78, category: "web3" },
    { name: "blockchainacademy.org", value: 28000, roi: 1766.67, category: "education" },
    { name: "defiwallet.app", value: 18500, roi: 1847.37, category: "defi" }
  ],
  topUsers: [
    { username: "domain_king", totalValue: 620000, domains: 45, roi: 185.5 },
    { username: "blockchain_builder", totalValue: 320000, domains: 22, roi: 165.2 },
    { username: "crypto_domainer", totalValue: 145000, domains: 12, roi: 156.8 },
    { username: "defi_trader", totalValue: 195000, domains: 15, roi: 148.3 },
    { username: "web3_dev", totalValue: 89000, domains: 8, roi: 142.1 }
  ],
  topCategories: [
    { category: "crypto", volume: 2500000, count: 245, avgPrice: 10204 },
    { category: "web3", volume: 1800000, count: 189, avgPrice: 9524 },
    { category: "defi", volume: 1500000, count: 156, avgPrice: 9615 },
    { category: "nft", volume: 1200000, count: 134, avgPrice: 8955 },
    { category: "education", volume: 800000, count: 87, avgPrice: 9195 }
  ]
};

export const mockMarketTrends = {
  priceTrends: {
    crypto: { change: 0.15, trend: "up" },
    web3: { change: 0.08, trend: "up" },
    defi: { change: -0.03, trend: "down" },
    nft: { change: 0.12, trend: "up" },
    education: { change: 0.05, trend: "up" }
  },
  volumeTrends: {
    daily: { change: 0.12, trend: "up" },
    weekly: { change: 0.08, trend: "up" },
    monthly: { change: 0.15, trend: "up" }
  },
  userTrends: {
    newUsers: { change: 0.18, trend: "up" },
    activeUsers: { change: 0.06, trend: "up" },
    retention: { change: 0.02, trend: "up" }
  }
};
