import { gql } from 'graphql-request';

// Query to get paginated list of tokenized names
export const GET_TOKENIZED_DOMAINS = gql`
  query GetTokenizedDomains(
    $skip: Int
    $take: Int
    $ownedBy: [AddressCAIP10!]
    $claimStatus: NamesQueryClaimStatus
    $name: String
    $networkIds: [String!]
    $tlds: [String!]
    $sortOrder: SortOrderType
  ) {
    names(
      skip: $skip
      take: $take
      ownedBy: $ownedBy
      claimStatus: $claimStatus
      name: $name
      networkIds: $networkIds
      tlds: $tlds
      sortOrder: $sortOrder
    ) {
      items {
        name
        expiresAt
        tokenizedAt
        eoi
        registrar {
          name
          ianaId
          websiteUrl
        }
        tokens {
          tokenId
          networkId
          ownerAddress
          type
          startsAt
          expiresAt
          tokenAddress
          chain {
            name
            networkId
          }
        }
        activities {
          type
          createdAt
          ... on NameTokenizedActivity {
            txHash
            networkId
          }
        }
      }
      totalCount
      pageSize
      currentPage
      totalPages
      hasPreviousPage
      hasNextPage
    }
  }
`;

// Query to get specific domain information
export const GET_DOMAIN_INFO = gql`
  query GetDomainInfo($name: String!) {
    name(name: $name) {
      name
      expiresAt
      tokenizedAt
      eoi
      registrar {
        name
        ianaId
        websiteUrl
      }
      nameservers {
        ldhName
      }
      dsKeys {
        keyTag
        algorithm
        digest
        digestType
      }
      transferLock
      claimedBy
      tokens {
        tokenId
        networkId
        ownerAddress
        type
        startsAt
        expiresAt
        explorerUrl
        tokenAddress
        chain {
          name
          networkId
        }
        listings {
          id
          price
          currency {
            symbol
            decimals
          }
          expiresAt
        }
      }
      activities {
        type
        createdAt
        ... on NameTokenizedActivity {
          txHash
          networkId
        }
        ... on NameClaimedActivity {
          txHash
          claimedBy
        }
      }
    }
  }
`;

// Query to get domain listings
export const GET_DOMAIN_LISTINGS = gql`
  query GetDomainListings(
    $skip: Float
    $take: Float
    $tlds: [String!]
    $sld: String
    $networkIds: [String!]
  ) {
    listings(
      skip: $skip
      take: $take
      tlds: $tlds
      sld: $sld
      networkIds: $networkIds
    ) {
      items {
        id
        price
        currency {
          symbol
          decimals
          name
        }
        offererAddress
        orderbook
        expiresAt
        createdAt
        name
        nameExpiresAt
        registrar {
          name
          ianaId
        }
        tokenId
        tokenAddress
        chain {
          name
          networkId
        }
      }
      totalCount
      pageSize
      currentPage
      totalPages
      hasPreviousPage
      hasNextPage
    }
  }
`;

// Query to get domain offers
export const GET_DOMAIN_OFFERS = gql`
  query GetDomainOffers(
    $tokenId: String
    $offeredBy: [AddressCAIP10!]
    $skip: Float
    $take: Float
    $status: OfferStatus
    $sortOrder: SortOrderType
  ) {
    offers(
      tokenId: $tokenId
      offeredBy: $offeredBy
      skip: $skip
      take: $take
      status: $status
      sortOrder: $sortOrder
    ) {
      items {
        id
        price
        currency {
          symbol
          decimals
          name
        }
        offererAddress
        orderbook
        expiresAt
        createdAt
        name
        nameExpiresAt
        registrar {
          name
          ianaId
        }
        tokenId
        tokenAddress
        chain {
          name
          networkId
        }
      }
      totalCount
      pageSize
      currentPage
      totalPages
      hasPreviousPage
      hasNextPage
    }
  }
`;

// Query to get domain statistics
export const GET_DOMAIN_STATISTICS = gql`
  query GetDomainStatistics($tokenId: String!) {
    nameStatistics(tokenId: $tokenId) {
      name
      highestOffer {
        id
        price
        currency {
          symbol
          decimals
        }
        offererAddress
        expiresAt
      }
      activeOffers
      offersLast3Days
    }
  }
`;

// Query to get user's portfolio
export const GET_USER_PORTFOLIO = gql`
  query GetUserPortfolio($address: AddressCAIP10!) {
    names(ownedBy: [$address], claimStatus: ALL) {
      items {
        name
        expiresAt
        tokenizedAt
        eoi
        registrar {
          name
          ianaId
        }
        tokens {
          tokenId
          networkId
          ownerAddress
          type
          startsAt
          expiresAt
          tokenAddress
          chain {
            name
            networkId
          }
        }
        activities {
          type
          createdAt
          ... on NameTokenizedActivity {
            txHash
            networkId
          }
        }
      }
      totalCount
    }
  }
`;

// Query to get domain activities/history
export const GET_DOMAIN_ACTIVITIES = gql`
  query GetDomainActivities($name: String!) {
    name(name: $name) {
      activities {
        type
        createdAt
        ... on NameTokenizedActivity {
          txHash
          networkId
        }
        ... on NameClaimedActivity {
          txHash
          claimedBy
        }
        ... on NameListedActivity {
          txHash
          price
          currency {
            symbol
            decimals
          }
        }
        ... on NameSoldActivity {
          txHash
          price
          currency {
            symbol
            decimals
          }
          buyer
        }
      }
    }
  }
`;

// Query to get marketplace statistics
export const GET_MARKETPLACE_STATISTICS = gql`
  query GetMarketplaceStatistics {
    marketplaceStats {
      totalListings
      totalOffers
      totalVolume
      averagePrice
      topTlds {
        tld
        count
      }
      recentActivity {
        type
        count
        timestamp
      }
    }
  }
`;

// Query to search domains
export const SEARCH_DOMAINS = gql`
  query SearchDomains(
    $query: String!
    $skip: Int
    $take: Int
    $tlds: [String!]
    $networkIds: [String!]
  ) {
    searchDomains(
      query: $query
      skip: $skip
      take: $take
      tlds: $tlds
      networkIds: $networkIds
    ) {
      items {
        name
        expiresAt
        tokenizedAt
        eoi
        registrar {
          name
          ianaId
        }
        tokens {
          tokenId
          networkId
          ownerAddress
          type
          startsAt
          expiresAt
          tokenAddress
          chain {
            name
            networkId
          }
        }
      }
      totalCount
      pageSize
      currentPage
      totalPages
      hasPreviousPage
      hasNextPage
    }
  }
`;

// Query to get domain metadata
export const GET_DOMAIN_METADATA = gql`
  query GetDomainMetadata($tokenId: String!) {
    tokenMetadata(tokenId: $tokenId) {
      tokenId
      name
      description
      image
      attributes {
        trait_type
        value
      }
      external_url
      animation_url
    }
  }
`;

// Query to get registrar information
export const GET_REGISTRAR_INFO = gql`
  query GetRegistrarInfo($ianaId: Int!) {
    registrar(ianaId: $ianaId) {
      name
      ianaId
      websiteUrl
      supportedTlds
      pricing {
        tld
        price
        currency
      }
    }
  }
`;

// Query to get network information
export const GET_NETWORK_INFO = gql`
  query GetNetworkInfo($networkId: String!) {
    network(networkId: $networkId) {
      name
      networkId
      chainId
      rpcUrl
      explorerUrl
      nativeCurrency {
        name
        symbol
        decimals
      }
    }
  }
`;

// Query to get all supported networks
export const GET_SUPPORTED_NETWORKS = gql`
  query GetSupportedNetworks {
    networks {
      name
      networkId
      chainId
      rpcUrl
      explorerUrl
      nativeCurrency {
        name
        symbol
        decimals
      }
    }
  }
`;

// Query to get domain expiration warnings
export const GET_EXPIRING_DOMAINS = gql`
  query GetExpiringDomains(
    $ownedBy: [AddressCAIP10!]
    $daysUntilExpiry: Int
    $skip: Int
    $take: Int
  ) {
    expiringDomains(
      ownedBy: $ownedBy
      daysUntilExpiry: $daysUntilExpiry
      skip: $skip
      take: $take
    ) {
      items {
        name
        expiresAt
        daysUntilExpiry
        registrar {
          name
          ianaId
        }
        tokens {
          tokenId
          networkId
          ownerAddress
          chain {
            name
            networkId
          }
        }
      }
      totalCount
    }
  }
`;

// Type definitions for better TypeScript support
export interface DomainInfo {
  name: string;
  expiresAt: string;
  tokenizedAt?: string;
  eoi?: boolean;
  registrar: {
    name: string;
    ianaId: number;
    websiteUrl?: string;
  };
  tokens: Array<{
    tokenId: string;
    networkId: string;
    ownerAddress: string;
    type: string;
    startsAt: string;
    expiresAt: string;
    tokenAddress?: string;
    explorerUrl?: string;
    chain: {
      name: string;
      networkId: string;
    };
    listings?: Array<{
      id: string;
      price: string;
      currency: {
        symbol: string;
        decimals: number;
      };
      expiresAt: string;
    }>;
  }>;
  activities: Array<{
    type: string;
    createdAt: string;
    txHash?: string;
    networkId?: string;
    claimedBy?: string;
  }>;
}

export interface DomainListing {
  id: string;
  price: string;
  currency: {
    symbol: string;
    decimals: number;
    name: string;
  };
  offererAddress: string;
  orderbook: string;
  expiresAt: string;
  createdAt: string;
  name: string;
  nameExpiresAt: string;
  registrar: {
    name: string;
    ianaId: number;
  };
  tokenId: string;
  tokenAddress: string;
  chain: {
    name: string;
    networkId: string;
  };
}

export interface DomainOffer {
  id: string;
  price: string;
  currency: {
    symbol: string;
    decimals: number;
    name: string;
  };
  offererAddress: string;
  orderbook: string;
  expiresAt: string;
  createdAt: string;
  name: string;
  nameExpiresAt: string;
  registrar: {
    name: string;
    ianaId: number;
  };
  tokenId: string;
  tokenAddress: string;
  chain: {
    name: string;
    networkId: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
