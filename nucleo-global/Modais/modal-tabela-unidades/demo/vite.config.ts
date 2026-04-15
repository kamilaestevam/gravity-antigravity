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
    dedupe: ['react', 'react-dom', '@phosphor-icons/react'],
    alias: {
      '@nucleo/modal-tabela-unidades': nucleo('Modais/modal-tabela-unidades/src/index.ts'),
      '@nucleo/modal-tabela-moeda':    nucleo('Modais/modal-tabela-moeda/src/index.ts'),
      '@nucleo/modal-global':          nucleo('Modais/modal-global/src/index.ts'),
      '@nucleo/campo-select-global':   nucleo('Campos/campo-select-global/src/index.ts'),
      '@nucleo/campo-geral-global':    nucleo('Campos/campo-geral-global/src/index.ts'),
      '@nucleo/tooltip-global':        nucleo('Feedback/tooltip-global/src/index.ts'),
    },
  },

  server: {
    port: 5221,
    fs: { allow: [monoRoot] },
  },
})
