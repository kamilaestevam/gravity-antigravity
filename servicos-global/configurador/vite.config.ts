import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', '@phosphor-icons/react', '@clerk/clerk-react', 'react-router-dom'],
    alias: {
      // ── Botoes ──
      '@nucleo/botao-global': path.resolve(__dirname, '../../nucleo-global/Botoes/botao-global/src/index.ts'),
      '@nucleo/botao-novo-global': path.resolve(__dirname, '../../nucleo-global/Botoes/botao-novo-global/src/index.ts'),
      '@nucleo/botao-novo-admin-global': path.resolve(__dirname, '../../nucleo-global/Botoes/botao-novo-admin-global/src/index.ts'),
      '@nucleo/botoes-salvar-global': path.resolve(__dirname, '../../nucleo-global/Botoes/botoes-salvar-global/src/index.ts'),
      // ── Campos ──
      '@nucleo/campo-calendario-global': path.resolve(__dirname, '../../nucleo-global/Campos/campo-calendario-global/src/index.ts'),
      '@nucleo/campo-geral-global': path.resolve(__dirname, '../../nucleo-global/Campos/campo-geral-global/src/index.ts'),
      '@nucleo/campo-localizar-global': path.resolve(__dirname, '../../nucleo-global/Campos/campo-localizar-global/src/index.ts'),
      '@nucleo/campo-select-global': path.resolve(__dirname, '../../nucleo-global/Campos/campo-select-global/src/index.ts'),
      '@nucleo/campo-selecao-excluir-global': path.resolve(__dirname, '../../nucleo-global/Campos/campo-selecao-excluir-global/src/index.ts'),
      '@nucleo/campo-workspace-selecao-global': path.resolve(__dirname, '../../nucleo-global/Campos/campo-workspace-selecao-global/src/index.ts'),
      // ── Feedback ──
      '@nucleo/aviso-interno-global': path.resolve(__dirname, '../../nucleo-global/Feedback/aviso-interno-global/src/index.ts'),
      '@nucleo/status-salvar-global': path.resolve(__dirname, '../../nucleo-global/Feedback/status-salvar-global/src/index.ts'),
      '@nucleo/tooltip-global': path.resolve(__dirname, '../../nucleo-global/Feedback/tooltip-global/src/index.ts'),
      // ── Layout ──
      '@nucleo/cabecalho-global': path.resolve(__dirname, '../../nucleo-global/Layout/cabecalho-global/src/index.ts'),
      '@nucleo/card-global': path.resolve(__dirname, '../../nucleo-global/Layout/card-global/src/index.ts'),
      '@nucleo/logo-global': path.resolve(__dirname, '../../nucleo-global/Layout/logo-global/src/index.ts'),
      '@nucleo/pagina-global': path.resolve(__dirname, '../../nucleo-global/Layout/pagina-global/src/index.ts'),
      '@nucleo/stat-card-global': path.resolve(__dirname, '../../nucleo-global/Layout/stat-card-global/src/index.ts'),
      '@nucleo/usuario-global': path.resolve(__dirname, '../../nucleo-global/Layout/usuario-global/src/index.ts'),
      '@nucleo/menu-lateral-global': path.resolve(__dirname, '../../nucleo-global/Layout/menu-lateral-global/src/index.ts'),
      // ── Modais ──
      '@nucleo/modal-global': path.resolve(__dirname, '../../nucleo-global/Modais/modal-global/src/index.ts'),
      '@nucleo/modal-formulario-global': path.resolve(__dirname, '../../nucleo-global/Modais/modal-formulario-global/src/index.ts'),
      '@nucleo/modal-formulario-abas-global': path.resolve(__dirname, '../../nucleo-global/Modais/modal-formulario-abas-global/src/index.ts'),
      '@nucleo/modal-sem-sessoes-global': path.resolve(__dirname, '../../nucleo-global/Modais/modal-sem-sessoes-global/src/index.ts'),
      '@nucleo/modal-campo-select-global': path.resolve(__dirname, '../../nucleo-global/Modais/modal-select-global/src/index.ts'),
      // ── Tabelas ──
      '@nucleo/tabela-global': path.resolve(__dirname, '../../nucleo-global/Tabelas/tabela-global/src/index.ts'),
      '@nucleo/tabela-camadas-global': path.resolve(__dirname, '../../nucleo-global/Tabelas/tabela-camadas-global/src/index.ts'),
      // ── Utilidades ──
      '@nucleo/utils': path.resolve(__dirname, '../../nucleo-global/Utilidades/utils/src/index.ts'),
      // ── Login (raiz) ──
      '@nucleo/login-novo-global': path.resolve(__dirname, '../../nucleo-global/login-novo-global/src/index.ts'),
      '@nucleo/login-global': path.resolve(__dirname, '../../nucleo-global/login-global/src/index.ts'),
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
    // proxy desabilitado temporariamente (backend não está rodando, causa ENOBUFS)
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8005',
    //     changeOrigin: true,
    //   },
    // },
  },
})

