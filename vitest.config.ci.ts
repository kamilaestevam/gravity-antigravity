/**
 * vitest.config.ci.ts
 *
 * Config unificada para CI/deploy — resolve aliases do monorepo (@nucleo/*,
 * @produto/*, @cadastros/*, etc.) que o `npx vitest run` bare não encontra.
 *
 * Escopo: apenas suítes em testes/ (não coleta __tests__ espalhados nos serviços).
 */
import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createNucleoAliases,
  createServiceAliases,
  createTenantAliases,
} from './nucleo-global/vite-aliases'

const root = path.dirname(fileURLToPath(import.meta.url))
const nodeModules = path.resolve(root, 'node_modules')

const resolveTsFromJs = {
  name: 'resolve-ts-from-js',
  resolveId(source: string, importer: string | undefined) {
    if (source.endsWith('.js') && importer) {
      const tsPath = path.resolve(path.dirname(importer), source.replace(/\.js$/, '.ts'))
      return tsPath
    }
    return null
  },
}

export default defineConfig({
  plugins: [resolveTsFromJs],
  root,
  resolve: {
    extensions: ['.mjs', '.ts', '.tsx', '.mts', '.jsx', '.js', '.json'],
    alias: {
      react: path.resolve(nodeModules, 'react'),
      'react-dom': path.resolve(nodeModules, 'react-dom'),
      'react/jsx-runtime': path.resolve(nodeModules, 'react/jsx-runtime'),
      '@plataforma/historico': path.resolve(
        root,
        'servicos-global/servicos-plataforma/historico-global/src/index.ts',
      ),
      ...createNucleoAliases(root),
      ...createServiceAliases(root),
      ...createTenantAliases(root, ['gabi', 'dashboard', 'atividades', 'cadastros']),
      '@produto': path.resolve(root, 'servicos-global/produto'),
      '@cadastros': path.resolve(root, 'servicos-global/cadastros'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: [
      'testes/**/*.test.ts',
      'testes/**/*.test.tsx',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/*.e2e.test.ts',
    ],
    env: {
      NODE_ENV: 'test',
      CONFIGURADOR_DATABASE_URL: 'postgresql://localhost:5432/configurador_test',
      ORGANIZACAO_DATABASE_URL: 'postgresql://localhost:5432/organizacao_test',
      CLERK_SECRET_KEY: 'ci_clerk_placeholder',
      CHAVE_INTERNA_SERVICO: 'ci-internal-key',
    },
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
})
