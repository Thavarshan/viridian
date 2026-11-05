import AuthLayout from '~/layouts/auth';
import { Form, Link } from '@adonisjs/inertia/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Signup() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Start building with the starter kit.
        </p>
      </div>

      <Form route="new_account.store">
        {({ errors, processing }) => (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Ada Lovelace"
                aria-invalid={Boolean(errors.fullName)}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
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
              <Label htmlFor="dateOfBirth">Date of birth (optional)</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                autoComplete="bday"
                aria-invalid={Boolean(errors.dateOfBirth)}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
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
                placeholder="••••••••"
                aria-invalid={Boolean(errors.passwordConfirmation)}
              />
              {errors.passwordConfirmation && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.passwordConfirmation}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? 'Creating account…' : 'Create account'}
            </Button>
          </div>
        )}
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          route="session.create"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

Signup.layout = [AuthLayout];
