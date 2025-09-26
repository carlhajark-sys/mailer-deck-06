import { Server, User, ServerStatus } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Network, Globe, Copy, Check } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';
import { SortableTableHead, SortDirection } from './SortableTableHead';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { cn } from '@/lib/utils';

interface ServerTableProps {
  servers: Server[];
  users: User[];
  sortConfig: { key: string; direction: SortDirection };
  onSort: (key: string) => void;
  onEditServer: (server: Server) => void;
  onDeleteServer: (serverId: string) => void;
  onManageIPs: (server: Server) => void;
  onUpdateStatus: (serverId: string, status: ServerStatus) => void;
}

export const ServerTable = ({ 
  servers, 
  users, 
  sortConfig,
  onSort,
  onEditServer, 
  onDeleteServer, 
  onManageIPs,
  onUpdateStatus 
}: ServerTableProps) => {
  const { copyToClipboard, copiedText } = useCopyToClipboard();

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unassigned';
  };

  const getTotalDomains = (server: Server) => {
    return server.ips.reduce((total, ip) => total + ip.domains.length, 0);
  };

  const handleCopyClick = (text: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    copyToClipboard(text, label);
  };

  return (
    <div className="bg-card rounded-lg elevation-1 overflow-hidden hover-lift">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-variant">
            <SortableTableHead 
              sortKey="name" 
              currentSort={sortConfig} 
              onSort={onSort}
            >
              Server Name
            </SortableTableHead>
            <SortableTableHead 
              sortKey="mainIp" 
              currentSort={sortConfig} 
              onSort={onSort}
            >
              Main IP
            </SortableTableHead>
            <SortableTableHead 
              sortKey="status" 
              currentSort={sortConfig} 
              onSort={onSort}
            >
              Status
            </SortableTableHead>
            <SortableTableHead 
              sortKey="assignedUser" 
              currentSort={sortConfig} 
              onSort={onSort}
            >
              Assigned To
            </SortableTableHead>
            <SortableTableHead 
              sortKey="ipsCount" 
              currentSort={sortConfig} 
              onSort={onSort}
              className="text-center"
            >
              IPs
            </SortableTableHead>
            <SortableTableHead 
              sortKey="domainsCount" 
              currentSort={sortConfig} 
              onSort={onSort}
              className="text-center"
            >
              Domains
            </SortableTableHead>
            <TableHead className="font-semibold text-foreground">Notes</TableHead>
            <TableHead className="font-semibold text-foreground text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {servers.map((server, index) => (
            <TableRow 
              key={server.id} 
              className="hover:bg-surface-variant/50 transition-all duration-200 animate-fade-in group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell className="font-medium">
                <div 
                  className={cn(
                    "copy-cell flex items-center gap-2",
                    copiedText === server.name && "copied"
                  )}
                  onClick={(e) => handleCopyClick(server.name, "Server name", e)}
                  title="Click to copy"
                >
                  {server.name}
                  {copiedText === server.name ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                  )}
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">
                <div 
                  className={cn(
                    "copy-cell flex items-center gap-2",
                    copiedText === server.mainIp && "copied"
                  )}
                  onClick={(e) => handleCopyClick(server.mainIp, "IP address", e)}
                  title="Click to copy"
                >
                  {server.mainIp}
                  {copiedText === server.mainIp ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <StatusDropdown 
                  status={server.status} 
                  onStatusChange={(status) => onUpdateStatus(server.id, status)}
                />
              </TableCell>
              <TableCell>
                <div 
                  className={cn(
                    "copy-cell flex items-center gap-2",
                    copiedText === getUserName(server.assignedUserId) && "copied"
                  )}
                  onClick={(e) => handleCopyClick(getUserName(server.assignedUserId), "Assigned user", e)}
                  title="Click to copy"
                >
                  {getUserName(server.assignedUserId)}
                  {copiedText === getUserName(server.assignedUserId) ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onManageIPs(server)}
                  className="h-8 min-w-[3rem] px-2 hover:bg-primary-light hover:text-primary btn-ghost-enhanced transition-all duration-200"
                  title="Manage IPs"
                >
                  <Network className="h-4 w-4" />
                  <span className="ml-1 text-xs font-medium">{server.ips.length}</span>
                </Button>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onManageIPs(server)}
                  className="h-8 min-w-[3rem] px-2 hover:bg-primary-light hover:text-primary btn-ghost-enhanced transition-all duration-200"
                  title="Manage Domains"
                >
                  <Globe className="h-4 w-4" />
                  <span className="ml-1 text-xs font-medium">{getTotalDomains(server)}</span>
                </Button>
              </TableCell>
              <TableCell className="max-w-xs">
                {server.notes ? (
                  <div 
                    className={cn(
                      "copy-cell truncate text-sm text-muted-foreground flex items-center gap-2",
                      copiedText === server.notes && "copied"
                    )}
                    onClick={(e) => handleCopyClick(server.notes || '', "Notes", e)}
                    title={`${server.notes} (Click to copy)`}
                  >
                    {server.notes}
                    {copiedText === server.notes ? (
                      <Check className="h-3 w-3 text-success flex-shrink-0" />
                    ) : (
                      <Copy className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground/50 italic">No notes</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditServer(server)}
                    className="h-8 w-8 p-0 hover:bg-primary-light hover:text-primary btn-ghost-enhanced transition-all duration-200"
                    title="Edit server"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteServer(server.id)}
                    className="h-8 w-8 p-0 hover:bg-error-light hover:text-error btn-ghost-enhanced transition-all duration-200"
                    title="Delete server"
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
        <div className="text-center py-16 text-muted-foreground animate-fade-in">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-surface-variant rounded-full p-4">
              <Network className="h-12 w-12 opacity-50" />
            </div>
            <div>
              <p className="text-lg font-medium">No servers found</p>
              <p className="text-sm text-muted-foreground/70">Try adjusting your search or add a new server</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};