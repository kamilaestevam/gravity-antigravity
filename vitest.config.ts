import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./testes/testes-unitarios/setup.ts'],
    environmentMatchGlobs: [
      // Testes de middleware e serviços Node.js puro devem rodar em ambiente node
      ['testes/testes-unitarios/middleware/**', 'node'],
      ['testes/testes-unitarios/servicos-tenant/**', 'node'],
    ],
    env: {
      CLERK_SECRET_KEY: 'test-clerk-secret',
      RESEND_API_KEY: 'test-resend-key',
      TENANT_DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/tenant_test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './testes/testes-unitarios/resultados',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
      },
      include: [
        'nucleo-global/**/src/**/*.ts',
        'nucleo-global/**/src/**/*.tsx',
      ],
      exclude: [
        'nucleo-global/**/src/index.ts',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@nucleo/tabela-global': path.resolve(__dirname, 'nucleo-global/tabela-global/src/index.ts'),
      '@nucleo/modal-global': path.resolve(__dirname, 'nucleo-global/modal-global/src/index.ts'),
      '@nucleo/select': path.resolve(__dirname, 'nucleo-global/select/src/index.ts'),
      '@nucleo/utils': path.resolve(__dirname, 'nucleo-global/utils/src/index.ts'),
      '@gravity/shell': path.resolve(__dirname, 'servicos-global/shell/index.ts'),
      '@tenant/middleware': path.resolve(__dirname, 'servicos-global/tenant/middleware'),
      '@tenant': path.resolve(__dirname, 'servicos-global/tenant'),
    },
  },
})
