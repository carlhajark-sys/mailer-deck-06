import { useState } from 'react';
import { Server } from '@/types';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { ServerTable } from '@/components/ServerTable';
import { ServerTablePagination } from '@/components/ServerTablePagination';
import { ServerModal } from '@/components/ServerModal';
import { IPDomainModal } from '@/components/IPDomainModal';
import { SearchBar } from '@/components/SearchBar';
import { Navigation } from '@/components/Navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Network, TrendingUp, AlertTriangle, Globe2 } from 'lucide-react';

const Index = () => {
  const {
    users,
    servers,
    allServers,
    searchQuery,
    setSearchQuery,
    sortConfig,
    handleSort,
    currentPage,
    totalPages,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    totalServers,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading server data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border elevation-1 hover-lift">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-lg">
                  <Network className="h-6 w-6 text-primary-foreground" />
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
                <Button 
                  onClick={handleAddServer} 
                  className="bg-primary hover:bg-primary-hover shadow-lg hover:shadow-xl transition-all duration-200 btn-ghost-enhanced"
                >
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
              <div className="bg-card rounded-lg p-6 elevation-1 hover-lift animate-slide-up border border-border/50" style={{ animationDelay: '0ms' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Total Servers</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{totalServers}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Network className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-6 elevation-1 hover-lift animate-slide-up border border-success/20" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Production</p>
                    <p className="text-3xl font-bold text-success mt-1">
                      {allServers.filter(s => s.status === 'Production').length}
                    </p>
                  </div>
                  <div className="bg-success/10 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-6 elevation-1 hover-lift animate-slide-up border border-error/20" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Issues</p>
                    <p className="text-3xl font-bold text-error mt-1">
                      {allServers.filter(s => s.status === 'Down' || s.status === 'Timed out').length}
                    </p>
                  </div>
                  <div className="bg-error/10 p-3 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-error" />
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-6 elevation-1 hover-lift animate-slide-up border border-info/20" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Total IPs</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {allServers.reduce((total, server) => total + server.ips.length, 0)}
                    </p>
                  </div>
                  <div className="bg-info/10 p-3 rounded-full">
                    <Globe2 className="h-6 w-6 text-info" />
                  </div>
                </div>
              </div>
            </div>

            {/* Server Table */}
            <div className="space-y-0">
              <ServerTable
                servers={servers}
                users={users}
                sortConfig={sortConfig}
                onSort={handleSort}
                onEditServer={handleEditServer}
                onDeleteServer={handleDeleteServer}
                onManageIPs={handleManageIPs}
                onUpdateStatus={updateServerStatus}
              />
              <ServerTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalServers={totalServers}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
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
