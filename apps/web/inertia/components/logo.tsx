import { Link } from '@adonisjs/inertia/react';
import { Sprout } from 'lucide-react';

export default function Logo({ size = 26 }: { size?: number }) {
  return (
    <Link
      route="home"
      aria-label="Viridian home"
      className="inline-flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
    >
      <Sprout size={size} strokeWidth={2} aria-hidden="true" />
      <span className="text-base font-semibold tracking-tight">Viridian</span>
    </Link>
  );
}
