import { Search, Bell } from 'lucide-react';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header = ({ onSearch }: HeaderProps) => {
  return (
    <header className="bg-card border-b border-border px-6 py-4 flex justify-between items-center shadow-sm">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <a href="#" className="hover:text-foreground transition-colors" tabIndex={0}>Projects</a>
        <span>/</span>
        <a href="#" className="hover:text-foreground transition-colors" tabIndex={0}>E-Commerce Platform</a>
        <span>/</span>
        <span className="text-foreground font-medium">Dashboard</span>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects, issues..."
            className="pl-10 pr-4 py-2 w-72 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            onChange={(e) => onSearch?.(e.target.value)}
            aria-label="Search"
          />
        </div>

        {/* Notifications */}
        <button 
          className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* User Menu */}
        <button 
          className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="User menu"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
            JD
          </div>
          <span className="text-sm font-medium hidden md:block">John Developer</span>
        </button>
      </div>
    </header>
  );
};
