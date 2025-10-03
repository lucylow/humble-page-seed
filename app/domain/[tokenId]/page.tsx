import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { DomainPage } from '@/components/DomainPage'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

interface PageProps {
  params: {
    tokenId: string
  }
}

async function getDomainData(tokenId: string) {
  try {
    // In a real implementation, this would fetch from your database
    // For now, we'll return mock data
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/domain/${tokenId}`, {
      next: { revalidate: 60 }, // Revalidate every minute
    })
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching domain data:', error)
    return null
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export async function generateMetadata({ params }: PageProps) {
  const domainData = await getDomainData(params.tokenId)
  
  if (!domainData) {
    return {
      title: 'Domain Not Found - DomaLand.AI',
      description: 'The requested domain could not be found.',
    }
  }

  return {
    title: `${domainData.name} - DomaLand.AI`,
    description: domainData.description || `Domain ${domainData.name} on DomaLand.AI`,
    openGraph: {
      title: `${domainData.name} - DomaLand.AI`,
      description: domainData.description || `Domain ${domainData.name} on DomaLand.AI`,
      images: domainData.image ? [domainData.image] : [],
    },
  }
}

export default async function DomainPageRoute({ params }: PageProps) {
  const domainData = await getDomainData(params.tokenId)
  
  if (!domainData) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
          <DomainPage domainData={domainData} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

