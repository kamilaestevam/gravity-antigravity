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

  it('valor_total dinâmico — pedido bloqueado + soma mesma moeda; item editável', () => {
    const res = obterPillsTooltipColuna('valor_total_pedido', { modoDinamicoPedidoItem: true })
    expect(res.dual).toBe(true)
    expect(res.pedido).toEqual([
      'bloqueado_edicao',
      'valor_total_soma_mesma_moeda',
      'alerta_moeda_divergente',
    ])
    expect(res.item).toEqual(['editavel_nos_itens'])
  })

  it('valor_total sem expandir — 4 pills em sequência no cabeçalho', () => {
    const res = obterPillsTooltipColuna('valor_total_pedido')
    expect(res.dual).toBe(false)
    expect(res.pedido).toEqual([
      'bloqueado_edicao',
      'valor_total_soma_mesma_moeda',
      'alerta_moeda_divergente',
      'editavel_nos_itens',
    ])
  })

  it('valor_por_unidade_item sem expandir — 4 pills em sequência no cabeçalho', () => {
    const res = obterPillsTooltipColuna('valor_por_unidade_item')
    expect(res.dual).toBe(false)
    expect(res.pedido).toEqual([
      'bloqueado_edicao',
      'valor_unitario_sem_somatoria',
      'alerta_moeda_divergente',
      'editavel_nos_itens',
    ])
  })

  it('valor_por_unidade_item expandido — pedido 3 pills + item editável', () => {
    const res = obterPillsTooltipColuna('valor_por_unidade_item', { modoDinamicoPedidoItem: true })
    expect(res.dual).toBe(true)
    expect(res.pedido).toEqual([
      'bloqueado_edicao',
      'valor_unitario_sem_somatoria',
      'alerta_moeda_divergente',
    ])
    expect(res.item).toEqual(['editavel_nos_itens'])
  })

  it('quantidade_pronta dinâmico — pedido soma qtd pronta, alerta e bloqueado; item só editável', () => {
    const res = obterPillsTooltipColuna('quantidade_pronta_itens_pedido_total', { modoDinamicoPedidoItem: true })
    expect(res.dual).toBe(true)
    expect(res.pedido).toEqual([
      'calculado_pedido_qtd_pronta',
      'bloqueado_edicao',
      'soma_mesma_unidade',
      'alerta_divergencia',
    ])
    expect(res.item).toEqual(['editavel_item', 'alerta_moeda_divergente'])
    expect(res.pedido.at(1)).toBe('bloqueado_edicao')
    expect(pillsParaNivelColuna('quantidade_pronta_itens_pedido_total', 'item', { modoDinamicoPedidoItem: true }))
      .toEqual(['editavel_item', 'alerta_moeda_divergente'])
  })

  it('quantidade_pronta sem modo dinâmico — pedido com pills específicas de qtd pronta', () => {
    const pills = pillsParaNivelColuna('quantidade_pronta_itens_pedido_total', 'pai')
    expect(pills).toEqual(['calculado_pedido_qtd_pronta', 'bloqueado_edicao', 'soma_mesma_unidade', 'alerta_divergencia'])
  })

  it('quantidade_total_pedido dinâmico — pedido bloqueado + casas decimais; item só editável', () => {
    const res = obterPillsTooltipColuna('quantidade_total_pedido', { modoDinamicoPedidoItem: true })
    expect(res.dual).toBe(true)
    expect(res.pedido).toEqual([
      'calculado_pedido',
      'bloqueado_edicao',
      'alerta_divergencia',
      'casas_decimais_config',
    ])
    expect(res.pedido.at(1)).toBe('bloqueado_edicao')
    expect(res.item).toEqual(['editavel_item'])
    expect(pillsParaNivelColuna('quantidade_total_pedido', 'item', { modoDinamicoPedidoItem: true }))
      .toEqual(['editavel_item'])
  })

  it('quantidade_total_pedido sem modo dinâmico — pedido com pills específicas de qtd inicial', () => {
    const pills = pillsParaNivelColuna('quantidade_total_pedido', 'pai')
    expect(pills).toEqual([
      'calculado_pedido',
      'bloqueado_edicao',
      'alerta_divergencia',
      'casas_decimais_config',
    ])
  })

  it('ghost descrição — pedido, item e replicar; sem alerta de divergência', () => {
    const res = obterPillsTooltipColuna('descricao_item')
    expect(res.ghostSemCheckbox).toBe(true)
    expect(res.pedido).toEqual(['editavel_pedido', 'editavel_item', 'replica_itens'])
    expect(res.item).toEqual(['editavel_pedido', 'editavel_item', 'replica_itens'])
    expect(res.pedido).not.toContain('alerta_divergencia')
    expect(res.item).not.toContain('alerta_divergencia')
  })

  it('moeda_pedido — três pills iguais no pedido e no item (editável + replicar)', () => {
    const res = obterPillsTooltipColuna('moeda_pedido')
    expect(res.pedido).toEqual(['editavel_pedido', 'editavel_item', 'replica_itens'])
    expect(res.item).toEqual(['editavel_pedido', 'editavel_item', 'replica_itens'])
    expect(pillsParaNivelColuna('moeda_pedido', 'pai')).toEqual(['editavel_pedido', 'editavel_item', 'replica_itens'])
    expect(pillsParaNivelColuna('moeda_pedido', 'item')).toEqual(['editavel_pedido', 'editavel_item', 'replica_itens'])
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
