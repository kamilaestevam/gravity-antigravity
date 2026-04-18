import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Exclui E2E — rodado separadamente com vitest.e2e.config.ts
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    exclude: ['tests/**/*.e2e.test.ts'],
    env: {
      NODE_ENV: 'test',
      VITEST: 'true',
    },
  },
});
