import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', '@phosphor-icons/react', '@clerk/clerk-react', 'react-router-dom'],
    alias: {
      '@nucleo/botao-global': path.resolve(
        __dirname,
        '../../nucleo-global/botao-global/src/index.ts'
      ),
      '@nucleo/pagina-global': path.resolve(
        __dirname,
        '../../nucleo-global/pagina-global/src/index.ts'
      ),
      '@nucleo/cabecalho-global': path.resolve(
        __dirname,
        '../../nucleo-global/cabecalho-global/src/index.ts'
      ),
      '@nucleo/card-global': path.resolve(
        __dirname,
        '../../nucleo-global/card-global/src/index.ts'
      ),
      '@nucleo/tabela-global': path.resolve(
        __dirname,
        '../../nucleo-global/tabela-global/src/index.ts'
      ),
      '@nucleo/utils': path.resolve(
        __dirname,
        '../../nucleo-global/utils/src/index.ts'
      ),
      '@nucleo/tooltip-global': path.resolve(
        __dirname,
        '../../nucleo-global/tooltip-global/src/index.ts'
      ),
      '@nucleo/botao-novo-global': path.resolve(
        __dirname,
        '../../nucleo-global/botao-novo-global/src/index.ts'
      ),
      '@nucleo/select-global': path.resolve(
        __dirname,
        '../../nucleo-global/select-global/src/index.ts'
      ),
      '@nucleo/stat-card-global': path.resolve(
        __dirname,
        '../../nucleo-global/stat-card-global/src/index.ts'
      ),
      '@nucleo/botoes-salvar-global': path.resolve(
        __dirname,
        '../../nucleo-global/botoes-salvar-global/src/index.ts'
      ),
      '@nucleo/status-salvar-global': path.resolve(
        __dirname,
        '../../nucleo-global/status-salvar-global/src/index.ts'
      ),
      '@nucleo/modal-select-global': path.resolve(
        __dirname,
        '../../nucleo-global/modal-select-global/src/index.ts'
      ),
      '@nucleo/aviso-interno-global': path.resolve(
        __dirname,
        '../../nucleo-global/aviso-interno-global/src/index.ts'
      ),
      '@nucleo/usuario-global': path.resolve(
        __dirname,
        '../../nucleo-global/usuario-global/src/index.ts'
      ),
      '@nucleo/calendario-campo-global': path.resolve(
        __dirname,
        '../../nucleo-global/calendario-campo-global/src/index.ts'
      ),
      '@nucleo/geral-campo-global': path.resolve(
        __dirname,
        '../../nucleo-global/geral-campo-global/src/index.ts'
      ),
      '@nucleo/modal-global': path.resolve(
        __dirname,
        '../../nucleo-global/modal-global/src/index.ts'
      ),
      '@nucleo/modal-sem-sessoes-global': path.resolve(
        __dirname,
        '../../nucleo-global/modal-sem-sessoes-global/src/index.ts'
      ),
      '@nucleo/localizar-campo-global': path.resolve(
        __dirname,
        '../../nucleo-global/localizar-campo-global/src/index.ts'
      ),
      '@nucleo/logo-global': path.resolve(
        __dirname,
        '../../nucleo-global/logo-global/src/index.ts'
      ),
      '@nucleo/login-global': path.resolve(
        __dirname,
        '../../nucleo-global/login-global/src/index.ts'
      ),
      '@nucleo/login-novo-global': path.resolve(
        __dirname,
        '../../nucleo-global/login-novo-global/src/index.ts'
      ),
      '@nucleo/workspace-selecao-global': path.resolve(
        __dirname,
        '../../nucleo-global/workspace-selecao-global/src/index.ts'
      ),
      '@tenant/gabi': path.resolve(
        __dirname,
        '../tenant/gabi'
      ),
      '@gravity/shell': path.resolve(
        __dirname,
        '../shell/index.ts'
      ),
    },
  },
  server: {
    port: 8003,
    proxy: {
      '/api': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
    },
  },
})

