import { ReactNode } from 'react';
import NavigationBar from './NavigationBar';
import Breadcrumbs from './Breadcrumbs';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  showBreadcrumbs?: boolean;
  showFooter?: boolean;
}

const Layout = ({ 
  children, 
  showNavigation = true, 
  showBreadcrumbs = true, 
  showFooter = true 
}: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showNavigation && <NavigationBar />}
      {showBreadcrumbs && <Breadcrumbs />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;

