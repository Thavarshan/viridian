import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

test('a visitor can sign up, log out, and sign back in', async ({ page }) => {
  const email = `e2e-${randomUUID()}@example.com`;
  const password = 'correct-horse-battery';

  await page.goto('/signup');
  await expect(
    page.getByRole('heading', { name: 'Create your account' }),
  ).toBeVisible();

  await page.getByLabel('Full name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole('heading', { name: 'Your dashboard is ready' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole('heading', { name: 'Your dashboard is ready' }),
  ).toBeVisible();
});
