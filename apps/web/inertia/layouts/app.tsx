import Logo from '~/components/logo';
import { type ReactNode } from 'react';
import { House, LogOut, Settings2 } from 'lucide-react';
import { Form } from '@adonisjs/inertia/react';
import FlashToasts from '~/components/flash_toasts';
import ThemeToggle from '~/components/theme_toggle';
import NavLink, { type NavItem } from '~/components/nav_link';
import { Button } from '@/components/ui/button';

/**
 * Top-level app navigation. Add an entry here for every new area of your
 * app, and it shows up in the navigation bar with its active state handled.
 */
const nav: NavItem[] = [
  { label: 'Dashboard', route: 'dashboard', icon: House },
  { label: 'Settings', route: 'profile.edit', icon: Settings2 },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo size={28} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Form route="session.destroy">
              <Button type="submit" variant="outline" size="sm">
                <LogOut />
                Log out
              </Button>
            </Form>
          </div>
        </div>
      </header>

      <nav aria-label="Main navigation" className="border-b bg-background">
        <div className="mx-auto flex h-12 w-full max-w-6xl items-center gap-1 px-4 sm:px-6">
          {nav.map(({ label, route, icon: Icon }) => (
            <NavLink
              key={label}
              route={route}
              className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-accent-foreground"
            >
              {Icon && <Icon className="size-4" />}
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="min-h-[calc(100svh-7.5rem)] bg-muted/30">
        {children}
      </main>
      <FlashToasts />
    </>
  );
}
