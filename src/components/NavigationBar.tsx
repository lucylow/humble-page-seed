import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Menu, 
  X, 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  BarChart3, 
  HelpCircle, 
  Sparkles,
  Code,
  Home,
  ChevronDown,
  Store,
  Repeat,
  Wallet,
  TrendingUp
} from "lucide-react";
import { useState } from 'react';
import WalletConnect from './WalletConnect';
import { useWalletStore } from '@/store/useWalletStore';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  description?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NavigationBar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const { isConnected } = useWalletStore();
  
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  const isLandingPage = location.pathname === '/landing';
  
  // Navigation sections for better organization
  const mainNavItems: NavItem[] = [
    { 
      label: 'Home', 
      path: '/', 
      icon: <Home className="w-4 h-4" />,
      description: 'Main dashboard'
    },
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: <LayoutDashboard className="w-4 h-4" />,
      description: 'Overview & metrics'
    },
    { 
      label: 'Invoices', 
      path: '/invoices', 
      icon: <FileText className="w-4 h-4" />,
      description: 'Manage invoices'
    },
    { 
      label: 'Analytics', 
      path: '/analytics', 
      icon: <BarChart3 className="w-4 h-4" />,
      description: 'Performance metrics'
    },
  ];

  const demoNavItems: NavItem[] = [
    { 
      label: 'AI Demo', 
      path: '/demo', 
      icon: <Sparkles className="w-4 h-4" />,
      badge: 'New',
      description: 'AI invoice parsing'
    },
    { 
      label: 'API Demo', 
      path: '/api-demo', 
      icon: <Code className="w-4 h-4" />,
      description: 'Live API integration'
    },
  ];

  const defiNavItems: NavItem[] = [
    { 
      label: 'NFT Marketplace', 
      path: '/nft-marketplace', 
      icon: <Store className="w-4 h-4" />,
      description: 'Trade invoice NFTs'
    },
    { 
      label: 'Cross-Chain Swap', 
      path: '/cross-chain-swap', 
      icon: <Repeat className="w-4 h-4" />,
      description: 'Multi-chain swaps'
    },
    { 
      label: 'Treasury', 
      path: '/treasury', 
      icon: <Wallet className="w-4 h-4" />,
      description: 'Multisig treasury'
    },
    { 
      label: 'Yield Optimizer', 
      path: '/yield-optimizer', 
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Optimize yields'
    },
  ];

  const actionItems: NavItem[] = [
    { 
      label: 'Create Invoice', 
      path: '/create', 
      icon: <PlusCircle className="w-4 h-4" />,
      description: 'New invoice'
    },
    { 
      label: 'Help', 
      path: '/help', 
      icon: <HelpCircle className="w-4 h-4" />,
      description: 'Documentation'
    },
  ];
  
  // Don't show navbar on standalone landing page
  if (isLandingPage) {
    return null;
  }
  
  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                BitMindAI
              </span>
              <span className="text-xs text-gray-500 -mt-1 hidden sm:block">Bitcoin-native smart invoices</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {mainNavItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive(item.path) 
                    ? 'bg-blue-50 text-blue-600 font-semibold' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.label}
                {item.badge && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}

            {/* Demo Dropdown */}
            <div className="relative group">
              <button
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                onMouseEnter={() => setIsDemoMenuOpen(true)}
                onMouseLeave={() => setIsDemoMenuOpen(false)}
              >
                <Sparkles className="w-4 h-4" />
                Demos
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {isDemoMenuOpen && (
                <div 
                  className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  onMouseEnter={() => setIsDemoMenuOpen(true)}
                  onMouseLeave={() => setIsDemoMenuOpen(false)}
                >
                  {demoNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                        isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {item.icon}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <span className="text-xs text-gray-500">{item.description}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                  
                  <div className="my-2 border-t border-gray-100"></div>
                  
                  <div className="px-4 py-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase">DeFi Features</span>
                  </div>
                  
                  {defiNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                        isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {item.icon}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <span className="text-xs text-gray-500">{item.description}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {actionItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive(item.path) 
                    ? 'bg-blue-50 text-blue-600 font-semibold' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          {/* Wallet Connect & Mobile Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <WalletConnect />
            </div>
            
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-100 mt-2 pt-4">
            <div className="space-y-1">
              {/* Main Navigation */}
              {mainNavItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path) 
                      ? 'bg-blue-50 text-blue-600 font-semibold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {item.label}
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <span className="text-xs text-gray-500">{item.description}</span>
                    )}
                  </div>
                </Link>
              ))}

              {/* Demo Section */}
              <div className="pt-2 pb-1 px-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Demos
                </span>
              </div>
              {demoNavItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path) 
                      ? 'bg-blue-50 text-blue-600 font-semibold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {item.label}
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <span className="text-xs text-gray-500">{item.description}</span>
                    )}
                  </div>
                </Link>
              ))}

              {/* DeFi Section */}
              <div className="pt-2 pb-1 px-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  DeFi Features
                </span>
              </div>
              {defiNavItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path) 
                      ? 'bg-blue-50 text-blue-600 font-semibold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {item.label}
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <span className="text-xs text-gray-500">{item.description}</span>
                    )}
                  </div>
                </Link>
              ))}

              {/* Action Items */}
              <div className="pt-2 pb-1 px-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </span>
              </div>
              {actionItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path) 
                      ? 'bg-blue-50 text-blue-600 font-semibold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}

              {/* Mobile Wallet Connect */}
              <div className="pt-4 px-3">
                <WalletConnect />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;

