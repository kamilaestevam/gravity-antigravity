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
  root,
  test: {
    environment: 'node',
    globals: true,
    include: ['testes/testes-unitarios/infra/**/*.test.ts'],
    env: { NODE_ENV: 'test' },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './testes/testes-unitarios/infra/resultados',
      include: ['scripts/migrate-tenants/_shared.ts'],
      // functions: unitários cobrem apenas funções puras (_shared.ts tem helpers de ANSI + async cobertas nos funcionais)
      thresholds: { lines: 70, branches: 70 },
    },
  },
})
