import React, { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send, Shield, Clock, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: string;
  type: 'text' | 'offer' | 'system';
  offerAmount?: string;
  offerStatus?: 'pending' | 'accepted' | 'rejected';
  isEncrypted?: boolean;
}

interface DomainMessagingProps {
  domainName: string;
  domainOwner: string;
  currentUser: string;
}

const DomainMessaging: React.FC<DomainMessagingProps> = ({ 
  domainName, 
  domainOwner, 
  currentUser 
}) => {
  const { isConnected, account } = useWeb3();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');

  // Mock XMTP conversation initialization
  useEffect(() => {
    if (isConnected && account) {
      initializeConversation();
      loadMessages();
    }
  }, [isConnected, account, domainName, domainOwner]);

  const initializeConversation = async () => {
    try {
      // Simulate XMTP conversation creation
      const convId = `conv_${domainName}_${account}_${domainOwner}`;
      setConversationId(convId);
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        sender: 'system',
        recipient: account!,
        content: `Welcome to the conversation about ${domainName}. This conversation is encrypted and secure.`,
        timestamp: new Date().toISOString(),
        type: 'system',
        isEncrypted: true
      };
      
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
    }
  };

  const loadMessages = async () => {
    try {
      // Simulate loading existing messages
      const mockMessages: Message[] = [
        {
          id: '1',
          sender: domainOwner,
          recipient: account!,
          content: `Hi! Thanks for your interest in ${domainName}. I'm happy to answer any questions you might have.`,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'text',
          isEncrypted: true
        },
        {
          id: '2',
          sender: account!,
          recipient: domainOwner,
          content: 'Hi! I\'m very interested in this domain. Could you tell me more about its history and any previous usage?',
          timestamp: new Date(Date.now() - 3000000).toISOString(),
          type: 'text',
          isEncrypted: true
        },
        {
          id: '3',
          sender: domainOwner,
          recipient: account!,
          content: 'Absolutely! This domain has been in my portfolio for 3 years. It was previously used for a tech startup that pivoted. The domain has great SEO potential and is perfect for a new venture.',
          timestamp: new Date(Date.now() - 2400000).toISOString(),
          type: 'text',
          isEncrypted: true
        },
        {
          id: '4',
          sender: account!,
          recipient: domainOwner,
          content: 'That sounds great! I\'d like to make an offer.',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          type: 'offer',
          offerAmount: '8.5',
          offerStatus: 'pending',
          isEncrypted: true
        }
      ];
      
      setMessages(prev => [...prev, ...mockMessages]);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !isConnected) return;

    setIsLoading(true);
    try {
      // Simulate XMTP message sending
      const message: Message = {
        id: Date.now().toString(),
        sender: account!,
        recipient: domainOwner,
        content: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text',
        isEncrypted: true
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Simulate auto-reply
        const autoReply: Message = {
          id: (Date.now() + 1).toString(),
          sender: domainOwner,
          recipient: account!,
          content: 'Thanks for your message! I\'ll get back to you shortly.',
          timestamp: new Date().toISOString(),
          type: 'text',
          isEncrypted: true
        };
        setMessages(prev => [...prev, autoReply]);
      }, 2000);

    } catch (error) {
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendOffer = async (amount: string) => {
    if (!isConnected) return;

    setIsLoading(true);
    try {
      const offerMessage: Message = {
        id: Date.now().toString(),
        sender: account!,
        recipient: domainOwner,
        content: `I'd like to make an offer of ${amount} ETH for ${domainName}`,
        timestamp: new Date().toISOString(),
        type: 'offer',
        offerAmount: amount,
        offerStatus: 'pending',
        isEncrypted: true
      };

      setMessages(prev => [...prev, offerMessage]);
      
      toast({
        title: "Offer Sent!",
        description: `Your offer of ${amount} ETH has been sent to the domain owner`,
      });

    } catch (error) {
      toast({
        title: "Offer Failed",
        description: "Failed to send offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getSenderName = (sender: string) => {
    if (sender === 'system') return 'System';
    if (sender === account) return 'You';
    return `${sender.slice(0, 6)}...${sender.slice(-4)}`;
  };

  const getSenderAvatar = (sender: string) => {
    if (sender === 'system') return <Bot className="w-4 h-4" />;
    if (sender === account) return <User className="w-4 h-4" />;
    return <User className="w-4 h-4" />;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isConnected) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Connect Wallet to Start Messaging</h3>
          <p className="text-muted-foreground">
            Connect your wallet to securely message the domain owner about {domainName}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Domain Discussion: {domainName}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">End-to-end encrypted</span>
              <Badge variant="outline" className="text-xs">
                XMTP
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Owner</div>
            <div className="font-mono text-sm">{domainOwner.slice(0, 6)}...{domainOwner.slice(-4)}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === account ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {getSenderAvatar(message.sender)}
                </AvatarFallback>
              </Avatar>
              
              <div className={`flex-1 max-w-xs lg:max-w-md ${message.sender === account ? 'text-right' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{getSenderName(message.sender)}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
                
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === account
                      ? 'bg-primary text-primary-foreground'
                      : message.type === 'system'
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-muted/50'
                  }`}
                >
                  {message.type === 'offer' ? (
                    <div>
                      <div className="font-medium mb-2">💰 Offer: {message.offerAmount} ETH</div>
                      <div className="text-sm opacity-90">{message.content}</div>
                      <div className="mt-2">
                        <Badge 
                          variant={message.offerStatus === 'pending' ? 'outline' : 
                                  message.offerStatus === 'accepted' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {message.offerStatus}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm">{message.content}</div>
                  )}
                  
                  {message.isEncrypted && (
                    <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                      <Shield className="w-3 h-3" />
                      <span>Encrypted</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 max-w-xs lg:max-w-md">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{getSenderName(domainOwner)}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1 min-h-[40px] max-h-32 resize-none"
              rows={1}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              size="sm"
              className="px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendOffer('8.0')}
                disabled={isLoading}
                className="text-xs"
              >
                Quick Offer: 8.0 ETH
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendOffer('9.0')}
                disabled={isLoading}
                className="text-xs"
              >
                Quick Offer: 9.0 ETH
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainMessaging;
