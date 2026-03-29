// vite.config.ts — produto/bid-frete/client
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@nucleo': path.resolve(__dirname, '../../../nucleo-global'),
      '@shell': path.resolve(__dirname, '../../../servicos-global/shell'),
      '@tenant': path.resolve(__dirname, '../../../servicos-global/tenant'),
      '@produto': path.resolve(__dirname, '../../../servicos-global/produto'),
    }
  },

  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:8023',
        changeOrigin: true,
      }
    }
  }
})
