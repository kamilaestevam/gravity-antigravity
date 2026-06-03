/**
 * TST-UNI-MBOTO-000004 — keep-alive: painel só entra em visitados após 1ª visita
 */
import { describe, expect, it } from 'vitest'
import type { PedidoVisualizacaoId } from '../../../../servicos-global/produto/pedido/client/src/components/pedidos-visualizacao-context.js'

function registrarVisita(
  visitados: Set<PedidoVisualizacaoId>,
  id: PedidoVisualizacaoId,
): Set<PedidoVisualizacaoId> {
  if (visitados.has(id)) return visitados
  const next = new Set(visitados)
  next.add(id)
  return next
}

function deveMontarPainel(visitados: Set<PedidoVisualizacaoId>, id: PedidoVisualizacaoId): boolean {
  return visitados.has(id)
}

describe('TST-UNI-MBOTO-000004 — keep-alive visitados', () => {
  it('inicia vazio até primeira visita', () => {
    const visitados = new Set<PedidoVisualizacaoId>()
    expect(deveMontarPainel(visitados, 'lista')).toBe(false)
    const apos = registrarVisita(visitados, 'lista')
    expect(deveMontarPainel(apos, 'lista')).toBe(true)
  })

  it('não duplica entradas no Set', () => {
    let visitados = new Set<PedidoVisualizacaoId>(['dashboard'])
    visitados = registrarVisita(visitados, 'dashboard')
    expect(visitados.size).toBe(1)
  })
})
