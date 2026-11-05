import { test } from '@japa/runner';
import { resolveAppTheme } from '#types/theme';

test.group('Application theme', () => {
  test('accepts the supported dark theme', ({ assert }) => {
    assert.equal(resolveAppTheme('dark'), 'dark');
  });

  test('falls back to light for unsupported values', ({ assert }) => {
    assert.equal(resolveAppTheme('blue'), 'light');
    assert.equal(resolveAppTheme(undefined), 'light');
  });
});
