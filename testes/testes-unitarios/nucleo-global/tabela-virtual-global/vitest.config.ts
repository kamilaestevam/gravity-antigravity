import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../../..')

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
  root,
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['testes/testes-unitarios/nucleo-global/tabela-virtual-global/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './testes/testes-unitarios/nucleo-global/tabela-virtual-global/resultados',
      thresholds: { lines: 80, functions: 80, branches: 80 },
    },
  },
})
