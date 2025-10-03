import { gql } from 'graphql-request';

// Mutation to initiate email verification
export const INITIATE_EMAIL_VERIFICATION = gql`
  mutation InitiateEmailVerification($email: String!) {
    initiateEmailVerification(email: $email)
  }
`;

// Mutation to complete email verification
export const COMPLETE_EMAIL_VERIFICATION = gql`
  mutation CompleteEmailVerification($code: String!, $email: String!) {
    completeEmailVerification(code: $code, email: $email)
  }
`;

// Mutation to upload registrant contacts
export const UPLOAD_REGISTRANT_CONTACTS = gql`
  mutation UploadRegistrantContacts(
    $contact: RegistrantContactInput!
    $emailVerificationProof: String!
    $networkId: String!
    $registrarIanaId: Int!
  ) {
    uploadRegistrantContacts(
      contact: $contact
      emailVerificationProof: $emailVerificationProof
      networkId: $networkId
      registrarIanaId: $registrarIanaId
    ) {
      proofOfContactsVoucher {
        registrantHandle
        nonce
        publicKey
        proofSource
        expiresAt
      }
      signature
    }
  }
`;

// Mutation to generate metadata
export const GENERATE_METADATA = gql`
  mutation GenerateMetadata($tokens: [TokenMetadataGenerationRequestInput!]!) {
    generateMetadata(tokens: $tokens)
  }
`;

// Mutation to create a domain listing
export const CREATE_DOMAIN_LISTING = gql`
  mutation CreateDomainListing(
    $tokenId: String!
    $price: String!
    $currency: String!
    $expiresAt: String
  ) {
    createListing(
      tokenId: $tokenId
      price: $price
      currency: $currency
      expiresAt: $expiresAt
    ) {
      id
      price
      currency {
        symbol
        decimals
      }
      expiresAt
      createdAt
    }
  }
`;

// Mutation to update a domain listing
export const UPDATE_DOMAIN_LISTING = gql`
  mutation UpdateDomainListing(
    $listingId: String!
    $price: String
    $expiresAt: String
  ) {
    updateListing(
      listingId: $listingId
      price: $price
      expiresAt: $expiresAt
    ) {
      id
      price
      currency {
        symbol
        decimals
      }
      expiresAt
      updatedAt
    }
  }
`;

// Mutation to cancel a domain listing
export const CANCEL_DOMAIN_LISTING = gql`
  mutation CancelDomainListing($listingId: String!) {
    cancelListing(listingId: $listingId) {
      id
      status
      cancelledAt
    }
  }
`;

// Mutation to create a domain offer
export const CREATE_DOMAIN_OFFER = gql`
  mutation CreateDomainOffer(
    $tokenId: String!
    $price: String!
    $currency: String!
    $expiresAt: String
  ) {
    createOffer(
      tokenId: $tokenId
      price: $price
      currency: $currency
      expiresAt: $expiresAt
    ) {
      id
      price
      currency {
        symbol
        decimals
      }
      expiresAt
      createdAt
    }
  }
`;

// Mutation to update a domain offer
export const UPDATE_DOMAIN_OFFER = gql`
  mutation UpdateDomainOffer(
    $offerId: String!
    $price: String
    $expiresAt: String
  ) {
    updateOffer(
      offerId: $offerId
      price: $price
      expiresAt: $expiresAt
    ) {
      id
      price
      currency {
        symbol
        decimals
      }
      expiresAt
      updatedAt
    }
  }
`;

// Mutation to cancel a domain offer
export const CANCEL_DOMAIN_OFFER = gql`
  mutation CancelDomainOffer($offerId: String!) {
    cancelOffer(offerId: $offerId) {
      id
      status
      cancelledAt
    }
  }
`;

// Mutation to accept a domain offer
export const ACCEPT_DOMAIN_OFFER = gql`
  mutation AcceptDomainOffer($offerId: String!) {
    acceptOffer(offerId: $offerId) {
      id
      status
      acceptedAt
      transactionHash
    }
  }
`;

// Mutation to reject a domain offer
export const REJECT_DOMAIN_OFFER = gql`
  mutation RejectDomainOffer($offerId: String!) {
    rejectOffer(offerId: $offerId) {
      id
      status
      rejectedAt
    }
  }
`;

// Mutation to purchase a domain listing
export const PURCHASE_DOMAIN_LISTING = gql`
  mutation PurchaseDomainListing($listingId: String!) {
    purchaseListing(listingId: $listingId) {
      id
      status
      purchasedAt
      transactionHash
    }
  }
`;

// Mutation to transfer domain ownership
export const TRANSFER_DOMAIN_OWNERSHIP = gql`
  mutation TransferDomainOwnership(
    $tokenId: String!
    $toAddress: String!
  ) {
    transferOwnership(
      tokenId: $tokenId
      toAddress: $toAddress
    ) {
      tokenId
      fromAddress
      toAddress
      transactionHash
      transferredAt
    }
  }
`;

// Mutation to renew domain
export const RENEW_DOMAIN = gql`
  mutation RenewDomain(
    $tokenId: String!
    $duration: Int!
  ) {
    renewDomain(
      tokenId: $tokenId
      duration: $duration
    ) {
      tokenId
      newExpirationDate
      transactionHash
      renewedAt
    }
  }
`;

// Mutation to lock domain transfer
export const LOCK_DOMAIN_TRANSFER = gql`
  mutation LockDomainTransfer($tokenId: String!) {
    lockTransfer(tokenId: $tokenId) {
      tokenId
      isLocked
      lockedAt
      transactionHash
    }
  }
`;

// Mutation to unlock domain transfer
export const UNLOCK_DOMAIN_TRANSFER = gql`
  mutation UnlockDomainTransfer($tokenId: String!) {
    unlockTransfer(tokenId: $tokenId) {
      tokenId
      isLocked
      unlockedAt
      transactionHash
    }
  }
`;

// Mutation to update domain metadata
export const UPDATE_DOMAIN_METADATA = gql`
  mutation UpdateDomainMetadata(
    $tokenId: String!
    $metadata: TokenMetadataInput!
  ) {
    updateTokenMetadata(
      tokenId: $tokenId
      metadata: $metadata
    ) {
      tokenId
      metadata {
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
      updatedAt
    }
  }
`;

// Mutation to set domain nameservers
export const SET_DOMAIN_NAMESERVERS = gql`
  mutation SetDomainNameservers(
    $tokenId: String!
    $nameservers: [String!]!
  ) {
    setNameservers(
      tokenId: $tokenId
      nameservers: $nameservers
    ) {
      tokenId
      nameservers {
        ldhName
      }
      updatedAt
    }
  }
`;

// Mutation to set domain DS records
export const SET_DOMAIN_DS_RECORDS = gql`
  mutation SetDomainDSRecords(
    $tokenId: String!
    $dsRecords: [DSRecordInput!]!
  ) {
    setDSRecords(
      tokenId: $tokenId
      dsRecords: $dsRecords
    ) {
      tokenId
      dsKeys {
        keyTag
        algorithm
        digest
        digestType
      }
      updatedAt
    }
  }
`;

// Mutation to enable domain auto-renewal
export const ENABLE_DOMAIN_AUTO_RENEWAL = gql`
  mutation EnableDomainAutoRenewal($tokenId: String!) {
    enableAutoRenewal(tokenId: $tokenId) {
      tokenId
      autoRenewalEnabled
      enabledAt
    }
  }
`;

// Mutation to disable domain auto-renewal
export const DISABLE_DOMAIN_AUTO_RENEWAL = gql`
  mutation DisableDomainAutoRenewal($tokenId: String!) {
    disableAutoRenewal(tokenId: $tokenId) {
      tokenId
      autoRenewalEnabled
      disabledAt
    }
  }
`;

// Mutation to create a domain watchlist
export const CREATE_DOMAIN_WATCHLIST = gql`
  mutation CreateDomainWatchlist($domains: [String!]!) {
    createWatchlist(domains: $domains) {
      id
      domains
      createdAt
    }
  }
`;

// Mutation to add domains to watchlist
export const ADD_TO_WATCHLIST = gql`
  mutation AddToWatchlist(
    $watchlistId: String!
    $domains: [String!]!
  ) {
    addToWatchlist(
      watchlistId: $watchlistId
      domains: $domains
    ) {
      id
      domains
      updatedAt
    }
  }
`;

// Mutation to remove domains from watchlist
export const REMOVE_FROM_WATCHLIST = gql`
  mutation RemoveFromWatchlist(
    $watchlistId: String!
    $domains: [String!]!
  ) {
    removeFromWatchlist(
      watchlistId: $watchlistId
      domains: $domains
    ) {
      id
      domains
      updatedAt
    }
  }
`;

// Mutation to delete watchlist
export const DELETE_WATCHLIST = gql`
  mutation DeleteWatchlist($watchlistId: String!) {
    deleteWatchlist(watchlistId: $watchlistId) {
      id
      deletedAt
    }
  }
`;

// Type definitions for mutation inputs and responses
export interface RegistrantContactInput {
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface TokenMetadataGenerationRequestInput {
  tokenId: string;
  name: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  external_url?: string;
  animation_url?: string;
}

export interface TokenMetadataInput {
  name: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  external_url?: string;
  animation_url?: string;
}

export interface DSRecordInput {
  keyTag: number;
  algorithm: number;
  digest: string;
  digestType: number;
}

export interface ProofOfContactsVoucher {
  registrantHandle: number;
  nonce: number;
  publicKey: string;
  proofSource: number;
  expiresAt: string;
}

export interface UploadRegistrantContactsResponse {
  proofOfContactsVoucher: ProofOfContactsVoucher;
  signature: string;
}

export interface DomainListingResponse {
  id: string;
  price: string;
  currency: {
    symbol: string;
    decimals: number;
  };
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DomainOfferResponse {
  id: string;
  price: string;
  currency: {
    symbol: string;
    decimals: number;
  };
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TransferOwnershipResponse {
  tokenId: string;
  fromAddress: string;
  toAddress: string;
  transactionHash: string;
  transferredAt: string;
}

export interface RenewDomainResponse {
  tokenId: string;
  newExpirationDate: string;
  transactionHash: string;
  renewedAt: string;
}

export interface LockTransferResponse {
  tokenId: string;
  isLocked: boolean;
  lockedAt: string;
  transactionHash: string;
}

export interface UnlockTransferResponse {
  tokenId: string;
  isLocked: boolean;
  unlockedAt: string;
  transactionHash: string;
}

export interface MetadataUpdateResponse {
  tokenId: string;
  metadata: {
    name: string;
    description?: string;
    image?: string;
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
    external_url?: string;
    animation_url?: string;
  };
  updatedAt: string;
}

export interface WatchlistResponse {
  id: string;
  domains: string[];
  createdAt: string;
  updatedAt?: string;
}
