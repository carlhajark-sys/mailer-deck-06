import { useState, useCallback, useMemo, useEffect } from 'react';
import { Server, User, IP, Domain, ServerStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch users from database
  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Fetch servers with their IPs and domains
  const fetchServers = useCallback(async () => {
    try {
      const { data: serversData, error: serversError } = await supabase
        .from('servers')
        .select(`
          *,
          ips (
            *,
            domains (*)
          )
        `)
        .order('name');
      
      if (serversError) throw serversError;

      // Transform database data to match frontend types
      const transformedServers: Server[] = (serversData || []).map(server => ({
        id: server.id,
        name: server.name,
        mainIp: server.main_ip,
        status: server.status as ServerStatus,
        assignedUserId: server.assigned_user_id || '',
        notes: server.notes || '',
        ips: (server.ips || []).map((ip: any) => ({
          id: ip.id,
          address: ip.address,
          serverId: ip.server_id,
          domains: (ip.domains || []).map((domain: any) => ({
            id: domain.id,
            domain: domain.domain,
            type: domain.type as 'found' | 'production',
            ipId: domain.ip_id
          }))
        }))
      }));

      setServers(transformedServers);
    } catch (error) {
      console.error('Error fetching servers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch servers",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchServers()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchUsers, fetchServers]);

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

  const updateServerStatus = useCallback(async (serverId: string, status: ServerStatus) => {
    try {
      const { error } = await supabase
        .from('servers')
        .update({ status })
        .eq('id', serverId);
      
      if (error) throw error;
      
      setServers(prevServers => 
        prevServers.map(server => 
          server.id === serverId ? { ...server, status } : server
        )
      );
      
      toast({
        title: "Status updated",
        description: `Server status changed to ${status}`
      });
    } catch (error) {
      console.error('Error updating server status:', error);
      toast({
        title: "Error",
        description: "Failed to update server status",
        variant: "destructive"
      });
    }
  }, [toast]);

  const addServer = useCallback(async (serverData: Omit<Server, 'id' | 'ips'>) => {
    try {
      const { data, error } = await supabase
        .from('servers')
        .insert([{
          name: serverData.name,
          main_ip: serverData.mainIp,
          status: serverData.status,
          assigned_user_id: serverData.assignedUserId || null,
          notes: serverData.notes
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      const newServer: Server = {
        id: data.id,
        name: data.name,
        mainIp: data.main_ip,
        status: data.status as ServerStatus,
        assignedUserId: data.assigned_user_id || '',
        notes: data.notes || '',
        ips: []
      };
      
      setServers(prevServers => [...prevServers, newServer]);
      
      toast({
        title: "Server added",
        description: `${serverData.name} has been created successfully`
      });
    } catch (error) {
      console.error('Error adding server:', error);
      toast({
        title: "Error",
        description: "Failed to add server",
        variant: "destructive"
      });
    }
  }, [toast]);

  const updateServer = useCallback(async (serverId: string, serverData: Partial<Server>) => {
    try {
      const updateData: any = {};
      if (serverData.name) updateData.name = serverData.name;
      if (serverData.mainIp) updateData.main_ip = serverData.mainIp;
      if (serverData.status) updateData.status = serverData.status;
      if (serverData.assignedUserId !== undefined) updateData.assigned_user_id = serverData.assignedUserId || null;
      if (serverData.notes !== undefined) updateData.notes = serverData.notes;

      const { error } = await supabase
        .from('servers')
        .update(updateData)
        .eq('id', serverId);
      
      if (error) throw error;
      
      setServers(prevServers => 
        prevServers.map(server => 
          server.id === serverId ? { ...server, ...serverData } : server
        )
      );
      
      toast({
        title: "Server updated",
        description: "Server has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating server:', error);
      toast({
        title: "Error",
        description: "Failed to update server",
        variant: "destructive"
      });
    }
  }, [toast]);

  const deleteServer = useCallback(async (serverId: string) => {
    try {
      const { error } = await supabase
        .from('servers')
        .delete()
        .eq('id', serverId);
      
      if (error) throw error;
      
      setServers(prevServers => prevServers.filter(server => server.id !== serverId));
      
      toast({
        title: "Server deleted",
        description: "Server and all associated data have been removed"
      });
    } catch (error) {
      console.error('Error deleting server:', error);
      toast({
        title: "Error",
        description: "Failed to delete server",
        variant: "destructive"
      });
    }
  }, [toast]);

  const addIPToServer = useCallback(async (serverId: string, ipAddresses: string[]) => {
    try {
      const { data, error } = await supabase
        .from('ips')
        .insert(
          ipAddresses.map(address => ({
            address: address.trim(),
            server_id: serverId
          }))
        )
        .select();
      
      if (error) throw error;
      
      const newIPs: IP[] = (data || []).map(ip => ({
        id: ip.id,
        address: ip.address,
        serverId: ip.server_id,
        domains: []
      }));
      
      setServers(prevServers => 
        prevServers.map(server => {
          if (server.id === serverId) {
            return { ...server, ips: [...server.ips, ...newIPs] };
          }
          return server;
        })
      );
      
      toast({
        title: "IPs added",
        description: `${ipAddresses.length} IP(s) added successfully`
      });
    } catch (error) {
      console.error('Error adding IPs:', error);
      toast({
        title: "Error",
        description: "Failed to add IPs",
        variant: "destructive"
      });
    }
  }, [toast]);

  const deleteIP = useCallback(async (serverId: string, ipId: string) => {
    try {
      const { error } = await supabase
        .from('ips')
        .delete()
        .eq('id', ipId);
      
      if (error) throw error;
      
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
    } catch (error) {
      console.error('Error deleting IP:', error);
      toast({
        title: "Error",
        description: "Failed to delete IP",
        variant: "destructive"
      });
    }
  }, [toast]);

  const updateDomains = useCallback(async (serverId: string, ipId: string, domains: Domain[]) => {
    try {
      // First delete existing domains for this IP
      await supabase.from('domains').delete().eq('ip_id', ipId);
      
      // Then insert new domains
      if (domains.length > 0) {
        const { error } = await supabase
          .from('domains')
          .insert(
            domains.map(domain => ({
              domain: domain.domain,
              type: domain.type,
              ip_id: ipId
            }))
          );
        
        if (error) throw error;
      }
      
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
    } catch (error) {
      console.error('Error updating domains:', error);
      toast({
        title: "Error",
        description: "Failed to update domains",
        variant: "destructive"
      });
    }
  }, [toast]);

  const addUser = useCallback(async (userData: Omit<User, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ name: userData.name }])
        .select()
        .single();
      
      if (error) throw error;
      
      const newUser: User = {
        id: data.id,
        name: data.name
      };
      
      setUsers(prevUsers => [...prevUsers, newUser]);
      
      toast({
        title: "User added",
        description: `${userData.name} has been created successfully`
      });
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive"
      });
    }
  }, [toast]);

  const updateUser = useCallback(async (userId: string, userData: Partial<User>) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: userData.name })
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, ...userData } : user
        )
      );
      
      toast({
        title: "User updated",
        description: "User has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    }
  }, [toast]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      // First unassign user from any servers
      await supabase
        .from('servers')
        .update({ assigned_user_id: null })
        .eq('assigned_user_id', userId);
      
      // Then delete the user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      setServers(prevServers => 
        prevServers.map(server => 
          server.assignedUserId === userId 
            ? { ...server, assignedUserId: '' }
            : server
        )
      );
      
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      toast({
        title: "User deleted",
        description: "User has been removed and unassigned from all servers"
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
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
    loading
  };
};