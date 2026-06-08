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
      'editavel_nos_itens',
      'alerta_moeda_divergente_entre_itens',
    ])
    expect(res.item).toEqual(['editavel_nos_itens', 'valor_total_item_formula'])
  })

  it('valor_total sem expandir — 4 pills em sequência no cabeçalho', () => {
    const res = obterPillsTooltipColuna('valor_total_pedido')
    expect(res.dual).toBe(false)
    expect(res.pedido).toEqual([
      'bloqueado_edicao',
      'valor_total_soma_mesma_moeda',
      'editavel_nos_itens',
      'alerta_moeda_divergente_entre_itens',
    ])
  })

  it('valor_por_unidade_item sem expandir — 4 pills em sequência no cabeçalho', () => {
    const res = obterPillsTooltipColuna('valor_por_unidade_item')
    expect(res.dual).toBe(false)
    expect(res.pedido).toEqual([
      'bloqueado_edicao',
      'valor_unitario_sem_somatoria',
      'editavel_nos_itens',
      'alerta_moeda_divergente',
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
      'bloqueado_edicao',
      'calculado_pedido_qtd_pronta',
      'soma_mesma_unidade',
      'alerta_divergencia',
    ])
    expect(res.item).toEqual(['editavel_item', 'alerta_moeda_divergente'])
    expect(pillsParaNivelColuna('quantidade_pronta_itens_pedido_total', 'item', { modoDinamicoPedidoItem: true }))
      .toEqual(['editavel_item', 'alerta_moeda_divergente'])
  })

  it('quantidade_pronta sem modo dinâmico — pedido com pills específicas de qtd pronta', () => {
    const pills = pillsParaNivelColuna('quantidade_pronta_itens_pedido_total', 'pai')
    expect(pills).toEqual(['bloqueado_edicao', 'calculado_pedido_qtd_pronta', 'soma_mesma_unidade', 'alerta_divergencia'])
  })

  it('quantidade_total_pedido dinâmico — pedido bloqueado + casas decimais; item só editável', () => {
    const res = obterPillsTooltipColuna('quantidade_total_pedido', { modoDinamicoPedidoItem: true })
    expect(res.dual).toBe(true)
    expect(res.pedido).toEqual([
      'bloqueado_edicao',
      'calculado_pedido_qtd_inicial',
      'editavel_item',
      'alerta_divergencia',
      'casas_decimais_config',
    ])
    expect(res.item).toEqual(['editavel_item'])
    expect(pillsParaNivelColuna('quantidade_total_pedido', 'item', { modoDinamicoPedidoItem: true }))
      .toEqual(['editavel_item'])
  })

  it('quantidade_total_pedido sem modo dinâmico — pedido com pills específicas de qtd inicial', () => {
    const pills = pillsParaNivelColuna('quantidade_total_pedido', 'pai')
    expect(pills).toEqual([
      'bloqueado_edicao',
      'calculado_pedido_qtd_inicial',
      'editavel_item',
      'alerta_divergencia',
      'casas_decimais_config',
    ])
  })

  it('ghost descrição — pedido, item e replicar; sem alerta de divergência', () => {
    const res = obterPillsTooltipColuna('descricao_item')
    expect(res.ghostSemCheckbox).toBe(false)
    expect(res.pedido).toEqual(['editavel_pedido', 'replica_itens', 'editavel_item'])
    expect(res.item).toEqual(['editavel_item', 'editavel_pedido', 'replica_itens'])
    expect(res.pedido).not.toContain('alerta_divergencia')
    expect(res.item).not.toContain('alerta_divergencia')
  })

  it('moeda_pedido — pedido: editável → replicar → editável item; item: só editável no item', () => {
    const res = obterPillsTooltipColuna('moeda_pedido')
    expect(res.pedido).toEqual(['editavel_pedido', 'replica_itens', 'editavel_item'])
    expect(res.item).toEqual(['editavel_item'])
    expect(pillsParaNivelColuna('moeda_pedido', 'pai')).toEqual(['editavel_pedido', 'replica_itens', 'editavel_item'])
    expect(pillsParaNivelColuna('moeda_pedido', 'item')).toEqual(['editavel_item'])
  })

  it('unidade_comercializada_pedido — pedido e item: editável + replicar + item + alerta', () => {
    const pillsUnidade = [
      'editavel_pedido',
      'replica_itens',
      'editavel_item',
      'alerta_divergencia',
    ] as const
    const res = obterPillsTooltipColuna('unidade_comercializada_pedido')
    expect(res.pedido).toEqual([...pillsUnidade])
    expect(res.item).toEqual(expect.arrayContaining([...pillsUnidade]))
    expect(res.item).toHaveLength(pillsUnidade.length)
    expect(pillsParaNivelColuna('unidade_comercializada_pedido', 'pai')).toEqual([...pillsUnidade])
    const pillsItem = pillsParaNivelColuna('unidade_comercializada_pedido', 'item')
    expect(pillsItem).toEqual(expect.arrayContaining([...pillsUnidade]))
    expect(pillsItem).toHaveLength(pillsUnidade.length)
  })

  it('NCM — três pills iguais no pedido e no item; sem subtexto ghost', () => {
    const res = obterPillsTooltipColuna('ncm')
    expect(res.ghostSemCheckbox).toBe(false)
    expect(res.pedido).toEqual(['editavel_pedido', 'replica_itens', 'editavel_item'])
    expect(res.item).toEqual(['editavel_item', 'editavel_pedido', 'replica_itens'])
    expect(pillsParaNivelColuna('ncm', 'pai')).toEqual(['editavel_pedido', 'replica_itens', 'editavel_item'])
    expect(pillsParaNivelColuna('ncm', 'item')).toEqual(['editavel_item', 'editavel_pedido', 'replica_itens'])
  })

  it('pillsParaNivelColuna item saldo inclui formula', () => {
    const pills = pillsParaNivelColuna('saldo_itens_do_pedido', 'item')
    expect(pills).toContain('somente_leitura')
    expect(pills).toContain('formula_config')
  })

  it('peso_liquido_total_pedido — pedido bloqueado + calculado + alerta', () => {
    const pills = pillsParaNivelColuna('peso_liquido_total_pedido', 'pai')
    expect(pills).toEqual(['bloqueado_edicao', 'calculado_pedido', 'alerta_divergencia'])
  })

  it('cubagem_total_pedido dinâmico — pedido bloqueado + calculado + alerta', () => {
    const res = obterPillsTooltipColuna('cubagem_total_pedido', { modoDinamicoPedidoItem: true })
    expect(res.dual).toBe(true)
    expect(res.pedido).toEqual(['bloqueado_edicao', 'calculado_pedido', 'alerta_divergencia'])
    expect(res.item).toEqual(['editavel_item', 'alerta_divergencia'])
  })

  it('valor_total_cambio_pedido — pedido bloqueado + calculado', () => {
    const pills = pillsParaNivelColuna('valor_total_cambio_pedido', 'pai')
    expect(pills).toEqual(['bloqueado_edicao', 'calculado_pedido'])
  })

  it('taxa_cambio_estimada — pedido bloqueado + calculado', () => {
    const pills = pillsParaNivelColuna('taxa_cambio_estimada', 'pai')
    expect(pills).toEqual(['bloqueado_edicao', 'calculado_pedido'])
  })

  it('quantidade_volumes_pedido — pedido bloqueado + total soma + alerta', () => {
    const pills = pillsParaNivelColuna('quantidade_volumes_pedido', 'pai')
    expect(pills).toEqual(['bloqueado_edicao', 'calculado_pedido_volumes', 'alerta_divergencia'])
  })

  it('quantidade_volumes_pedido — item editável no item', () => {
    const pills = pillsParaNivelColuna('quantidade_volumes_pedido', 'item')
    expect(pills).toEqual(['editavel_item'])
  })

  it('quantidade_volumes_pedido obterPills — pedido e item distintos', () => {
    const res = obterPillsTooltipColuna('quantidade_volumes_pedido')
    expect(res.dual).toBe(false)
    expect(res.pedido).toEqual(['bloqueado_edicao', 'calculado_pedido_volumes', 'alerta_divergencia'])
    expect(res.item).toEqual(['editavel_item'])
  })

  it('quantidade_transferida_total dinâmico — pedido calculado + bloqueado; item somente leitura + operação', () => {
    const res = obterPillsTooltipColuna('quantidade_transferida_total', { modoDinamicoPedidoItem: true })
    expect(res.dual).toBe(true)
    expect(res.pedido).toEqual([
      'bloqueado_edicao',
      'calculado_pedido_qtd_transferida',
      'soma_mesma_unidade',
      'alerta_unidade_comercializada_divergente',
      'casas_decimais_config',
    ])
    expect(res.item).toEqual(['somente_leitura', 'so_operacao'])
  })

  it('quantidade_transferida_total sem expandir — pills corretas no cabeçalho', () => {
    const res = obterPillsTooltipColuna('quantidade_transferida_total')
    expect(res.dual).toBe(false)
    expect(res.pedido).toEqual([
      'bloqueado_edicao',
      'calculado_pedido_qtd_transferida',
      'soma_mesma_unidade',
      'alerta_unidade_comercializada_divergente',
      'casas_decimais_config',
    ])
    expect(res.item).toEqual(['somente_leitura', 'so_operacao'])
    expect(pillsParaNivelColuna('quantidade_transferida_total', 'item')).toEqual(['somente_leitura', 'so_operacao'])
  })

  it('saldo_itens_do_pedido dinâmico — pedido fórmula + alerta unidade; item somente leitura', () => {
    const res = obterPillsTooltipColuna('saldo_itens_do_pedido', { modoDinamicoPedidoItem: true })
    expect(res.dual).toBe(true)
    expect(res.linkFormula).toBe(true)
    expect(res.pedido).toEqual([
      'bloqueado_edicao',
      'calculado_pedido_saldo',
      'alerta_unidade_comercializada_divergente',
      'formula_config',
      'casas_decimais_config',
    ])
    expect(res.item).toEqual(['somente_leitura', 'formula_config'])
  })

  it('saldo_itens_do_pedido sem expandir — pills corretas no cabeçalho', () => {
    const res = obterPillsTooltipColuna('saldo_itens_do_pedido')
    expect(res.dual).toBe(false)
    expect(res.linkFormula).toBe(true)
    expect(res.pedido).toEqual([
      'bloqueado_edicao',
      'calculado_pedido_saldo',
      'alerta_unidade_comercializada_divergente',
      'formula_config',
      'casas_decimais_config',
    ])
    expect(res.item).toEqual(['somente_leitura', 'formula_config'])
    expect(pillsParaNivelColuna('saldo_itens_do_pedido', 'item')).toEqual(['somente_leitura', 'formula_config'])
  })

  it('quantidade_cancelada_total_pedido dinâmico — pedido calculado + alerta unidade; item somente leitura', () => {
    const res = obterPillsTooltipColuna('quantidade_cancelada_total_pedido', { modoDinamicoPedidoItem: true })
    expect(res.dual).toBe(true)
    expect(res.pedido).toEqual([
      'bloqueado_edicao',
      'calculado_pedido_qtd_cancelada',
      'soma_mesma_unidade',
      'alerta_unidade_comercializada_divergente',
      'casas_decimais_config',
    ])
    expect(res.item).toEqual(['somente_leitura', 'so_operacao'])
  })

  it('quantidade_cancelada_total_pedido sem expandir — pills corretas no cabeçalho', () => {
    const res = obterPillsTooltipColuna('quantidade_cancelada_total_pedido')
    expect(res.dual).toBe(false)
    expect(res.pedido).toEqual([
      'bloqueado_edicao',
      'calculado_pedido_qtd_cancelada',
      'soma_mesma_unidade',
      'alerta_unidade_comercializada_divergente',
      'casas_decimais_config',
    ])
    expect(res.item).toEqual(['somente_leitura', 'so_operacao'])
    expect(pillsParaNivelColuna('quantidade_cancelada_total_pedido', 'item')).toEqual(['somente_leitura', 'so_operacao'])
  })

  it.each([
    'porto_origem',
    'porto_destino',
    'local_de_origem',
    'local_de_destino',
    'aeroporto_origem',
    'aeroporto_destino',
  ] as const)('%s — pedido e item com mesmas pills espelhadas', (campo) => {
    const pillsPedido = ['editavel_pedido', 'editavel_item', 'espelhado_logistica_bidirecional'] as const
    const pillsItem = ['editavel_item', 'editavel_pedido', 'espelhado_logistica_bidirecional'] as const
    const res = obterPillsTooltipColuna(campo)
    expect(res.pedido).toEqual([...pillsPedido])
    expect(res.item).toEqual([...pillsItem])
    expect(res.pedido).not.toContain('replica_itens')
    expect(res.pedido).not.toContain('alerta_divergencia')
    expect(res.item).not.toContain('alerta_divergencia')
  })
})
