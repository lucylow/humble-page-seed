import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  try {
    const { tokenId } = params
    
    // In a real implementation, you would fetch domain data from your database
    // For now, we'll return a JSON response with domain metadata
    const domainData = {
      tokenId,
      name: `Domain #${tokenId}`,
      description: `Tokenized Domain on DomaLand.AI`,
      image: `https://domaland.ai/api/og?domain=${tokenId}`,
      url: `https://domaland.ai/domain/${tokenId}`
    }
    
    return NextResponse.json(domainData)
  } catch (error) {
    console.error('Error fetching domain data:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch domain data' },
      { status: 500 }
    )
  }
}
