import { useState, useEffect } from 'react';
import { Server, User, ServerStatus } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  server?: Server;
  users: User[];
  onSave: (serverData: Omit<Server, 'id' | 'ips'>) => void;
  onUpdate?: (serverId: string, serverData: Partial<Server>) => void;
}

const statuses: ServerStatus[] = ['Production', 'Test', 'Down', 'Timed out'];

export const ServerModal = ({ isOpen, onClose, server, users, onSave, onUpdate }: ServerModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    mainIp: '',
    status: 'Test' as ServerStatus,
    assignedUserId: 'unassigned',
    notes: ''
  });

  // Update form data when server prop changes
  useEffect(() => {
    if (server) {
      setFormData({
        name: server.name,
        mainIp: server.mainIp,
        status: server.status,
        assignedUserId: server.assignedUserId,
        notes: server.notes
      });
    } else {
      setFormData({
        name: '',
        mainIp: '',
        status: 'Test',
        assignedUserId: 'unassigned',
        notes: ''
      });
    }
  }, [server]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only require name for new servers, all fields for editing
    const isCreating = !server;
    if (isCreating) {
      if (!formData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter a server name",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!formData.name.trim() || !formData.mainIp.trim()) {
        toast({
          title: "Validation Error", 
          description: "Please fill in server name and main IP",
          variant: "destructive"
        });
        return;
      }
    }

    if (server && onUpdate) {
      onUpdate(server.id, formData);
      toast({
        title: "Success",
        description: "Server updated successfully"
      });
    } else {
      // Set default values for new servers
      const serverData = {
        ...formData,
        mainIp: formData.mainIp.trim() || '0.0.0.0', // Default IP if not provided
        assignedUserId: formData.assignedUserId === "unassigned" ? "" : formData.assignedUserId
      };
      onSave(serverData);
      toast({
        title: "Success", 
        description: "Server created successfully"
      });
    }
    
    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      mainIp: '',
      status: 'Test',
      assignedUserId: 'unassigned',
      notes: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border elevation-3">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {server ? 'Edit Server' : 'Add New Server'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Server Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Server-A10"
              className="bg-surface border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mainIp">
              Main IP Address {server && '*'}
            </Label>
            <Input
              id="mainIp"
              value={formData.mainIp}
              onChange={(e) => setFormData(prev => ({ ...prev, mainIp: e.target.value }))}
              placeholder={server ? "e.g., 192.168.1.10" : "Optional - can be set later"}
              className="bg-surface border-border font-mono"
              required={!!server}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: ServerStatus) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="bg-surface border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedUser">
              Assigned User
            </Label>
            <Select 
              value={formData.assignedUserId || "unassigned"} 
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                assignedUserId: value === "unassigned" ? "" : value 
              }))}
            >
              <SelectTrigger className="bg-surface border-border">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this server..."
              className="bg-surface border-border resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-hover">
              {server ? 'Update Server' : 'Create Server'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};