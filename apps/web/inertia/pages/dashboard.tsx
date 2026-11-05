import Page from '~/components/page';
import { LayoutGrid } from 'lucide-react';
import AppLayout from '~/layouts/app';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function Dashboard() {
  return (
    <Page title="Dashboard" hideTitle>
      <Card className="mx-auto w-full max-w-2xl">
        <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center sm:px-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <LayoutGrid className="size-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight">
              Your dashboard is ready
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              It&apos;s empty on purpose. Add your first route and component to
              begin shaping this space.
            </p>
          </div>
          <Badge variant="secondary" className="font-mono font-normal">
            inertia/pages/dashboard.tsx
          </Badge>
        </CardContent>
      </Card>
    </Page>
  );
}

Dashboard.layout = [AppLayout];
