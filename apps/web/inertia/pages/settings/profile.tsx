import Page from '~/components/page';
import Section from '~/components/section';
import AppLayout from '~/layouts/app';
import SettingsLayout from '~/layouts/settings';
import { Form } from '@adonisjs/inertia/react';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { HTMLInputTypeAttribute, ReactNode } from 'react';

type ProfileInputProps = {
  name: string;
  label: string;
  defaultValue?: string;
  type?: HTMLInputTypeAttribute;
  autoComplete?: string;
  placeholder?: string;
  error?: string;
};

function ProfileInput({
  name,
  label,
  defaultValue = '',
  type = 'text',
  autoComplete,
  placeholder,
  error,
}: ProfileInputProps) {
  const id = name.replaceAll('.', '-');

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
      />
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function ProfileTextarea({
  name,
  label,
  defaultValue = '',
  placeholder,
  error,
}: Omit<ProfileInputProps, 'type' | 'autoComplete'>) {
  const id = name.replaceAll('.', '-');

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={5}
        aria-invalid={Boolean(error)}
        className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20"
      />
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

const SOCIAL_NETWORKS: ReadonlyArray<{
  platform:
    | 'bluesky'
    | 'facebook'
    | 'github'
    | 'instagram'
    | 'linkedin'
    | 'mastodon'
    | 'threads'
    | 'tiktok'
    | 'x'
    | 'youtube';
  label: string;
}> = [
  { platform: 'bluesky', label: 'Bluesky' },
  { platform: 'facebook', label: 'Facebook' },
  { platform: 'github', label: 'GitHub' },
  { platform: 'instagram', label: 'Instagram' },
  { platform: 'linkedin', label: 'LinkedIn' },
  { platform: 'mastodon', label: 'Mastodon' },
  { platform: 'threads', label: 'Threads' },
  { platform: 'tiktok', label: 'TikTok' },
  { platform: 'x', label: 'X' },
  { platform: 'youtube', label: 'YouTube' },
];

export default function ProfileSettings() {
  const user = usePage().props.user;
  const dateOfBirth =
    typeof user?.dateOfBirth === 'string' ? user.dateOfBirth.slice(0, 10) : '';

  return (
    <Page
      title="Profile"
      description="Update your public details, work information, and contact links."
    >
      <Form
        route="profile.update"
        method="put"
        transform={(data) => ({
          ...data,
          isProfilePublic: Boolean(data.isProfilePublic),
        })}
      >
        {({ errors, processing }) => (
          <div className="space-y-8">
            <Section
              title="Account"
              description="Your sign-in email is read-only here."
            >
              <FieldGrid>
                <div className="space-y-2">
                  <Label htmlFor="account-email">Email</Label>
                  <Input
                    id="account-email"
                    type="email"
                    value={user?.email ?? ''}
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    {user?.emailVerifiedAt
                      ? 'Your email address is verified.'
                      : 'Your email address is not verified yet.'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    defaultValue={user?.username ?? ''}
                    autoComplete="username"
                    aria-invalid={Boolean(errors.username)}
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.username}
                    </p>
                  )}
                </div>
              </FieldGrid>
              {user?.age !== null && user?.age !== undefined && (
                <p className="text-sm text-muted-foreground">
                  Age:{' '}
                  <span className="font-medium text-foreground">
                    {user.age}
                  </span>
                </p>
              )}
            </Section>

            <Section title="Personal details">
              <FieldGrid>
                <ProfileInput
                  name="fullName"
                  label="Full name"
                  defaultValue={user?.fullName ?? ''}
                  autoComplete="name"
                  error={errors.fullName}
                />
                <ProfileInput
                  name="pronouns"
                  label="Pronouns"
                  defaultValue={user?.pronouns ?? ''}
                  placeholder="e.g. she/her"
                  error={errors.pronouns}
                />
                <ProfileInput
                  name="phone"
                  label="Phone"
                  type="tel"
                  defaultValue={user?.phone ?? ''}
                  autoComplete="tel"
                  error={errors.phone}
                />
                <ProfileInput
                  name="dateOfBirth"
                  label="Date of birth"
                  type="date"
                  defaultValue={dateOfBirth}
                  error={errors.dateOfBirth}
                />
                <ProfileInput
                  name="avatarUrl"
                  label="Avatar URL"
                  type="url"
                  defaultValue={user?.avatarUrl ?? ''}
                  placeholder="https://example.com/avatar.png"
                  error={errors.avatarUrl}
                />
                <ProfileInput
                  name="website"
                  label="Website"
                  type="url"
                  defaultValue={user?.website ?? ''}
                  placeholder="https://example.com"
                  error={errors.website}
                />
              </FieldGrid>
              <ProfileTextarea
                name="about"
                label="About"
                defaultValue={user?.about ?? ''}
                placeholder="A short introduction about you"
                error={errors.about}
              />
            </Section>

            <Section title="Work">
              <FieldGrid>
                <ProfileInput
                  name="headline"
                  label="Headline"
                  defaultValue={user?.headline ?? ''}
                  placeholder="Product designer and maker"
                  error={errors.headline}
                />
                <ProfileInput
                  name="jobTitle"
                  label="Job title"
                  defaultValue={user?.jobTitle ?? ''}
                  error={errors.jobTitle}
                />
                <ProfileInput
                  name="company"
                  label="Company"
                  defaultValue={user?.company ?? ''}
                  error={errors.company}
                />
                <ProfileInput
                  name="industry"
                  label="Industry"
                  defaultValue={user?.industry ?? ''}
                  error={errors.industry}
                />
              </FieldGrid>
            </Section>

            <Section title="Location and preferences">
              <FieldGrid>
                <ProfileInput
                  name="addressLine1"
                  label="Address line 1"
                  defaultValue={user?.addressLine1 ?? ''}
                  autoComplete="address-line1"
                  error={errors.addressLine1}
                />
                <ProfileInput
                  name="addressLine2"
                  label="Address line 2"
                  defaultValue={user?.addressLine2 ?? ''}
                  autoComplete="address-line2"
                  error={errors.addressLine2}
                />
                <ProfileInput
                  name="city"
                  label="City"
                  defaultValue={user?.city ?? ''}
                  autoComplete="address-level2"
                  error={errors.city}
                />
                <ProfileInput
                  name="region"
                  label="State / region"
                  defaultValue={user?.region ?? ''}
                  autoComplete="address-level1"
                  error={errors.region}
                />
                <ProfileInput
                  name="postalCode"
                  label="Postal code"
                  defaultValue={user?.postalCode ?? ''}
                  autoComplete="postal-code"
                  error={errors.postalCode}
                />
                <ProfileInput
                  name="country"
                  label="Country code"
                  defaultValue={user?.country ?? ''}
                  placeholder="LK"
                  autoComplete="country"
                  error={errors.country}
                />
                <ProfileInput
                  name="locale"
                  label="Locale"
                  defaultValue={user?.locale ?? ''}
                  placeholder="en-LK"
                  error={errors.locale}
                />
                <ProfileInput
                  name="timeZone"
                  label="Time zone"
                  defaultValue={user?.timeZone ?? ''}
                  placeholder="Asia/Colombo"
                  error={errors.timeZone}
                />
              </FieldGrid>
            </Section>

            <Section title="Social links">
              <FieldGrid>
                {SOCIAL_NETWORKS.map(({ platform, label }) => (
                  <ProfileInput
                    key={platform}
                    name={`socialLinks.${platform}`}
                    label={label}
                    type="url"
                    defaultValue={user?.socialLinks?.[platform] ?? ''}
                    placeholder={`https://${platform}.com/username`}
                    error={errors[`socialLinks.${platform}`]}
                  />
                ))}
              </FieldGrid>
            </Section>

            <Section title="Privacy">
              <label className="flex items-start gap-3 rounded-md border p-4">
                <input
                  name="isProfilePublic"
                  type="checkbox"
                  value="true"
                  defaultChecked={user?.isProfilePublic ?? false}
                  className="mt-0.5 size-4 accent-primary"
                  aria-invalid={Boolean(errors.isProfilePublic)}
                />
                <span className="space-y-1">
                  <span className="block text-sm font-medium">
                    Make my profile public
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    Allow other people to view your profile details.
                  </span>
                  {errors.isProfilePublic && (
                    <span
                      className="block text-sm text-destructive"
                      role="alert"
                    >
                      {errors.isProfilePublic}
                    </span>
                  )}
                </span>
              </label>
            </Section>

            <div className="flex justify-end border-t pt-6">
              <Button type="submit" disabled={processing}>
                {processing ? 'Saving profile…' : 'Save profile'}
              </Button>
            </div>
          </div>
        )}
      </Form>
    </Page>
  );
}

ProfileSettings.layout = [AppLayout, SettingsLayout];
