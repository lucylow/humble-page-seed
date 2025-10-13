import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const routeLabels: Record<string, string> = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/invoices': 'Invoices',
  '/create': 'Create Invoice',
  '/demo': 'AI Demo',
  '/api-demo': 'API Demo',
  '/analytics': 'Analytics',
  '/help': 'Help',
  '/landing': 'Landing',
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on home or landing page
  if (location.pathname === '/' || location.pathname === '/landing') {
    return null;
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' }
  ];

  let currentPath = '';
  pathnames.forEach((pathname, index) => {
    currentPath += `/${pathname}`;
    const label = routeLabels[currentPath] || pathname.charAt(0).toUpperCase() + pathname.slice(1);
    breadcrumbs.push({ label, path: currentPath });
  });

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isFirst = index === 0;

            return (
              <li key={breadcrumb.path} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
                {isLast ? (
                  <span className="text-gray-900 font-medium flex items-center gap-1">
                    {isFirst && <Home className="w-4 h-4" />}
                    {breadcrumb.label}
                  </span>
                ) : (
                  <Link
                    to={breadcrumb.path}
                    className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                  >
                    {isFirst && <Home className="w-4 h-4" />}
                    {breadcrumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumbs;

