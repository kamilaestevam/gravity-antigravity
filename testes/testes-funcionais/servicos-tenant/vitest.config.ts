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
    include: ['testes/testes-funcionais/servicos-tenant/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      INTERNAL_API_KEY: 'test-internal-key',
      ALLOWED_ORIGINS: 'http://localhost:5179',
    },
  },
  resolve: {
    alias: {
      '@nucleo': path.resolve(root, 'nucleo-global'),
      '@tenant': path.resolve(root, 'servicos-global/tenant'),
      '@produto': path.resolve(root, 'produto'),
    },
  },
})
