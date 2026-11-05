import MarketingLayout from '~/layouts/marketing';
import { ArrowLeft } from 'lucide-react';
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

export default function NotFound() {
  return (
    <main className="grid min-h-[calc(100svh-3.5rem)] place-items-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <Badge variant="secondary" className="mb-2 w-fit">
            404
          </Badge>
          <CardTitle className="text-2xl">Page not found</CardTitle>
          <CardDescription className="text-sm">
            That route hasn&apos;t been built yet. Check the URL or return to
            the home page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            render={<Link route="home" />}
            nativeButton={false}
            variant="outline"
          >
            <ArrowLeft />
            Back home
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

NotFound.layout = [MarketingLayout];
