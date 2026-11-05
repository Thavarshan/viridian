export const APP_THEMES = ['light', 'dark'] as const;

export type AppTheme = (typeof APP_THEMES)[number];

export const DEFAULT_APP_THEME: AppTheme = 'light';

export function isAppTheme(value: unknown): value is AppTheme {
  return value === 'light' || value === 'dark';
}

export function resolveAppTheme(value: unknown): AppTheme {
  return isAppTheme(value) ? value : DEFAULT_APP_THEME;
}
