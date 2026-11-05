import MarketingLayout from '~/layouts/marketing';
import { CircleAlert, RotateCcw } from 'lucide-react';
import { Link } from '@adonisjs/inertia/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ServerError() {
  return (
    <main className="grid min-h-[calc(100svh-3.5rem)] place-items-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              The server encountered an unexpected error. Try again in a moment.
            </AlertDescription>
          </Alert>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RotateCcw />
            Try again
          </Button>
          <Button
            render={<Link route="home" />}
            nativeButton={false}
            variant="ghost"
          >
            Go home
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

ServerError.layout = [MarketingLayout];
