'use client'

import { useState, useEffect, useMemo } from 'react'
import { domaClient, DomaDomainState } from '@/lib/domaClient'
import { domainStateSynchronizer, StateChangeEvent } from '@/lib/stateSync'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Globe, 
  Shield, 
  DollarSign,
  ExternalLink,
  AlertCircle
} from 'lucide-react'

export function DomainMarketplace() {
  const [domains, setDomains] = useState<DomaDomainState[]>([])
  const [filteredDomains, setFilteredDomains] = useState<DomaDomainState[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')
  const [syncedDomains, setSyncedDomains] = useState<Set<string>>(new Set())

  // Load domains and set up synchronization
  useEffect(() => {
    const loadMarketplace = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const listedDomains = await domaClient.getListedDomains()
        setDomains(listedDomains)
        setFilteredDomains(listedDomains)

        // Set up synchronization for each domain
        listedDomains.forEach(domain => {
          if (domain.metadata?.name && !syncedDomains.has(domain.metadata.name)) {
            setupDomainSync(domain.metadata.name)
            setSyncedDomains(prev => new Set([...prev, domain.metadata!.name]))
          }
        })

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load marketplace'
        setError(errorMessage)
        console.error('Failed to load marketplace:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadMarketplace()
  }, [syncedDomains])

  // Set up domain synchronization
  const setupDomainSync = (domainName: string) => {
    domainStateSynchronizer.startMonitoring(domainName)

    // Add state change handler
    const unsubscribe = domainStateSynchronizer.addStateHandler((event: StateChangeEvent) => {
      if (event.domainName === domainName) {
        setDomains(prev => prev.map(domain => 
          domain.metadata?.name === domainName 
            ? { ...domain, ...event.newState, lastUpdated: event.timestamp }
            : domain
        ))
      }
    })

    return unsubscribe
  }

  // Filter and sort domains
  useEffect(() => {
    let filtered = [...domains]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(domain => 
        domain.metadata?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        domain.metadata?.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(domain => {
        switch (filterBy) {
          case 'tokenized':
            return domain.isTokenized
          case 'listed':
            return domain.isListed
          case 'active':
            return domain.dnsStatus.isActive
          default:
            return true
        }
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.metadata?.name || '').localeCompare(b.metadata?.name || '')
        case 'price': {
          const priceA = a.price ? parseFloat(a.price) : 0
          const priceB = b.price ? parseFloat(b.price) : 0
          return priceB - priceA
        }
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        default:
          return 0
      }
    })

    setFilteredDomains(filtered)
  }, [domains, searchQuery, sortBy, filterBy])

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const listedDomains = await domaClient.getListedDomains()
      setDomains(listedDomains)
    } catch (err) {
      console.error('Failed to refresh marketplace:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchase = (domain: DomaDomainState) => {
    // Implement purchase logic
    console.log('Purchasing domain:', domain.metadata?.name)
  }

  const handleMakeOffer = (domain: DomaDomainState) => {
    // Implement make offer logic
    console.log('Making offer for domain:', domain.metadata?.name)
  }

  if (isLoading && domains.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Domain Marketplace</h1>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Domain Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Discover and purchase tokenized domains with real-time state synchronization
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search domains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            <SelectItem value="tokenized">Tokenized</SelectItem>
            <SelectItem value="listed">Listed for Sale</SelectItem>
            <SelectItem value="active">DNS Active</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="recent">Recently Updated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Domain Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDomains.map((domain, index) => (
          <DomainCard
            key={domain.metadata?.name || index}
            domain={domain}
            onPurchase={() => handlePurchase(domain)}
            onMakeOffer={() => handleMakeOffer(domain)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredDomains.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No domains found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'Try adjusting your search terms' : 'No domains are currently available'}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-muted/50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">{domains.length}</div>
          <div className="text-sm text-muted-foreground">Total Domains</div>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">
            {domains.filter(d => d.isTokenized).length}
          </div>
          <div className="text-sm text-muted-foreground">Tokenized</div>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">
            {domains.filter(d => d.isListed).length}
          </div>
          <div className="text-sm text-muted-foreground">Listed for Sale</div>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">
            {domains.filter(d => d.dnsStatus.isActive).length}
          </div>
          <div className="text-sm text-muted-foreground">DNS Active</div>
        </div>
      </div>
    </div>
  )
}

interface DomainCardProps {
  domain: DomaDomainState
  onPurchase: () => void
  onMakeOffer: () => void
}

function DomainCard({ domain, onPurchase, onMakeOffer }: DomainCardProps) {
  const domainName = domain.metadata?.name || 'Unknown Domain'
  const description = domain.metadata?.description || 'No description available'
  const price = domain.price ? parseFloat(domain.price) : null

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-medium group-hover:text-primary transition-colors">
              {domainName}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            {domain.isTokenized && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Shield className="h-3 w-3 mr-1" />
                Tokenized
              </Badge>
            )}
            {domain.dnsStatus.isActive && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Globe className="h-3 w-3 mr-1" />
                DNS Active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        {price && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-2xl font-bold text-primary">
              ${price.toLocaleString()}
            </span>
          </div>
        )}

        {/* Owner */}
        <div className="text-sm">
          <span className="text-muted-foreground">Owner: </span>
          <span className="font-mono">
            {domain.owner.slice(0, 6)}...{domain.owner.slice(-4)}
          </span>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground">
          Updated: {domain.lastUpdated.toLocaleString()}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {domain.isListed && price ? (
            <Button 
              onClick={onPurchase}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80"
              size="sm"
            >
              Buy Now
            </Button>
          ) : (
            <Button 
              onClick={onMakeOffer}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              Make Offer
            </Button>
          )}
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
