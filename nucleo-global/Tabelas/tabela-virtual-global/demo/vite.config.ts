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
    dedupe: ['react', 'react-dom', '@phosphor-icons/react'],
    alias: {
      '@nucleo/tabela-virtual-global':    nucleo('Tabelas/tabela-virtual-global/src/index.ts'),
      '@nucleo/select-colunas-global':    nucleo('Tabelas/select-colunas-global/src/index.ts'),
      '@nucleo/tooltip-global':           nucleo('Feedback/tooltip-global/src/index.ts'),
      '@nucleo/campo-calendario-global':  nucleo('Campos/campo-calendario-global/src/index.ts'),
      '@nucleo/campo-geral-global':       nucleo('Campos/campo-geral-global/src/index.ts'),
      '@nucleo/campo-select-global':      nucleo('Campos/campo-select-global/src/index.ts'),
      '@nucleo/switch-global':            nucleo('Campos/switch-global/src/index.ts'),
      '@nucleo/botao-global':             nucleo('Botoes/botao-global/src/index.ts'),
    },
  },

  optimizeDeps: {
    include: [
      '@phosphor-icons/react',
      'i18next',
      'react-i18next',
      '@tanstack/react-virtual',
    ],
  },

  server: {
    port: 5300,
    fs: { allow: [monoRoot] },
  },
})
