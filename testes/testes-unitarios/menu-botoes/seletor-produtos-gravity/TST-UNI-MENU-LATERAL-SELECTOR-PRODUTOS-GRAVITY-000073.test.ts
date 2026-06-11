/**
 * TST-UNI-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000073 — montarListaProdutosSwitcherInicial
 */
import { describe, expect, it } from 'vitest'
import { montarListaProdutosSwitcherInicial } from '../../../../servicos-global/shell/hooks/useProdutosSwitcher.js'

describe('TST-UNI-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000073 — montarListaProdutosSwitcherInicial', () => {
  it('inclui produto atual e atalho Processos por último (Pedido)', () => {
    const lista = montarListaProdutosSwitcherInicial('pedido', 'Pedido')
    expect(lista.some(p => p.slug === 'pedido' && p.name === 'Pedido')).toBe(true)
    const processos = lista.at(-1)
    expect(processos?.slug).toBe('processo')
    expect(processos?.kind).toBe('acao')
    expect(processos?.name).toBe('Processos')
  })

  it('contexto Processos: atalho único com kind acao', () => {
    const lista = montarListaProdutosSwitcherInicial('processo', 'Processos')
    const processos = lista.filter(p => p.slug === 'processo')
    expect(processos).toHaveLength(1)
    expect(processos[0]?.kind).toBe('acao')
  })
})
