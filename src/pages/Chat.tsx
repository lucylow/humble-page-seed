import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWeb3 } from '@/contexts/Web3Context';
import { useDoma } from '@/contexts/DomaContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DomainMessaging from '@/components/DomainMessaging';
// Fixed lucide-react imports - removed non-existent FileContract
import { 
  Globe, 
  Wallet, 
  ExternalLink, 
  FileText, 
  Coins, 
  History, 
  Handshake, 
  Heart, 
  Check, 
  Clock, 
  MessageCircle, 
  BadgeCheck, 
  Send,
  Link as LinkIcon
} from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOutgoing: boolean;
  hasTransaction?: boolean;
  transactionHash?: string;
}

interface DomainDetails {
  name: string;
  price: string;
  description: string;
  registrationDate: string;
  expirationDate: string;
  traffic: string;
  pageRank: string;
  owner: string;
  category: string;
}

const Chat: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { isConnected, connectWallet, account } = useWeb3();
  const { marketplaceDomains } = useDoma();
  
  // Get domain from URL parameters
  const domainFromUrl = searchParams.get('domain');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'DomainSeller.eth',
      content: "Hi there! Thanks for your interest in cryptoinvestor.eth. Are you looking to make an offer?",
      timestamp: '10:24 AM',
      isOutgoing: false
    },
    {
      id: '2',
      sender: 'You',
      content: "Yes, I'm interested. Would you consider 4.5 ETH for the domain?",
      timestamp: '10:27 AM',
      isOutgoing: true
    },
    {
      id: '3',
      sender: 'DomainSeller.eth',
      content: "That's a bit lower than my asking price. I have another offer for 5 ETH. Can you do better?",
      timestamp: '10:29 AM',
      isOutgoing: false
    },
    {
      id: '4',
      sender: 'You',
      content: "I could do 4.8 ETH. Here's a signed transaction ready to execute:",
      timestamp: '10:31 AM',
      isOutgoing: true,
      hasTransaction: true,
      transactionHash: '0x1234...5678'
    },
    {
      id: '5',
      sender: 'DomainSeller.eth',
      content: "I appreciate the offer. Let me think about it and get back to you. Would you be interested in partial payment in USDC?",
      timestamp: '10:35 AM',
      isOutgoing: false
    },
    {
      id: '6',
      sender: 'You',
      content: "Possibly. What ratio were you thinking? ETH/USDC?",
      timestamp: '10:36 AM',
      isOutgoing: true
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const domainDetails: DomainDetails = {
    name: 'cryptoinvestor.eth',
    price: '5.2 ETH',
    description: 'Premium domain for crypto investment platforms. Short, memorable, and highly brandable. Perfect for DeFi projects, investment funds, or crypto media.',
    registrationDate: 'Jan 15, 2022',
    expirationDate: 'Jan 15, 2024',
    traffic: '~500 visits/mo',
    pageRank: '4/10',
    owner: '0x8a17...3c2d',
    category: 'Premium'
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: 'You',
        content: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOutgoing: true
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate typing indicator
      setIsTyping(true);
      
      // Simulate reply after delay
      setTimeout(() => {
        const replies = [
          "I can do 5 ETH if you're willing to close today.",
          "Would you consider 4.9 ETH with a 50% USDC payment?",
          "I have another buyer interested at 5.1 ETH. Can you match that?",
          "I'm willing to negotiate on price if we can close quickly.",
          "Would you like to make a counter-offer?"
        ];
        
        const reply = replies[Math.floor(Math.random() * replies.length)];
        const replyMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'DomainSeller.eth',
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOutgoing: false
        };
        
        setMessages(prev => [...prev, replyMessage]);
        setIsTyping(false);
      }, 1000 + Math.random() * 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleMakeOffer = () => {
    const offerAmount = prompt(`Make an offer for ${domainDetails.name} (Current price: ${domainDetails.price}):`);
    if (offerAmount && !isNaN(parseFloat(offerAmount)) && parseFloat(offerAmount) > 0) {
      const message: Message = {
        id: Date.now().toString(),
        sender: 'You',
        content: `I'd like to make an offer of ${offerAmount} ETH for ${domainDetails.name}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOutgoing: true
      };
      setMessages(prev => [...prev, message]);
      
      // Simulate seller response
      setTimeout(() => {
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'DomainSeller.eth',
          content: `Thank you for your offer of ${offerAmount} ETH. I'll consider it and get back to you shortly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOutgoing: false
        };
        setMessages(prev => [...prev, reply]);
      }, 1500);
    } else if (offerAmount) {
      alert('Please enter a valid offer amount greater than 0');
    }
  };

  const handleWatchlist = () => {
    setIsWatchlisted(!isWatchlisted);
    if (!isWatchlisted) {
      // Add to watchlist
      const message: Message = {
        id: Date.now().toString(),
        sender: 'System',
        content: `Added ${domainDetails.name} to your watchlist`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOutgoing: false
      };
      setMessages(prev => [...prev, message]);
    } else {
      // Remove from watchlist
      const message: Message = {
        id: Date.now().toString(),
        sender: 'System',
        content: `Removed ${domainDetails.name} from your watchlist`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOutgoing: false
      };
      setMessages(prev => [...prev, message]);
    }
  };

  // If a specific domain is requested, show the domain messaging interface
  if (domainFromUrl) {
    const domain = marketplaceDomains.find(d => d.name === domainFromUrl);
    if (domain) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
          <div className="container mx-auto">
            <DomainMessaging 
              domainName={domainFromUrl}
              domainOwner={domain.owner}
              currentUser={account || ''}
            />
          </div>
        </div>
      );
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        
        <Card className="w-full max-w-md bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border border-border/50 shadow-2xl shadow-primary/10 relative z-10">
          <CardHeader className="text-center pb-6">
            <div className="mb-4">
              <span className="text-4xl animate-float">💬</span>
            </div>
            <CardTitle className="text-2xl text-foreground">
              DomainFi Chat
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Connect your wallet to start trading negotiations
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={() => connectWallet()} 
              className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium py-3 transition-all duration-300 hover:shadow-lg"
              size="lg"
            >
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </div>
            </Button>
            <div className="text-sm text-muted-foreground text-center bg-muted/30 rounded-lg p-3">
              Negotiate domain trades with secure, on-chain messaging
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-accent/5 to-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold text-black dark:text-white">
              DomainFi Chat
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Connected: {account?.slice(0, 6)}...{account?.slice(-4)}</span>
              </div>
              <Badge variant="outline" className="px-3 py-1">
                XMTP Protocol
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-4 py-2 bg-emerald-50 border-emerald-500/20 text-emerald-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
              Live Chat
            </Badge>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Domain Details Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 sticky top-24">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-primary mb-2">
                      {domainDetails.name}
                    </CardTitle>
                    <div className="text-2xl font-bold text-emerald-600">
                      {domainDetails.price}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {domainDetails.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {domainDetails.description}
                </p>

                {/* Domain Metadata */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Registration</div>
                    <div className="text-sm font-medium">{domainDetails.registrationDate}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Expiration</div>
                    <div className="text-sm font-medium">{domainDetails.expirationDate}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Traffic</div>
                    <div className="text-sm font-medium">{domainDetails.traffic}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">PageRank</div>
                    <div className="text-sm font-medium">{domainDetails.pageRank}</div>
                  </div>
                </div>

                {/* On-Chain Links */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    On-Chain Links
                  </h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Globe className="w-4 h-4 mr-2" />
                      View on Etherscan
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Smart Contract
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Coins className="w-4 h-4 mr-2" />
                      Token Details
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <History className="w-4 h-4 mr-2" />
                      Transaction History
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={handleMakeOffer}
                    className="w-full bg-foreground text-background hover:bg-foreground/90"
                  >
                    <Handshake className="w-4 h-4 mr-2" />
                    Make Offer
                  </Button>
                  <Button 
                    onClick={handleWatchlist}
                    variant="outline" 
                    className="w-full"
                  >
                    {isWatchlisted ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Added to Watchlist
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Add to Watchlist
                      </>
                    )}
                  </Button>
                </div>

                {/* Negotiation Status */}
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                    Negotiation in progress - 2 offers received
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Container */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 h-[600px] flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b border-border/50">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Trade Negotiation
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Connected via XMTP</span>
                    <BadgeCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              </CardHeader>

              {/* Chat Messages */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOutgoing ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] p-4 rounded-2xl ${
                        message.isOutgoing
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}
                    >
                      {!message.isOutgoing && (
                        <div className="text-sm font-semibold mb-2 opacity-80">
                          {message.sender}
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      {message.hasTransaction && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mt-2 h-8 text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Transaction
                        </Button>
                      )}
                      <div className="text-xs opacity-70 mt-2 text-right">
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-md p-4 max-w-fit">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          DomainSeller.eth is typing
                        </span>
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Chat Input */}
              <div className="border-t border-border/50 p-4">
                <div className="flex gap-3">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 min-h-[60px] resize-none"
                    rows={2}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-foreground text-background hover:bg-foreground/90"
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
