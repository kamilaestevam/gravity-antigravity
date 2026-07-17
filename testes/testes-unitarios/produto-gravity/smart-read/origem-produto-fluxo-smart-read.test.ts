import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  limparOrigemProdutoFluxoSmartRead,
  resolverOrigemProdutoFluxoSmartRead,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/origem-produto-fluxo-smart-read'

describe('origem-produto-fluxo-smart-read', () => {
  afterEach(() => {
    limparOrigemProdutoFluxoSmartRead()
    vi.unstubAllGlobals()
  })

  it('com origem na URL retorna BID e não depende de leitura da lista', () => {
    const store = new Map<string, string>()
    vi.stubGlobal('sessionStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => { store.set(k, v) },
      removeItem: (k: string) => { store.delete(k) },
    })
    expect(resolverOrigemProdutoFluxoSmartRead('bid-frete-internacional')).toBe(
      'bid-frete-internacional',
    )
  })

  it('sem origem na URL limpa sessão e retorna null (Smart Docs puro)', () => {
    const store = new Map<string, string>([
      ['smart-read:origem-produto-fluxo', 'bid-frete-internacional'],
    ])
    vi.stubGlobal('sessionStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => { store.set(k, v) },
      removeItem: (k: string) => { store.delete(k) },
    })
    expect(resolverOrigemProdutoFluxoSmartRead(null)).toBeNull()
    expect(store.has('smart-read:origem-produto-fluxo')).toBe(false)
  })
})
