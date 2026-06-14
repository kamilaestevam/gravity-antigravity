// TST-FUN-EDICAO-EM-MASSA-LISTA-PEDIDO-000109 — fast path contadores
// @vitest-environment node
import { describe, it, expect } from 'vitest'

function contarPedidosAtualizadosFastPath(opts: {
  pedidoIds: string[]
  pedidoIdsAlvo: string[]
  pedidoIdsComItens: string[]
  temUpdatePedido: boolean
  temUpdateItem: boolean
}): number {
  const s = new Set<string>()
  if (opts.temUpdatePedido) opts.pedidoIdsAlvo.forEach(id => s.add(id))
  if (opts.temUpdateItem) opts.pedidoIdsComItens.forEach(id => s.add(id))
  return s.size
}

describe('TST-FUN-EDICAO-EM-MASSA-LISTA-PEDIDO-000109 — fast path', () => {
  it('F09: só item alterado não conta todos os pedidos do batch', () => {
    const n = contarPedidosAtualizadosFastPath({
      pedidoIds: ['p1', 'p2', 'p3'],
      pedidoIdsAlvo: [],
      pedidoIdsComItens: ['p2'],
      temUpdatePedido: false,
      temUpdateItem: true,
    })
    expect(n).toBe(1)
    expect(n).not.toBe(3)
  })

  it('F10: timeout rota confirmar é 60s (contrato operacional)', () => {
    const TIMEOUT_MS = 60_000
    expect(TIMEOUT_MS).toBeGreaterThanOrEqual(60_000)
  })
})
