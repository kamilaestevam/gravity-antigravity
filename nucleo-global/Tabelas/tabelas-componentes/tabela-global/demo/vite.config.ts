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
      '@nucleo/tabela-global':          nucleo('Tabelas/tabelas-componentes/tabela-global/src/index.ts'),
      '@nucleo/select-colunas-global':  nucleo('Tabelas/tabelas-componentes/select-colunas-global/src/index.ts'),
      '@nucleo/export-utils':           nucleo('Utilidades/export-utils/exportUtils.ts'),
      'exceljs':                        path.resolve(__dirname, 'node_modules/exceljs'),
      'jspdf':                          path.resolve(__dirname, 'node_modules/jspdf'),
      'jspdf-autotable':                path.resolve(__dirname, 'node_modules/jspdf-autotable'),
      '@nucleo/tooltip-global':         nucleo('Feedback/tooltip-global/src/index.ts'),
      '@nucleo/campo-geral-global':     nucleo('Campos/campo-geral-global/src/index.ts'),
      '@nucleo/campo-calendario-global':nucleo('Campos/campo-calendario-global/src/index.ts'),
      '@nucleo/campo-select-global':    nucleo('Campos/campo-select-global/src/index.ts'),
      '@nucleo/switch-global':          nucleo('Campos/switch-global/src/index.ts'),
      '@nucleo/botao-global':           nucleo('Botoes/botao-global/src/index.ts'),
      '@nucleo/modal-global':                    nucleo('Modais/modal-global/src/index.ts'),
      '@nucleo/modal-confirmar-excluir-global':  nucleo('Modais/modal-confirmar-excluir-global/src/index.ts'),
      '@nucleo/modal-formulario-global':           nucleo('Modais/modal-formulario-global/src/index.ts'),
      '@nucleo/modal-formulario-abas-global':     nucleo('Modais/modal-formulario-abas-global/src/index.ts'),
      '@nucleo/modal-sem-sessoes-global':        nucleo('Modais/modal-sem-sessoes-global/src/index.ts'),
      '@nucleo/cabecalho-global':                nucleo('Layout/cabecalho-global/src/index.ts'),
      '@nucleo/botoes-salvar-global':            nucleo('Botoes/botoes-salvar-global/src/index.ts'),
      '@nucleo/status-salvar-global':            nucleo('Feedback/status-salvar-global/src/index.ts'),
    },
  },

  optimizeDeps: {
    include: [
      '@phosphor-icons/react',
      'i18next',
      'react-i18next',
      'exceljs',
    ],
  },

  server: {
    port: 5210,
    fs: { allow: [monoRoot] },
  },
})
