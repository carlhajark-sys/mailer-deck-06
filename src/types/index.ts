export type ServerStatus = 'Production' | 'Test' | 'Down' | 'Timed out';

export interface User {
  id: string;
  name: string;
}

export interface Domain {
  id: string;
  domain: string;
  type: 'found' | 'production';
  ipId: string;
}

export interface IP {
  id: string;
  address: string;
  serverId: string;
  domains: Domain[];
}

export interface Server {
  id: string;
  name: string;
  mainIp: string;
  status: ServerStatus;
  assignedUserId: string;
  notes: string;
  ips: IP[];
}

export interface DashboardData {
  users: User[];
  servers: Server[];
}