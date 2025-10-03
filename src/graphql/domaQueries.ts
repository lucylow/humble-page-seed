// GraphQL Query Definitions for Doma Subgraph
import { gql } from 'graphql-request';

/**
 * Enhanced queries for marketplace analytics and user domains
 * These complement the existing Doma Protocol queries
 */

// Query user's owned domains with market data
export const GET_USER_DOMAINS = gql`
  query GetUserDomains($owner: String!) {
    names(
      ownedBy: [$owner]
      take: 100
      sortOrder: DESC
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
          listings {
            id
            price
            currency {
              symbol
              decimals
            }
            expiresAt
            orderbook
          }
        }
        activities {
          type
          createdAt
        }
      }
      totalCount
    }
  }
`;

// Query marketplace statistics for dashboard
export const GET_MARKETPLACE_STATS = gql`
  query GetMarketplaceStats {
    listings(take: 100) {
      items {
        id
        price
        currency {
          symbol
          decimals
        }
        createdAt
        name
      }
      totalCount
    }
  }
`;

// Real-time subscription for new listings
export const DOMAIN_LISTED_SUBSCRIPTION = gql`
  subscription OnDomainListed {
    tokenListed {
      tokenId
      name
      price
      currency {
        symbol
        decimals
      }
      offererAddress
      expiresAt
    }
  }
`;

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

// Query to get domain activities
export const GET_DOMAIN_ACTIVITIES = gql`
  query GetDomainActivities(
    $name: String!
    $skip: Float
    $take: Float
    $type: NameActivityType
    $sortOrder: SortOrderType
  ) {
    nameActivities(
      name: $name
      skip: $skip
      take: $take
      type: $type
      sortOrder: $sortOrder
    ) {
      items {
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
        ... on NameRenewedActivity {
          txHash
          expiresAt
        }
        ... on NameDetokenizedActivity {
          txHash
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

// Query to get token activities
export const GET_TOKEN_ACTIVITIES = gql`
  query GetTokenActivities(
    $tokenId: String!
    $skip: Float
    $take: Float
    $type: TokenActivityType
    $sortOrder: SortOrderType
  ) {
    tokenActivities(
      tokenId: $tokenId
      skip: $skip
      take: $take
      type: $type
      sortOrder: $sortOrder
    ) {
      items {
        type
        networkId
        txHash
        finalized
        createdAt
        ... on TokenMintedActivity {
          tokenId
        }
        ... on TokenTransferredActivity {
          tokenId
          transferredTo
          transferredFrom
        }
        ... on TokenListedActivity {
          tokenId
          orderId
          startsAt
          expiresAt
          seller
          buyer
          payment {
            price
            currency {
              symbol
              decimals
            }
          }
          orderbook
        }
        ... on TokenOfferReceivedActivity {
          tokenId
          orderId
          expiresAt
          buyer
          seller
          payment {
            price
            currency {
              symbol
              decimals
            }
          }
          orderbook
        }
        ... on TokenPurchasedActivity {
          tokenId
          orderId
          purchasedAt
          seller
          buyer
          payment {
            price
            currency {
              symbol
              decimals
            }
          }
          orderbook
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

// Query to search domains by name pattern
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

// Query to get trending domains
export const GET_TRENDING_DOMAINS = gql`
  query GetTrendingDomains(
    $timeframe: TrendingTimeframe
    $skip: Int
    $take: Int
    $tlds: [String!]
  ) {
    trendingDomains(
      timeframe: $timeframe
      skip: $skip
      take: $take
      tlds: $tlds
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
          chain {
            name
            networkId
          }
        }
        trendScore
        activityCount
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

// Query to get domain analytics
export const GET_DOMAIN_ANALYTICS = gql`
  query GetDomainAnalytics($name: String!) {
    domainAnalytics(name: $name) {
      name
      totalViews
      uniqueVisitors
      averageSessionDuration
      bounceRate
      trafficSources {
        source
        percentage
      }
      topPages {
        path
        views
      }
      geographicData {
        country
        visitors
      }
      deviceBreakdown {
        device
        percentage
      }
    }
  }
`;

// Type definitions for better TypeScript support
export interface Domain {
  name: string;
  expiresAt: string;
  tokenizedAt?: string;
  eoi: boolean;
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
    tokenAddress: string;
    chain: {
      name: string;
      networkId: string;
    };
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
