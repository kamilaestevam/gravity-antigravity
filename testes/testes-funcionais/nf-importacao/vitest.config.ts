import { defineConfig } from 'vitest/config'
import path from 'node:path'

const monorepoRoot = path.resolve(__dirname, '../../..')
const rootNodeModules = path.resolve(monorepoRoot, 'node_modules')
const nfImportacaoRoot = path.resolve(monorepoRoot, 'produto/nf-importacao')
const nfImportacaoClient = path.resolve(nfImportacaoRoot, 'client')
const nfImportacaoNodeModules = path.resolve(nfImportacaoRoot, 'node_modules')
// Use processo's node_modules for React 18 + react-dom + @testing-library (all consistent)
const processoClient = path.resolve(monorepoRoot, 'produto/processo/client')
const processoNodeModules = path.resolve(processoClient, 'node_modules')
const processoMocks = path.resolve(monorepoRoot, 'testes/testes-unitarios/produtos/processo/__mocks__')

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(__dirname, 'setup.ts')],
    include: [
      'testes/testes-funcionais/nf-importacao/**/*.test.{ts,tsx}',
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

      // Source aliases
      '@nf-importacao': path.resolve(nfImportacaoClient, 'src'),

      // Mocks of nucleo/shell/phosphor via existing processo mocks
      '@nucleo/menu-lateral-global': path.resolve(processoMocks, 'nucleo.tsx'),
      '@nucleo/status-badge-global': path.resolve(processoMocks, 'nucleo.tsx'),
      '@nucleo/tooltip-global': path.resolve(processoMocks, 'nucleo.tsx'),
      '@nucleo/botao-global': path.resolve(processoMocks, 'nucleo.tsx'),
      '@nucleo/pagina-global': path.resolve(processoMocks, 'nucleo.tsx'),
      '@nucleo/cabecalho-global': path.resolve(processoMocks, 'nucleo.tsx'),
      '@nucleo/card-global': path.resolve(processoMocks, 'nucleo.tsx'),
      '@nucleo/campo-geral-global': path.resolve(processoMocks, 'nucleo.tsx'),
      '@nucleo/campo-select-global': path.resolve(processoMocks, 'nucleo.tsx'),
      '@nucleo/modal-confirmar-excluir-global': path.resolve(processoMocks, 'nucleo.tsx'),
      '@nucleo/tabela-camadas-global': path.resolve(processoMocks, 'nucleo.tsx'),
      '@nucleo/botoes-salvar-global': path.resolve(processoMocks, 'nucleo.tsx'),
      '@nucleo/campo-localizar-expandido-global': path.resolve(processoMocks, 'nucleo.tsx'),
      '@gravity/shell': path.resolve(processoMocks, 'shell.tsx'),
      '@shell': path.resolve(processoMocks, 'shell.tsx'),
      '@phosphor-icons/react': path.resolve(processoMocks, 'phosphor.tsx'),

      // CSS mock
      './ProcessoLayout_2.css': path.resolve(processoMocks, 'empty.css'),
    },
  },
})
