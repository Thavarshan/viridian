import { randomUUID } from 'node:crypto';
import { test } from '@japa/runner';
import User from '#models/user';
import testUtils from '@adonisjs/core/services/test_utils';

const password = 'correct-horse-battery';

test.group('Authentication', (group) => {
  group.each.setup(() => testUtils.db().truncate());

  test('renders the home and guest authentication pages', async ({
    client,
  }) => {
    const pages = [
      { url: '/', component: 'home' },
      { url: '/signup', component: 'auth/signup' },
      { url: '/login', component: 'auth/login' },
      { url: '/password/forgot', component: 'auth/forgot_password' },
      {
        url: `/password/reset?token=${'a'.repeat(64)}`,
        component: 'auth/reset_password',
      },
    ];

    for (const page of pages) {
      const response = await client.get(page.url).withInertia();

      response.assertStatus(200);
      response.assertInertiaComponent(page.component);
    }
  });

  test('redirects unauthenticated visitors from protected pages', async ({
    client,
  }) => {
    const dashboard = await client.get('/dashboard');
    const profile = await client.get('/settings/profile');

    dashboard.assertRedirectsTo('/login');
    profile.assertRedirectsTo('/login');
  });

  test('registers a user, hashes the password, and accepts date of birth', async ({
    client,
    assert,
  }) => {
    const email = `signup-${randomUUID()}@example.com`;
    const response = await client.post('/signup').withCsrfToken().form({
      fullName: 'Ada Lovelace',
      email,
      dateOfBirth: '1815-12-10',
      password,
      passwordConfirmation: password,
    });

    response.assertRedirectsTo('/dashboard');

    const user = await User.findByOrFail('email', email);
    assert.equal(user.fullName, 'Ada Lovelace');
    assert.equal(user.dateOfBirth?.toISODate(), '1815-12-10');
    assert.isTrue(await user.verifyPassword(password));
    assert.notEqual(user.password, password);
  });

  test('accepts a blank optional date of birth during signup', async ({
    client,
    assert,
  }) => {
    const email = `signup-${randomUUID()}@example.com`;
    const response = await client.post('/signup').withCsrfToken().form({
      fullName: 'Grace Hopper',
      email,
      dateOfBirth: '',
      password,
      passwordConfirmation: password,
    });

    response.assertRedirectsTo('/dashboard');

    const user = await User.findByOrFail('email', email);
    assert.isNull(user.dateOfBirth);
  });

  test('rejects a signup with mismatched password confirmation', async ({
    client,
    assert,
  }) => {
    const response = await client
      .post('/signup')
      .withCsrfToken()
      .json({
        fullName: 'Ada Lovelace',
        email: `signup-${randomUUID()}@example.com`,
        password,
        passwordConfirmation: 'a-different-password',
      })
      .header('referer', '/signup');

    response.assertRedirectsTo('/signup');
    assert.lengthOf(await User.query(), 0);
  });

  test('rejects duplicate signup email addresses', async ({
    client,
    assert,
  }) => {
    const email = `duplicate-${randomUUID()}@example.com`;
    await User.create({ email, password, fullName: 'Ada Lovelace' });

    const response = await client
      .post('/signup')
      .withCsrfToken()
      .header('referer', '/signup')
      .json({
        fullName: 'Another Ada',
        email,
        password,
        passwordConfirmation: password,
      });

    response.assertRedirectsTo('/signup');
    assert.lengthOf(await User.query().where('email', email), 1);
  });

  test('authenticates a user and records the last login', async ({
    client,
    assert,
  }) => {
    const user = await User.create({
      fullName: 'Ada Lovelace',
      email: `login-${randomUUID()}@example.com`,
      password,
    });

    const response = await client.post('/login').withCsrfToken().form({
      email: user.email,
      password,
    });

    response.assertRedirectsTo('/dashboard');

    await user.refresh();
    assert.isNotNull(user.lastLoginAt);
  });

  test('rejects invalid login credentials', async ({ client, assert }) => {
    const user = await User.create({
      email: `login-${randomUUID()}@example.com`,
      password,
    });

    const response = await client
      .post('/login')
      .withCsrfToken()
      .header('referer', '/login')
      .json({
        email: user.email,
        password: 'not-the-password',
      });

    response.assertRedirectsTo('/login');
    await user.refresh();
    assert.isNull(user.lastLoginAt);
  });

  test('logs out an authenticated user', async ({ client }) => {
    const user = await User.create({
      email: `logout-${randomUUID()}@example.com`,
      password,
    });

    const response = await client
      .post('/logout')
      .loginAs(user)
      .withCsrfToken()
      .form({});

    response.assertRedirectsTo('/login');
  });

  test('redirects authenticated users away from guest authentication pages', async ({
    client,
  }) => {
    const user = await User.create({
      email: `guest-${randomUUID()}@example.com`,
      password,
    });

    const login = await client.get('/login').loginAs(user);
    const forgotPassword = await client.get('/password/forgot').loginAs(user);

    login.assertRedirectsTo('/');
    forgotPassword.assertRedirectsTo('/');
  });

  test('shares the transformed authenticated user without its password', async ({
    client,
    assert,
  }) => {
    const user = await User.create({
      fullName: 'Ada Lovelace',
      email: `shared-${randomUUID()}@example.com`,
      password,
    });

    const response = await client.get('/dashboard').loginAs(user).withInertia();

    response.assertInertiaComponent('dashboard');
    response.assertInertiaPropsContains({
      user: {
        id: user.id,
        email: user.email,
        fullName: 'Ada Lovelace',
        initials: 'AL',
        age: null,
      },
    });

    const props = response.body().props as {
      user: Record<string, unknown>;
    };
    assert.notProperty(props.user, 'password');
  });

  test('falls back to light theme for an invalid theme cookie', async ({
    client,
  }) => {
    const response = await client
      .get('/')
      .cookie('app_theme', 'blue')
      .withInertia();

    response.assertInertiaPropsContains({ preferences: { theme: 'light' } });
  });
});
