import { defineConfig } from 'vitest/config'
import path from 'node:path'

const monorepoRoot = path.resolve(__dirname, '../../..')
const rootNodeModules = path.resolve(monorepoRoot, 'node_modules')
const pedidoNodeModules = path.resolve(monorepoRoot, 'produto/pedido/node_modules')

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(__dirname, '../setup.ts')],
    include: [
      'testes/testes-unitarios/pedido/ListaPedidos.test.tsx',
    ],
    env: {
      NODE_ENV: 'test',
      VITE_INTERNAL_KEY: 'test-key',
    },
    server: {
      deps: {
        inline: [/@testing-library/, /react-i18next/, /i18next/],
        fallbackCJS: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: path.resolve(__dirname, 'resultados'),
      include: [
        'produto/pedido/client/src/pages/ListaPedidos.tsx',
        'produto/pedido/client/src/shared/api.ts',
        'produto/pedido/client/src/shared/types.ts',
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
      // Força uma única cópia do React (root React 19) para evitar conflito de versões.
      // @testing-library/react do root é v16 (suporta React 18 e 19).
      '@testing-library/react':       path.resolve(rootNodeModules, '@testing-library/react'),
      '@testing-library/dom':         path.resolve(rootNodeModules, '@testing-library/dom'),
      '@testing-library/user-event':  path.resolve(rootNodeModules, '@testing-library/user-event'),
      '@testing-library/jest-dom':    path.resolve(rootNodeModules, '@testing-library/jest-dom'),
      'react/jsx-runtime':            path.resolve(rootNodeModules, 'react/jsx-runtime'),
      'react/jsx-dev-runtime':        path.resolve(rootNodeModules, 'react/jsx-dev-runtime'),
      'react-dom/client':             path.resolve(rootNodeModules, 'react-dom/client'),
      'react-dom':                    path.resolve(rootNodeModules, 'react-dom'),
      'react':                        path.resolve(rootNodeModules, 'react'),
      // Mockar react-router-dom completamente para evitar conflito React 18 vs 19
      'react-router-dom':             path.resolve(__dirname, '__mocks__/router.tsx'),
      // Demais deps do pedido
      'zustand':                      path.resolve(pedidoNodeModules, 'zustand'),
      // Mocks de núcleo
      '@nucleo/tabela-virtual-global': path.resolve(__dirname, '__mocks__/nucleo.tsx'),
      '@nucleo/card-global':           path.resolve(__dirname, '__mocks__/nucleo.tsx'),
      '@nucleo/status-badge-global':   path.resolve(__dirname, '__mocks__/nucleo.tsx'),
      '@nucleo/botao-global':          path.resolve(__dirname, '__mocks__/nucleo.tsx'),
      '@nucleo/tooltip-global':        path.resolve(__dirname, '__mocks__/nucleo.tsx'),
      // Shell
      '@gravity/shell':               path.resolve(__dirname, '__mocks__/shell.tsx'),
      '@shell':                       path.resolve(__dirname, '__mocks__/shell.tsx'),
      // Ícones
      '@phosphor-icons/react':        path.resolve(__dirname, '__mocks__/phosphor.tsx'),
      // i18n
      'react-i18next':                path.resolve(__dirname, '__mocks__/i18n.tsx'),
      // CSS (não testado)
      './ListaPedidos.css':           path.resolve(__dirname, '__mocks__/empty.css'),
    },
  },
})
