import { useState } from 'react';
import { Server } from '@/types';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { ServerTable } from '@/components/ServerTable';
import { ServerModal } from '@/components/ServerModal';
import { IPDomainModal } from '@/components/IPDomainModal';
import { SearchBar } from '@/components/SearchBar';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Network } from 'lucide-react';

const Index = () => {
  const {
    users,
    servers,
    searchQuery,
    setSearchQuery,
    updateServerStatus,
    addServer,
    updateServer,
    deleteServer,
    addIPToServer,
    deleteIP,
    updateDomains,
    loading
  } = useSupabaseData();

  const [showServerModal, setShowServerModal] = useState(false);
  const [showIPModal, setShowIPModal] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | undefined>();
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleEditServer = (server: Server) => {
    setEditingServer(server);
    setShowServerModal(true);
  };

  const handleAddServer = () => {
    setEditingServer(undefined);
    setShowServerModal(true);
  };

  const handleManageIPs = (server: Server) => {
    setSelectedServer(server);
    setShowIPModal(true);
  };

  const handleDeleteServer = (serverId: string) => {
    setDeleteConfirm(serverId);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteServer(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const closeServerModal = () => {
    setShowServerModal(false);
    setEditingServer(undefined);
  };

  const closeIPModal = () => {
    setShowIPModal(false);
    setSelectedServer(null);
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border elevation-1">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <Network className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Server Management</h1>
                  <p className="text-sm text-muted-foreground">Team Leader Dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Navigation />
                <SearchBar 
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
                <Button onClick={handleAddServer} className="bg-primary hover:bg-primary-hover">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Server
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-card rounded-lg p-6 elevation-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Servers</p>
                    <p className="text-2xl font-bold text-foreground">{servers.length}</p>
                  </div>
                  <Network className="h-8 w-8 text-primary" />
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-6 elevation-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Production</p>
                    <p className="text-2xl font-bold text-success">
                      {servers.filter(s => s.status === 'Production').length}
                    </p>
                  </div>
                  <div className="h-3 w-3 bg-success rounded-full"></div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-6 elevation-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Issues</p>
                    <p className="text-2xl font-bold text-error">
                      {servers.filter(s => s.status === 'Down' || s.status === 'Timed out').length}
                    </p>
                  </div>
                  <div className="h-3 w-3 bg-error rounded-full"></div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-6 elevation-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total IPs</p>
                    <p className="text-2xl font-bold text-foreground">
                      {servers.reduce((total, server) => total + server.ips.length, 0)}
                    </p>
                  </div>
                  <div className="h-3 w-3 bg-info rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Server Table */}
            <ServerTable
              servers={servers}
              users={users}
              onEditServer={handleEditServer}
              onDeleteServer={handleDeleteServer}
              onManageIPs={handleManageIPs}
              onUpdateStatus={updateServerStatus}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      <ServerModal
        isOpen={showServerModal}
        onClose={closeServerModal}
        server={editingServer}
        users={users}
        onSave={addServer}
        onUpdate={updateServer}
      />

      {selectedServer && (
        <IPDomainModal
          isOpen={showIPModal}
          onClose={closeIPModal}
          server={selectedServer}
          onAddIPs={addIPToServer}
          onDeleteIP={deleteIP}
          onUpdateDomains={updateDomains}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Server</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the server and all associated IPs and domains.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-error hover:bg-error/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Index;
