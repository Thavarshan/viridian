import Logo from '~/components/logo';
import { type ReactNode } from 'react';
import { GitBranch, ShieldCheck, Sprout } from 'lucide-react';
import FlashToasts from '~/components/flash_toasts';
import ThemeToggle from '~/components/theme_toggle';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
              <div className="space-y-6">
                <div className="flex size-11 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
                  <Sprout className="size-5" />
                </div>
                <Badge variant="outline" className="w-fit">
                  Software Delivery Intelligence
                </Badge>
                <p className="max-w-sm text-2xl font-medium leading-relaxed tracking-tight">
                  Understand the evidence behind a release and the changes
                  around an incident.
                </p>
              </div>

              <Card className="bg-background/70">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Deterministic checks establish facts before any
                      model-assisted reasoning.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <GitBranch className="mt-0.5 size-4 shrink-0 text-primary" />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      The roadmap connects release history with incident
                      investigations through shared evidence.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </Card>
      </main>

      <FlashToasts />
    </div>
  );
}
