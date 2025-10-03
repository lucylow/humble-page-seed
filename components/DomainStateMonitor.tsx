'use client'

import { useState, useEffect } from 'react'
import { useDomainState } from '@/hooks/useDomainState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Globe, 
  Shield, 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react'

interface DomainStateMonitorProps {
  domainName: string
  showDetails?: boolean
}

export function DomainStateMonitor({ domainName, showDetails = true }: DomainStateMonitorProps) {
  const { domainState, isLoading, error, refresh } = useDomainState(domainName)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const handleRefresh = async () => {
    await refresh()
    setLastRefresh(new Date())
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain State Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain State Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!domainState) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain State Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No domain state available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain State Monitor
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              size="sm"
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <span className="text-xs text-muted-foreground">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Tokenization</span>
            </div>
            <Badge 
              variant={domainState.isTokenized ? "default" : "outline"}
              className={domainState.isTokenized ? "bg-green-50 text-green-700" : ""}
            >
              {domainState.isTokenized ? 'Tokenized' : 'Not Tokenized'}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">DNS Status</span>
            </div>
            <Badge 
              variant={domainState.dnsStatus.isActive ? "default" : "outline"}
              className={domainState.dnsStatus.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}
            >
              {domainState.dnsStatus.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Last Updated</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {domainState.lastUpdated.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Detailed Information */}
        {showDetails && (
          <div className="space-y-4">
            {/* Tokenization Details */}
            {domainState.isTokenized && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Tokenization Details</h4>
                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Token ID:</span>
                    <span className="font-mono">{domainState.tokenId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Owner:</span>
                    <span className="font-mono">
                      {domainState.owner.slice(0, 6)}...{domainState.owner.slice(-4)}
                    </span>
                  </div>
                  {domainState.price && (
                    <div className="flex justify-between text-sm">
                      <span>Listed Price:</span>
                      <span className="font-medium">${parseFloat(domainState.price).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DNS Details */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">DNS Configuration</h4>
              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <div className="flex items-center gap-1">
                    {domainState.dnsStatus.isActive ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500" />
                    )}
                    <span>{domainState.dnsStatus.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                
                {domainState.dnsStatus.nameservers.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium">Nameservers:</span>
                    <div className="space-y-1">
                      {domainState.dnsStatus.nameservers.map((ns, index) => (
                        <div key={index} className="text-xs font-mono text-muted-foreground">
                          {ns}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {domainState.dnsStatus.records.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium">DNS Records:</span>
                    <div className="space-y-1">
                      {domainState.dnsStatus.records.slice(0, 3).map((record, index) => (
                        <div key={index} className="text-xs font-mono text-muted-foreground">
                          {record.type}: {record.name} → {record.value}
                        </div>
                      ))}
                      {domainState.dnsStatus.records.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{domainState.dnsStatus.records.length - 3} more records
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            {domainState.metadata && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Metadata</h4>
                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Name:</span> {domainState.metadata.name}
                  </div>
                  {domainState.metadata.description && (
                    <div className="text-sm">
                      <span className="font-medium">Description:</span> {domainState.metadata.description}
                    </div>
                  )}
                  {domainState.metadata.attributes && domainState.metadata.attributes.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Attributes:</span>
                      <div className="flex flex-wrap gap-1">
                        {domainState.metadata.attributes.map((attr, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {attr.trait_type}: {attr.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Real-time Status Indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Real-time monitoring active</span>
        </div>
      </CardContent>
    </Card>
  )
}

