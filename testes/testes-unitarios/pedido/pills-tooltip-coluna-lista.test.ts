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

  it('ghost descrição — pedido, item e replicar; sem alerta de divergência', () => {
    const res = obterPillsTooltipColuna('descricao_item')
    expect(res.ghostSemCheckbox).toBe(true)
    expect(res.pedido).toEqual(['editavel_pedido', 'editavel_item', 'replica_itens'])
    expect(res.item).toEqual(['editavel_pedido', 'editavel_item', 'replica_itens'])
    expect(res.pedido).not.toContain('alerta_divergencia')
    expect(res.item).not.toContain('alerta_divergencia')
  })

  it('pillsParaNivelColuna item saldo inclui formula', () => {
    const pills = pillsParaNivelColuna('saldo_itens_do_pedido', 'item')
    expect(pills).toContain('somente_leitura')
    expect(pills).toContain('formula_config')
  })

  it.each([
    'porto_origem',
    'porto_destino',
    'local_de_origem',
    'local_de_destino',
    'aeroporto_origem',
    'aeroporto_destino',
  ] as const)('%s — pedido e item com mesmas pills espelhadas', (campo) => {
    const pills = ['editavel_pedido', 'editavel_item', 'espelhado_logistica_bidirecional'] as const
    const res = obterPillsTooltipColuna(campo)
    expect(res.pedido).toEqual([...pills])
    expect(res.item).toEqual([...pills])
    expect(res.pedido).not.toContain('replica_itens')
    expect(res.pedido).not.toContain('alerta_divergencia')
    expect(res.item).not.toContain('alerta_divergencia')
  })
})
