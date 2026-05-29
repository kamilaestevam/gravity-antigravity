import { describe, expect, it } from 'vitest'
import {
  isCampoLogisticaPedido,
  normalizarCodigoLogisticaPedido,
} from '../../../servicos-global/produto/pedido/shared/camposLogisticaPedido'

/** Espelha o filtro do popover de select em TabelaVirtualGlobal (campos logísticos). */
function filtrarOpcoesPopover(
  opcoes: Array<{ valor: string | null; label: string | null }>,
  termoBusca: string,
): Array<{ valor: string | null; label: string | null }> {
  const termo = termoBusca.trim().toLowerCase()
  if (!termo) return opcoes
  return opcoes.filter(op => {
    const label = (op.label ?? '').toLowerCase()
    const valor = (op.valor ?? '').toLowerCase()
    return label.includes(termo) || valor.includes(termo)
  })
}

describe('filtro popover campos logísticos (local/porto/aeroporto)', () => {
  it('não quebra com valor null no catálogo (regressão produção)', () => {
    const opcoes = [
      { valor: 'BR', label: 'BR — Brasil' },
      { valor: null, label: 'null — inválido' },
    ]
    expect(() => filtrarOpcoesPopover(opcoes, 'br')).not.toThrow()
    expect(filtrarOpcoesPopover(opcoes, 'br')).toHaveLength(1)
  })

  it('filtra por label quando termo bate', () => {
    const opcoes = [{ valor: 'AX', label: 'AX — Åland, Ilhas' }]
    expect(filtrarOpcoesPopover(opcoes, 'åland')).toHaveLength(1)
  })
})

describe('camposLogisticaPedido', () => {
  it('identifica os seis campos logísticos do pedido', () => {
    expect(isCampoLogisticaPedido('porto_destino')).toBe(true)
    expect(isCampoLogisticaPedido('local_de_origem')).toBe(true)
    expect(isCampoLogisticaPedido('incoterm')).toBe(false)
  })

  it('normaliza código para maiúsculas e trim', () => {
    expect(normalizarCodigoLogisticaPedido(' arbue ')).toBe('ARBUE')
    expect(normalizarCodigoLogisticaPedido('')).toBe(null)
    expect(normalizarCodigoLogisticaPedido(null)).toBe(null)
  })
})
