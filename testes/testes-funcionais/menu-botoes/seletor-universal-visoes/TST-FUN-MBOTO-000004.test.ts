/**
 * TST-FUN-MBOTO-000004 — Processo listagem (baseline)
 */
import { describe, expect, it } from 'vitest'
import { resolverProcessoVisualizacaoPorPathname } from '../../../../servicos-global/produto/processo/client/src/components/processo-visualizacao-context.js'

describe('TST-FUN-MBOTO-000004 — Processo rotas seletor', () => {
  it('resolve lista e kanban', () => {
    expect(resolverProcessoVisualizacaoPorPathname('/acesso-processos/lista')).toBe('lista')
    expect(resolverProcessoVisualizacaoPorPathname('/acesso-processos/kanban')).toBe('kanban')
  })
})
