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
    alias: {
      '@nucleo/select-colunas-global': nucleo('Tabelas/select-colunas-global/src/index.ts'),
    },
  },

  server: {
    port: 5213,
    fs: { allow: [monoRoot] },
  },
})
