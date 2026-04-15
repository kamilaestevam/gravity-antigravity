import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
    include: ['testes/testes-unitarios/configurador/**/*.test.ts'],
    setupFiles: [path.resolve(__dirname, '../setup.ts')],
    env: {
      NODE_ENV: 'test',
      PORT: '8005',
      STRIPE_SECRET_KEY: 'sk_test_dummy_vitest',
      CLERK_SECRET_KEY: 'sk_test_dummy_vitest',
      INTERNAL_SERVICE_KEY: 'test-internal-key',
      CLERK_WEBHOOK_SECRET: 'whsec_dummy_vitest',
      CONFIGURADOR_DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: path.resolve(__dirname, 'resultados'),
      include: [
        'servicos-global/configurador/server/routes/admin.ts',
        'servicos-global/configurador/server/middleware/requireAuth.ts',
        'servicos-global/configurador/server/middleware/requireGravityAdmin.ts',
      ],
      exclude: ['**/*.d.ts', '**/node_modules/**'],
      thresholds: { lines: 70, functions: 70, branches: 60 },
    },
  },
})
