import { defineConfig } from 'vitest/config';

/**
 * Configuração exclusiva para testes E2E.
 *
 * Requer DATABASE_URL apontando para um PostgreSQL real.
 * Os testes fazem skip automático se a variável estiver ausente.
 *
 * Uso:
 *   DATABASE_URL=postgresql://... npx vitest run --config vitest.e2e.config.ts
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.e2e.test.ts'],
    // E2E pode ser lento — timeout generoso
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Sequencial: cada suite cria/dropa schemas no mesmo banco
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
    env: {
      NODE_ENV: 'test',
      VITEST: 'true',
    },
  },
});
