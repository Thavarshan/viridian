import { defineConfig, devices } from '@playwright/test';

const webBaseURL = 'http://127.0.0.1:3334';
const agentApiBaseURL = 'http://127.0.0.1:8000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',

  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'web-chromium',
      testDir: './tests/web',
      use: { ...devices['Desktop Chrome'], baseURL: webBaseURL },
    },
    {
      name: 'agent-api',
      testDir: './tests/agent-api',
      use: { baseURL: agentApiBaseURL },
    },
  ],

  webServer: [
    {
      command:
        'node ace migration:run --no-schema-generate && node ace serve --hmr',
      cwd: '../../apps/web',
      url: `${webBaseURL}/`,
      timeout: 120_000,
      reuseExistingServer: false,
      gracefulShutdown: { signal: 'SIGINT', timeout: 5_000 },
      env: {
        NODE_ENV: 'test',
        HOST: '127.0.0.1',
        PORT: '3334',
        APP_URL: webBaseURL,
        DB_DATABASE: 'wire_e2e',
      },
    },
    {
      command: 'uv run --locked agent-api',
      cwd: '../../apps/agent-api',
      url: `${agentApiBaseURL}/ready`,
      timeout: 60_000,
      reuseExistingServer: !process.env.CI,
      gracefulShutdown: { signal: 'SIGINT', timeout: 5_000 },
      env: {
        AGENT_HOST: '127.0.0.1',
        AGENT_PORT: '8000',
      },
    },
  ],
});
