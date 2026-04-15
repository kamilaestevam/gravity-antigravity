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
      '@nucleo/modal-passo-passo-global': nucleo('Modais/modal-passo-passo-global/src/index.ts'),
      '@nucleo/botao-global':             nucleo('Botoes/botao-global/src/index.ts'),
    },
  },

  server: {
    port: 5220,
    fs: { allow: [monoRoot] },
  },
})
