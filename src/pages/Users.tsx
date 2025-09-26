import { useState } from 'react';
import { User } from '@/types';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { UserTable } from '@/components/UserTable';
import { UserModal } from '@/components/UserModal';
import { SearchBar } from '@/components/SearchBar';
import { Navigation } from '@/components/Navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Users as UsersIcon, UserCheck, Server } from 'lucide-react';

const Users = () => {
  const {
    users,
    servers,
    userSearchQuery,
    setUserSearchQuery,
    addUser,
    updateUser,
    deleteUser,
    loading
  } = useSupabaseData();

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleAddUser = () => {
    setEditingUser(undefined);
    setShowUserModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    setDeleteConfirm(userId);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteUser(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setEditingUser(undefined);
  };

  // Get user statistics
  const assignedUsers = users.filter(user => 
    servers.some(server => server.assignedUserId === user.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading users...</p>
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-info to-info/80 rounded-xl flex items-center justify-center shadow-lg">
                  <UsersIcon className="h-6 w-6 text-info-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                  <p className="text-sm text-muted-foreground">Manage team members and assignments</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <SearchBar 
                  value={userSearchQuery}
                  onChange={setUserSearchQuery}
                  placeholder="Search users..."
                />
                <Button 
                  onClick={handleAddUser} 
                  className="bg-primary hover:bg-primary-hover shadow-lg hover:shadow-xl transition-all duration-200 btn-ghost-enhanced"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>
            <Navigation />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg p-6 elevation-1 hover-lift animate-slide-up border border-border/50" style={{ animationDelay: '0ms' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{users.length}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <UsersIcon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-6 elevation-1 hover-lift animate-slide-up border border-success/20" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Assigned Users</p>
                    <p className="text-3xl font-bold text-success mt-1">
                      {assignedUsers.length}
                    </p>
                  </div>
                  <div className="bg-success/10 p-3 rounded-full">
                    <UserCheck className="h-6 w-6 text-success" />
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-6 elevation-1 hover-lift animate-slide-up border border-warning/20" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Available</p>
                    <p className="text-3xl font-bold text-warning mt-1">
                      {users.length - assignedUsers.length}
                    </p>
                  </div>
                  <div className="bg-warning/10 p-3 rounded-full">
                    <Server className="h-6 w-6 text-warning" />
                  </div>
                </div>
              </div>
            </div>

            {/* User Table */}
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <UserTable
                users={users}
                servers={servers}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <UserModal
        isOpen={showUserModal}
        onClose={closeUserModal}
        user={editingUser}
        onSave={addUser}
        onUpdate={updateUser}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user and unassign them from any servers.
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

export default Users;