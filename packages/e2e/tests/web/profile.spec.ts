import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

test('an authenticated user can update and reload their profile', async ({
  page,
}) => {
  const email = `profile-${randomUUID()}@example.com`;
  const username = `ada_${randomUUID().replaceAll('-', '').slice(0, 8)}`;
  const password = 'correct-horse-battery';

  await page.goto('/signup');
  await page.getByLabel('Full name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/\/settings\/profile$/);
  await expect(
    page.getByRole('heading', { name: 'Profile', exact: true }),
  ).toBeVisible();

  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Phone').fill('+44 20 7946 0958');
  await page.getByLabel('Date of birth').fill('1815-12-10');
  await page.getByLabel('About').fill('Mathematician and writer.');
  await page.getByLabel('Website').fill('https://ada.example.com');
  await page.getByLabel('Job title').fill('Mathematician');
  await page.getByLabel('City').fill('London');
  await page.getByLabel('GitHub').fill('https://github.com/ada');
  await page.getByRole('checkbox', { name: /Make my profile public/ }).check();
  await page.getByRole('button', { name: 'Save profile' }).click();

  await expect(page.getByLabel('Username')).toHaveValue(username);
  await expect(page.getByLabel('Date of birth')).toHaveValue('1815-12-10');

  await page.reload();
  await expect(page.getByLabel('Username')).toHaveValue(username);
  await expect(page.getByLabel('Phone')).toHaveValue('+44 20 7946 0958');
  await expect(page.getByLabel('About')).toHaveValue(
    'Mathematician and writer.',
  );
  await expect(page.getByLabel('Website')).toHaveValue(
    'https://ada.example.com',
  );
  await expect(page.getByLabel('GitHub')).toHaveValue('https://github.com/ada');
  await expect(
    page.getByRole('checkbox', { name: /Make my profile public/ }),
  ).toBeChecked();
});
