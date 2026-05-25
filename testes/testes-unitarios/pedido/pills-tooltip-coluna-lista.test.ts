import { describe, expect, it } from 'vitest'
import { obterPillsTooltipColuna, pillsParaNivelColuna } from '../../../servicos-global/produto/pedido/client/src/shared/pillsTooltipColunaLista'

describe('obterPillsTooltipColuna', () => {
  it('tipo_operacao tem pílulas editável e replicação (não somente leitura)', () => {
    const res = obterPillsTooltipColuna('tipo_operacao')
    expect(res.pedido).toContain('editavel_pedido')
    expect(res.pedido).toContain('replica_itens')
    expect(res.pedido).not.toContain('somente_leitura')
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

  it('ghost descrição marca subtexto ghost', () => {
    const res = obterPillsTooltipColuna('descricao_item')
    expect(res.ghostSemCheckbox).toBe(true)
  })

  it('pillsParaNivelColuna item saldo inclui formula', () => {
    const pills = pillsParaNivelColuna('saldo_itens_do_pedido', 'item')
    expect(pills).toContain('somente_leitura')
    expect(pills).toContain('formula_config')
  })
})
