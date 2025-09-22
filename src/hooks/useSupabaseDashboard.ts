import { useState, useCallback, useMemo } from 'react';
import { Server, User, IP, Domain, ServerStatus } from '@/types';
import { mockData } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseDashboard = () => {
  const [users, setUsers] = useState<User[]>(mockData.users);
  const [servers, setServers] = useState<Server[]>(mockData.servers);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const { toast } = useToast();

  const filteredServers = useMemo(() => {
    if (!searchQuery.trim()) return servers;
    
    const query = searchQuery.toLowerCase();
    return servers.filter(server => {
      const user = users.find(u => u.id === server.assignedUserId);
      return (
        server.name.toLowerCase().includes(query) ||
        server.mainIp.includes(query) ||
        user?.name.toLowerCase().includes(query)
      );
    });
  }, [servers, users, searchQuery]);

  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return users;
    
    const query = userSearchQuery.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(query)
    );
  }, [users, userSearchQuery]);

  const updateServerStatus = useCallback((serverId: string, status: ServerStatus) => {
    setServers(prevServers => 
      prevServers.map(server => 
        server.id === serverId ? { ...server, status } : server
      )
    );
    
    toast({
      title: "Status updated",
      description: `Server status changed to ${status}`
    });
  }, [toast]);

  const addServer = useCallback((serverData: Omit<Server, 'id' | 'ips'>) => {
    const newServer: Server = {
      ...serverData,
      id: Date.now().toString(),
      ips: []
    };
    setServers(prevServers => [...prevServers, newServer]);
    
    toast({
      title: "Server added",
      description: `${serverData.name} has been created successfully`
    });
  }, [toast]);

  const updateServer = useCallback((serverId: string, serverData: Partial<Server>) => {
    setServers(prevServers => 
      prevServers.map(server => 
        server.id === serverId ? { ...server, ...serverData } : server
      )
    );
    
    toast({
      title: "Server updated",
      description: "Server has been updated successfully"
    });
  }, [toast]);

  const deleteServer = useCallback((serverId: string) => {
    setServers(prevServers => prevServers.filter(server => server.id !== serverId));
    
    toast({
      title: "Server deleted",
      description: "Server and all associated data have been removed"
    });
  }, [toast]);

  const addIPToServer = useCallback((serverId: string, ipAddresses: string[]) => {
    setServers(prevServers => 
      prevServers.map(server => {
        if (server.id === serverId) {
          const newIPs: IP[] = ipAddresses.map((address, index) => ({
            id: `${serverId}-ip-${Date.now()}-${index}`,
            address: address.trim(),
            serverId,
            domains: []
          }));
          return { ...server, ips: [...server.ips, ...newIPs] };
        }
        return server;
      })
    );
    
    toast({
      title: "IPs added",
      description: `${ipAddresses.length} IP(s) added successfully`
    });
  }, [toast]);

  const deleteIP = useCallback((serverId: string, ipId: string) => {
    setServers(prevServers => 
      prevServers.map(server => {
        if (server.id === serverId) {
          return { ...server, ips: server.ips.filter(ip => ip.id !== ipId) };
        }
        return server;
      })
    );
    
    toast({
      title: "IP deleted",
      description: "IP and associated domains have been removed"
    });
  }, [toast]);

  const updateDomains = useCallback((serverId: string, ipId: string, domains: Domain[]) => {
    setServers(prevServers => 
      prevServers.map(server => {
        if (server.id === serverId) {
          return {
            ...server,
            ips: server.ips.map(ip => 
              ip.id === ipId ? { ...ip, domains } : ip
            )
          };
        }
        return server;
      })
    );
    
    toast({
      title: "Domains updated",
      description: "Domain list has been saved successfully"
    });
  }, [toast]);

  const addUser = useCallback((userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    
    toast({
      title: "User added",
      description: `${userData.name} has been created successfully`
    });
  }, [toast]);

  const updateUser = useCallback((userId: string, userData: Partial<User>) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, ...userData } : user
      )
    );
    
    toast({
      title: "User updated",
      description: "User has been updated successfully"
    });
  }, [toast]);

  const deleteUser = useCallback((userId: string) => {
    // First unassign user from any servers
    setServers(prevServers => 
      prevServers.map(server => 
        server.assignedUserId === userId 
          ? { ...server, assignedUserId: '' }
          : server
      )
    );
    
    // Then delete the user
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    
    toast({
      title: "User deleted",
      description: "User has been removed and unassigned from all servers"
    });
  }, [toast]);

  return {
    users: filteredUsers,
    servers: filteredServers,
    searchQuery,
    setSearchQuery,
    userSearchQuery,
    setUserSearchQuery,
    updateServerStatus,
    addServer,
    updateServer,
    deleteServer,
    addIPToServer,
    deleteIP,
    updateDomains,
    addUser,
    updateUser,
    deleteUser,
    loading: false
  };
};