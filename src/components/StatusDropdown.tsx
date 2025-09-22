import { ServerStatus } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from './StatusBadge';

interface StatusDropdownProps {
  status: ServerStatus;
  onStatusChange: (status: ServerStatus) => void;
}

const statuses: ServerStatus[] = ['Production', 'Test', 'Down', 'Timed out'];

export const StatusDropdown = ({ status, onStatusChange }: StatusDropdownProps) => {
  return (
    <Select value={status} onValueChange={onStatusChange}>
      <SelectTrigger className="w-32 h-8 border-0 bg-transparent p-0">
        <SelectValue>
          <StatusBadge status={status} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="z-50 bg-popover border border-border shadow-lg">
        {statuses.map((statusOption) => (
          <SelectItem key={statusOption} value={statusOption} className="p-2">
            <StatusBadge status={statusOption} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};