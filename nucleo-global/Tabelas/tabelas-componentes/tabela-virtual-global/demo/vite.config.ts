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
      '@nucleo/tabela-virtual-global':    nucleo('Tabelas/tabelas-componentes/tabela-virtual-global/src/index.ts'),
      '@nucleo/modal-tabela-moeda':                nucleo('Modais/modal-tabela-moeda/src/index.ts'),
      '@nucleo/modal-tabela-unidades':             nucleo('Modais/modal-tabela-unidades/src/index.ts'),
      '@nucleo/select-colunas-global':    nucleo('Tabelas/tabelas-componentes/select-colunas-global/src/index.ts'),
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
