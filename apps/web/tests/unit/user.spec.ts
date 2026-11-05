import { test } from '@japa/runner';
import User from '#models/user';
import { DateTime } from 'luxon';

test.group('User initials', () => {
  test('uses the first letters of the full name', ({ assert }) => {
    const user = new User();
    user.fullName = 'Ada Lovelace';
    user.email = 'ada@example.com';

    assert.equal(user.initials, 'AL');
  });

  test('falls back to the email address when the name is missing', ({
    assert,
  }) => {
    const user = new User();
    user.fullName = null;
    user.email = 'ada@example.com';

    assert.equal(user.initials, 'AD');
  });

  test('uses the first two letters of a single name', ({ assert }) => {
    const user = new User();
    user.fullName = 'Ada';
    user.email = 'ada@example.com';

    assert.equal(user.initials, 'AD');
  });

  test('handles extra whitespace in a full name', ({ assert }) => {
    const user = new User();
    user.fullName = '  Ada   Byron   Lovelace  ';
    user.email = 'ada@example.com';

    assert.equal(user.initials, 'AL');
  });

  test('falls back to the email prefix when the full name is blank', ({
    assert,
  }) => {
    const user = new User();
    user.fullName = '   ';
    user.email = 'ada@example.com';

    assert.equal(user.initials, 'AD');
  });
});

test.group('User age', () => {
  test('returns null when date of birth is missing', ({ assert }) => {
    const user = new User();
    user.dateOfBirth = null;

    assert.isNull(user.age);
  });

  test('returns the age after the birthday has passed', ({ assert }) => {
    const user = new User();
    user.dateOfBirth = DateTime.now().minus({ years: 30 });

    assert.equal(user.age, 30);
  });

  test('does not count the upcoming birthday early', ({ assert }) => {
    const user = new User();
    user.dateOfBirth = DateTime.now().minus({ years: 30 }).plus({ days: 1 });

    assert.equal(user.age, 29);
  });

  test('returns null for a future date of birth', ({ assert }) => {
    const user = new User();
    user.dateOfBirth = DateTime.now().plus({ days: 1 });

    assert.isNull(user.age);
  });
});
