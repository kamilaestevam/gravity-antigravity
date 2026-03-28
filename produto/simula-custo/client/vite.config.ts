// vite.config.ts — produto/simula-custo/client
// Skill: antigravity-criar-produto (Passo 3)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      // Aliases canônicos da plataforma Gravity
      '@nucleo': path.resolve(__dirname, '../../../nucleo-global'),
      '@shell':  path.resolve(__dirname, '../../../servicos-global/shell'),
      '@tenant': path.resolve(__dirname, '../../../servicos-global/tenant'),
      '@produto': path.resolve(__dirname, '../../../servicos-global/produto'),
    }
  },

  server: {
    port: 5174,
    proxy: {
      // Redireciona todas as chamadas /api para o server do produto (porta 8020)
      '/api': {
        target: 'http://localhost:8020',
        changeOrigin: true,
      }
    }
  }
})
