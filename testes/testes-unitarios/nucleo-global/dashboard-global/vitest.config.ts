import { defineConfig } from 'vitest/config'
import path from 'node:path'

const monorepoRoot    = path.resolve(__dirname, '../../../..')
const rootNodeModules = path.resolve(monorepoRoot, 'node_modules')

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(monorepoRoot, 'testes/testes-unitarios/setup.ts')],
    include: [
      'testes/testes-unitarios/nucleo-global/dashboard-global/**/*.test.{ts,tsx}',
    ],
    server: {
      deps: { inline: [/@testing-library/, /@phosphor-icons/] },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: path.resolve(__dirname, 'resultados'),
      include: [
        'nucleo-global/Dashboard/dashboard-global/src/DashboardToolbar/**/*.{ts,tsx}',
      ],
      thresholds: { lines: 80, functions: 80, branches: 70 },
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
      '@nucleo/campo-calendario-global': path.resolve(__dirname, '__mocks__/campo-calendario-global.tsx'),
    },
  },
})
