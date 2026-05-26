import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../..')

export default defineConfig({
  root,
  test: {
    globals: true,
    environment: 'node',
    include: ['testes/testes-funcionais/login/**/*.test.ts'],
    env: { NODE_ENV: 'test' },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './testes/testes-funcionais/login/resultados',
      thresholds: { lines: 70, functions: 70, branches: 70 },
    },
  },
})
