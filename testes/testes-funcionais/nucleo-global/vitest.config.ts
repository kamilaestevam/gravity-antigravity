import { defineConfig } from 'vitest/config'
import path from 'node:path'

const monorepoRoot    = path.resolve(__dirname, '../../..')
const rootNodeModules = path.resolve(monorepoRoot, 'node_modules')

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(monorepoRoot, 'testes/testes-unitarios/setup.ts')],
    include: [
      'testes/testes-funcionais/nucleo-global/**/*.test.{ts,tsx}',
    ],
    server: {
      deps: { inline: [/@testing-library/, /@phosphor-icons/] },
    },
  },
  resolve: {
    alias: {
      react:                        path.resolve(rootNodeModules, 'react'),
      'react-dom':                  path.resolve(rootNodeModules, 'react-dom'),
      'react/jsx-runtime':          path.resolve(rootNodeModules, 'react/jsx-runtime'),
      'react/jsx-dev-runtime':      path.resolve(rootNodeModules, 'react/jsx-dev-runtime'),
      'react-dom/client':           path.resolve(rootNodeModules, 'react-dom/client'),
      '@testing-library/react':     path.resolve(rootNodeModules, '@testing-library/react'),
      '@testing-library/dom':       path.resolve(rootNodeModules, '@testing-library/dom'),
      '@testing-library/jest-dom':  path.resolve(rootNodeModules, '@testing-library/jest-dom'),
      '@testing-library/user-event':path.resolve(rootNodeModules, '@testing-library/user-event'),
      '@phosphor-icons/react':      path.resolve(rootNodeModules, '@phosphor-icons/react'),
      // Alias de nucleo-global para testes funcionais
      '@nucleo/campo-calendario-global': path.resolve(monorepoRoot, 'nucleo-global/Campos/campo-calendario-global/src/index.ts'),
    },
  },
})
