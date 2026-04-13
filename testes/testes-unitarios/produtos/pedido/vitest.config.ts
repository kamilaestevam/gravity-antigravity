import { defineConfig } from 'vitest/config'
import path from 'node:path'

const monorepoRoot = path.resolve(__dirname, '../../../..')
const rootNodeModules = path.resolve(monorepoRoot, 'node_modules')
const pedidoClientNodeModules = path.resolve(monorepoRoot, 'produto/pedido/client/node_modules')

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
    // Ambiente padrão node — arquivos com // @vitest-environment jsdom sobrescrevem
    environment: 'node',
    globals: true,
    setupFiles: [path.resolve(__dirname, '../../setup.ts')],
    include: [
      'testes/testes-unitarios/produtos/pedido/bulkSchemas.test.ts',
      'testes/testes-unitarios/produtos/pedido/selecaoStore.test.ts',
      'testes/testes-unitarios/produtos/pedido/kanbanColunas.test.ts',
      'testes/testes-unitarios/produtos/pedido/kanbanColunasComponente.test.ts',
      'testes/testes-unitarios/produtos/pedido/kanbanModal.test.ts',
    ],
    env: {
      NODE_ENV: 'test',
      VITE_INTERNAL_KEY: 'test-key',
    },
    server: {
      deps: {
        inline: [/@testing-library/, /zustand/],
        fallbackCJS: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: path.resolve(__dirname, 'resultados'),
      include: [
        'produto/pedido/server/src/shared/bulkSchemas.ts',
        'produto/pedido/client/src/shared/state/selecaoStore.ts',
        'produto/pedido/client/src/shared/kanbanUtils.ts',
        'produto/pedido/client/src/pages/SecaoKanbanColunas.tsx',
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
      // React — força cópia única do root (React 19)
      '@testing-library/react':      path.resolve(rootNodeModules, '@testing-library/react'),
      '@testing-library/dom':        path.resolve(rootNodeModules, '@testing-library/dom'),
      '@testing-library/user-event': path.resolve(rootNodeModules, '@testing-library/user-event'),
      '@testing-library/jest-dom':   path.resolve(rootNodeModules, '@testing-library/jest-dom'),
      'react/jsx-runtime':           path.resolve(rootNodeModules, 'react/jsx-runtime'),
      'react/jsx-dev-runtime':       path.resolve(rootNodeModules, 'react/jsx-dev-runtime'),
      'react-dom/client':            path.resolve(rootNodeModules, 'react-dom/client'),
      'react-dom':                   path.resolve(rootNodeModules, 'react-dom'),
      'react':                       path.resolve(rootNodeModules, 'react'),
      // Zustand — usar cópia do root (não existe no cliente do pedido)
      'zustand':                     path.resolve(rootNodeModules, 'zustand'),
    },
  },
})
