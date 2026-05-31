import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createNucleoAliases,
  createServiceAliases,
  createTenantAliases,
} from '../../../nucleo-global/vite-aliases'

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
  plugins: [react(), resolveTsFromJs],
  root,
  resolve: {
    alias: {
      ...createNucleoAliases(root),
      ...createServiceAliases(root),
      ...createTenantAliases(root, ['gabi']),
    },
    extensions: ['.mjs', '.ts', '.tsx', '.mts', '.jsx', '.js', '.json'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['testes/testes-unitarios/bid-frete-internacional/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './testes/testes-unitarios/bid-frete-internacional/resultados',
      include: [
        'servicos-global/produto/bid-frete-internacional/server/src/services/*.ts',
        'servicos-global/produto/bid-frete-internacional/client/src/pages/colunas-lista-bid-frete-internacional.tsx',
        'servicos-global/produto/bid-frete-internacional/client/src/pages/lista-bid-frete-internacional-utils.ts',
        'servicos-global/produto/bid-frete-internacional/client/src/shared/lista-bid-frete-*.ts',
      ],
      thresholds: { lines: 60, branches: 60 },
    },
  },
})
