import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import WalletConnectionTest from '@/components/WalletConnectionTest';
import WalletConnectionHelper from '@/components/WalletConnectionHelper';
import EnhancedWalletConnection from '@/components/EnhancedWalletConnection';

const Help: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I connect my wallet?",
          answer: "Click the 'Connect Wallet' button in the top right corner. We support MetaMask, WalletConnect, and other popular Web3 wallets. Make sure you're on the correct network (Ethereum mainnet or testnet)."
        },
        {
          question: "What domains can I tokenize?",
          answer: "You can tokenize any domain you own. Simply connect your wallet, go to the Dashboard, and click 'Tokenize Domain'. Enter your domain name and follow the prompts to create your domain token."
        },
        {
          question: "How much does it cost to tokenize a domain?",
          answer: "Tokenization costs include gas fees for the blockchain transaction (typically $10-50 depending on network congestion) plus a small platform fee of 2.5% of the domain's value."
        }
      ]
    },
    {
      category: "Trading & Marketplace",
      questions: [
        {
          question: "How do I list my domain for sale?",
          answer: "After tokenizing your domain, go to the Marketplace section and click 'List Domain'. Set your desired price in ETH and confirm the transaction. Your domain will appear in the marketplace for others to purchase."
        },
        {
          question: "Can I buy fractions of a domain?",
          answer: "Yes! Many domains are available for fractional ownership. Go to the Portfolio section to browse fractional domain opportunities. You can buy as little as 1% of a domain's value."
        },
        {
          question: "How do I know if a domain is legitimate?",
          answer: "All domains on our platform are verified through blockchain records. Check the domain's ownership history, verification badges, and community ratings before purchasing."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "What blockchain networks are supported?",
          answer: "Currently, we support Ethereum mainnet and testnets. We're working on adding support for Polygon, Arbitrum, and other Layer 2 solutions for lower gas fees."
        },
        {
          question: "How do I transfer my domain tokens?",
          answer: "Domain tokens are ERC-721 NFTs that can be transferred like any other NFT. Use your wallet's 'Send' function and enter the recipient's address along with the token ID."
        },
        {
          question: "What happens if I lose access to my wallet?",
          answer: "Unfortunately, if you lose access to your wallet and don't have your seed phrase, the domain tokens cannot be recovered. Always backup your seed phrase in a secure location."
        }
      ]
    }
  ];

  const filteredFAQs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-accent/5 to-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-black dark:text-white">
            Help Center
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions and get support for your DomainFi experience
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="text-4xl mb-2 animate-float">📚</div>
              <CardTitle className="text-lg">Documentation</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Comprehensive guides and API documentation
              </p>
              <Button variant="outline" className="w-full">
                View Docs
              </Button>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="text-4xl mb-2 animate-float" style={{animationDelay: '0.5s'}}>💬</div>
              <CardTitle className="text-lg">Community</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Join our Discord for real-time support
              </p>
              <Button variant="outline" className="w-full">
                Join Discord
              </Button>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="text-4xl mb-2 animate-float" style={{animationDelay: '1s'}}>🎫</div>
              <CardTitle className="text-lg">Support Ticket</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Submit a ticket for personalized help
              </p>
              <Button variant="outline" className="w-full">
                Create Ticket
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search help articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                />
              </div>
              <Button className="bg-foreground text-background hover:bg-foreground/90">
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-background/50 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="faq" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              FAQ
            </TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Wallet Tools
            </TabsTrigger>
            <TabsTrigger value="guides" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Guides
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Contact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="outline" className="px-3 py-1">
                        {category.category}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                          <AccordionTrigger className="text-left hover:no-underline">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50">
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4 opacity-50">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or browse our categories below.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🔧</span>
                    Wallet Connection Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Use these tools to diagnose and fix wallet connection issues. Perfect for troubleshooting MetaMask, 
                    WalletConnect, and other Web3 wallet problems.
                  </p>
                  
                  <Tabs defaultValue="connect" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="connect">Connect Wallet</TabsTrigger>
                      <TabsTrigger value="test">Connection Test</TabsTrigger>
                      <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="connect" className="space-y-4">
                      <EnhancedWalletConnection />
                    </TabsContent>
                    
                    <TabsContent value="test" className="space-y-4">
                      <WalletConnectionTest />
                    </TabsContent>
                    
                    <TabsContent value="diagnostics" className="space-y-4">
                      <WalletConnectionHelper />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    Common Wallet Issues & Solutions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Wallet not detected</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p>If your wallet is not being detected:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Make sure MetaMask or your preferred wallet extension is installed and enabled</li>
                          <li>Refresh the page and try connecting again</li>
                          <li>Check that the wallet extension is not disabled by your browser</li>
                          <li>Try using incognito/private mode to rule out extension conflicts</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Connection rejected or failed</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p>If wallet connection is being rejected:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Make sure to click "Connect" when prompted by your wallet</li>
                          <li>Check that your wallet is unlocked and not busy with another transaction</li>
                          <li>Try disconnecting from other dApps and connecting again</li>
                          <li>Clear your browser cache and try again</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Wrong network or chain issues</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p>If you're having network-related issues:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Our platform supports Ethereum, Polygon, and BSC networks</li>
                          <li>Click "Connect" and approve the network switch when prompted</li>
                          <li>Manually switch networks in your wallet if auto-switch fails</li>
                          <li>Check that you have sufficient native tokens for gas fees</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-4">
                      <AccordionTrigger>Development and testing</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p>For developers and testing:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Use the "Mock Wallet" option in development mode</li>
                          <li>Run the connection test to verify wallet functionality</li>
                          <li>Use the diagnostics tool to check wallet capabilities</li>
                          <li>Check browser console for detailed error messages</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="guides" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🚀</span>
                    Getting Started Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Learn how to connect your wallet, tokenize your first domain, and start trading.
                  </p>
                  <Button variant="outline" className="w-full">
                    Read Guide
                  </Button>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">💼</span>
                    Portfolio Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Master the art of managing your domain portfolio and maximizing returns.
                  </p>
                  <Button variant="outline" className="w-full">
                    Read Guide
                  </Button>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🔒</span>
                    Security Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Keep your domain tokens and wallet secure with these essential tips.
                  </p>
                  <Button variant="outline" className="w-full">
                    Read Guide
                  </Button>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Analytics & Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Understand market trends and make data-driven investment decisions.
                  </p>
                  <Button variant="outline" className="w-full">
                    Read Guide
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📧</span>
                    Email Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Get personalized help from our support team. We typically respond within 24 hours.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">General Support</Badge>
                      <span className="text-sm text-muted-foreground">support@domafi.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Technical Issues</Badge>
                      <span className="text-sm text-muted-foreground">tech@domafi.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Business Inquiries</Badge>
                      <span className="text-sm text-muted-foreground">business@domafi.com</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">💬</span>
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Chat with our support team in real-time. Available Monday-Friday, 9 AM - 6 PM EST.
                  </p>
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Help;
