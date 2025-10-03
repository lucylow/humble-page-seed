import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DEMO_DOMAINS = [
  {
    name: "web3pro.eth",
    description: "Premium Web3 professional services brand",
    price: "12.5 ETH",
    valuation: "15.2 ETH",
    tags: ["Premium", "Tech", "Web3"],
    trend: "+25%"
  },
  {
    name: "aimarket.eth",
    description: "AI-powered marketplace platform",
    price: "8.3 ETH",
    valuation: "10.1 ETH",
    tags: ["AI", "Marketplace", "Trending"],
    trend: "+18%"
  },
  {
    name: "metashop.eth",
    description: "Next-gen metaverse shopping experience",
    price: "6.7 ETH",
    valuation: "8.4 ETH",
    tags: ["Metaverse", "Commerce", "Hot"],
    trend: "+32%"
  },
  {
    name: "defi.trade",
    description: "Decentralized trading platform",
    price: "18.9 ETH",
    valuation: "22.5 ETH",
    tags: ["DeFi", "Premium", "Finance"],
    trend: "+15%"
  },
  {
    name: "nftgallery.eth",
    description: "Curated NFT art gallery",
    price: "5.2 ETH",
    valuation: "6.8 ETH",
    tags: ["NFT", "Art", "Gallery"],
    trend: "+22%"
  },
  {
    name: "cryptonews.eth",
    description: "Leading crypto news platform",
    price: "14.5 ETH",
    valuation: "17.3 ETH",
    tags: ["Media", "News", "Crypto"],
    trend: "+12%"
  }
];

export function DemoDomainsGrid() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg border border-primary/20">
        <Sparkles className="h-5 w-5 text-primary" />
        <p className="text-sm">
          These are example domains to showcase the platform. Connect your wallet to list your own domains!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEMO_DOMAINS.map((domain, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold">{domain.name}</CardTitle>
                  <CardDescription className="mt-2">{domain.description}</CardDescription>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {domain.trend}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {domain.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Listed Price</p>
                    <p className="text-2xl font-bold text-primary">{domain.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">AI Valuation</p>
                    <p className="text-lg font-semibold">{domain.valuation}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/marketplace')}
              >
                View Details
              </Button>
              <Button 
                className="flex-1"
                onClick={() => navigate('/marketplace')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Quick Buy
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
