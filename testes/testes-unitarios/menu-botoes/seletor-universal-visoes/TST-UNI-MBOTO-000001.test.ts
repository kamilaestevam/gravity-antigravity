/**
 * TST-UNI-MBOTO-000001 — resolverVisualizacaoPorPathname (Pedido)
 */
import { describe, expect, it } from 'vitest'
import { resolverVisualizacaoPorPathname } from '../../../../servicos-global/produto/pedido/client/src/components/pedidos-visualizacao-context.js'

describe('TST-UNI-MBOTO-000001 — resolverVisualizacaoPorPathname', () => {
  it('resolve as 4 rotas de visualização', () => {
    expect(resolverVisualizacaoPorPathname('/pedido/pedidos/visao-geral')).toBe('visao-geral')
    expect(resolverVisualizacaoPorPathname('/pedido/pedidos/lista')).toBe('lista')
    expect(resolverVisualizacaoPorPathname('/pedido/pedidos/dashboard')).toBe('dashboard')
    expect(resolverVisualizacaoPorPathname('/pedido/pedidos/kanban')).toBe('kanban')
  })

  it('retorna null fora do seletor', () => {
    expect(resolverVisualizacaoPorPathname('/pedido/configuracoes')).toBeNull()
    expect(resolverVisualizacaoPorPathname('/hub')).toBeNull()
  })
})
