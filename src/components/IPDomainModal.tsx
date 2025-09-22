import { useState, useCallback } from 'react';
import { Server, IP, Domain } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Copy, Edit3, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface IPDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server;
  onAddIPs: (serverId: string, ips: string[]) => void;
  onDeleteIP: (serverId: string, ipId: string) => void;
  onUpdateDomains: (serverId: string, ipId: string, domains: Domain[]) => void;
}

export const IPDomainModal = ({ 
  isOpen, 
  onClose, 
  server, 
  onAddIPs, 
  onDeleteIP,
  onUpdateDomains 
}: IPDomainModalProps) => {
  const { toast } = useToast();
  const [selectedIP, setSelectedIP] = useState<IP | null>(server.ips[0] || null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIPs, setNewIPs] = useState('');
  const [editingDomains, setEditingDomains] = useState<{type: 'found' | 'production', value: string} | null>(null);

  const handleAddIPs = () => {
    if (!newIPs.trim()) return;
    
    const ipList = newIPs.split('\n').filter(ip => ip.trim());
    if (ipList.length === 0) return;
    
    onAddIPs(server.id, ipList);
    setNewIPs('');
    setShowAddForm(false);
    toast({
      title: "Success",
      description: `Added ${ipList.length} IP(s) to ${server.name}`
    });
  };

  const handleDeleteIP = (ip: IP) => {
    if (server.ips.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete the last IP address",
        variant: "destructive"
      });
      return;
    }
    
    onDeleteIP(server.id, ip.id);
    if (selectedIP?.id === ip.id) {
      setSelectedIP(server.ips.find(i => i.id !== ip.id) || null);
    }
    toast({
      title: "Success",
      description: "IP address deleted"
    });
  };

  const copyToClipboard = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  }, [toast]);

  const copyIP = useCallback(async (ipAddress: string) => {
    await copyToClipboard(ipAddress, 'IP address');
  }, [copyToClipboard]);

  const copyAllIPs = useCallback(async () => {
    const allIPs = server.ips.map(ip => ip.address).join('\n');
    await copyToClipboard(allIPs, 'All IP addresses');
  }, [server.ips, copyToClipboard]);

  const getDomainsText = (domains: Domain[], type: 'found' | 'production') => {
    return domains
      .filter(d => d.type === type)
      .map(d => d.domain)
      .join('\n');
  };

  const handleSaveDomains = () => {
    if (!editingDomains || !selectedIP) return;
    
    const newDomainList = editingDomains.value
      .split('\n')
      .filter(d => d.trim())
      .map(d => d.trim());
    
    const updatedDomains = selectedIP.domains.filter(d => d.type !== editingDomains.type);
    
    newDomainList.forEach((domain, index) => {
      updatedDomains.push({
        id: `${selectedIP.id}-${editingDomains.type}-${Date.now()}-${index}`,
        domain,
        type: editingDomains.type,
        ipId: selectedIP.id
      });
    });
    
    onUpdateDomains(server.id, selectedIP.id, updatedDomains);
    setEditingDomains(null);
    
    // Update selected IP to reflect changes
    setSelectedIP(prev => prev ? {...prev, domains: updatedDomains} : null);
    
    toast({
      title: "Success",
      description: `${editingDomains.type} domains updated`
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-card border-border elevation-3">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Manage IPs & Domains - {server.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 h-[60vh]">
          {/* Left Pane - IP List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">IP Addresses ({server.ips.length})</h3>
              <div className="flex gap-2">
                <Button
                  onClick={copyAllIPs}
                  size="sm"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary-light"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy All
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-primary hover:bg-primary-hover"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add IPs
                </Button>
              </div>
            </div>
            
            {showAddForm && (
              <div className="p-4 bg-surface-variant rounded-lg space-y-3">
                <Label>Add IP Addresses (one per line)</Label>
                <Textarea
                  value={newIPs}
                  onChange={(e) => setNewIPs(e.target.value)}
                  placeholder="192.168.1.100&#10;192.168.1.101&#10;192.168.1.102"
                  className="bg-surface border-border resize-none font-mono text-sm"
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddIPs}>Add</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </div>
            )}
            
            <div className="space-y-2 overflow-y-auto max-h-96">
              {server.ips.map((ip) => (
                <div
                  key={ip.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedIP?.id === ip.id 
                      ? "bg-primary-light border-primary" 
                      : "bg-surface border-border hover:bg-surface-variant"
                  )}
                  onClick={() => setSelectedIP(ip)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">{ip.address}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {ip.domains.length} domains
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyIP(ip.address);
                        }}
                        className="h-6 w-6 p-0 hover:bg-primary-light hover:text-primary"
                        title="Copy IP"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteIP(ip);
                        }}
                        className="h-6 w-6 p-0 hover:bg-error-light hover:text-error"
                        title="Delete IP"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Pane - Domain Display */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Domains {selectedIP && `- ${selectedIP.address}`}
            </h3>
            
            {selectedIP ? (
              <div className="space-y-4">
                {/* Found Domains */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Found Domains</Label>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(getDomainsText(selectedIP.domains, 'found'), 'Found domains')}
                        className="h-7 px-2 text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingDomains({
                          type: 'found',
                          value: getDomainsText(selectedIP.domains, 'found')
                        })}
                        className="h-7 px-2 text-xs"
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                  
                  {editingDomains?.type === 'found' ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingDomains.value}
                        onChange={(e) => setEditingDomains(prev => prev ? {...prev, value: e.target.value} : null)}
                        className="bg-surface border-border resize-none font-mono text-sm"
                        rows={8}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveDomains}>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingDomains(null)}>
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Textarea
                      value={getDomainsText(selectedIP.domains, 'found')}
                      readOnly
                      className="bg-surface border-border resize-none font-mono text-sm"
                      rows={8}
                    />
                  )}
                </div>
                
                {/* Production Domains */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Production Domains</Label>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(getDomainsText(selectedIP.domains, 'production'), 'Production domains')}
                        className="h-7 px-2 text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingDomains({
                          type: 'production',
                          value: getDomainsText(selectedIP.domains, 'production')
                        })}
                        className="h-7 px-2 text-xs"
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                  
                  {editingDomains?.type === 'production' ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingDomains.value}
                        onChange={(e) => setEditingDomains(prev => prev ? {...prev, value: e.target.value} : null)}
                        className="bg-surface border-border resize-none font-mono text-sm"
                        rows={8}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveDomains}>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingDomains(null)}>
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Textarea
                      value={getDomainsText(selectedIP.domains, 'production')}
                      readOnly
                      className="bg-surface border-border resize-none font-mono text-sm"
                      rows={8}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>Select an IP address to view its domains</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};