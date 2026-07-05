import { describe, expect, it } from 'vitest'
import {
  mesclarVisibilidadeCardsTopoPainel,
  painelCardsTopoTemIntersecaoComPrefs,
  resolverPendingCardsAposSyncExterno,
  resolverPeriodoAposSyncExterno,
} from '../../../../servicos-global/produto/pedido/client/src/shared/cardsPrefsSync'
import type { CardPreferencia } from '../../../../servicos-global/produto/pedido/client/src/shared/useCardPreferences'

const baseline: CardPreferencia[] = [
  { id: 'valor_total', visible: true },
  { id: 'qtd_total', visible: true },
]

const normalizar = (prefs: CardPreferencia[]) => prefs

describe('cardsPrefsSync', () => {
  it('preserva edição local quando cards customizados terminam de carregar', () => {
    const pending: CardPreferencia[] = [
      ...baseline,
      { id: 'pedidos_em_andamento', visible: true },
    ]
    const salvoNormalizado = normalizar(baseline)

    const result = resolverPendingCardsAposSyncExterno(
      pending,
      baseline,
      salvoNormalizado,
      normalizar,
    )

    expect(result).toEqual(pending)
  })

  it('sincroniza com cardsSalvos quando não há edição pendente', () => {
    const salvoNormalizado: CardPreferencia[] = [
      { id: 'valor_total', visible: true },
      { id: 'pedidos_em_andamento', visible: true },
    ]

    const result = resolverPendingCardsAposSyncExterno(
      baseline,
      baseline,
      salvoNormalizado,
      normalizar,
    )

    expect(result).toEqual(salvoNormalizado)
  })

  it('preserva período pendente enquanto cards estão dirty', () => {
    expect(resolverPeriodoAposSyncExterno('6m', '30d', '30d')).toBe('6m')
    expect(resolverPeriodoAposSyncExterno('30d', '30d', '6m')).toBe('6m')
  })

  it('mescla cards visíveis globais com snapshot do painel da lista', () => {
    const prefs: CardPreferencia[] = [
      { id: 'valor_total', visible: true },
      { id: 'qtd_total', visible: false },
      { id: 'pedidos_em_andamento', visible: true },
    ]

    const merged = mesclarVisibilidadeCardsTopoPainel(prefs, ['valor_total'])

    expect(merged.find(p => p.id === 'valor_total')?.visible).toBe(true)
    expect(merged.find(p => p.id === 'pedidos_em_andamento')?.visible).toBe(true)
    expect(merged.find(p => p.id === 'qtd_total')?.visible).toBe(false)
  })

  it('detecta interseção entre painel e prefs existentes', () => {
    const prefs: CardPreferencia[] = [{ id: 'valor_total', visible: true }]
    expect(painelCardsTopoTemIntersecaoComPrefs(prefs, ['valor_total'])).toBe(true)
    expect(painelCardsTopoTemIntersecaoComPrefs(prefs, ['inexistente'])).toBe(false)
  })
})
