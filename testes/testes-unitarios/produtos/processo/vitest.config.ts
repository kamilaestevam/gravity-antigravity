import { defineConfig } from 'vitest/config'
import path from 'node:path'

const monorepoRoot = path.resolve(__dirname, '../../../..')
const processoClient = path.resolve(monorepoRoot, 'produto/processo/client')
const processoNodeModules = path.resolve(processoClient, 'node_modules')

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(__dirname, 'setup.ts')],
    include: [
      'testes/testes-unitarios/produtos/processo/**/*.test.{ts,tsx}',
      'testes/testes-funcionais/produtos/processo/**/*.test.{ts,tsx}',
    ],
    env: {
      NODE_ENV: 'test',
      VITE_INTERNAL_SERVICE_KEY: 'test-key',
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
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
      },
    },
  },
  resolve: {
    alias: {
      // Force ALL React to use processo's React 18 — single copy
      '@testing-library/react': path.resolve(processoNodeModules, '@testing-library/react'),
      '@testing-library/dom': path.resolve(processoNodeModules, '@testing-library/dom'),
      '@testing-library/jest-dom': path.resolve(processoNodeModules, '@testing-library/jest-dom'),
      'react-router-dom': path.resolve(processoNodeModules, 'react-router-dom'),
      'react/jsx-runtime': path.resolve(processoNodeModules, 'react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(processoNodeModules, 'react/jsx-dev-runtime'),
      'react-dom/client': path.resolve(processoNodeModules, 'react-dom/client'),
      'react-dom/test-utils': path.resolve(processoNodeModules, 'react-dom/test-utils'),
      'react-dom': path.resolve(processoNodeModules, 'react-dom'),
      'react': path.resolve(processoNodeModules, 'react'),
      // Mocks de componentes nucleo-global
      '@nucleo/menu-lateral-global': path.resolve(__dirname, '__mocks__/nucleo.tsx'),
      '@nucleo/status-badge-global': path.resolve(__dirname, '__mocks__/nucleo.tsx'),
      '@nucleo/tooltip-global': path.resolve(__dirname, '__mocks__/nucleo.tsx'),
      '@nucleo/botao-global': path.resolve(__dirname, '__mocks__/nucleo.tsx'),
      '@nucleo/pagina-global': path.resolve(__dirname, '__mocks__/nucleo.tsx'),
      '@nucleo/cabecalho-global': path.resolve(__dirname, '__mocks__/nucleo.tsx'),
      '@nucleo/card-global': path.resolve(__dirname, '__mocks__/nucleo.tsx'),
      '@nucleo/campo-geral-global': path.resolve(__dirname, '__mocks__/nucleo.tsx'),
      '@nucleo/campo-select-global': path.resolve(__dirname, '__mocks__/nucleo.tsx'),
      '@nucleo/modal-confirmar-excluir-global': path.resolve(__dirname, '__mocks__/nucleo.tsx'),
      '@nucleo/tabela-camadas-global': path.resolve(__dirname, '__mocks__/nucleo.tsx'),
      '@nucleo/botoes-salvar-global': path.resolve(__dirname, '__mocks__/nucleo.tsx'),
      '@nucleo/campo-localizar-expandido-global': path.resolve(__dirname, '__mocks__/nucleo.tsx'),
      '@gravity/shell': path.resolve(__dirname, '__mocks__/shell.tsx'),
      '@shell': path.resolve(__dirname, '__mocks__/shell.tsx'),
      '@phosphor-icons/react': path.resolve(__dirname, '__mocks__/phosphor.tsx'),
      // CSS mocks
      './ProcessoLayout_2.css': path.resolve(__dirname, '__mocks__/empty.css'),
      './WorkflowPage.css': path.resolve(__dirname, '__mocks__/empty.css'),
      './DadosTecnicosPage.css': path.resolve(__dirname, '__mocks__/empty.css'),
      './EmailPage.css': path.resolve(__dirname, '__mocks__/empty.css'),
      './ProcessoLayout.css': path.resolve(__dirname, '__mocks__/empty.css'),
    },
  },
})
