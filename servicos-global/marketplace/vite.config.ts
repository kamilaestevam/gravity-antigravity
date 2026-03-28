import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@nucleo/logo-global': path.resolve(
        __dirname,
        '../../nucleo-global/logo-global/src/index.ts'
      ),
      '@nucleo/tooltip-global': path.resolve(
        __dirname,
        '../../nucleo-global/Feedback/tooltip-global/src/index.ts'
      )
    }
  },
  server: {
    port: 8002,
    host: true,
    fs: {
      allow: [
        path.resolve(__dirname, '../..'),
      ],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@phosphor-icons/react'],
  },
})

