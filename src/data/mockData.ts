import { DashboardData, User, Server, IP, Domain } from '@/types';

export const mockUsers: User[] = [
  { id: '1', name: 'John Smith' },
  { id: '2', name: 'Sarah Johnson' },
  { id: '3', name: 'Mike Chen' },
  { id: '4', name: 'Emma Davis' },
  { id: '5', name: 'Alex Rodriguez' },
];

const generateDomains = (ipId: string, count: number): Domain[] => {
  const domains: Domain[] = [];
  const foundDomains = ['example.com', 'testsite.org', 'myapp.io', 'webservice.net', 'platform.co'];
  const prodDomains = ['production.com', 'live-site.org', 'mainapp.io', 'enterprise.net', 'business.co'];
  
  for (let i = 0; i < count; i++) {
    if (i < count / 2) {
      domains.push({
        id: `${ipId}-found-${i}`,
        domain: foundDomains[i % foundDomains.length].replace('.', `${i}.`),
        type: 'found',
        ipId
      });
    } else {
      domains.push({
        id: `${ipId}-prod-${i}`,
        domain: prodDomains[i % prodDomains.length].replace('.', `${i}.`),
        type: 'production',
        ipId
      });
    }
  }
  
  return domains;
};

const generateIPs = (serverId: string, count: number): IP[] => {
  const ips: IP[] = [];
  
  for (let i = 0; i < count; i++) {
    const ipId = `${serverId}-ip-${i}`;
    const ip: IP = {
      id: ipId,
      address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      serverId,
      domains: generateDomains(ipId, Math.floor(Math.random() * 8) + 2)
    };
    ips.push(ip);
  }
  
  return ips;
};

export const mockServers: Server[] = [
  {
    id: '1',
    name: 'Server-A10',
    mainIp: '192.168.1.10',
    status: 'Production',
    assignedUserId: '1',
    notes: 'Primary production server, handles main traffic',
    ips: generateIPs('1', 3)
  },
  {
    id: '2',
    name: 'Server-B15',
    mainIp: '192.168.1.15',
    status: 'Test',
    assignedUserId: '2',
    notes: 'Testing environment for new features',
    ips: generateIPs('2', 2)
  },
  {
    id: '3',
    name: 'Server-C20',
    mainIp: '192.168.1.20',
    status: 'Down',
    assignedUserId: '3',
    notes: 'Server down for maintenance',
    ips: generateIPs('3', 4)
  },
  {
    id: '4',
    name: 'Server-D25',
    mainIp: '192.168.1.25',
    status: 'Timed out',
    assignedUserId: '4',
    notes: 'Connection timeout issues, investigating',
    ips: generateIPs('4', 1)
  },
  {
    id: '5',
    name: 'Server-E30',
    mainIp: '192.168.1.30',
    status: 'Production',
    assignedUserId: '5',
    notes: 'Secondary production server',
    ips: generateIPs('5', 5)
  },
];

export const mockData: DashboardData = {
  users: mockUsers,
  servers: mockServers,
};