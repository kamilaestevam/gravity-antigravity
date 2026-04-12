import { defineConfig } from 'vitest/config'
import path from 'node:path'

const monorepoRoot = path.resolve(__dirname, '../../..')
const rootNodeModules = path.resolve(monorepoRoot, 'node_modules')

/** Resolve imports com extensão .js para os arquivos .ts correspondentes (ESM no Node) */
const resolveTsFromJs = {
  name: 'resolve-ts-from-js',
  resolveId(source: string, importer: string | undefined) {
    if (source.endsWith('.js') && importer) {
      const tsSource = source.replace(/\.js$/, '.ts')
      const dir = path.dirname(importer)
      const resolved = path.resolve(dir, tsSource)
      return resolved
    }
    return undefined
  },
}

export default defineConfig({
  plugins: [resolveTsFromJs],
  test: {
    environment: 'node',
    globals: true,
    include: [
      'testes/testes-funcionais/pedido/**/*.test.ts',
    ],
    env: {
      NODE_ENV: 'test',
      VITE_INTERNAL_KEY: 'test-key',
      INTERNAL_SERVICE_KEY: 'test-key',
    },
    server: {
      deps: {
        fallbackCJS: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: path.resolve(__dirname, 'resultados'),
      include: [
        'produto/pedido/server/src/routes/consolidar.ts',
        'produto/pedido/server/src/routes/transferir.ts',
        'produto/pedido/server/src/shared/bulkSchemas.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@nucleo': path.resolve(monorepoRoot, 'nucleo-global'),
      '@tenant': path.resolve(monorepoRoot, 'servicos-global/tenant'),
      '@produto': path.resolve(monorepoRoot, 'produto'),
    },
  },
})
