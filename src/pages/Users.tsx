import { useState } from 'react';
import { User } from '@/types';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { UserTable } from '@/components/UserTable';
import { UserModal } from '@/components/UserModal';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Users as UsersIcon } from 'lucide-react';

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

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border elevation-1">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <UsersIcon className="h-5 w-5 text-primary-foreground" />
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
                <Button onClick={handleAddUser} className="bg-primary hover:bg-primary-hover">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg p-6 elevation-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold text-foreground">{users.length}</p>
                  </div>
                  <UsersIcon className="h-8 w-8 text-primary" />
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-6 elevation-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned Users</p>
                    <p className="text-2xl font-bold text-success">
                      {assignedUsers.length}
                    </p>
                  </div>
                  <div className="h-3 w-3 bg-success rounded-full"></div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-6 elevation-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unassigned Users</p>
                    <p className="text-2xl font-bold text-warning">
                      {users.length - assignedUsers.length}
                    </p>
                  </div>
                  <div className="h-3 w-3 bg-warning rounded-full"></div>
                </div>
              </div>
            </div>

            {/* User Table */}
            <UserTable
              users={users}
              servers={servers}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
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