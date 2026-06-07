import { describe, expect, it } from 'vitest'
import { obterPillsTooltipColuna, pillsParaNivelColuna } from '../../../servicos-global/produto/pedido/client/src/shared/pillsTooltipColunaLista'

describe('obterPillsTooltipColuna', () => {
  it('tipo_operacao — pedido editável com replicação; item somente leitura', () => {
    const res = obterPillsTooltipColuna('tipo_operacao')
    expect(res.pedido).toContain('editavel_pedido')
    expect(res.pedido).toContain('replica_itens_auto')
    expect(res.pedido).not.toContain('alerta_divergencia')
    expect(res.item).toContain('somente_leitura')
    expect(res.item).not.toContain('editavel_item')
  })

  it('numero_pedido é dual com editável pedido e item', () => {
    const res = obterPillsTooltipColuna('numero_pedido')
    expect(res.dual).toBe(true)
    expect(res.pedido).toContain('editavel_pedido_numero')
    expect(res.item).toContain('editavel_item')
    expect(res.numeroUnicoOrg).toBe(true)
  })

  it('valor_total dinâmico separa pedido calculado e item editável', () => {
    const res = obterPillsTooltipColuna('valor_total_pedido', { modoDinamicoPedidoItem: true })
    expect(res.dual).toBe(true)
    expect(res.pedido).toContain('calculado_pedido')
    expect(res.item).toContain('editavel_item')
  })

  it('NCM — três pills iguais no pedido e no item; sem subtexto ghost', () => {
    const res = obterPillsTooltipColuna('ncm')
    expect(res.ghostSemCheckbox).toBe(false)
    expect(res.pedido).toEqual(['editavel_pedido', 'replica_itens', 'editavel_item'])
    expect(res.item).toEqual(['editavel_pedido', 'replica_itens', 'editavel_item'])
    expect(pillsParaNivelColuna('ncm', 'pai')).toEqual(['editavel_pedido', 'replica_itens', 'editavel_item'])
    expect(pillsParaNivelColuna('ncm', 'item')).toEqual(['editavel_pedido', 'replica_itens', 'editavel_item'])
  })

  it('pillsParaNivelColuna item saldo inclui formula', () => {
    const pills = pillsParaNivelColuna('saldo_itens_do_pedido', 'item')
    expect(pills).toContain('somente_leitura')
    expect(pills).toContain('formula_config')
  })
})
