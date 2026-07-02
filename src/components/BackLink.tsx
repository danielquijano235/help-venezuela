import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BackLinkProps {
  to: string;
  label: string;
}

export function BackLink({ to, label }: BackLinkProps) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-signal hover:text-signal-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-route"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
