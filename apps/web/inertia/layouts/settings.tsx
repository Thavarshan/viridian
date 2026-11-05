import Page from '~/components/page';
import { type ReactNode } from 'react';
import NavLink, { type NavItem } from '~/components/nav_link';
import { UserRound } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Settings pages can register their route and icon here to appear in the
 * settings navigation.
 */
const items: NavItem[] = [
  { label: 'Profile', route: 'profile.edit', icon: UserRound },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <Page
      title="Settings"
      description="Manage your account settings and preferences."
    >
      <div
        className={
          items.length > 0
            ? 'grid gap-6 md:grid-cols-[15rem_minmax(0,1fr)]'
            : 'grid gap-6'
        }
      >
        {items.length > 0 && (
          <nav
            aria-label="Settings navigation"
            className="flex flex-col gap-1 rounded-lg border bg-card p-2"
          >
            {items.map(({ label, route, icon: Icon }) => (
              <NavLink
                key={label}
                route={route}
                exact
                className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-accent-foreground"
              >
                {Icon && <Icon className="size-4" />}
                {label}
              </NavLink>
            ))}
          </nav>
        )}
        <Card className="min-w-0">
          <CardContent className="p-6">{children}</CardContent>
        </Card>
      </div>
    </Page>
  );
}
