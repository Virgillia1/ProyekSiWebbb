import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { ExpandableSearch } from './ExpandableSearch';

interface AdminTableToolbarProps {
  addLabel: string;
  searchPlaceholder: string;
  searchValue: string;
  onAdd: () => void;
  onSearchChange: (value: string) => void;
}

export function AdminTableToolbar({
  addLabel,
  searchPlaceholder,
  searchValue,
  onAdd,
  onSearchChange,
}: AdminTableToolbarProps) {
  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
      <ExpandableSearch
        value={searchValue}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
      />
      <Button type="button" onClick={onAdd} className="h-11 rounded-xl px-4 shadow-sm">
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}
