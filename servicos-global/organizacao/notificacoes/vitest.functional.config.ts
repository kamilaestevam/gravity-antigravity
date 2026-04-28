// Config para testes funcionais do serviço notificacoes.
// Fica dentro do pacote para que `vitest/config` resolva para a versão local
// (1.6.1) compatível com vite 5.x.

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
    include: [root.replace(/\\/g, '/') + '/testes/testes-funcionais/tenant/notificacoes/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      RESEND_WEBHOOK_SECRET: 'whsec_Z3Jhdml0eS10ZXN0LXNlY3JldC1mb3Itdml0ZXN0ISE=',
      TENANT_DATABASE_URL:   'postgres://test:test@localhost:5432/test',
      INTERNAL_API_KEY:      'test-internal-key',
      TENANT_EMAIL_SERVICE_URL: 'http://email-service.test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      reportsDirectory: path.join(root, 'testes/testes-funcionais/tenant/notificacoes/resultados'),
      thresholds: { lines: 70, functions: 70, branches: 70 },
    },
  },
})
