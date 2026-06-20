/**
 * TST-UNI-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000074 — rotaTemSeletorProdutosProcesso
 */
import { describe, expect, it } from 'vitest'
import { rotaTemSeletorProdutosProcesso } from '../../../../servicos-global/shell/utils/rota-processo-com-switcher.js'

describe('TST-UNI-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000074 — rotaTemSeletorProdutosProcesso', () => {
  it('habilita seletor nas rotas workspace de Processos', () => {
    expect(rotaTemSeletorProdutosProcesso('/acesso-processos/lista')).toBe(true)
    expect(rotaTemSeletorProdutosProcesso('/acesso-processos/kanban')).toBe(true)
    expect(rotaTemSeletorProdutosProcesso('/acesso-processos/insights')).toBe(true)
    expect(rotaTemSeletorProdutosProcesso('/acesso-processos/dashboard/')).toBe(true)
    expect(rotaTemSeletorProdutosProcesso('/processo/lista')).toBe(true)
    expect(rotaTemSeletorProdutosProcesso('/processo/kanban/')).toBe(true)
  })

  it('habilita seletor nas rotas de detalhe do processo', () => {
    expect(rotaTemSeletorProdutosProcesso('/acesso-processos/lista/proc-1/workflow')).toBe(true)
    expect(rotaTemSeletorProdutosProcesso('/acesso-processos/lista/proc-1/dados-tecnicos')).toBe(true)
    expect(rotaTemSeletorProdutosProcesso('/acesso-processos/p1/workflow')).toBe(true)
    expect(rotaTemSeletorProdutosProcesso('/processo/lista/proc-1/dados-tecnicos')).toBe(true)
  })

  it('desabilita seletor fora de Processos (hub, pedido, raiz)', () => {
    expect(rotaTemSeletorProdutosProcesso('/acesso-processos')).toBe(false)
    expect(rotaTemSeletorProdutosProcesso('/pedido/pedidos/lista')).toBe(false)
    expect(rotaTemSeletorProdutosProcesso('/hub')).toBe(false)
  })
})
