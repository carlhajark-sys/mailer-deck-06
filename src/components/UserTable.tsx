import { User, Server } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Server as ServerIcon, Copy, Check, Users } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { cn } from '@/lib/utils';

interface UserTableProps {
  users: User[];
  servers: Server[];
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserTable = ({ users, servers, onEditUser, onDeleteUser }: UserTableProps) => {
  const { copyToClipboard, copiedText } = useCopyToClipboard();

  const getUserServerCount = (userId: string) => {
    return servers.filter(server => server.assignedUserId === userId).length;
  };

  const getUserServers = (userId: string) => {
    return servers.filter(server => server.assignedUserId === userId);
  };

  const handleCopyClick = (text: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    copyToClipboard(text, label);
  };

  return (
    <div className="bg-card rounded-lg elevation-1 overflow-hidden hover-lift">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Users</h2>
        <p className="text-sm text-muted-foreground">Manage team members and their server assignments</p>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-variant">
            <TableHead className="text-foreground font-medium">Name</TableHead>
            <TableHead className="text-foreground font-medium">Assigned Servers</TableHead>
            <TableHead className="text-foreground font-medium">Server Details</TableHead>
            <TableHead className="text-foreground font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => {
            const userServers = getUserServers(user.id);
            const serverCount = userServers.length;
            
            return (
              <TableRow 
                key={user.id} 
                className="hover:bg-surface-variant/50 transition-all duration-200 animate-fade-in group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div 
                        className={cn(
                          "copy-cell flex items-center gap-2 font-medium text-foreground",
                          copiedText === user.name && "copied"
                        )}
                        onClick={(e) => handleCopyClick(user.name, "User name", e)}
                        title="Click to copy name"
                      >
                        {user.name}
                        {copiedText === user.name ? (
                          <Check className="h-3 w-3 text-success" />
                        ) : (
                          <Copy className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                        )}
                      </div>
                      <div 
                        className={cn(
                          "copy-cell text-sm text-muted-foreground flex items-center gap-2",
                          copiedText === user.id && "copied"
                        )}
                        onClick={(e) => handleCopyClick(user.id, "User ID", e)}
                        title="Click to copy ID"
                      >
                        ID: {user.id}
                        {copiedText === user.id && (
                          <Check className="h-3 w-3 text-success" />
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ServerIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{serverCount}</span>
                    <span className="text-muted-foreground">
                      server{serverCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-md">
                    {userServers.length > 0 ? (
                      userServers.map((server) => (
                        <Badge 
                          key={server.id} 
                          variant="outline" 
                          className={cn(
                            "text-xs cursor-pointer transition-colors hover:bg-primary/10 hover:text-primary",
                            copiedText === server.name && "bg-success/10 text-success"
                          )}
                          onClick={(e) => handleCopyClick(server.name, "Server name", e)}
                          title={`${server.name} (Click to copy)`}
                        >
                          {server.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No servers assigned</span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditUser(user)}
                      className="hover:bg-primary/10 hover:text-primary btn-ghost-enhanced transition-all duration-200"
                      title="Edit user"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteUser(user.id)}
                      className="hover:bg-error/10 hover:text-error btn-ghost-enhanced transition-all duration-200"
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {users.length === 0 && (
        <div className="text-center py-16 text-muted-foreground animate-fade-in">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-surface-variant rounded-full p-4">
              <Users className="h-12 w-12 opacity-50" />
            </div>
            <div>
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm text-muted-foreground/70">Try adjusting your search or add a new user</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};