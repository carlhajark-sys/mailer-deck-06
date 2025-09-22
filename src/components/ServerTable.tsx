import { Server, User, ServerStatus } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Network, Globe } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';
import { cn } from '@/lib/utils';

interface ServerTableProps {
  servers: Server[];
  users: User[];
  onEditServer: (server: Server) => void;
  onDeleteServer: (serverId: string) => void;
  onManageIPs: (server: Server) => void;
  onUpdateStatus: (serverId: string, status: ServerStatus) => void;
}

export const ServerTable = ({ 
  servers, 
  users, 
  onEditServer, 
  onDeleteServer, 
  onManageIPs,
  onUpdateStatus 
}: ServerTableProps) => {
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unassigned';
  };

  const getTotalDomains = (server: Server) => {
    return server.ips.reduce((total, ip) => total + ip.domains.length, 0);
  };

  return (
    <div className="bg-card rounded-lg elevation-1 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-variant">
            <TableHead className="font-semibold text-foreground">Server Name</TableHead>
            <TableHead className="font-semibold text-foreground">Main IP</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground">Assigned To</TableHead>
            <TableHead className="font-semibold text-foreground text-center">IPs</TableHead>
            <TableHead className="font-semibold text-foreground text-center">Domains</TableHead>
            <TableHead className="font-semibold text-foreground">Notes</TableHead>
            <TableHead className="font-semibold text-foreground text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {servers.map((server) => (
            <TableRow key={server.id} className="hover:bg-surface-variant/50 transition-colors">
              <TableCell className="font-medium">{server.name}</TableCell>
              <TableCell className="font-mono text-sm">{server.mainIp}</TableCell>
              <TableCell>
                <StatusDropdown 
                  status={server.status} 
                  onStatusChange={(status) => onUpdateStatus(server.id, status)}
                />
              </TableCell>
              <TableCell>{getUserName(server.assignedUserId)}</TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onManageIPs(server)}
                  className="h-8 w-8 p-0 hover:bg-primary-light hover:text-primary"
                >
                  <Network className="h-4 w-4" />
                  <span className="ml-1 text-xs">{server.ips.length}</span>
                </Button>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onManageIPs(server)}
                  className="h-8 w-8 p-0 hover:bg-primary-light hover:text-primary"
                >
                  <Globe className="h-4 w-4" />
                  <span className="ml-1 text-xs">{getTotalDomains(server)}</span>
                </Button>
              </TableCell>
              <TableCell className="max-w-xs">
                <div className="truncate text-sm text-muted-foreground" title={server.notes}>
                  {server.notes || 'No notes'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditServer(server)}
                    className="h-8 w-8 p-0 hover:bg-primary-light hover:text-primary"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteServer(server.id)}
                    className="h-8 w-8 p-0 hover:bg-error-light hover:text-error"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {servers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Network className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No servers found</p>
        </div>
      )}
    </div>
  );
};