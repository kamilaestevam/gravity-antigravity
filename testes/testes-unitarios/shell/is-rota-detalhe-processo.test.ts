import { describe, expect, it } from 'vitest'
import { isRotaDetalheProcesso } from '../../../servicos-global/shell/is-rota-detalhe-processo'

describe('isRotaDetalheProcesso', () => {
  it('identifica detalhe legado e por slug', () => {
    expect(isRotaDetalheProcesso('/processo/detalhe/workflow')).toBe(true)
    expect(isRotaDetalheProcesso('/acesso-processos/lista/processo-imp20260150/workflow')).toBe(true)
    expect(isRotaDetalheProcesso('/acesso-processos/p1/workflow')).toBe(true)
    expect(isRotaDetalheProcesso('/processo/workflow')).toBe(true)
  })

  it('exclui lista/kanban workspace (menu global)', () => {
    expect(isRotaDetalheProcesso('/acesso-processos/lista')).toBe(false)
    expect(isRotaDetalheProcesso('/processo/lista')).toBe(false)
    expect(isRotaDetalheProcesso('/acesso-processos/kanban')).toBe(false)
    expect(isRotaDetalheProcesso('/processo/insights')).toBe(false)
  })
})
