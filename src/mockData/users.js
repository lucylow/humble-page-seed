// src/mockData/users.js
export const mockUsers = [
  {
    id: 1,
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    username: "crypto_domainer",
    email: "john@domaininvestor.com",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    joinDate: "2023-05-15",
    totalDomains: 12,
    totalValue: 145000,
    reputation: 4.8,
    userType: "investor"
  },
  {
    id: 2,
    walletAddress: "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c",
    username: "web3_dev",
    email: "sarah@web3builders.com",
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786",
    joinDate: "2023-07-22",
    totalDomains: 8,
    totalValue: 89000,
    reputation: 4.9,
    userType: "developer"
  },
  {
    id: 3,
    walletAddress: "0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3",
    username: "domain_king",
    email: "mike@domains.com",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    joinDate: "2023-02-10",
    totalDomains: 45,
    totalValue: 620000,
    reputation: 4.7,
    userType: "collector"
  },
  {
    id: 4,
    walletAddress: "0x8a4e3f8a7d1b2c5d6e4f4a3b2c1d5e6f4a3b2c1",
    username: "nft_enthusiast",
    email: "emily@nftgallery.io",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    joinDate: "2023-09-05",
    totalDomains: 5,
    totalValue: 38000,
    reputation: 4.5,
    userType: "enthusiast"
  },
  {
    id: 5,
    walletAddress: "0x9b5f4c8e2a7d1b3c6e9f2a5b8c1d4e7f0a3b6c9",
    username: "defi_trader",
    email: "alex@defitrading.com",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    joinDate: "2023-08-12",
    totalDomains: 15,
    totalValue: 195000,
    reputation: 4.6,
    userType: "trader"
  },
  {
    id: 6,
    walletAddress: "0x3c7f9e2b5d8a1c4f7e0b3d6c9f2a5b8e1c4f7a0",
    username: "blockchain_builder",
    email: "maria@blockchainbuilders.io",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    joinDate: "2023-06-20",
    totalDomains: 22,
    totalValue: 320000,
    reputation: 4.9,
    userType: "developer"
  }
];

export const mockUserProfiles = {
  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e": {
    ...mockUsers[0],
    bio: "Crypto domain investor with 5+ years experience in digital assets. Focus on premium domains with strong commercial potential.",
    socialLinks: {
      twitter: "https://twitter.com/crypto_domainer",
      linkedin: "https://linkedin.com/in/crypto-domainer"
    },
    achievements: [
      "Top 10 Domain Investor 2023",
      "Early Adopter Badge",
      "High Volume Trader"
    ],
    portfolio: {
      totalInvested: 125000,
      totalReturns: 145000,
      roi: 16.0,
      favoriteCategories: ["crypto", "web3", "defi"]
    }
  },
  "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c": {
    ...mockUsers[1],
    bio: "Full-stack developer passionate about Web3 and decentralized applications. Building the future of the internet.",
    socialLinks: {
      github: "https://github.com/web3_dev",
      twitter: "https://twitter.com/web3_dev"
    },
    achievements: [
      "Developer of the Month",
      "Open Source Contributor",
      "Web3 Pioneer"
    ],
    portfolio: {
      totalInvested: 75000,
      totalReturns: 89000,
      roi: 18.7,
      favoriteCategories: ["web3", "developer", "tech"]
    }
  }
};
