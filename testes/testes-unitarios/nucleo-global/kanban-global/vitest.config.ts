import { defineConfig } from 'vitest/config'
import path from 'node:path'

const monorepoRoot    = path.resolve(__dirname, '../../../..')
const rootNodeModules = path.resolve(monorepoRoot, 'node_modules')
const dndNodeModules  = path.resolve(monorepoRoot, 'nucleo-global/Kanban/kanban-global/demo/node_modules')

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(monorepoRoot, 'testes/testes-unitarios/setup.ts')],
    include: [
      'testes/testes-unitarios/nucleo-global/kanban-global/**/*.test.{ts,tsx}',
      'testes/testes-funcionais/nucleo-global/kanban-global/**/*.test.{ts,tsx}',
    ],
    server: {
      deps: { inline: [/@testing-library/, /@dnd-kit/] },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: path.resolve(__dirname, 'resultados'),
      include: ['nucleo-global/Kanban/kanban-global/src/**/*.{ts,tsx}'],
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
      'react-i18next':              path.resolve(rootNodeModules, 'react-i18next'),
      'i18next':                    path.resolve(rootNodeModules, 'i18next'),
      '@dnd-kit/core':              path.resolve(dndNodeModules, '@dnd-kit/core'),
      '@dnd-kit/sortable':          path.resolve(dndNodeModules, '@dnd-kit/sortable'),
      '@dnd-kit/utilities':         path.resolve(dndNodeModules, '@dnd-kit/utilities'),
      '@phosphor-icons/react':      path.resolve(dndNodeModules, '@phosphor-icons/react'),
    },
  },
})
