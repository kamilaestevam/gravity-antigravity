/**
 * Setup global para testes unitários.
 * Em ambiente jsdom (componentes React): configura @testing-library/jest-dom e cleanup.
 * Em ambiente node (serviços/middleware): puloverifica apenas os mocks básicos necessários.
 */
import { afterEach, vi } from 'vitest'

// Verifica se estamos em um ambiente jsdom (browser simulado)
const isJsdom = typeof window !== 'undefined' && typeof document !== 'undefined'

if (isJsdom) {
  // Importação dinâmica para evitar erros em ambiente node
  const { default: _matchers } = await import('@testing-library/jest-dom/matchers')
  const { expect } = await import('vitest')
  expect.extend(_matchers as Parameters<typeof expect.extend>[0])

  const { cleanup } = await import('@testing-library/react')

  // Limpa os componentes montados após cada teste
  afterEach(() => {
    cleanup()
  })

  // Adiciona mock vazio para funções de browser faltantes no jsdom
  if (typeof global.URL.createObjectURL === 'undefined') {
    global.URL.createObjectURL = vi.fn()
  }
  if (typeof global.URL.revokeObjectURL === 'undefined') {
    global.URL.revokeObjectURL = vi.fn()
  }

  // jsdom não implementa scrollIntoView nem scrollTo — necessários para testes de tabela
  if (typeof Element.prototype.scrollIntoView === 'undefined') {
    Element.prototype.scrollIntoView = vi.fn()
  }
  if (typeof Element.prototype.scrollTo === 'undefined') {
    Element.prototype.scrollTo = vi.fn()
  }
}
