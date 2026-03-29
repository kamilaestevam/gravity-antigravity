// vite.config.ts — produto/simula-custo/client
// Skill: antigravity-criar-produto (Passo 3)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Raiz do nucleo-global
const nucleo = (subpath: string) =>
  path.resolve(__dirname, `../../../nucleo-global/${subpath}`)

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      // ── Botoes ──
      '@nucleo/botao-global':                     nucleo('Botoes/botao-global/src/index.ts'),
      '@nucleo/botao-novo-admin-global':           nucleo('Botoes/botao-novo-admin-global/src/index.ts'),
      '@nucleo/botoes-salvar-global':              nucleo('Botoes/botoes-salvar-global/src/index.ts'),
      // ── Campos ──
      '@nucleo/campo-calendario-global':           nucleo('Campos/campo-calendario-global/src/index.ts'),
      '@nucleo/campo-geral-global':                nucleo('Campos/campo-geral-global/src/index.ts'),
      '@nucleo/campo-localizar-expandido-global':  nucleo('Campos/campo-localizar-expandido-global/src/index.ts'),
      '@nucleo/campo-select-global':               nucleo('Campos/campo-select-global/src/index.ts'),
      '@nucleo/switch-global':                     nucleo('Campos/switch-global/src/index.ts'),
      // ── Feedback ──
      '@nucleo/mensageria-global':                 nucleo('Mensageria Global/mensageria-global/src/index.ts'),
      '@nucleo/status-badge-global':               nucleo('Feedback/status-badge-global/src/index.ts'),
      '@nucleo/status-salvar-global':              nucleo('Feedback/status-salvar-global/src/index.ts'),
      '@nucleo/tooltip-global':                    nucleo('Feedback/tooltip-global/src/index.ts'),
      // ── Layout ──
      '@nucleo/cabecalho-global':                  nucleo('Layout/cabecalho-global/src/index.ts'),
      '@nucleo/card-global':                       nucleo('Layout/card-global/src/index.ts'),
      '@nucleo/logo-global':                       nucleo('Layout/logo-global/src/index.ts'),
      '@nucleo/menu-lateral-global':               nucleo('Layout/menu-lateral-global/src/index.ts'),
      '@nucleo/pagina-global':                     nucleo('Layout/pagina-global/src/index.ts'),
      '@nucleo/usuario-global':                    nucleo('Layout/usuario-global/src/index.ts'),
      '@nucleo/view-toggle-global':                nucleo('Layout/view-toggle-global/src/index.ts'),
      // ── Modais ──
      '@nucleo/modal-global':                      nucleo('Modais/modal-global/src/index.ts'),
      '@nucleo/modal-formulario-global':           nucleo('Modais/modal-formulario-global/src/index.ts'),
      '@nucleo/modal-formulario-abas-global':      nucleo('Modais/modal-formulario-abas-global/src/index.ts'),
      '@nucleo/modal-confirmar-excluir-global':    nucleo('Modais/modal-confirmar-excluir-global/src/index.ts'),
      '@nucleo/modal-sem-sessoes-global':          nucleo('Modais/modal-sem-sessoes-global/src/index.ts'),
      '@nucleo/modal-campo-select-global':         nucleo('Modais/modal-select-global/src/index.ts'),
      '@nucleo/modal-workspace-inicial-global':    nucleo('Modais/modal-workspace-inicial-global/src/index.ts'),
      // ── Tabelas ──
      '@nucleo/tabela-global':                     nucleo('Tabelas/tabela-global/src/index.ts'),
      '@nucleo/tabela-camadas-global':             nucleo('Tabelas/tabela-camadas-global/src/index.ts'),
      // ── Utilidades ──
      '@nucleo/utils':                             nucleo('Utilidades/utils/src/index.ts'),
      // ── Shell / serviços ──
      '@shell':   path.resolve(__dirname, '../../../servicos-global/shell'),
      '@tenant':  path.resolve(__dirname, '../../../servicos-global/tenant'),
      '@produto': path.resolve(__dirname, '../../../servicos-global/produto'),
    }
  },

  server: {
    port: 8001,
    fs: {
      allow: ['../../..']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8020',
        changeOrigin: true,
      }
    }
  }
})
