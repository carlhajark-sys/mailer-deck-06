import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Network, Users } from 'lucide-react';

export const Navigation = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      label: 'Servers',
      icon: Network,
    },
    {
      path: '/users',
      label: 'Users',
      icon: Users,
    },
  ];

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};