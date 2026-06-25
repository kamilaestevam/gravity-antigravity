import { describe, expect, it } from 'vitest'
import {
  SLUGS_STATUS_SISTEMA_PEDIDO,
  statusEhSistemaPedido,
  normalizarListaStatus,
} from '../../../../servicos-global/produto/pedido/client/src/shared/statusPedidoSistema'
import type { PedidoStatusConfig } from '../../../../servicos-global/produto/pedido/client/src/shared/types'

describe('statusPedidoSistema', () => {
  it('identifica slugs reservados como sistema', () => {
    expect(SLUGS_STATUS_SISTEMA_PEDIDO.has('rascunho')).toBe(true)
    expect(SLUGS_STATUS_SISTEMA_PEDIDO.has('em_andamento')).toBe(false)
    expect(statusEhSistemaPedido({ nome: 'consolidado', is_sistema: false })).toBe(true)
    expect(statusEhSistemaPedido({ nome: 'aprovado', is_sistema: false })).toBe(false)
    expect(statusEhSistemaPedido({ nome: 'custom', is_sistema: true })).toBe(true)
  })

  it('normaliza is_sistema na lista', () => {
    const entrada: PedidoStatusConfig[] = [
      { id: '1', nome: 'rascunho', rotulo: 'Rascunho', cor: '#000', ordem: 0, is_padrao: false, is_sistema: false },
      { id: '2', nome: 'teste', rotulo: 'Teste', cor: '#111', ordem: 1, is_padrao: false, is_sistema: false },
    ]
    const saida = normalizarListaStatus(entrada)
    expect(saida[0]?.is_sistema).toBe(true)
    expect(saida[1]?.is_sistema).toBe(false)
  })
})
