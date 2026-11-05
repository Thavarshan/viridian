import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import mail from '@adonisjs/mail/services/main';
import testUtils from '@adonisjs/core/services/test_utils';
import { DateTime } from 'luxon';
import User from '#models/user';

const currentPassword = 'correct-horse-battery';
const replacementPassword = 'another-correct-password';

async function createUser() {
  return User.create({
    fullName: 'Ada Lovelace',
    email: `reset-${randomUUID()}@example.com`,
    password: currentPassword,
  });
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

async function insertResetToken(user: User, token: string, expiresAt: Date) {
  await db.table('password_reset_tokens').insert({
    user_id: user.id,
    token_hash: hashToken(token),
    created_at: DateTime.now().toJSDate(),
    expires_at: expiresAt,
  });
}

async function resetTokenCount() {
  const result = await db
    .from('password_reset_tokens')
    .count('* as count')
    .first();

  return Number(result?.count ?? 0);
}

test.group('Password recovery', (group) => {
  group.each.setup(() => testUtils.db().truncate());

  test('renders the reset form with its query token', async ({ client }) => {
    const token = randomBytes(32).toString('hex');
    const response = await client
      .get(`/password/reset?token=${token}`)
      .withInertia();

    response.assertStatus(200);
    response.assertInertiaComponent('auth/reset_password');
    response.assertInertiaPropsContains({ token });
  });

  test('sends a hashed, expiring reset token without exposing it in storage', async ({
    client,
    assert,
  }) => {
    const user = await createUser();
    using fake = mail.fake();

    const response = await client
      .post('/password/forgot')
      .withCsrfToken()
      .header('referer', '/password/forgot')
      .form({ email: user.email });

    response.assertRedirectsTo('/password/forgot');
    fake.messages.assertSent(
      (message) =>
        message.hasTo(user.email) &&
        message.hasSubject('Reset your Wire password'),
    );
    fake.messages.assertSentCount(1);

    const sentMessage = fake.messages.sent()[0];
    assert.isDefined(sentMessage);
    const body = String(sentMessage!.nodeMailerMessage.text);
    const token = /token=([a-f0-9]{64})/.exec(body)?.[1];
    assert.isDefined(token);

    const resetRecord = await db
      .from('password_reset_tokens')
      .where('user_id', user.id)
      .first();
    assert.isDefined(resetRecord);
    assert.equal(resetRecord!.token_hash, hashToken(token!));
    assert.notEqual(resetRecord!.token_hash, token);
    assert.isAbove(
      new Date(resetRecord!.expires_at).getTime(),
      new Date(resetRecord!.created_at).getTime(),
    );
  });

  test('returns the same confirmation for an unknown email without sending mail', async ({
    client,
    assert,
  }) => {
    using fake = mail.fake();

    const response = await client
      .post('/password/forgot')
      .withCsrfToken()
      .header('referer', '/password/forgot')
      .form({ email: `missing-${randomUUID()}@example.com` });

    response.assertRedirectsTo('/password/forgot');
    fake.messages.assertNoneSent();
    assert.equal(await resetTokenCount(), 0);
  });

  test('replaces an earlier token when a new reset is requested', async ({
    client,
    assert,
  }) => {
    const user = await createUser();
    const oldToken = randomBytes(32).toString('hex');
    await insertResetToken(
      user,
      oldToken,
      DateTime.now().plus({ minutes: 60 }).toJSDate(),
    );
    using fake = mail.fake();

    const response = await client
      .post('/password/forgot')
      .withCsrfToken()
      .header('referer', '/password/forgot')
      .form({ email: user.email });

    response.assertRedirectsTo('/password/forgot');
    fake.messages.assertSentCount(1);
    const record = await db
      .from('password_reset_tokens')
      .where('user_id', user.id)
      .first();
    assert.isDefined(record);
    assert.notEqual(record!.token_hash, hashToken(oldToken));
    assert.equal(await resetTokenCount(), 1);
  });

  test('resets the password and consumes the token once', async ({
    client,
    assert,
  }) => {
    const user = await createUser();
    const token = randomBytes(32).toString('hex');
    await insertResetToken(
      user,
      token,
      DateTime.now().plus({ minutes: 60 }).toJSDate(),
    );

    const response = await client.post('/password/reset').withCsrfToken().form({
      token,
      password: replacementPassword,
      passwordConfirmation: replacementPassword,
    });

    response.assertRedirectsTo('/login');

    const updatedUser = await User.findOrFail(user.id);
    assert.isFalse(await updatedUser.verifyPassword(currentPassword));
    assert.isTrue(await updatedUser.verifyPassword(replacementPassword));
    assert.equal(await resetTokenCount(), 0);

    const reuseResponse = await client
      .post('/password/reset')
      .withCsrfToken()
      .header('referer', '/password/reset')
      .form({
        token,
        password: currentPassword,
        passwordConfirmation: currentPassword,
      });

    reuseResponse.assertRedirectsTo('/password/reset');
    assert.isTrue(await updatedUser.verifyPassword(replacementPassword));
  });

  test('rejects expired and unknown reset tokens', async ({
    client,
    assert,
  }) => {
    const user = await createUser();
    const expiredToken = randomBytes(32).toString('hex');
    await insertResetToken(
      user,
      expiredToken,
      DateTime.now().minus({ minutes: 1 }).toJSDate(),
    );

    const expiredResponse = await client
      .post('/password/reset')
      .withCsrfToken()
      .header('referer', '/password/reset')
      .form({
        token: expiredToken,
        password: replacementPassword,
        passwordConfirmation: replacementPassword,
      });

    expiredResponse.assertRedirectsTo('/password/reset');
    assert.isTrue(await user.verifyPassword(currentPassword));

    const unknownResponse = await client
      .post('/password/reset')
      .withCsrfToken()
      .header('referer', '/password/reset')
      .form({
        token: randomBytes(32).toString('hex'),
        password: replacementPassword,
        passwordConfirmation: replacementPassword,
      });

    unknownResponse.assertRedirectsTo('/password/reset');
    assert.isTrue(await user.verifyPassword(currentPassword));
  });

  test('validates reset-token shape and password confirmation', async ({
    client,
  }) => {
    const malformedTokenResponse = await client
      .post('/password/reset')
      .withCsrfToken()
      .header('referer', '/password/reset')
      .json({
        token: 'too-short',
        password: replacementPassword,
        passwordConfirmation: replacementPassword,
      });

    malformedTokenResponse.assertRedirectsTo('/password/reset');

    const mismatchResponse = await client
      .post('/password/reset')
      .withCsrfToken()
      .header('referer', '/password/reset')
      .json({
        token: randomBytes(32).toString('hex'),
        password: replacementPassword,
        passwordConfirmation: currentPassword,
      });

    mismatchResponse.assertRedirectsTo('/password/reset');
  });
});
