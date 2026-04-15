import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monoRoot  = path.resolve(__dirname, '../../../..')
const nucleo    = (sub: string) => path.resolve(monoRoot, `nucleo-global/${sub}`)

export default defineConfig({
  plugins: [react()],

  resolve: {
    // Prioriza source (.ts/.tsx) sobre compilados (.js) para evitar version skew
    // com artefatos stale em nucleo-global (ver commit 6d6eeda).
    extensions: ['.mjs', '.ts', '.tsx', '.mts', '.jsx', '.js', '.json'],
    dedupe: ['react', 'react-dom', '@phosphor-icons/react', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
    alias: {
      '@nucleo/kanban-global':           nucleo('Kanban/kanban-global/src/index.ts'),
      '@nucleo/campo-calendario-global': nucleo('Campos/campo-calendario-global/src/index.ts'),
      '@nucleo/campo-geral-global':      nucleo('Campos/campo-geral-global/src/index.ts'),
      '@nucleo/botao-global':            nucleo('Botoes/botao-global/src/index.ts'),
      '@nucleo/tooltip-global':          nucleo('Feedback/tooltip-global/src/index.ts'),
      '@nucleo/campo-select-global':     nucleo('Campos/campo-select-global/src/index.ts'),
      // Garante que imports dentro de src/ do nucleo resolvam para o node_modules do demo
      '@dnd-kit/core':          path.resolve(__dirname, 'node_modules/@dnd-kit/core'),
      '@dnd-kit/sortable':      path.resolve(__dirname, 'node_modules/@dnd-kit/sortable'),
      '@dnd-kit/utilities':     path.resolve(__dirname, 'node_modules/@dnd-kit/utilities'),
      '@phosphor-icons/react':  path.resolve(__dirname, 'node_modules/@phosphor-icons/react'),
      'react-i18next':          path.resolve(monoRoot, 'node_modules/react-i18next'),
      'i18next':                path.resolve(monoRoot, 'node_modules/i18next'),
    },
  },

  optimizeDeps: {
    include: [
      '@phosphor-icons/react',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      'react-i18next',
      'i18next',
    ],
  },

  server: {
    port: 5215,
    fs: { allow: [monoRoot] },
  },
})
