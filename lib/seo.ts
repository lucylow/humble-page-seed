import { DomainData } from '@/types/domain'

export interface SEOData {
  title: string
  description: string
  keywords: string[]
  canonicalUrl: string
  ogImage?: string
  structuredData?: Record<string, unknown>
  robots?: string
}

export interface DomainSEOData extends SEOData {
  domainName: string
  domainValue?: number
  domainCategory?: string
  domainStatus: 'available' | 'listed' | 'sold'
  listingPrice?: string
  currency?: string
}

/**
 * Generate SEO data for the main landing page
 */
export function generateMainPageSEO(): SEOData {
  return {
    title: 'DomaLand.AI - SEO-Optimized Domain Landing Pages | Transform Domains into Digital Assets',
    description: 'Create high-converting, search engine optimized landing pages for your tokenized domains. AI-powered SEO optimization, automatic meta tags, and structured data for maximum visibility.',
    keywords: [
      'domain landing pages',
      'SEO optimization',
      'domain tokenization',
      'web3 domains',
      'domain marketplace',
      'digital assets',
      'domain monetization',
      'blockchain domains',
      'domain trading',
      'automated SEO'
    ],
    canonicalUrl: 'https://domaland.ai',
    ogImage: 'https://domaland.ai/og-image.jpg',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'DomaLand.AI',
      url: 'https://domaland.ai',
      description: 'Create SEO-optimized landing pages for your tokenized domains',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free domain landing page generation'
      },
      creator: {
        '@type': 'Organization',
        name: 'DomaLand Team',
        url: 'https://domaland.ai'
      }
    },
    robots: 'index, follow'
  }
}

/**
 * Generate SEO data for individual domain pages
 */
export function generateDomainSEO(domainData: DomainData): DomainSEOData {
  const domainName = domainData.name
  const domainValue = domainData.marketplaceData?.price ? parseFloat(domainData.marketplaceData.price) : undefined
  const isListed = domainData.marketplaceData?.isListed || false
  const status = isListed ? 'listed' : 'available'
  
  // Generate dynamic title based on domain status and value
  let title: string
  let description: string
  
  if (isListed && domainValue) {
    title = `${domainName} - Premium Domain for Sale | $${domainValue.toLocaleString()} | DomaLand.AI`
    description = `${domainName} is available for immediate purchase at $${domainValue.toLocaleString()}. Premium domain with full transfer support, SSL certificate, and SEO optimization. Buy now or make an offer.`
  } else if (isListed) {
    title = `${domainName} - Domain for Sale | Premium Web3 Domain | DomaLand.AI`
    description = `${domainName} is listed for sale on DomaLand.AI. Premium domain with blockchain ownership verification and automated SEO optimization. Make an offer today.`
  } else {
    title = `${domainName} - Tokenized Domain | Web3 Digital Asset | DomaLand.AI`
    description = `${domainName} is a tokenized domain on the DomaLand.AI platform. Track ownership, view analytics, and manage your digital asset portfolio.`
  }

  // Generate keywords based on domain characteristics
  const keywords = generateDomainKeywords(domainName, domainValue, status)
  
  // Generate structured data
  const structuredData = generateDomainStructuredData(domainData, domainValue, status)

  return {
    title,
    description,
    keywords,
    canonicalUrl: `https://domaland.ai/domain/${domainData.tokenId}`,
    ogImage: domainData.image || `https://domaland.ai/api/og/domain/${domainData.tokenId}`,
    structuredData,
    robots: 'index, follow',
    domainName,
    domainValue,
    domainStatus: status,
    listingPrice: domainData.marketplaceData?.price,
    currency: 'USD'
  }
}

/**
 * Generate domain-specific keywords
 */
function generateDomainKeywords(domainName: string, domainValue?: number, status: string): string[] {
  const baseKeywords = [
    domainName,
    `${domainName} domain`,
    `${domainName} for sale`,
    'premium domain',
    'domain marketplace',
    'web3 domain',
    'blockchain domain',
    'domain tokenization'
  ]

  if (status === 'listed') {
    baseKeywords.push(
      `${domainName} buy`,
      `${domainName} purchase`,
      'domain investment',
      'domain trading'
    )
  }

  if (domainValue && domainValue > 10000) {
    baseKeywords.push(
      'premium domain investment',
      'high value domain',
      'domain portfolio'
    )
  }

  // Add TLD-specific keywords
  const tld = domainName.split('.').pop()
  if (tld) {
    baseKeywords.push(`${tld} domain`, `.${tld} extension`)
  }

  return [...new Set(baseKeywords)] // Remove duplicates
}

/**
 * Generate structured data for domain pages
 */
function generateDomainStructuredData(domainData: DomainData, domainValue?: number, status: string): Record<string, unknown> {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: domainData.name,
    description: domainData.description || `${domainData.name} domain available on DomaLand.AI`,
    image: domainData.image || `https://domaland.ai/api/og/domain/${domainData.tokenId}`,
    url: `https://domaland.ai/domain/${domainData.tokenId}`,
    brand: {
      '@type': 'Brand',
      name: 'DomaLand.AI'
    },
    category: 'Domain Name',
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Token ID',
        value: domainData.tokenId
      },
      {
        '@type': 'PropertyValue',
        name: 'Contract Address',
        value: domainData.contractAddress
      },
      {
        '@type': 'PropertyValue',
        name: 'Owner',
        value: domainData.owner
      }
    ]
  }

  // Add offer data if domain is listed
  if (status === 'listed' && domainValue) {
    baseStructuredData['offers'] = {
      '@type': 'Offer',
      price: domainValue.toString(),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'DomaLand.AI'
      },
      url: `https://domaland.ai/domain/${domainData.tokenId}`
    }
  }

  // Add FAQ structured data
  baseStructuredData['mainEntity'] = [
    {
      '@type': 'Question',
      name: `What is ${domainData.name}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${domainData.name} is a tokenized domain name on the DomaLand.AI platform, representing digital ownership verified on the blockchain.`
      }
    },
    {
      '@type': 'Question',
      name: `How do I purchase ${domainData.name}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `You can purchase ${domainData.name} directly through our platform using cryptocurrency or make an offer. All transactions are secured by smart contracts.`
      }
    }
  ]

  return baseStructuredData
}

/**
 * Generate XML sitemap data
 */
export function generateSitemapData(domains: DomainData[]): string {
  const baseUrls = [
    {
      loc: 'https://domaland.ai',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      loc: 'https://domaland.ai/features',
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      loc: 'https://domaland.ai/pricing',
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.7'
    }
  ]

  const domainUrls = domains.map(domain => ({
    loc: `https://domaland.ai/domain/${domain.tokenId}`,
    lastmod: domain.updatedAt || new Date().toISOString(),
    changefreq: 'weekly',
    priority: '0.6'
  }))

  const allUrls = [...baseUrls, ...domainUrls]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: https://domaland.ai/sitemap.xml

# Disallow admin and API routes
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /_next/

# Allow important pages
Allow: /domain/
Allow: /features/
Allow: /pricing/`
}

/**
 * Generate meta tags for Next.js
 */
export function generateMetaTags(seoData: SEOData) {
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords.join(', '),
    robots: seoData.robots,
    canonical: seoData.canonicalUrl,
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      url: seoData.canonicalUrl,
      siteName: 'DomaLand.AI',
      images: seoData.ogImage ? [
        {
          url: seoData.ogImage,
          width: 1200,
          height: 630,
          alt: seoData.title,
        }
      ] : [],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.title,
      description: seoData.description,
      images: seoData.ogImage ? [seoData.ogImage] : [],
    },
  }
}
