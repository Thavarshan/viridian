import { expect, test } from '@playwright/test';

test('liveness and readiness endpoints report service state', async ({
  request,
}) => {
  const health = await request.get('/health');
  expect(health.ok()).toBeTruthy();
  expect(await health.json()).toEqual({ status: 'ok' });

  const readiness = await request.get('/ready');
  expect(readiness.ok()).toBeTruthy();
  expect(await readiness.json()).toEqual({ status: 'ready' });
});

test('the versioned API entry point is available', async ({ request }) => {
  const response = await request.get('/v1/');
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toEqual({
    service: 'Viridian Agent API',
    version: 'v1',
  });
});

test('generated OpenAPI documentation describes the service routes', async ({
  request,
}) => {
  const response = await request.get('/openapi.json');
  expect(response.ok()).toBeTruthy();

  const specification = await response.json();
  expect(specification.info.title).toBe('Viridian Agent API');
  expect(specification.paths).toHaveProperty('/health');
  expect(specification.paths).toHaveProperty('/ready');
  expect(specification.paths).toHaveProperty('/v1/');
});
