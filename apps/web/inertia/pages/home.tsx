import MarketingLayout from '~/layouts/marketing';
import {
  ArrowRight,
  ClipboardCheck,
  GitBranch,
  ShieldCheck,
  Sprout,
} from 'lucide-react';
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

const workflows = [
  {
    title: 'Release Intelligence',
    description: 'Assess requirements, changes, tests, and CI evidence.',
    icon: ClipboardCheck,
  },
  {
    title: 'Incident Intelligence',
    description: 'Relate sanitized failures to deployments and code changes.',
    icon: GitBranch,
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-3.5rem)] w-full max-w-6xl flex-col justify-center gap-10 px-4 py-12 sm:px-6 lg:gap-14">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <Badge variant="outline" className="gap-2 px-3 py-1 text-xs">
            <Sprout className="size-4 text-primary" />
            Software Delivery Intelligence
          </Badge>

          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Know what&apos;s ready to ship. Understand what broke.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Viridian is being built to connect release decisions with incident
              investigations through shared, traceable evidence.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              render={<Link route="new_account.create" />}
              nativeButton={false}
              size="lg"
              className="h-10 px-4"
            >
              Create an account
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

          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            The current app provides account and workspace foundations.
            Investigation workflows are planned in the project roadmap.
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <Badge variant="secondary" className="mb-2 w-fit">
              Planned workflows
            </Badge>
            <CardTitle className="text-lg">
              One evidence trail, before and after deployment
            </CardTitle>
            <CardDescription className="text-sm">
              Release and incident work will share provenance, revision history,
              and timelines.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workflows.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-md bg-muted/50 p-3"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-primary">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="font-medium">{title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}

            <Separator />

            <div className="flex items-start gap-3 px-1">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Facts, hypotheses, and confirmed conclusions stay clearly
                distinguished.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

Home.layout = [MarketingLayout];
