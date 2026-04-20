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
    include: ['testes/testes-funcionais/infra/**/*.test.ts'],
    env: { NODE_ENV: 'test' },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './testes/testes-funcionais/infra/resultados',
      include: ['scripts/migrate-tenants/_shared.ts'],
      // functions: helpers ANSI (b, red, green…) distorcem o metric — lines + branches são suficientes
      thresholds: { lines: 70, branches: 70 },
    },
  },
})
