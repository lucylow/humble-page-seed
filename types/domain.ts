export interface DomainData {
  id: string
  tokenId: string
  contractAddress: string
  name: string
  description?: string
  image?: string
  metadataUri?: string
  owner: string
  isListed: boolean
  listingPrice?: string
  createdAt: string
  updatedAt: string
  marketplaceData?: {
    isListed: boolean
    price?: string
    seller?: string
  }
  activeOffers?: Offer[]
  analytics?: DomainAnalytics[]
}

export interface Offer {
  id: string
  offerId: string
  buyer: string
  amount: string
  tokenAddress: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'WITHDRAWN'
  expiresAt?: string
  createdAt: string
}

export interface DomainAnalytics {
  id: string
  date: string
  pageViews: number
  uniqueVisitors: number
  offersReceived: number
}

export interface DomainMetadata {
  name: string
  description?: string
  image?: string
  attributes?: Array<{
    trait_type: string
    value: string
  }>
}

