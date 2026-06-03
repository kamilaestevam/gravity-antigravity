/**
 * TST-UNI-MBOTO-000005 — painel Insights ativo apenas na aba visao-geral
 */
import { describe, expect, it } from 'vitest'
import type { PedidoVisualizacaoId } from '../../../../servicos-global/produto/pedido/client/src/components/pedidos-visualizacao-context.js'

function painelInsightsAtivo(visualizacaoAtiva: PedidoVisualizacaoId | null): boolean {
  return visualizacaoAtiva === 'visao-geral'
}

describe('TST-UNI-MBOTO-000005 — usePainelInsightsAtivo (lógica)', () => {
  it('true somente em visao-geral', () => {
    expect(painelInsightsAtivo('visao-geral')).toBe(true)
    expect(painelInsightsAtivo('lista')).toBe(false)
    expect(painelInsightsAtivo('dashboard')).toBe(false)
    expect(painelInsightsAtivo('kanban')).toBe(false)
    expect(painelInsightsAtivo(null)).toBe(false)
  })
})
