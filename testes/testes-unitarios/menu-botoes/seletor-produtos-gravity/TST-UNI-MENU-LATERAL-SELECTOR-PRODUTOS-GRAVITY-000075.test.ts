/**
 * TST-UNI-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000075 — resolverNavegacaoTrocarProduto
 */
import { describe, expect, it } from 'vitest'
import {
  ROTA_ATALHO_PROCESSOS,
  resolverNavegacaoTrocarProduto,
} from '../../../../servicos-global/shell/utils/navegacao-trocar-produto.js'

describe('TST-UNI-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000075 — resolverNavegacaoTrocarProduto', () => {
  it('noop quando slug equivale ao produto atual', () => {
    expect(resolverNavegacaoTrocarProduto('pedido', 'pedido')).toEqual({ tipo: 'noop' })
    expect(resolverNavegacaoTrocarProduto('processo', 'processo')).toEqual({ tipo: 'noop' })
    expect(resolverNavegacaoTrocarProduto('bid-frete-internacional', 'bid-frete')).toEqual({ tipo: 'noop' })
  })

  it('redirect para atalho Processos quando slug processo e contexto diferente', () => {
    expect(resolverNavegacaoTrocarProduto('processo', 'pedido')).toEqual({
      tipo: 'redirect',
      href: ROTA_ATALHO_PROCESSOS,
    })
  })

  it('redirect para rota canônica do produto', () => {
    expect(resolverNavegacaoTrocarProduto('pedido', 'processo')).toEqual({
      tipo: 'redirect',
      href: '/pedido',
    })
    expect(resolverNavegacaoTrocarProduto('bid-frete-internacional', 'pedido')).toEqual({
      tipo: 'redirect',
      href: '/bid-frete',
    })
  })
})
