import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  try {
    const { tokenId } = params

    // Fetch domain data from database
    const domain = await prisma.domain.findUnique({
      where: { tokenId },
      include: {
        offers: {
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'desc' },
        },
        analytics: {
          orderBy: { date: 'desc' },
          take: 30, // Last 30 days
        },
      },
    })

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      )
    }

    // Fetch additional data from smart contracts
    const [marketplaceData, activeOffers] = await Promise.all([
      fetchMarketplaceData(domain.contractAddress, domain.tokenId),
      fetchActiveOffers(domain.contractAddress, domain.tokenId),
    ])

    return NextResponse.json({
      ...domain,
      marketplaceData,
      activeOffers,
    })

  } catch (error) {
    console.error('Error fetching domain data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function fetchMarketplaceData(contractAddress: string, tokenId: string) {
  try {
    // This would fetch from the Doma marketplace contract
    // For now, return mock data
    return {
      isListed: false,
      price: null,
      seller: null,
    }
  } catch (error) {
    console.error('Error fetching marketplace data:', error)
    return {
      isListed: false,
      price: null,
      seller: null,
    }
  }
}

async function fetchActiveOffers(contractAddress: string, tokenId: string) {
  try {
    // This would fetch from the OfferFactory contract
    // For now, return mock data
    return []
  } catch (error) {
    console.error('Error fetching active offers:', error)
    return []
  }
}

