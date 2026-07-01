import { Search } from 'lucide-react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por nombre, organización o dirección..."
        className="w-full rounded-lg border border-ink/20 bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink/40 focus:border-route focus:outline-none focus:ring-2 focus:ring-route/30"
      />
    </div>
  );
}
