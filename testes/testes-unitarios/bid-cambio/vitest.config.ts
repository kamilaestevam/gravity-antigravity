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
    include: ['testes/testes-unitarios/bid-cambio/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './testes/testes-unitarios/bid-cambio/resultados',
      include: [
        'servicos-global/produto/bid-cambio/server/src/services/*.ts',
        'servicos-global/produto/bid-cambio/client/src/shared/types.ts',
      ],
      thresholds: { lines: 70, branches: 70 },
    },
  },
})
