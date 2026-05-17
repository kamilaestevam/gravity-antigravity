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
    globals: true,
    include: ['testes/testes-unitarios/cadastros/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['servicos-global/cadastros/server/src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**'],
      reportsDirectory: './testes/testes-unitarios/cadastros/resultados',
      thresholds: { lines: 70, branches: 70 },
    },
  },
})
