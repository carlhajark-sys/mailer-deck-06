import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Network, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

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
    <nav className="flex items-center gap-4">
      <div className="flex items-center gap-1">
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
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Welcome, {user?.email}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="h-8 w-8 p-0"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
};