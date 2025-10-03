import React from 'react';
import { useParams } from 'react-router-dom';
import DomainNegotiation from '@/components/DomainNegotiation';
import SEOHead from '@/components/SEOHead';

const DomainNegotiationPage: React.FC = () => {
  const { domainId } = useParams<{ domainId: string }>();

  // Mock domain data for SEO - in production this would be fetched from the blockchain
  const mockDomainData = {
    name: `domain-${domainId}.eth`,
    description: `Negotiate the purchase of ${domainId} domain on DomaLand.AI`,
    imageUrl: `https://via.placeholder.com/400x200/6366f1/ffffff?text=${domainId}`,
    aiValuation: Math.floor(Math.random() * 100000) + 10000,
    tokenId: domainId || '',
    owner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    attributes: [
      { trait_type: 'Length', value: domainId?.length || 0 },
      { trait_type: 'Rarity', value: 'Premium' },
      { trait_type: 'Category', value: 'Business' },
      { trait_type: 'TLD', value: 'eth' }
    ]
  };

  if (!domainId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Domain Not Found</h2>
          <p className="text-muted-foreground">The domain you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead domainData={mockDomainData} domainId={domainId} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <DomainNegotiation
            domainId={domainId}
            domainName={mockDomainData.name}
            domainPrice="5.2 ETH"
            ownerAddress={mockDomainData.owner}
          />
        </div>
      </div>
    </>
  );
};

export default DomainNegotiationPage;


