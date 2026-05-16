import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../../..')

export default defineConfig({
  root,
  test: {
    globals: true,
    environment: 'node',
    include: ['testes/testes-unitarios/nucleo-global/logo-produtos/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './testes/testes-unitarios/nucleo-global/logo-produtos/resultados',
      thresholds: { lines: 80, functions: 80, branches: 80 },
    },
  },
})
