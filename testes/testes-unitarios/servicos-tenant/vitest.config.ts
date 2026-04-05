import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../..')

const resolveTsFromJs = {
  name: 'resolve-ts-from-js',
  resolveId(source: string, importer: string | undefined) {
    if (source.endsWith('.js') && importer) {
      const tsSource = source.replace(/\.js$/, '.ts')
      const dir = path.dirname(importer)
      return path.resolve(dir, tsSource)
    }
    return undefined
  },
}

export default defineConfig({
  plugins: [resolveTsFromJs],
  test: {
    environment: 'node',
    globals: true,
    include: ['testes/testes-unitarios/servicos-tenant/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: path.resolve(__dirname, 'resultados'),
      include: [
        'servicos-global/tenant/historico-global/src/**/*.ts',
        'servicos-global/tenant/historico/server/**/*.ts',
      ],
      exclude: ['**/*.d.ts', '**/node_modules/**', '**/index.ts'],
      thresholds: { lines: 70, functions: 70, branches: 60 },
    },
  },
  resolve: {
    alias: {
      '@gravity/shell': path.resolve(root, 'servicos-global/shell/index.ts'),
    },
  },
})
