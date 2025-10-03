'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DomainTokenizer } from '@/components/DomainTokenizer'
import { DomainMarketplace } from '@/components/DomainMarketplace'
import { DomainStateMonitor } from '@/components/DomainStateMonitor'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { 
  Globe, 
  Shield, 
  TrendingUp, 
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState('overview')
  const [userDomains, setUserDomains] = useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load user's domains when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      loadUserDomains()
    }
  }, [isConnected, address])

  const loadUserDomains = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would fetch domains owned by the user
      // For now, we'll simulate some data
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUserDomains([
        {
          name: 'example.com',
          isTokenized: true,
          tokenId: '1234',
          price: '5000',
          isListed: true
        },
        {
          name: 'test.xyz',
          isTokenized: false,
          tokenId: null,
          price: null,
          isListed: false
        }
      ])
    } catch (error) {
      console.error('Failed to load user domains:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTokenizationComplete = (result: Record<string, unknown>) => {
    console.log('Tokenization completed:', result)
    // Refresh user domains
    loadUserDomains()
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
            <p className="text-muted-foreground">
              Connect your wallet to access domain tokenization and management features
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ConnectButton />
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need to connect your wallet to tokenize domains and manage your portfolio
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container-padding py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-2">
            DomaLand.AI Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage your tokenized domains with real-time state synchronization
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Domains</p>
                  <p className="text-2xl font-bold">{userDomains.length}</p>
                </div>
                <Globe className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 via-transparent to-green-600/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tokenized</p>
                  <p className="text-2xl font-bold">
                    {userDomains.filter(d => d.isTokenized).length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/5 via-transparent to-blue-600/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Listed for Sale</p>
                  <p className="text-2xl font-bold">
                    {userDomains.filter(d => d.isListed).length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/5 via-transparent to-purple-600/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Monitoring</p>
                  <p className="text-2xl font-bold">
                    {userDomains.filter(d => d.isTokenized).length}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tokenize">Tokenize</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="monitor">Monitor</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Your Domains */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Your Domains
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : userDomains.length > 0 ? (
                    <div className="space-y-3">
                      {userDomains.map((domain, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-1">
                            <p className="font-medium">{domain.name}</p>
                            <div className="flex items-center gap-2">
                              {domain.isTokenized ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  Tokenized
                                </span>
                              ) : (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  Not Tokenized
                                </span>
                              )}
                              {domain.isListed && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  Listed
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {domain.price && (
                              <p className="font-bold text-primary">${parseFloat(domain.price).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No domains found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tokenize a domain to get started
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => setActiveTab('tokenize')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Tokenize New Domain
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('marketplace')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Browse Marketplace
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('monitor')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Monitor Domains
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Domain tokenized successfully</p>
                      <p className="text-xs text-muted-foreground">example.com • 2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Domain listed for sale</p>
                      <p className="text-xs text-muted-foreground">test.xyz • 1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Activity className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">State synchronization active</p>
                      <p className="text-xs text-muted-foreground">All domains • Ongoing</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tokenize">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Tokenize Your Domain</h2>
                <p className="text-muted-foreground">
                  Convert your domain into a blockchain asset with real-time state synchronization
                </p>
              </div>
              <DomainTokenizer onTokenizationComplete={handleTokenizationComplete} />
            </div>
          </TabsContent>

          <TabsContent value="marketplace">
            <DomainMarketplace />
          </TabsContent>

          <TabsContent value="monitor">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Domain State Monitoring</h2>
                <p className="text-muted-foreground">
                  Monitor your domains in real-time with automatic state synchronization
                </p>
              </div>
              
              {userDomains.filter(d => d.isTokenized).length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {userDomains
                    .filter(d => d.isTokenized)
                    .map((domain, index) => (
                      <DomainStateMonitor
                        key={index}
                        domainName={domain.name}
                        showDetails={true}
                      />
                    ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Tokenized Domains</h3>
                    <p className="text-muted-foreground mb-4">
                      Tokenize a domain to start monitoring its state
                    </p>
                    <Button onClick={() => setActiveTab('tokenize')}>
                      Tokenize Domain
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
