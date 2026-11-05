import { randomUUID } from 'node:crypto';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';
import User from '#models/user';
import testUtils from '@adonisjs/core/services/test_utils';

const password = 'correct-horse-battery';

async function createUser(username?: string | null) {
  return User.create({
    fullName: 'Ada Lovelace',
    email: `profile-${randomUUID()}@example.com`,
    password,
    username: username ?? null,
  });
}

test.group('Profile settings', (group) => {
  group.each.setup(() => testUtils.db().truncate());

  test('requires authentication to view profile settings', async ({
    client,
  }) => {
    const response = await client.get('/settings/profile');

    response.assertRedirectsTo('/login');
  });

  test('renders the current user profile in Inertia props', async ({
    client,
  }) => {
    const user = await createUser('ada');

    const response = await client
      .get('/settings/profile')
      .loginAs(user)
      .withInertia();

    response.assertStatus(200);
    response.assertInertiaComponent('settings/profile');
    response.assertInertiaPropsContains({
      user: {
        id: user.id,
        email: user.email,
        username: 'ada',
        fullName: 'Ada Lovelace',
        initials: 'AL',
        socialLinks: {},
        isProfilePublic: false,
      },
    });
  });

  test('updates all editable profile attributes', async ({
    client,
    assert,
  }) => {
    const user = await createUser();
    const socialLinks = {
      bluesky: 'https://bsky.app/profile/ada.example',
      facebook: 'https://facebook.com/ada',
      github: 'https://github.com/ada',
      instagram: 'https://instagram.com/ada',
      linkedin: 'https://linkedin.com/in/ada',
      mastodon: 'https://mastodon.social/@ada',
      threads: 'https://threads.net/@ada',
      tiktok: 'https://tiktok.com/@ada',
      x: 'https://x.com/ada',
      youtube: 'https://youtube.com/@ada',
    };

    const response = await client
      .put('/settings/profile')
      .loginAs(user)
      .withCsrfToken()
      .header('referer', '/settings/profile')
      .json({
        username: 'ada_lovelace',
        fullName: 'Ada Byron Lovelace',
        phone: '+44 20 7946 0958',
        avatarUrl: 'https://example.com/ada.png',
        about: 'Mathematician and writer.',
        website: 'https://ada.example.com',
        socialLinks,
        headline: 'Mathematician and computing pioneer',
        jobTitle: 'Mathematician',
        company: 'Analytical Engine',
        industry: 'Technology',
        pronouns: 'she/her',
        addressLine1: '12 St James Square',
        addressLine2: 'Apartment 4',
        city: 'London',
        region: 'Greater London',
        postalCode: 'SW1Y 4LB',
        country: 'GB',
        locale: 'en-GB',
        timeZone: 'Europe/London',
        dateOfBirth: '1815-12-10',
        isProfilePublic: true,
        email: 'changed@example.com',
        password: 'must-not-be-updated',
        emailVerifiedAt: '2025-01-01T00:00:00Z',
      });

    response.assertRedirectsTo('/settings/profile');

    const updatedUser = await User.findOrFail(user.id);
    assert.equal(updatedUser.username, 'ada_lovelace');
    assert.equal(updatedUser.fullName, 'Ada Byron Lovelace');
    assert.equal(updatedUser.phone, '+44 20 7946 0958');
    assert.equal(updatedUser.avatarUrl, 'https://example.com/ada.png');
    assert.equal(updatedUser.about, 'Mathematician and writer.');
    assert.equal(updatedUser.website, 'https://ada.example.com');
    assert.deepEqual(updatedUser.socialLinks, socialLinks);
    assert.equal(updatedUser.headline, 'Mathematician and computing pioneer');
    assert.equal(updatedUser.jobTitle, 'Mathematician');
    assert.equal(updatedUser.company, 'Analytical Engine');
    assert.equal(updatedUser.industry, 'Technology');
    assert.equal(updatedUser.pronouns, 'she/her');
    assert.equal(updatedUser.addressLine1, '12 St James Square');
    assert.equal(updatedUser.addressLine2, 'Apartment 4');
    assert.equal(updatedUser.city, 'London');
    assert.equal(updatedUser.region, 'Greater London');
    assert.equal(updatedUser.postalCode, 'SW1Y 4LB');
    assert.equal(updatedUser.country, 'GB');
    assert.equal(updatedUser.locale, 'en-GB');
    assert.equal(updatedUser.timeZone, 'Europe/London');
    assert.equal(updatedUser.dateOfBirth?.toISODate(), '1815-12-10');
    assert.isTrue(updatedUser.isProfilePublic);
    assert.equal(updatedUser.email, user.email);
    assert.isNull(updatedUser.emailVerifiedAt);
    assert.isTrue(await updatedUser.verifyPassword(password));
  });

  test('clears optional values and persists a false public-profile setting', async ({
    client,
    assert,
  }) => {
    const user = await createUser('ada');
    user.isProfilePublic = true;
    user.dateOfBirth = DateTime.fromISO('1815-12-10');
    await user.save();

    const response = await client
      .put('/settings/profile')
      .loginAs(user)
      .withCsrfToken()
      .header('referer', '/settings/profile')
      .json({
        username: '',
        avatarUrl: '',
        website: '',
        country: '',
        dateOfBirth: '',
        socialLinks: {},
        isProfilePublic: false,
      });

    response.assertRedirectsTo('/settings/profile');

    const updatedUser = await User.findOrFail(user.id);
    assert.isNull(updatedUser.username);
    assert.isNull(updatedUser.avatarUrl);
    assert.isNull(updatedUser.website);
    assert.isNull(updatedUser.country);
    assert.isNull(updatedUser.dateOfBirth);
    assert.deepEqual(updatedUser.socialLinks, {});
    assert.isFalse(updatedUser.isProfilePublic);
  });

  test('rejects invalid profile URLs, country codes, and future birth dates', async ({
    client,
    assert,
  }) => {
    const user = await createUser();
    const response = await client
      .put('/settings/profile')
      .loginAs(user)
      .withCsrfToken()
      .header('referer', '/settings/profile')
      .json({
        website: 'not-a-url',
        country: 'Great Britain',
        dateOfBirth: '2999-01-01',
      });

    response.assertRedirectsTo('/settings/profile');
    const unchangedUser = await User.findOrFail(user.id);
    assert.isNull(unchangedUser.website);
    assert.isNull(unchangedUser.country);
    assert.isNull(unchangedUser.dateOfBirth);
  });

  test('does not allow a username already used by another user', async ({
    client,
    assert,
  }) => {
    const existingUser = await createUser('ada');
    const editingUser = await createUser('grace');

    const response = await client
      .put('/settings/profile')
      .loginAs(editingUser)
      .withCsrfToken()
      .header('referer', '/settings/profile')
      .json({ username: existingUser.username });

    response.assertRedirectsTo('/settings/profile');
    const unchangedUser = await User.findOrFail(editingUser.id);
    assert.equal(unchangedUser.username, 'grace');
  });
});
