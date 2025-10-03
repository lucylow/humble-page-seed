import React, { createContext, useContext, useEffect, useState, ReactNode, FC, useCallback } from 'react';
import { useWeb3 } from './Web3Context';

interface XMTPMessage {
  id: string;
  content: string;
  senderAddress: string;
  timestamp: Date;
  conversationId: string;
  messageType: 'text' | 'offer' | 'transaction' | 'system';
  metadata?: {
    offerAmount?: string;
    offerToken?: string;
    transactionHash?: string;
    domainId?: string;
  };
}

interface Conversation {
  id: string;
  peerAddress: string;
  domainId?: string;
  domainName?: string;
  lastMessage?: XMTPMessage;
  unreadCount: number;
  isActive: boolean;
  createdAt: Date;
}

interface XMTPContextType {
  // Connection state
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Conversations
  conversations: Conversation[];
  activeConversation: Conversation | null;
  
  // Messages
  messages: XMTPMessage[];
  
  // Actions
  connectXMTP: () => Promise<void>;
  disconnectXMTP: () => void;
  startConversation: (peerAddress: string, domainId?: string) => Promise<string>;
  sendMessage: (conversationId: string, content: string, messageType?: 'text' | 'offer' | 'transaction') => Promise<void>;
  sendOffer: (conversationId: string, amount: string, token: string) => Promise<void>;
  sendTransactionLink: (conversationId: string, txHash: string) => Promise<void>;
  setActiveConversation: (conversationId: string) => void;
  markAsRead: (conversationId: string) => void;
  
  // Utility functions
  getConversationByDomain: (domainId: string) => Conversation | null;
  getUnreadCount: () => number;
}

const XMTPContext = createContext<XMTPContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useXMTP = () => {
  const context = useContext(XMTPContext);
  if (!context) {
    throw new Error('useXMTP must be used within an XMTPProvider');
  }
  return context;
};

interface XMTPProviderProps {
  children: ReactNode;
}

export const XMTPProvider: FC<XMTPProviderProps> = ({ children }) => {
  const { account, isConnected } = useWeb3();
  
  // State
  const [isConnectedXMTP, setIsConnectedXMTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<XMTPMessage[]>([]);

  // Mock XMTP client (in production, use actual XMTP SDK)
  const [xmtpClient, setXmtpClient] = useState<Record<string, unknown> | null>(null);

  const initializeXMTP = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In production, initialize actual XMTP client
      // const client = await Client.create(wallet, { env: 'production' });
      
      // Mock initialization for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setXmtpClient({ mock: true });
      setIsConnectedXMTP(true);
      
      // Load existing conversations
      await loadConversations();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize XMTP');
      setIsConnectedXMTP(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isConnected && account) {
      // Initialize XMTP when wallet connects
      initializeXMTP();
    } else {
      // Cleanup when wallet disconnects
      cleanupXMTP();
    }
  }, [isConnected, account, initializeXMTP]);

  const cleanupXMTP = () => {
    setXmtpClient(null);
    setIsConnectedXMTP(false);
    setConversations([]);
    setActiveConversation(null);
    setMessages([]);
    setError(null);
  };

  const loadConversations = async () => {
    try {
      // Mock conversations data
      const mockConversations: Conversation[] = [
        {
          id: 'conv-1',
          peerAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          domainId: 'domain-123',
          domainName: 'cryptoinvestor.eth',
          unreadCount: 2,
          isActive: true,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          lastMessage: {
            id: 'msg-1',
            content: 'Would you consider 4.8 ETH?',
            senderAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            conversationId: 'conv-1',
            messageType: 'offer',
            metadata: {
              offerAmount: '4.8',
              offerToken: 'ETH',
              domainId: 'domain-123'
            }
          }
        },
        {
          id: 'conv-2',
          peerAddress: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
          domainId: 'domain-456',
          domainName: 'nftgallery.eth',
          unreadCount: 0,
          isActive: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          lastMessage: {
            id: 'msg-2',
            content: 'Thanks for the offer!',
            senderAddress: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            conversationId: 'conv-2',
            messageType: 'text'
          }
        }
      ];
      
      setConversations(mockConversations);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const connectXMTP = async () => {
    if (!isConnected || !account) {
      throw new Error('Wallet not connected');
    }
    await initializeXMTP();
  };

  const disconnectXMTP = () => {
    cleanupXMTP();
  };

  const startConversation = async (peerAddress: string, domainId?: string): Promise<string> => {
    try {
      if (!xmtpClient) {
        throw new Error('XMTP client not initialized');
      }

      // Check if conversation already exists
      const existingConv = conversations.find(conv => 
        conv.peerAddress.toLowerCase() === peerAddress.toLowerCase()
      );
      
      if (existingConv) {
        return existingConv.id;
      }

      // Create new conversation
      const conversationId = `conv-${Date.now()}`;
      const newConversation: Conversation = {
        id: conversationId,
        peerAddress,
        domainId,
        domainName: domainId ? `domain-${domainId}.eth` : undefined,
        unreadCount: 0,
        isActive: true,
        createdAt: new Date()
      };

      setConversations(prev => [newConversation, ...prev]);
      return conversationId;
    } catch (err) {
      throw new Error(`Failed to start conversation: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const sendMessage = async (
    conversationId: string, 
    content: string, 
    messageType: 'text' | 'offer' | 'transaction' = 'text'
  ) => {
    try {
      if (!xmtpClient) {
        throw new Error('XMTP client not initialized');
      }

      const conversation = conversations.find(conv => conv.id === conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const message: XMTPMessage = {
        id: `msg-${Date.now()}`,
        content,
        senderAddress: account!,
        timestamp: new Date(),
        conversationId,
        messageType
      };

      // Add message to local state
      setMessages(prev => [...prev, message]);

      // Update conversation's last message
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, lastMessage: message, unreadCount: conv.peerAddress === account ? conv.unreadCount : conv.unreadCount + 1 }
          : conv
      ));

      // In production, send via XMTP
      // await xmtpClient.sendMessage(conversation.peerAddress, content);

    } catch (err) {
      throw new Error(`Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const sendOffer = async (conversationId: string, amount: string, token: string) => {
    const offerMessage = `I'd like to make an offer of ${amount} ${token} for this domain.`;
    await sendMessage(conversationId, offerMessage, 'offer');
    
    // Add offer metadata
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      lastMessage.metadata = {
        offerAmount: amount,
        offerToken: token
      };
    }
  };

  const sendTransactionLink = async (conversationId: string, txHash: string) => {
    const txMessage = `Transaction submitted: ${txHash}`;
    await sendMessage(conversationId, txMessage, 'transaction');
    
    // Add transaction metadata
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      lastMessage.metadata = {
        transactionHash: txHash
      };
    }
  };

  const setActiveConversationHandler = (conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setActiveConversation(conversation);
      // Load messages for this conversation
      loadMessagesForConversation(conversationId);
    }
  };

  const loadMessagesForConversation = async (conversationId: string) => {
    try {
      // Mock messages data
      const mockMessages: XMTPMessage[] = [
        {
          id: 'msg-1',
          content: 'Hi there! Thanks for your interest in cryptoinvestor.eth. Are you looking to make an offer?',
          senderAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          conversationId,
          messageType: 'text'
        },
        {
          id: 'msg-2',
          content: 'Yes, I\'m interested. Would you consider 4.5 ETH for the domain?',
          senderAddress: account!,
          timestamp: new Date(Date.now() - 90 * 60 * 1000),
          conversationId,
          messageType: 'offer',
          metadata: {
            offerAmount: '4.5',
            offerToken: 'ETH',
            domainId: 'domain-123'
          }
        },
        {
          id: 'msg-3',
          content: 'That\'s a bit lower than my asking price. I have another offer for 5 ETH. Can you do better?',
          senderAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          conversationId,
          messageType: 'text'
        },
        {
          id: 'msg-4',
          content: 'I could do 4.8 ETH. Here\'s a signed transaction ready to execute:',
          senderAddress: account!,
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          conversationId,
          messageType: 'transaction',
          metadata: {
            transactionHash: '0x1234567890abcdef...',
            domainId: 'domain-123'
          }
        }
      ];
      
      setMessages(mockMessages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const markAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, unreadCount: 0 }
        : conv
    ));
  };

  const getConversationByDomain = (domainId: string): Conversation | null => {
    return conversations.find(conv => conv.domainId === domainId) || null;
  };

  const getUnreadCount = (): number => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  };

  const contextValue: XMTPContextType = {
    // Connection state
    isConnected: isConnectedXMTP,
    isLoading,
    error,
    
    // Conversations
    conversations,
    activeConversation,
    
    // Messages
    messages,
    
    // Actions
    connectXMTP,
    disconnectXMTP,
    startConversation,
    sendMessage,
    sendOffer,
    sendTransactionLink,
    setActiveConversation: setActiveConversationHandler,
    markAsRead,
    
    // Utility functions
    getConversationByDomain,
    getUnreadCount
  };

  return (
    <XMTPContext.Provider value={contextValue}>
      {children}
    </XMTPContext.Provider>
  );
};
