import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const root = path.resolve(__dirname, '../../../../')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shell':                       path.resolve(root, 'servicos-global/shell'),
      '@nucleo/pagina-global':        path.resolve(root, 'nucleo-global/Layout/pagina-global/src'),
      '@nucleo/cabecalho-global':     path.resolve(root, 'nucleo-global/Layout/cabecalho-global/src'),
      '@nucleo/card-global':          path.resolve(root, 'nucleo-global/Layout/card-global/src'),
      '@nucleo/tabela-global':        path.resolve(root, 'nucleo-global/Tabelas/tabela-global/src'),
      '@nucleo/tabela-camadas-global': path.resolve(root, 'nucleo-global/Tabelas/tabela-camadas-global/src'),
      '@nucleo/botao-global':         path.resolve(root, 'nucleo-global/Botoes/botao-global/src'),
      '@nucleo/modal-global':         path.resolve(root, 'nucleo-global/Modais/modal-global/src'),
      '@nucleo/campo-global':         path.resolve(root, 'nucleo-global/Campos/campo-geral-global/src'),
      '@nucleo/campo-select':         path.resolve(root, 'nucleo-global/Campos/campo-select-global/src'),
      '@nucleo/status-badge':         path.resolve(root, 'nucleo-global/Feedback/status-badge-global/src'),
      '@nucleo/dashboard':            path.resolve(root, 'nucleo-global/Dashboard'),
      '@tenant/dashboard':            path.resolve(root, 'servicos-global/tenant/dashboard/src'),
    }
  },
  server: {
    port: 5010,
    proxy: {
      '/api/v1/dashboard': {
        target: 'http://localhost:8010',
        changeOrigin: true
      }
    }
  }
})
