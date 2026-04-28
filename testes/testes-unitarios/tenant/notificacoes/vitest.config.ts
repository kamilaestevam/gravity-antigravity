import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../../..')

// Resolve imports .js → .ts em tempo de teste (ESM com extensões explícitas)
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
    include: ['testes/testes-unitarios/tenant/notificacoes/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      // Secret padrão para os testes de webhook — sobrescrito por testes específicos
      RESEND_WEBHOOK_SECRET: 'whsec_Z3Jhdml0eS10ZXN0LXNlY3JldC1mb3Itdml0ZXN0ISE=',
      TENANT_DATABASE_URL:   'postgres://test:test@localhost:5432/test',
      INTERNAL_API_KEY:      'test-internal-key',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './testes/testes-unitarios/tenant/notificacoes/resultados',
      thresholds: { lines: 70, functions: 70, branches: 70 },
    },
  },
  resolve: {
    alias: {
      '@tenant': path.resolve(root, 'servicos-global/tenant'),
    },
  },
})
