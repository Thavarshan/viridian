import AuthLayout from '~/layouts/auth';
import { Form, Link } from '@adonisjs/inertia/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPassword({ token }: { token: string }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Choose a new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Use at least 8 characters. The reset link expires after one hour.
        </p>
      </div>

      <Form route="password.reset.store">
        {({ errors, processing }) => (
          <div className="space-y-4">
            <input type="hidden" name="token" value={token} />

            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                aria-invalid={Boolean(errors.password)}
              />
              {errors.password && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">Confirm password</Label>
              <Input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                required
                aria-invalid={Boolean(errors.passwordConfirmation)}
              />
              {errors.passwordConfirmation && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.passwordConfirmation}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? 'Resetting password…' : 'Reset password'}
            </Button>
          </div>
        )}
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        <Button
          render={<Link route="session.create" />}
          nativeButton={false}
          variant="link"
          size="sm"
          className="h-auto p-0 font-medium text-foreground"
        >
          Back to sign in
        </Button>
      </p>
    </div>
  );
}

ResetPassword.layout = [AuthLayout];
