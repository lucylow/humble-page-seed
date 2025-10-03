import React, { useState, useEffect, useRef } from 'react';
import { useXMTP } from '@/contexts/XMTPContext';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Send, 
  DollarSign, 
  ExternalLink, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Wallet
} from 'lucide-react';

interface TradeChatProps {
  domainId?: string;
  domainName?: string;
  domainPrice?: string;
  peerAddress?: string;
  className?: string;
}

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    senderAddress: string;
    timestamp: Date;
    messageType: 'text' | 'offer' | 'transaction' | 'system';
    metadata?: {
      offerAmount?: string;
      offerToken?: string;
      transactionHash?: string;
      domainId?: string;
    };
  };
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getMessageIcon = () => {
    switch (message.messageType) {
      case 'offer':
        return <DollarSign className="w-4 h-4" />;
      case 'transaction':
        return <ExternalLink className="w-4 h-4" />;
      case 'system':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getMessageColor = () => {
    switch (message.messageType) {
      case 'offer':
        return 'bg-blue-500 text-white';
      case 'transaction':
        return 'bg-green-500 text-white';
      case 'system':
        return 'bg-yellow-500 text-white';
      default:
        return isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && (
          <div className="text-xs text-muted-foreground mb-1 ml-2">
            {formatAddress(message.senderAddress)}
          </div>
        )}
        
        <div className={`rounded-lg p-3 ${getMessageColor()}`}>
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              {getMessageIcon()}
            </div>
            <div className="flex-1">
              <p className="text-sm">{message.content}</p>
              
              {/* Offer metadata */}
              {message.messageType === 'offer' && message.metadata?.offerAmount && (
                <div className="mt-2 p-2 bg-white/20 rounded border">
                  <div className="text-xs font-semibold">Offer Details</div>
                  <div className="text-sm">
                    {message.metadata.offerAmount} {message.metadata.offerToken}
                  </div>
                </div>
              )}
              
              {/* Transaction metadata */}
              {message.messageType === 'transaction' && message.metadata?.transactionHash && (
                <div className="mt-2 p-2 bg-white/20 rounded border">
                  <div className="text-xs font-semibold mb-1">Transaction</div>
                  <a 
                    href={`https://etherscan.io/tx/${message.metadata.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline hover:no-underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on Etherscan
                  </a>
                </div>
              )}
              
              <div className="text-xs opacity-70 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(message.timestamp)}
                {isOwn && <CheckCircle className="w-3 h-3 ml-1" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TradeChat: React.FC<TradeChatProps> = ({ 
  domainId, 
  domainName, 
  domainPrice, 
  peerAddress,
  className 
}) => {
  const { 
    isConnected, 
    isLoading, 
    error, 
    conversations, 
    activeConversation, 
    messages,
    connectXMTP,
    startConversation,
    sendMessage,
    sendOffer,
    sendTransactionLink,
    setActiveConversation,
    markAsRead,
    getConversationByDomain
  } = useXMTP();
  
  const { account } = useWeb3();
  
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerToken, setOfferToken] = useState('ETH');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initialize conversation when component mounts
  useEffect(() => {
    if (domainId && peerAddress && isConnected) {
      initializeConversation();
    }
  }, [domainId, peerAddress, isConnected]);

  // Mark messages as read when conversation becomes active
  useEffect(() => {
    if (activeConversation) {
      markAsRead(activeConversation.id);
    }
  }, [activeConversation, markAsRead]);

  const initializeConversation = async () => {
    try {
      // Check if conversation already exists for this domain
      const existingConv = getConversationByDomain(domainId!);
      if (existingConv) {
        setActiveConversation(existingConv.id);
        return;
      }

      // Start new conversation
      const conversationId = await startConversation(peerAddress!, domainId);
      setActiveConversation(conversationId);
    } catch (err) {
      console.error('Failed to initialize conversation:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation || isSending) return;

    try {
      setIsSending(true);
      await sendMessage(activeConversation.id, messageInput.trim());
      setMessageInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendOffer = async () => {
    if (!offerAmount || !activeConversation) return;

    try {
      setIsSending(true);
      await sendOffer(activeConversation.id, offerAmount, offerToken);
      setShowOfferModal(false);
      setOfferAmount('');
    } catch (err) {
      console.error('Failed to send offer:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected && !isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Trade Negotiation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Connect XMTP to Start Chatting</h3>
            <p className="text-muted-foreground mb-4">
              Enable decentralized messaging to negotiate domain sales
            </p>
            <Button onClick={connectXMTP} className="w-full">
              Connect XMTP
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Trade Negotiation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Connecting to XMTP...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Trade Negotiation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to connect to XMTP: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Trade Negotiation
          </div>
          <Badge variant="outline" className="text-xs">
            XMTP Connected
          </Badge>
        </CardTitle>
        {domainName && (
          <div className="text-sm text-muted-foreground">
            Negotiating: <span className="font-semibold">{domainName}</span>
            {domainPrice && (
              <span className="ml-2">• Listed at {domainPrice}</span>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Messages Area */}
        <div className="h-96 border-b">
          <ScrollArea ref={scrollAreaRef} className="h-full p-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                <p>Start the conversation...</p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.senderAddress.toLowerCase() === account?.toLowerCase()}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="p-4">
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOfferModal(true)}
              disabled={isSending}
            >
              <DollarSign className="w-4 h-4 mr-1" />
              Make Offer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const txHash = prompt('Enter transaction hash:');
                if (txHash && activeConversation) {
                  sendTransactionLink(activeConversation.id, txHash);
                }
              }}
              disabled={isSending}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Share TX
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isSending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isSending}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Make an Offer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.001"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Token</label>
                <select
                  value={offerToken}
                  onChange={(e) => setOfferToken(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSendOffer}
                  disabled={!offerAmount || isSending}
                  className="flex-1"
                >
                  {isSending ? 'Sending...' : 'Send Offer'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowOfferModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default TradeChat;


