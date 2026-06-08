import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../../..')

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
  resolve: {
    alias: {
      '@nucleo/logo-produtos': path.resolve(root, 'nucleo-global/Logo/produtos/src/index.ts'),
      '@nucleo/menu-lateral-global': path.resolve(root, 'nucleo-global/Layout/menu-lateral-global/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['testes/testes-unitarios/menu-botoes/seletor-produtos-gravity/**/*.test.ts'],
    env: { NODE_ENV: 'test' },
  },
})
