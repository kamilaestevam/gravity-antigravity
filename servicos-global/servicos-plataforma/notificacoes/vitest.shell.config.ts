// Config para testes unitários do pacote shell (entityLinkFactory, etc.)
// Roda a partir do notificacoes para usar vitest 1.6.1 local (compatível com vite 5.x).

import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../..')

const resolveTsFromJs = {
  name: 'resolve-ts-from-js',
  resolveId(source: string, importer: string | undefined) {
    if (source.endsWith('.js') && importer) {
      return path.resolve(path.dirname(importer), source.replace(/\.js$/, '.ts'))
    }
  },
}

export default defineConfig({
  plugins: [resolveTsFromJs],
  test: {
    globals: true,
    environment: 'node',
    include: [root.replace(/\\/g, '/') + '/testes/testes-unitarios/nucleo-global/shell/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      reportsDirectory: path.join(root, 'testes/testes-unitarios/nucleo-global/shell/resultados'),
      thresholds: { lines: 80, functions: 80, branches: 80 },
    },
  },
})
