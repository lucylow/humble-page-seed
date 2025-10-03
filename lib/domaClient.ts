import { ethers } from 'ethers'

export interface DomaDomainState {
  tokenId?: string
  owner: string
  isTokenized: boolean
  metadata?: {
    name: string
    description?: string
    image?: string
    attributes?: Array<{
      trait_type: string
      value: string
    }>
  }
  dnsStatus: {
    isActive: boolean
    nameservers: string[]
    records: Array<{
      type: string
      name: string
      value: string
    }>
  }
  lastUpdated: Date
  price?: string
  isListed?: boolean
}

export interface TokenizationParams {
  domain: string
  owner: string
  chainId: number
  metadata: {
    description: string
    image?: string
    attributes?: Array<{
      trait_type: string
      value: string
    }>
  }
}

export interface TokenizationResult {
  success: boolean
  transactionHash?: string
  tokenId?: string
  error?: string
}

export class DomaClient {
  private provider: ethers.Provider
  private signer: ethers.Signer | null = null
  private apiKey: string
  private network: string
  private listeners: Map<string, Array<(state: DomaDomainState) => void>> = new Map()
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map()

  constructor(config: {
    provider: ethers.Provider
    apiKey: string
    network: 'mainnet' | 'testnet'
  }) {
    this.provider = config.provider
    this.apiKey = config.apiKey
    this.network = config.network
  }

  async connectWallet(): Promise<void> {
    if (this.provider instanceof ethers.BrowserProvider) {
      this.signer = await this.provider.getSigner()
    }
  }

  /**
   * Tokenize a domain using Doma's protocol
   */
  async tokenizeDomain(params: TokenizationParams): Promise<TokenizationResult> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected')
      }

      // Verify domain ownership through Doma's registry
      const ownershipVerified = await this.verifyDomainOwnership(params.domain, params.owner)
      if (!ownershipVerified) {
        return {
          success: false,
          error: 'Domain ownership verification failed'
        }
      }

      // Check if domain is already tokenized
      const existingState = await this.getDomainState(params.domain)
      if (existingState.isTokenized) {
        return {
          success: false,
          error: 'Domain is already tokenized'
        }
      }

      // Create tokenization transaction
      const tokenizationTx = await this.createTokenizationTransaction(params)
      
      // Send transaction
      const tx = await this.signer.sendTransaction(tokenizationTx)
      const receipt = await tx.wait()

      if (receipt.status === 1) {
        // Transaction successful, update state
        const tokenId = this.extractTokenIdFromReceipt(receipt)
        
        // Start monitoring the domain state
        this.startDomainMonitoring(params.domain)

        return {
          success: true,
          transactionHash: tx.hash,
          tokenId: tokenId
        }
      } else {
        return {
          success: false,
          error: 'Transaction failed'
        }
      }

    } catch (error) {
      console.error('Tokenization failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get current state of a domain
   */
  async getDomainState(domainName: string): Promise<DomaDomainState> {
    try {
      // Fetch from Doma API
      const response = await fetch(`${this.getApiBaseUrl()}/domains/${domainName}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch domain state: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        tokenId: data.tokenId,
        owner: data.owner,
        isTokenized: data.isTokenized,
        metadata: data.metadata,
        dnsStatus: data.dnsStatus,
        lastUpdated: new Date(data.lastUpdated),
        price: data.price,
        isListed: data.isListed
      }

    } catch (error) {
      console.error('Failed to fetch domain state:', error)
      
      // Return default state on error
      return {
        owner: '',
        isTokenized: false,
        dnsStatus: {
          isActive: false,
          nameservers: [],
          records: []
        },
        lastUpdated: new Date()
      }
    }
  }

  /**
   * Watch for domain state changes
   */
  watchDomain(domainName: string, callback: (state: DomaDomainState) => void): () => void {
    if (!this.listeners.has(domainName)) {
      this.listeners.set(domainName, [])
    }
    
    this.listeners.get(domainName)!.push(callback)

    // Start monitoring if not already started
    if (!this.pollingIntervals.has(domainName)) {
      this.startDomainMonitoring(domainName)
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(domainName) || []
      this.listeners.set(domainName, listeners.filter(l => l !== callback))
      
      // Stop monitoring if no more listeners
      if (this.listeners.get(domainName)?.length === 0) {
        this.stopDomainMonitoring(domainName)
      }
    }
  }

  /**
   * Get all listed domains
   */
  async getListedDomains(): Promise<DomaDomainState[]> {
    try {
      const response = await fetch(`${this.getApiBaseUrl()}/domains/listed`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch listed domains: ${response.statusText}`)
      }

      const data = await response.json()
      return data.domains.map((domain: Record<string, unknown>) => ({
        tokenId: domain.tokenId,
        owner: domain.owner,
        isTokenized: domain.isTokenized,
        metadata: domain.metadata,
        dnsStatus: domain.dnsStatus,
        lastUpdated: new Date(domain.lastUpdated),
        price: domain.price,
        isListed: domain.isListed
      }))

    } catch (error) {
      console.error('Failed to fetch listed domains:', error)
      return []
    }
  }

  /**
   * Verify domain ownership
   */
  private async verifyDomainOwnership(domainName: string, owner: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.getApiBaseUrl()}/domains/${domainName}/verify-ownership`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ owner })
      })

      const data = await response.json()
      return data.verified === true

    } catch (error) {
      console.error('Ownership verification failed:', error)
      return false
    }
  }

  /**
   * Create tokenization transaction
   */
  private async createTokenizationTransaction(params: TokenizationParams) {
    // This would interact with Doma's smart contract
    // For now, we'll create a mock transaction
    return {
      to: this.getDomaContractAddress(),
      data: this.encodeTokenizationData(params),
      value: 0
    }
  }

  /**
   * Start monitoring domain state changes
   */
  private startDomainMonitoring(domainName: string) {
    const interval = setInterval(async () => {
      try {
        const currentState = await this.getDomainState(domainName)
        this.notifyListeners(domainName, currentState)
      } catch (error) {
        console.error(`Failed to monitor domain ${domainName}:`, error)
      }
    }, 30000) // Poll every 30 seconds

    this.pollingIntervals.set(domainName, interval)
  }

  /**
   * Stop monitoring domain state changes
   */
  private stopDomainMonitoring(domainName: string) {
    const interval = this.pollingIntervals.get(domainName)
    if (interval) {
      clearInterval(interval)
      this.pollingIntervals.delete(domainName)
    }
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(domainName: string, state: DomaDomainState) {
    const listeners = this.listeners.get(domainName) || []
    listeners.forEach(listener => listener(state))
  }

  /**
   * Get API base URL based on network
   */
  private getApiBaseUrl(): string {
    return this.network === 'mainnet' 
      ? 'https://api.doma.xyz/v1'
      : 'https://api-testnet.doma.xyz/v1'
  }

  /**
   * Get Doma contract address based on network
   */
  private getDomaContractAddress(): string {
    return this.network === 'mainnet'
      ? '0x...' // Mainnet contract address
      : '0x...' // Testnet contract address
  }

  /**
   * Encode tokenization data for smart contract
   */
  private encodeTokenizationData(params: TokenizationParams): string {
    // This would encode the function call data for the Doma contract
    // For now, return a mock value
    return '0x...'
  }

  /**
   * Extract token ID from transaction receipt
   */
  private extractTokenIdFromReceipt(receipt: ethers.TransactionReceipt): string {
    // This would parse the transaction receipt to extract the token ID
    // For now, return a mock value
    return Math.floor(Math.random() * 10000).toString()
  }
}

// Export singleton instance
export const domaClient = new DomaClient({
  provider: new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_DOMA_RPC_URL || 'https://rpc.doma-testnet.xyz'),
  apiKey: process.env.NEXT_PUBLIC_DOMA_API_KEY || '',
  network: (process.env.NEXT_PUBLIC_DOMA_NETWORK as 'mainnet' | 'testnet') || 'testnet'
})
