import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  Code, 
  PlusCircle, 
  FileText, 
  BarChart3, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface QuickNavItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  badge?: string;
}

const QuickNav = () => {
  const navItems: QuickNavItem[] = [
    {
      title: 'AI Demo',
      description: 'See AI invoice parsing in action with real-time extraction',
      icon: <Sparkles className="w-8 h-8" />,
      path: '/demo',
      color: 'from-orange-500 to-purple-600',
      badge: 'Popular'
    },
    {
      title: 'Create Invoice',
      description: 'Generate a new smart contract invoice with milestone tracking',
      icon: <PlusCircle className="w-8 h-8" />,
      path: '/create',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Manage Invoices',
      description: 'View and manage all your active and completed invoices',
      icon: <FileText className="w-8 h-8" />,
      path: '/invoices',
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'API Demo',
      description: 'Explore live API integration with CoinGecko and public data',
      icon: <Code className="w-8 h-8" />,
      path: '/api-demo',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Analytics',
      description: 'Track performance metrics and payment statistics',
      icon: <BarChart3 className="w-8 h-8" />,
      path: '/analytics',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      title: 'Documentation',
      description: 'Learn how to use BitMindAI and integrate with your DAO',
      icon: <HelpCircle className="w-8 h-8" />,
      path: '/help',
      color: 'from-gray-500 to-slate-600'
    },
  ];

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Quick Navigation</h2>
        <p className="text-muted-foreground">Jump to key features and start exploring</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="group"
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 group-hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold">{item.title}</h3>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.description}
                    </p>
                    <div className="flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Explore
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickNav;

