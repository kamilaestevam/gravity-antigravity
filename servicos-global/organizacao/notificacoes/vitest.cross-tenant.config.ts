// Config para testes de isolamento cross-tenant do serviço notificacoes.

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
    include: [root.replace(/\\/g, '/') + '/testes/testes-cross-tenant/notificacoes/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      TENANT_DATABASE_URL: 'postgres://test:test@localhost:5432/test',
      INTERNAL_API_KEY: 'test-internal-key',
    },
  },
})
