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
      'testes/testes-unitarios/tabela-virtual-global/**/*.test.{ts,tsx}',
    ],
    env: {
      NODE_ENV: 'test',
    },
    server: {
      deps: {
        inline: [/@testing-library/],
        fallbackCJS: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: path.resolve(__dirname, 'resultados'),
      include: [
        'nucleo-global/Tabelas/tabela-virtual-global/src/**/*.{ts,tsx}',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
  resolve: {
    alias: {
      // Força root React 19 em tudo para evitar conflito de versões.
      // @tanstack/react-virtual fica em pedido (não existe no root).
      '@testing-library/react':       path.resolve(rootNodeModules, '@testing-library/react'),
      '@testing-library/dom':         path.resolve(rootNodeModules, '@testing-library/dom'),
      '@testing-library/jest-dom':    path.resolve(rootNodeModules, '@testing-library/jest-dom'),
      '@testing-library/user-event':  path.resolve(rootNodeModules, '@testing-library/user-event'),
      'react/jsx-runtime':            path.resolve(rootNodeModules, 'react/jsx-runtime'),
      'react/jsx-dev-runtime':        path.resolve(rootNodeModules, 'react/jsx-dev-runtime'),
      'react-dom/client':             path.resolve(rootNodeModules, 'react-dom/client'),
      'react-dom':                    path.resolve(rootNodeModules, 'react-dom'),
      'react':                        path.resolve(rootNodeModules, 'react'),
      '@tanstack/react-virtual':      path.resolve(pedidoNodeModules, '@tanstack/react-virtual'),
      // @nucleo/* — stubs de UI (evitam resolver deps transitivas de ícones/modais)
      '@nucleo/tooltip-global':           path.resolve(__dirname, '__nucleo-ui-stub__.ts'),
      '@nucleo/gabi-field-icon-global':   path.resolve(__dirname, '__nucleo-ui-stub__.ts'),
      '@nucleo/select-colunas-global':    path.resolve(__dirname, '__nucleo-ui-stub__.ts'),
      '@nucleo/campo-calendario-global':  path.resolve(__dirname, '__nucleo-ui-stub__.ts'),
      '@nucleo/modal-tabela-moeda':       path.resolve(__dirname, '__stub-modal-moeda__.ts'),
      '@nucleo/modal-tabela-unidades':    path.resolve(__dirname, '__stub-modal-unidades__.ts'),
      '@nucleo/modal-global':             path.resolve(__dirname, '__nucleo-ui-stub__.ts'),
      '@nucleo/botao-global':             path.resolve(__dirname, '__nucleo-ui-stub__.ts'),
      '@nucleo/campo-geral-global':       path.resolve(__dirname, '__nucleo-ui-stub__.ts'),
      '@nucleo/campo-select-global':      path.resolve(__dirname, '__nucleo-ui-stub__.ts'),
      '@nucleo/cabecalho-global':         path.resolve(__dirname, '__nucleo-ui-stub__.ts'),
    },
  },
})
