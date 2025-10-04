import { Home, FolderKanban, BarChart3, AlertTriangle, Settings, HelpCircle, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  icon: typeof Home;
  label: string;
  badge?: number;
  active?: boolean;
}

interface SidebarProps {
  onNavigate?: (item: string) => void;
}

export const Sidebar = ({ onNavigate }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: FolderKanban, label: 'Projects' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: AlertTriangle, label: 'Issues', badge: 23 },
    { icon: Settings, label: 'Settings' },
    { icon: HelpCircle, label: 'Help & Support' },
  ];

  return (
    <aside className={`bg-card border-r border-border transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-bold text-xl text-primary">CompatGuard</span>}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Project Selector */}
      {!collapsed && (
        <div className="p-4 border-b border-border">
          <select 
            className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm cursor-pointer hover:border-primary transition-colors"
            aria-label="Select project"
          >
            <option>E-Commerce Platform</option>
            <option>Marketing Website</option>
            <option>Admin Dashboard</option>
            <option>Mobile App</option>
          </select>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => onNavigate?.(item.label)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-all relative group ${
                item.active
                  ? 'text-primary bg-primary/10 font-semibold'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
              }`}
            >
              {item.active && <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r" />}
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
