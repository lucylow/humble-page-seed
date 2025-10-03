// SEO Optimization Service for Domain Landing Pages
export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  structuredData: Record<string, unknown>;
  canonicalUrl: string;
  robots: string;
  language: string;
}

export interface DomainData {
  name: string;
  price: string;
  category: string;
  owner: string;
  description?: string;
  image?: string;
  listedAt: string;
  tokenId: string;
  metadata?: Record<string, unknown>;
}

export class SEOOptimizer {
  private baseUrl: string;
  private defaultImage: string;

  constructor(baseUrl: string = 'https://domaland.xyz', defaultImage: string = '/og-default.png') {
    this.baseUrl = baseUrl;
    this.defaultImage = defaultImage;
  }

  /**
   * Generate comprehensive SEO data for a domain landing page
   */
  generateSEOData(domainData: DomainData): SEOData {
    const domainName = domainData.name;
    const price = domainData.price;
    const category = domainData.category;
    
    // Generate dynamic content based on domain characteristics
    const title = this.generateTitle(domainName, price, category);
    const description = this.generateDescription(domainName, price, category, domainData.description);
    const keywords = this.generateKeywords(domainName, category);
    
    // Generate structured data for better search engine understanding
    const structuredData = this.generateStructuredData(domainData);
    
    // Generate social media optimized content
    const ogTitle = this.generateOGTitle(domainName, price);
    const ogDescription = this.generateOGDescription(domainName, price, category);
    const ogImage = this.generateOGImage(domainName, domainData.image);
    
    return {
      title,
      description,
      keywords,
      ogTitle,
      ogDescription,
      ogImage,
      ogUrl: `${this.baseUrl}/domain/${domainName}`,
      twitterCard: 'summary_large_image',
      twitterTitle: ogTitle,
      twitterDescription: ogDescription,
      twitterImage: ogImage,
      structuredData,
      canonicalUrl: `${this.baseUrl}/domain/${domainName}`,
      robots: 'index, follow',
      language: 'en'
    };
  }

  /**
   * Generate optimized page title
   */
  private generateTitle(domainName: string, price: string, category: string): string {
    const priceFormatted = `${price} ETH`;
    const categoryFormatted = this.formatCategory(category);
    
    // Create multiple title variations for A/B testing
    const titleVariations = [
      `${domainName} - Premium ${categoryFormatted} Domain for Sale | ${priceFormatted}`,
      `Buy ${domainName} - ${categoryFormatted} Domain | ${priceFormatted} | DomaLand`,
      `${domainName} Domain for Sale - ${categoryFormatted} | ${priceFormatted} | Secure Purchase`,
      `Premium Domain ${domainName} - ${categoryFormatted} | ${priceFormatted} | Blockchain Verified`
    ];
    
    // Select title based on domain characteristics for optimal SEO
    if (this.isPremiumDomain(domainName)) {
      return titleVariations[0];
    } else if (this.isTechDomain(domainName)) {
      return titleVariations[1];
    } else if (this.isBusinessDomain(domainName)) {
      return titleVariations[2];
    } else {
      return titleVariations[3];
    }
  }

  /**
   * Generate optimized meta description
   */
  private generateDescription(domainName: string, price: string, category: string, customDescription?: string): string {
    if (customDescription && customDescription.length <= 155) {
      return customDescription;
    }

    const priceFormatted = `${price} ETH`;
    const categoryFormatted = this.formatCategory(category);
    
    const baseDescription = `Buy ${domainName} - Premium ${categoryFormatted} domain for ${priceFormatted}. `;
    const benefits = this.getDomainBenefits(domainName, category);
    const callToAction = 'Secure blockchain ownership, instant transfer, verified seller.';
    
    const fullDescription = baseDescription + benefits + callToAction;
    
    // Ensure description is within optimal length (150-160 characters)
    return fullDescription.length > 160 
      ? fullDescription.substring(0, 157) + '...'
      : fullDescription;
  }

  /**
   * Generate relevant keywords for the domain
   */
  private generateKeywords(domainName: string, category: string): string[] {
    const baseKeywords = [
      domainName,
      `${domainName} for sale`,
      `${domainName} domain`,
      'domain for sale',
      'premium domain',
      'blockchain domain',
      'web3 domain',
      'crypto domain',
      'secure domain purchase',
      'instant domain transfer'
    ];

    const categoryKeywords = this.getCategoryKeywords(category);
    const domainTypeKeywords = this.getDomainTypeKeywords(domainName);
    const industryKeywords = this.getIndustryKeywords(domainName);

    return [...baseKeywords, ...categoryKeywords, ...domainTypeKeywords, ...industryKeywords]
      .filter((keyword, index, array) => array.indexOf(keyword) === index) // Remove duplicates
      .slice(0, 20); // Limit to 20 keywords
  }

  /**
   * Generate Open Graph title
   */
  private generateOGTitle(domainName: string, price: string): string {
    return `${domainName} - Premium Domain for Sale | ${price} ETH`;
  }

  /**
   * Generate Open Graph description
   */
  private generateOGDescription(domainName: string, price: string, category: string): string {
    return `Secure purchase of ${domainName} for ${price} ETH. Premium ${this.formatCategory(category)} domain with blockchain verification and instant transfer.`;
  }

  /**
   * Generate Open Graph image URL
   */
  private generateOGImage(domainName: string, customImage?: string): string {
    if (customImage) {
      return customImage;
    }
    
    // Generate dynamic OG image URL with domain name
    return `${this.baseUrl}/api/og-image?domain=${encodeURIComponent(domainName)}&type=domain-sale`;
  }

  /**
   * Generate structured data (Schema.org) for better search engine understanding
   */
  private generateStructuredData(domainData: DomainData): Record<string, unknown> {
    const domainName = domainData.name;
    const price = parseFloat(domainData.price);
    
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": domainName,
      "description": domainData.description || `Premium domain ${domainName} available for purchase`,
      "category": domainData.category,
      "brand": {
        "@type": "Brand",
        "name": "DomaLand"
      },
      "offers": {
        "@type": "Offer",
        "price": price,
        "priceCurrency": "ETH",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "DomaLand Marketplace"
        },
        "url": `${this.baseUrl}/domain/${domainName}`
      },
      "image": domainData.image || this.defaultImage,
      "url": `${this.baseUrl}/domain/${domainName}`,
      "identifier": domainData.tokenId,
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Domain Type",
          "value": "Premium"
        },
        {
          "@type": "PropertyValue",
          "name": "Blockchain Verified",
          "value": "Yes"
        },
        {
          "@type": "PropertyValue",
          "name": "Transfer Type",
          "value": "Instant"
        }
      ]
    };
  }

  /**
   * Helper methods for content generation
   */
  private formatCategory(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'tech': 'Technology',
      'business': 'Business',
      'premium': 'Premium',
      'brand': 'Brand',
      'nft': 'NFT',
      'defi': 'DeFi',
      'crypto': 'Cryptocurrency',
      'general': 'General'
    };
    
    return categoryMap[category.toLowerCase()] || category;
  }

  private isPremiumDomain(domainName: string): boolean {
    const premiumIndicators = ['premium', 'vip', 'gold', 'elite', 'pro'];
    return premiumIndicators.some(indicator => 
      domainName.toLowerCase().includes(indicator)
    );
  }

  private isTechDomain(domainName: string): boolean {
    const techKeywords = ['tech', 'ai', 'app', 'dev', 'code', 'data', 'cloud', 'api'];
    return techKeywords.some(keyword => 
      domainName.toLowerCase().includes(keyword)
    );
  }

  private isBusinessDomain(domainName: string): boolean {
    const businessKeywords = ['business', 'corp', 'inc', 'ltd', 'group', 'company', 'enterprise'];
    return businessKeywords.some(keyword => 
      domainName.toLowerCase().includes(keyword)
    );
  }

  private getDomainBenefits(domainName: string, category: string): string {
    const benefits = [
      'Blockchain verified ownership. ',
      'Instant secure transfer. ',
      'No intermediaries required. '
    ];
    
    if (this.isTechDomain(domainName)) {
      benefits.push('Perfect for tech startups. ');
    } else if (this.isBusinessDomain(domainName)) {
      benefits.push('Ideal for business ventures. ');
    }
    
    return benefits.join('');
  }

  private getCategoryKeywords(category: string): string[] {
    const categoryKeywordMap: { [key: string]: string[] } = {
      'tech': ['technology domain', 'tech startup', 'software domain', 'app domain'],
      'business': ['business domain', 'corporate domain', 'company domain', 'enterprise domain'],
      'premium': ['premium domain', 'high value domain', 'exclusive domain', 'luxury domain'],
      'brand': ['brand domain', 'brandable domain', 'trademark domain', 'brand name'],
      'nft': ['nft domain', 'nft marketplace', 'digital art domain', 'crypto art'],
      'defi': ['defi domain', 'decentralized finance', 'crypto finance', 'blockchain finance'],
      'crypto': ['cryptocurrency domain', 'crypto domain', 'bitcoin domain', 'blockchain domain']
    };
    
    return categoryKeywordMap[category.toLowerCase()] || [];
  }

  private getDomainTypeKeywords(domainName: string): string[] {
    const keywords: string[] = [];
    
    if (domainName.length <= 6) {
      keywords.push('short domain', 'memorable domain', 'brandable domain');
    }
    
    if (domainName.includes('.')) {
      const tld = domainName.split('.').pop();
      keywords.push(`${tld} domain`, `${tld} extension`);
    }
    
    if (/^[a-z]+$/.test(domainName)) {
      keywords.push('exact match domain', 'keyword domain');
    }
    
    return keywords;
  }

  private getIndustryKeywords(domainName: string): string[] {
    const industryMap: { [key: string]: string[] } = {
      'finance': ['finance domain', 'financial services', 'banking domain', 'investment domain'],
      'health': ['health domain', 'medical domain', 'healthcare domain', 'wellness domain'],
      'education': ['education domain', 'learning domain', 'school domain', 'university domain'],
      'entertainment': ['entertainment domain', 'media domain', 'gaming domain', 'streaming domain'],
      'ecommerce': ['ecommerce domain', 'online store', 'shopping domain', 'retail domain'],
      'realestate': ['real estate domain', 'property domain', 'housing domain', 'realty domain']
    };
    
    for (const [industry, keywords] of Object.entries(industryMap)) {
      if (domainName.toLowerCase().includes(industry)) {
        return keywords;
      }
    }
    
    return [];
  }

  /**
   * Generate sitemap entry for the domain
   */
  generateSitemapEntry(domainData: DomainData): string {
    const url = `${this.baseUrl}/domain/${domainData.name}`;
    const lastmod = new Date(domainData.listedAt).toISOString().split('T')[0];
    const priority = this.isPremiumDomain(domainData.name) ? '0.9' : '0.7';
    const changefreq = 'weekly';
    
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }

  /**
   * Generate robots.txt entry
   */
  generateRobotsEntry(): string {
    return `User-agent: *
Allow: /domain/
Disallow: /api/
Sitemap: ${this.baseUrl}/sitemap.xml`;
  }
}

// Export singleton instance
export const seoOptimizer = new SEOOptimizer();
