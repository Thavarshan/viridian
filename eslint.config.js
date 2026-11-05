import { configApp } from '@adonisjs/eslint-config';
import { react } from '@adonisjs/eslint-config/react';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

const reactConfigs = react.map((config) => ({
  ...config,
  files: ['apps/web/inertia/**/*.{ts,tsx}'],
}));

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/.adonisjs/**',
      '**/build/**',
      '**/dist/**',
      '**/coverage/**',
      '**/tmp/**',
      '**/public/assets/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
  },
  ...configApp(...reactConfigs),
  {
    name: 'Viridian Inertia rules',
    files: ['apps/web/inertia/**/*.{ts,tsx}'],
    rules: {
      '@adonisjs/no-backend-import-in-frontend': ['error'],
      '@adonisjs/prefer-adonisjs-inertia-link': ['error'],
      '@adonisjs/prefer-adonisjs-inertia-form': ['error'],
    },
  },
  prettierRecommended,
];
