import Page from '~/components/page';
import { ClipboardCheck, GitBranch, Sprout } from 'lucide-react';
import AppLayout from '~/layouts/app';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Dashboard() {
  return (
    <Page
      title="Workspace"
      description="Your starting point for release and incident intelligence."
    >
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <Badge variant="outline" className="mb-2 w-fit gap-2">
            <Sprout className="size-3.5" />
            Viridian workspace
          </Badge>
          <CardTitle className="text-xl">
            Investigation workflows are planned
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm">
            The current app includes account and profile settings. Release and
            incident investigations will be added as the shared evidence
            foundation is built.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <Card size="sm" className="bg-muted/30">
              <CardHeader>
                <Badge variant="secondary" className="mb-1 w-fit">
                  Planned
                </Badge>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardCheck className="size-4 text-primary" />
                  Release Intelligence
                </CardTitle>
                <CardDescription className="text-sm">
                  Assess changes, requirements, tests, and CI evidence for a
                  target revision.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card size="sm" className="bg-muted/30">
              <CardHeader>
                <Badge variant="secondary" className="mb-1 w-fit">
                  Planned
                </Badge>
                <CardTitle className="flex items-center gap-2 text-base">
                  <GitBranch className="size-4 text-primary" />
                  Incident Intelligence
                </CardTitle>
                <CardDescription className="text-sm">
                  Correlate sanitized incident evidence with deployments and
                  code changes.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </CardContent>
      </Card>
    </Page>
  );
}

Dashboard.layout = [AppLayout];
