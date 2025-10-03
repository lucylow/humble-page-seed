import { DomaDomainState } from './domaClient'

export interface StateChangeEvent {
  domainName: string
  oldState: DomaDomainState | null
  newState: DomaDomainState
  changeType: 'tokenization' | 'ownership' | 'dns' | 'listing' | 'metadata'
  timestamp: Date
}

export interface StateSyncConfig {
  pollingInterval: number
  enableDNSMonitoring: boolean
  enableBlockchainMonitoring: boolean
  enableMetadataSync: boolean
}

export class DomainStateSynchronizer {
  private config: StateSyncConfig
  private stateHandlers: Array<(event: StateChangeEvent) => void> = []
  private monitoredDomains: Map<string, DomaDomainState> = new Map()
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map()
  private isRunning: boolean = false

  constructor(config: Partial<StateSyncConfig> = {}) {
    this.config = {
      pollingInterval: 30000, // 30 seconds
      enableDNSMonitoring: true,
      enableBlockchainMonitoring: true,
      enableMetadataSync: true,
      ...config
    }
  }

  /**
   * Start monitoring a domain for state changes
   */
  async startMonitoring(domainName: string, initialState?: DomaDomainState): Promise<void> {
    if (this.monitoredDomains.has(domainName)) {
      console.log(`Domain ${domainName} is already being monitored`)
      return
    }

    console.log(`Starting state monitoring for domain: ${domainName}`)

    // Store initial state
    if (initialState) {
      this.monitoredDomains.set(domainName, initialState)
    }

    // Start polling for state changes
    const interval = setInterval(async () => {
      await this.checkDomainState(domainName)
    }, this.config.pollingInterval)

    this.pollingIntervals.set(domainName, interval)
  }

  /**
   * Stop monitoring a domain
   */
  stopMonitoring(domainName: string): void {
    const interval = this.pollingIntervals.get(domainName)
    if (interval) {
      clearInterval(interval)
      this.pollingIntervals.delete(domainName)
    }

    this.monitoredDomains.delete(domainName)
    console.log(`Stopped monitoring domain: ${domainName}`)
  }

  /**
   * Add a handler for state change events
   */
  addStateHandler(handler: (event: StateChangeEvent) => void): () => void {
    this.stateHandlers.push(handler)
    
    // Return unsubscribe function
    return () => {
      const index = this.stateHandlers.indexOf(handler)
      if (index > -1) {
        this.stateHandlers.splice(index, 1)
      }
    }
  }

  /**
   * Check for state changes in a domain
   */
  private async checkDomainState(domainName: string): Promise<void> {
    try {
      // This would fetch the current state from Doma's API
      // For now, we'll simulate state changes
      const currentState = await this.fetchCurrentDomainState(domainName)
      const previousState = this.monitoredDomains.get(domainName)

      if (this.hasStateChanged(previousState, currentState)) {
        const changeType = this.detectChangeType(previousState, currentState)
        
        const event: StateChangeEvent = {
          domainName,
          oldState: previousState,
          newState: currentState,
          changeType,
          timestamp: new Date()
        }

        // Update stored state
        this.monitoredDomains.set(domainName, currentState)

        // Notify handlers
        this.notifyStateChange(event)

        console.log(`State change detected for ${domainName}:`, event)
      }

    } catch (error) {
      console.error(`Error checking state for domain ${domainName}:`, error)
    }
  }

  /**
   * Fetch current domain state from Doma API
   */
  private async fetchCurrentDomainState(domainName: string): Promise<DomaDomainState> {
    // This would make an actual API call to Doma
    // For now, we'll return a mock state
    return {
      owner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      isTokenized: Math.random() > 0.5,
      dnsStatus: {
        isActive: Math.random() > 0.3,
        nameservers: ['ns1.doma.xyz', 'ns2.doma.xyz'],
        records: [
          { type: 'A', name: domainName, value: '192.168.1.1' },
          { type: 'CNAME', name: `www.${domainName}`, value: domainName }
        ]
      },
      lastUpdated: new Date(),
      metadata: {
        name: domainName,
        description: `Tokenized domain ${domainName}`,
        attributes: [
          { trait_type: 'TLD', value: domainName.split('.').pop() || 'com' }
        ]
      }
    }
  }

  /**
   * Check if domain state has changed
   */
  private hasStateChanged(oldState: DomaDomainState | null, newState: DomaDomainState): boolean {
    if (!oldState) return true

    return (
      oldState.isTokenized !== newState.isTokenized ||
      oldState.owner !== newState.owner ||
      oldState.dnsStatus.isActive !== newState.dnsStatus.isActive ||
      oldState.price !== newState.price ||
      oldState.isListed !== newState.isListed ||
      JSON.stringify(oldState.metadata) !== JSON.stringify(newState.metadata)
    )
  }

  /**
   * Detect the type of state change
   */
  private detectChangeType(oldState: DomaDomainState | null, newState: DomaDomainState): StateChangeEvent['changeType'] {
    if (!oldState) return 'tokenization'

    if (oldState.isTokenized !== newState.isTokenized) {
      return 'tokenization'
    }

    if (oldState.owner !== newState.owner) {
      return 'ownership'
    }

    if (oldState.dnsStatus.isActive !== newState.dnsStatus.isActive) {
      return 'dns'
    }

    if (oldState.isListed !== newState.isListed || oldState.price !== newState.price) {
      return 'listing'
    }

    if (JSON.stringify(oldState.metadata) !== JSON.stringify(newState.metadata)) {
      return 'metadata'
    }

    return 'metadata' // Default fallback
  }

  /**
   * Notify all handlers of state changes
   */
  private notifyStateChange(event: StateChangeEvent): void {
    this.stateHandlers.forEach(handler => {
      try {
        handler(event)
      } catch (error) {
        console.error('Error in state change handler:', error)
      }
    })
  }

  /**
   * Get current state of a monitored domain
   */
  getDomainState(domainName: string): DomaDomainState | null {
    return this.monitoredDomains.get(domainName) || null
  }

  /**
   * Get all monitored domains
   */
  getMonitoredDomains(): string[] {
    return Array.from(this.monitoredDomains.keys())
  }

  /**
   * Start the synchronizer
   */
  start(): void {
    this.isRunning = true
    console.log('Domain state synchronizer started')
  }

  /**
   * Stop the synchronizer
   */
  stop(): void {
    this.isRunning = false
    
    // Clear all polling intervals
    this.pollingIntervals.forEach(interval => clearInterval(interval))
    this.pollingIntervals.clear()
    
    // Clear monitored domains
    this.monitoredDomains.clear()
    
    console.log('Domain state synchronizer stopped')
  }

  /**
   * Get synchronizer status
   */
  getStatus(): {
    isRunning: boolean
    monitoredDomains: number
    activeHandlers: number
  } {
    return {
      isRunning: this.isRunning,
      monitoredDomains: this.monitoredDomains.size,
      activeHandlers: this.stateHandlers.length
    }
  }
}

// Export singleton instance
export const domainStateSynchronizer = new DomainStateSynchronizer({
  pollingInterval: 30000,
  enableDNSMonitoring: true,
  enableBlockchainMonitoring: true,
  enableMetadataSync: true
})

