import { useState, useEffect, useCallback } from 'react'
import { domaClient, DomaDomainState } from '@/lib/domaClient'

export interface UseDomainStateReturn {
  domainState: DomaDomainState | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useDomainState(domainName: string): UseDomainStateReturn {
  const [domainState, setDomainState] = useState<DomaDomainState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDomainState = useCallback(async () => {
    if (!domainName) return

    setIsLoading(true)
    setError(null)

    try {
      const state = await domaClient.getDomainState(domainName)
      setDomainState(state)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch domain state'
      setError(errorMessage)
      console.error('Error fetching domain state:', err)
    } finally {
      setIsLoading(false)
    }
  }, [domainName])

  const refresh = useCallback(async () => {
    await fetchDomainState()
  }, [fetchDomainState])

  // Initial fetch
  useEffect(() => {
    fetchDomainState()
  }, [fetchDomainState])

  // Set up real-time monitoring
  useEffect(() => {
    if (!domainName) return

    const unsubscribe = domaClient.watchDomain(domainName, (newState) => {
      setDomainState(newState)
      console.log(`Domain state updated for ${domainName}:`, newState)
    })

    return unsubscribe
  }, [domainName])

  return {
    domainState,
    isLoading,
    error,
    refresh
  }
}

