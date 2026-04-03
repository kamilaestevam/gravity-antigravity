import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['testes/historico-global/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      reportsDirectory: './testes/historico-global/resultados',
      thresholds: { lines: 70, functions: 70, branches: 70, statements: 70 },
      include: [
        'servicos-global/tenant/historico-global/server/**/*.ts',
      ],
      exclude: [
        'servicos-global/tenant/historico-global/server/index.ts',
        '**/*.d.ts',
        '**/node_modules/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@gravity/shell': path.resolve(root, 'servicos-global/shell/index.ts'),
    },
  },
})
