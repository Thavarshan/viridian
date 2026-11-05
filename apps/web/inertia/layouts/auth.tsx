import Logo from '~/components/logo';
import { type ReactNode } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from '@adonisjs/inertia/react';
import FlashToasts from '~/components/flash_toasts';
import ThemeToggle from '~/components/theme_toggle';
import { Card } from '@/components/ui/card';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-muted/30 px-4 py-6 sm:px-6 sm:py-8">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Logo size={28} />
        <ThemeToggle />
      </header>

      <main className="mx-auto grid min-h-[calc(100svh-7rem)] w-full max-w-5xl place-items-center py-8">
        <Card className="w-full max-w-4xl p-0 sm:rounded-xl">
          <div className="grid md:grid-cols-2">
            <section className="flex items-center px-6 py-8 sm:px-10 sm:py-12">
              <div className="mx-auto w-full max-w-sm">{children}</div>
            </section>

            <aside className="hidden flex-col justify-between border-l bg-muted/50 p-10 md:flex">
              <div className="flex size-11 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
                <Sparkles className="size-5" />
              </div>

              <p className="max-w-sm text-2xl font-medium leading-relaxed tracking-tight">
                Authentication, kept simple so you can focus on building your
                product.
              </p>

              <div className="space-y-3">
                <p className="font-medium">Need production-ready auth?</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Explore Feature Packs for production-ready full-stack
                  components from the creators of AdonisJS.
                </p>
                <Link
                  href="https://plus.adonisjs.com/feature-packs"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Explore Feature Packs
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </aside>
          </div>
        </Card>
      </main>

      <FlashToasts />
    </div>
  );
}
