import vine from '@vinejs/vine';
import type { Infer } from '@vinejs/vine/types';

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254);
const password = () => vine.string().minLength(8).maxLength(32);
const dateOfBirth = () =>
  vine
    .unionOfTypes([
      vine.literal(''),
      vine.date({ formats: ['YYYY-MM-DD'] }).beforeOrEqual('today'),
    ])
    .nullable()
    .optional();
const optionalString = (maxLength: number) =>
  vine.string().trim().maxLength(maxLength).nullable().optional();
const optionalUrl = (maxLength: number) =>
  vine
    .unionOfTypes([
      vine.literal(''),
      vine.string().trim().url().maxLength(maxLength),
    ])
    .nullable()
    .optional();
const optionalSocialUrl = () =>
  vine
    .unionOfTypes([
      vine.literal(''),
      vine.string().trim().url().maxLength(2048),
    ])
    .optional();

/**
 * Validator to use when performing self-signup.
 *
 * The "passwordConfirmation" field is declared explicitly, so that it is part
 * of the request body type shared with the frontend. Otherwise the signup form
 * has no way to know about the errors reported for this field.
 */
export const signupValidator = vine.create({
  fullName: vine.string().nullable(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
  dateOfBirth: dateOfBirth(),
});

export type SignupData = Infer<typeof signupValidator>;

/**
 * Validate editable profile details. Account verification timestamps and
 * last-login data stay server-managed and are intentionally excluded.
 */
export const userProfileValidator = vine.create({
  username: vine
    .unionOfTypes([
      vine.literal(''),
      vine
        .string()
        .trim()
        .minLength(3)
        .maxLength(32)
        .regex(/^[a-zA-Z0-9_]+$/),
    ])
    .nullable()
    .optional(),
  fullName: optionalString(150),
  phone: optionalString(32),
  avatarUrl: optionalUrl(2048),
  about: optionalString(10000),
  website: optionalUrl(2048),
  socialLinks: vine
    .object({
      bluesky: optionalSocialUrl(),
      facebook: optionalSocialUrl(),
      github: optionalSocialUrl(),
      instagram: optionalSocialUrl(),
      linkedin: optionalSocialUrl(),
      mastodon: optionalSocialUrl(),
      threads: optionalSocialUrl(),
      tiktok: optionalSocialUrl(),
      x: optionalSocialUrl(),
      youtube: optionalSocialUrl(),
    })
    .optional(),
  headline: optionalString(160),
  jobTitle: optionalString(120),
  company: optionalString(160),
  industry: optionalString(120),
  pronouns: optionalString(64),
  addressLine1: optionalString(255),
  addressLine2: optionalString(255),
  city: optionalString(120),
  region: optionalString(120),
  postalCode: optionalString(32),
  country: vine
    .unionOfTypes([
      vine.literal(''),
      vine
        .string()
        .trim()
        .regex(/^[a-zA-Z]{2}$/),
    ])
    .nullable()
    .optional(),
  locale: optionalString(16),
  timeZone: optionalString(64),
  dateOfBirth: dateOfBirth(),
  isProfilePublic: vine.boolean().optional(),
});

export type UserProfileData = Infer<typeof userProfileValidator>;

/**
 * Validator to use before validating user credentials
 * during login
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
});

export type LoginData = Infer<typeof loginValidator>;

export const forgotPasswordValidator = vine.create({
  email: email(),
});

export type ForgotPasswordData = Infer<typeof forgotPasswordValidator>;

export const resetPasswordValidator = vine.create({
  token: vine
    .string()
    .trim()
    .minLength(64)
    .maxLength(64)
    .regex(/^[a-f0-9]+$/),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
});

export type ResetPasswordData = Infer<typeof resetPasswordValidator>;
