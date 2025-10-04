import { CheckCircle, AlertTriangle, TrendingUp, Download, RefreshCw } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatsCard } from '@/components/StatsCard';
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { ToastProvider, useToast } from '@/components/Toast';
import { useEffect } from 'react';

const DashboardContent = () => {
  const { showToast } = useToast();

  useEffect(() => {
    // Welcome message on first load
    const hasShownWelcome = sessionStorage.getItem('welcomeShown');
    if (!hasShownWelcome) {
      setTimeout(() => {
        showToast(
          'Welcome to CompatGuard! Use Ctrl+K to quickly search and explore your compatibility dashboard.',
          'Welcome',
          'success'
        );
        sessionStorage.setItem('welcomeShown', 'true');
      }, 1000);
    }

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showToast]);

  const handleNavigation = (item: string) => {
    showToast(`Navigated to ${item}`, 'Navigation', 'info');
  };

  const handleSearch = (query: string) => {
    if (query.length > 2) {
      showToast(`Searching for "${query}"`, 'Search', 'info');
    }
  };

  const handleNewScan = () => {
    showToast('Starting project scan...', 'Scan Started', 'info');
    setTimeout(() => {
      showToast('Project scan completed successfully', 'Scan Complete', 'success');
    }, 2000);
  };

  const handleExport = () => {
    showToast('Exporting compatibility report...', 'Export Started', 'info');
    setTimeout(() => {
      showToast('Report exported successfully', 'Export Complete', 'success');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar onNavigate={handleNavigation} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onSearch={handleSearch} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Project Dashboard</h1>
              <p className="text-lg text-muted-foreground">
                Monitor your project's compatibility status and resolve issues
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button
                onClick={handleNewScan}
                className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                New Scan
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              icon={CheckCircle}
              value="84%"
              label="Baseline Compliance"
              progress={84}
              trend="+12%"
              trendUp={true}
              variant="primary"
            />
            <StatsCard
              icon={AlertTriangle}
              value="23"
              label="Active Issues"
              progress={65}
              trend="-5%"
              trendUp={false}
              variant="warning"
            />
            <StatsCard
              icon={TrendingUp}
              value="96%"
              label="Browser Coverage"
              progress={96}
              trend="+3%"
              trendUp={true}
              variant="success"
            />
          </div>
        </main>
      </div>

      <AccessibilityPanel />
    </div>
  );
};

const Index = () => {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
};

export default Index;
