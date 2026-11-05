import MarketingLayout from '~/layouts/marketing';
import { ArrowRight, ArrowUpRight, CircleCheck, Code2 } from 'lucide-react';
import { Link } from '@adonisjs/inertia/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const resources = [
  {
    title: 'Documentation',
    description: 'Guides and API reference',
    href: 'https://docs.adonisjs.com',
  },
  {
    title: 'AdonisJS Plus',
    description: 'Feature packs and Flow AI',
    href: 'https://plus.adonisjs.com',
  },
  {
    title: 'Community',
    description: 'Meet fellow AdonisJS developers',
    href: 'https://discord.com/invite/vDcEjq6',
  },
];

export default function Home() {
  return (
    <main className="mx-auto grid min-h-[calc(100svh-3.5rem)] w-full max-w-6xl content-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
      <section className="flex flex-col items-start justify-center gap-6">
        <Badge variant="outline" className="gap-2 px-3 py-1 text-xs">
          <CircleCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
          Server ready
        </Badge>

        <div className="space-y-4">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            A full-stack React app, ready to build on.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Powered by Inertia and React, this setup combines server-driven
            routing with a fast, responsive interface.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            render={<Link route="new_account.create" />}
            nativeButton={false}
            size="lg"
            className="h-10 px-4"
          >
            Get started
            <ArrowRight />
          </Button>
          <Button
            render={<Link route="session.create" />}
            nativeButton={false}
            variant="outline"
            size="lg"
            className="h-10 px-4"
          >
            Sign in
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2" aria-label="Built with">
          {['AdonisJS', 'Inertia', 'React', 'TypeScript', 'Vite'].map(
            (name) => (
              <Badge key={name} variant="secondary" className="px-3 py-1">
                {name}
              </Badge>
            ),
          )}
        </div>
      </section>

      <Card className="w-full self-center">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted">
            <Code2 className="size-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">Start building</CardTitle>
          <CardDescription className="text-sm">
            Useful places to continue from here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {resources.map((resource, index) => (
            <div key={resource.href}>
              {index > 0 && <Separator className="my-2" />}
              <a
                href={resource.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-md p-3 transition-colors hover:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{resource.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {resource.description}
                  </p>
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </a>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

Home.layout = [MarketingLayout];
