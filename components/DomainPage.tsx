'use client'

import { useState } from 'react'
import { DomainData } from '@/types/domain'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OfferModal } from '@/components/OfferModal'
import { AnalyticsChart } from '@/components/AnalyticsChart'
import { StructuredData } from '@/components/StructuredData'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

interface DomainPageProps {
  domainData: DomainData
}

export function DomainPage({ domainData }: DomainPageProps) {
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<Record<string, unknown> | null>(null)

  const isListed = domainData.marketplaceData?.isListed || false
  const price = domainData.marketplaceData?.price
  const hasOffers = domainData.activeOffers && domainData.activeOffers.length > 0

  return (
    <>
      <StructuredData data={domainData} />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Breadcrumb Navigation */}
        <div className="container-padding pt-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/domains">Domains</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{domainData.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Hero Section */}
        <section className="container-padding py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
                  {domainData.name}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {domainData.description || `Premium domain ${domainData.name} available on DomaLand.AI`}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="px-4 py-2">
                  Token ID: {domainData.tokenId}
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  {domainData.name.split('.').pop()?.toUpperCase()} Domain
                </Badge>
                {isListed && (
                  <Badge variant="default" className="px-4 py-2 bg-emerald-500">
                    Listed for Sale
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Owner:</span>
                    <p className="font-mono">{domainData.owner.slice(0, 6)}...{domainData.owner.slice(-4)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contract:</span>
                    <p className="font-mono">{domainData.contractAddress.slice(0, 6)}...{domainData.contractAddress.slice(-4)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Domain Image */}
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  {domainData.image ? (
                    <img 
                      src={domainData.image} 
                      alt={domainData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl opacity-50">🌐</div>
                  )}
                </div>
              </Card>

              {/* Purchase Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>💰</span>
                    Purchase Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isListed && price ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          ${parseFloat(price).toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">Buy Now Price</p>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 font-semibold py-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-105"
                        size="lg"
                      >
                        <span className="mr-2">🛒</span>
                        Buy Now
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <p className="text-muted-foreground">
                        This domain is not currently listed for sale
                      </p>
                      <Button 
                        onClick={() => setShowOfferModal(true)}
                        variant="outline"
                        className="w-full"
                        size="lg"
                      >
                        <span className="mr-2">💬</span>
                        Make an Offer
                      </Button>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <Button 
                      onClick={() => setShowOfferModal(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <span className="mr-2">📝</span>
                      Make an Offer
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Submit a custom offer for this domain
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Detailed Information */}
        <section className="container-padding py-12">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="offers">Offers ({domainData.activeOffers?.length || 0})</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Domain Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Domain Name</span>
                      <p className="font-mono text-lg">{domainData.name}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Token ID</span>
                      <p className="font-mono">{domainData.tokenId}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Contract Address</span>
                      <p className="font-mono text-sm break-all">{domainData.contractAddress}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Owner</span>
                      <p className="font-mono text-sm break-all">{domainData.owner}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Market Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge variant={isListed ? "default" : "outline"}>
                        {isListed ? "Listed" : "Not Listed"}
                      </Badge>
                    </div>
                    {price && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Listed Price</span>
                        <span className="font-bold text-primary">
                          ${parseFloat(price).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active Offers</span>
                      <span className="font-bold">{domainData.activeOffers?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Created</span>
                      <span className="text-sm">{new Date(domainData.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="offers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Offers</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasOffers ? (
                    <div className="space-y-4">
                      {domainData.activeOffers?.map((offer) => (
                        <div key={offer.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <p className="font-medium">${parseFloat(offer.amount).toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">
                              From: {offer.buyer.slice(0, 6)}...{offer.buyer.slice(-4)}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge variant="outline">{offer.status}</Badge>
                            <p className="text-sm text-muted-foreground">
                              {offer.expiresAt ? new Date(offer.expiresAt).toLocaleDateString() : 'No expiry'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No active offers for this domain</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Domain Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  {domainData.analytics && domainData.analytics.length > 0 ? (
                    <AnalyticsChart data={domainData.analytics} />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No analytics data available yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Transaction history will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </div>

      {/* Offer Modal */}
      <OfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        domainData={domainData}
      />
    </>
  )
}
