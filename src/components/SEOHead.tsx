import React from 'react';
import { Helmet } from 'react-helmet-async';

interface DomainData {
  name: string;
  description?: string;
  imageUrl?: string;
  aiValuation?: number;
  tokenId: string;
  owner?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

interface SEOHeadProps {
  domainData: DomainData;
  domainId: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({ domainData, domainId }) => {
  const title = `${domainData.name} | DomaLand.AI`;
  const description = domainData.description || `Premium domain ${domainData.name} available for sale on DomaLand.AI`;
  const imageUrl = domainData.imageUrl || `https://domaland.ai/api/og?domain=${domainId}`;
  const url = `https://domaland.ai/domain/${domainId}`;

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": domainData.name,
    "description": description,
    "url": url,
    "image": imageUrl,
    "author": {
      "@type": "Organization",
      "name": "DomaLand.AI"
    },
    "offers": {
      "@type": "Offer",
      "price": domainData.aiValuation?.toString() || "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "DomaLand.AI"
      }
    },
    "additionalProperty": domainData.attributes?.map(attr => ({
      "@type": "PropertyValue",
      "name": attr.trait_type,
      "value": attr.value.toString()
    })) || []
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`domain, ${domainData.name}, blockchain, NFT, tokenized domain, DomaLand.AI`} />
      <meta name="author" content="DomaLand.AI" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="DomaLand.AI" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@DomaLandAI" />
      <meta name="twitter:creator" content="@DomaLandAI" />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      {/* Domain-specific Meta Tags */}
      <meta name="domain-name" content={domainData.name} />
      <meta name="domain-token-id" content={domainData.tokenId} />
      <meta name="domain-owner" content={domainData.owner || ""} />
      <meta name="domain-valuation" content={domainData.aiValuation?.toString() || "0"} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Additional Structured Data for Domain */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": domainData.name,
          "description": description,
          "image": imageUrl,
          "brand": {
            "@type": "Brand",
            "name": "DomaLand.AI"
          },
          "offers": {
            "@type": "Offer",
            "price": domainData.aiValuation?.toString() || "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "DomaLand.AI"
            }
          },
          "additionalProperty": domainData.attributes?.map(attr => ({
            "@type": "PropertyValue",
            "name": attr.trait_type,
            "value": attr.value.toString()
          })) || []
        })}
      </script>

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://gateway.pinata.cloud" />
      <link rel="preconnect" href="https://via.placeholder.com" />
      <link rel="dns-prefetch" href="https://gateway.pinata.cloud" />

      {/* Favicon and App Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Theme Color */}
      <meta name="theme-color" content="#6366f1" />
      <meta name="msapplication-TileColor" content="#6366f1" />

      {/* Additional SEO Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="DomaLand.AI" />

      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />

      {/* Performance Hints */}
      <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    </Helmet>
  );
};

export default SEOHead;


