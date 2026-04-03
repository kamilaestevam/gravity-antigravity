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
    dedupe: ['react', 'react-dom', '@phosphor-icons/react', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
    alias: {
      '@nucleo/kanban-global':  nucleo('Kanban/kanban-global/src/index.ts'),
      // Garante que imports dentro de src/ do nucleo resolvam para o node_modules do demo
      '@dnd-kit/core':          path.resolve(__dirname, 'node_modules/@dnd-kit/core'),
      '@dnd-kit/sortable':      path.resolve(__dirname, 'node_modules/@dnd-kit/sortable'),
      '@dnd-kit/utilities':     path.resolve(__dirname, 'node_modules/@dnd-kit/utilities'),
      '@phosphor-icons/react':  path.resolve(__dirname, 'node_modules/@phosphor-icons/react'),
    },
  },

  optimizeDeps: {
    include: [
      '@phosphor-icons/react',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
    ],
  },

  server: {
    port: 5215,
    fs: { allow: [monoRoot] },
  },
})
