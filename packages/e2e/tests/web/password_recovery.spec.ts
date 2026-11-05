import { randomBytes, randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

test('a visitor can request a reset link without exposing account existence', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByRole('link', { name: 'Forgot password?' }).click();

  await expect(page).toHaveURL(/\/password\/forgot$/);
  await expect(
    page.getByRole('heading', { name: 'Forgot your password?' }),
  ).toBeVisible();

  await page.getByLabel('Email').fill(`missing-${randomUUID()}@example.com`);
  await page.getByRole('button', { name: 'Email me a reset link' }).click();

  await expect(
    page.getByText(
      'If that email belongs to an account, a password reset link is on its way.',
    ),
  ).toBeVisible();
});

test('an invalid reset link is rejected after submitting the new password', async ({
  page,
}) => {
  const token = randomBytes(32).toString('hex');
  const password = 'another-correct-password';

  await page.goto(`/password/reset?token=${token}`);
  await expect(
    page.getByRole('heading', { name: 'Choose a new password' }),
  ).toBeVisible();

  await page.getByLabel('New password').fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await page.getByRole('button', { name: 'Reset password' }).click();

  await expect(
    page.getByText('This password reset link is invalid or expired.'),
  ).toBeVisible();
});
