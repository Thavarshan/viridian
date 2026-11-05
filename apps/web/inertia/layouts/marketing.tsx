import Logo from '~/components/logo';
import { type ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { Link } from '@adonisjs/inertia/react';
import FlashToasts from '~/components/flash_toasts';
import ThemeToggle from '~/components/theme_toggle';
import { Button } from '@/components/ui/button';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const { props } = usePage();

  return (
    <>
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo size={28} />
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            {props.user ? (
              <Button
                render={<Link route="dashboard" />}
                nativeButton={false}
                size="sm"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  render={<Link route="session.create" />}
                  nativeButton={false}
                  variant="ghost"
                  size="sm"
                >
                  Sign in
                </Button>
                <Button
                  render={<Link route="new_account.create" />}
                  nativeButton={false}
                  size="sm"
                >
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      {children}
      <FlashToasts />
    </>
  );
}
