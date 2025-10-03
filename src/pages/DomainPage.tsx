import React from 'react';
import { useParams } from 'react-router-dom';
import DomainLandingPage from '@/components/DomainLandingPage';
import SEOHead from '@/components/SEOHead';

/**
 * Dynamic domain page component that handles routing for individual domains
 * This component wraps the DomainLandingPage with SEO optimization
 */
const DomainPage: React.FC = () => {
  const { domainId } = useParams<{ domainId: string }>();

  // Mock domain data for SEO - in production this would be fetched from the blockchain
  const mockDomainData = {
    name: `domain-${domainId}.doma`,
    description: `Premium domain ${domainId} available for investment on DomaLand.AI`,
    imageUrl: `https://via.placeholder.com/400x200/6366f1/ffffff?text=${domainId}`,
    aiValuation: Math.floor(Math.random() * 100000) + 10000,
    tokenId: domainId || '',
    owner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    attributes: [
      { trait_type: 'Length', value: domainId?.length || 0 },
      { trait_type: 'Rarity', value: 'Premium' },
      { trait_type: 'Category', value: 'Business' },
      { trait_type: 'TLD', value: 'doma' }
    ]
  };

  return (
    <>
      <SEOHead domainData={mockDomainData} domainId={domainId || ''} />
      <DomainLandingPage />
    </>
  );
};

export default DomainPage;


