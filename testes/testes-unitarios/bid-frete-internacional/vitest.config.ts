import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../..')

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    root,
    include: ['testes/testes-unitarios/bid-frete-internacional/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './testes/testes-unitarios/bid-frete-internacional/resultados',
      include: [
        'servicos-global/produto/bid-frete-internacional/server/src/services/*.ts',
      ],
      thresholds: { lines: 60, branches: 60 },
    },
  },
})
