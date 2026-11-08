import AuthLayout from '~/layouts/auth';
import { Form, Link } from '@adonisjs/inertia/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPassword() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Forgot your password?
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your account email and we’ll send you a password reset link.
        </p>
      </div>

      <Form route="password.forgot.store">
        {({ errors, processing }) => (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? 'Sending link…' : 'Email me a reset link'}
            </Button>
          </div>
        )}
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Remembered your password?{' '}
        <Button
          render={<Link route="session.create" />}
          nativeButton={false}
          variant="link"
          size="sm"
          className="h-auto p-0 font-medium text-foreground"
        >
          Sign in
        </Button>
      </p>
    </div>
  );
}

ForgotPassword.layout = [AuthLayout];
