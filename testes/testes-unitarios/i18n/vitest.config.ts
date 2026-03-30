import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['testes/testes-unitarios/i18n/**/*.test.{ts,tsx}'],
    root: path.resolve(__dirname, '../../..'),
  },
})
