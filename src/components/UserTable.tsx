import { User, Server } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Server as ServerIcon } from 'lucide-react';

interface UserTableProps {
  users: User[];
  servers: Server[];
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserTable = ({ users, servers, onEditUser, onDeleteUser }: UserTableProps) => {
  const getUserServerCount = (userId: string) => {
    return servers.filter(server => server.assignedUserId === userId).length;
  };

  const getUserServers = (userId: string) => {
    return servers.filter(server => server.assignedUserId === userId);
  };

  return (
    <div className="bg-card rounded-lg elevation-1 overflow-hidden">
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
          {users.map((user) => {
            const userServers = getUserServers(user.id);
            const serverCount = userServers.length;
            
            return (
              <TableRow key={user.id} className="hover:bg-surface-variant/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {user.id}</p>
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
                          className="text-xs"
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
                      className="hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteUser(user.id)}
                      className="hover:bg-error/10 hover:text-error"
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
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No users found</p>
        </div>
      )}
    </div>
  );
};