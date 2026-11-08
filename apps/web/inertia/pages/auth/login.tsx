import AuthLayout from '~/layouts/auth';
import { Form, Link } from '@adonisjs/inertia/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your Viridian account.
        </p>
      </div>

      <Form route="session.store">
        {({ errors, processing }) => (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@example.com"
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  route="password.forgot.create"
                  className="text-xs font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={Boolean(errors.password)}
              />
              {errors.password && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? 'Signing in…' : 'Sign in'}
            </Button>
          </div>
        )}
      </Form>

      <p className="text-center text-xs text-muted-foreground">
        New here?{' '}
        <Button
          render={<Link route="new_account.create" />}
          nativeButton={false}
          variant="link"
          size="sm"
          className="h-auto p-0 font-medium text-foreground"
        >
          Create an account
        </Button>
      </p>
    </div>
  );
}

Login.layout = [AuthLayout];
