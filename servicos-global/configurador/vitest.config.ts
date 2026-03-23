// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./server/__tests__/setup.ts'],
    // Env vars disponíveis antes de qualquer import de módulo
    env: {
      NODE_ENV: 'test',
      PORT: '8005',
      STRIPE_SECRET_KEY: 'sk_test_dummy_vitest',
      CLERK_SECRET_KEY: 'sk_test_dummy_vitest',
      INTERNAL_SERVICE_KEY: 'test-internal-key',
      CLERK_WEBHOOK_SECRET: 'whsec_dummy_vitest',
      CONFIGURADOR_DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
      },
    },
  },
})
