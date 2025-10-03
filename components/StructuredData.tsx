import { DomainData } from '@/types/domain'
import { generateDomainStructuredData } from '@/lib/seo'

interface StructuredDataProps {
  data: DomainData
}

export function StructuredData({ data }: StructuredDataProps) {
  const structuredData = generateDomainStructuredData(
    data,
    data.marketplaceData?.price ? parseFloat(data.marketplaceData.price) : undefined,
    data.marketplaceData?.isListed ? 'listed' : 'available'
  )

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  )
}

