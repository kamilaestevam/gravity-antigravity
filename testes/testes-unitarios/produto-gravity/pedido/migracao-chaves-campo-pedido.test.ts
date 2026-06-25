import { describe, expect, it } from 'vitest'
import {
  migrarChavesConfigListaPainel,
  parsearConfigListaPainel,
} from '../../../../servicos-global/produto/pedido/shared/listaPainelConfigSchema.js'
import {
  migrarListaChavesCampoPedido,
  migrarRecordChavesCampoPedido,
  normalizarChaveCampoPedido,
} from '../../../../servicos-global/produto/pedido/shared/migracaoChavesCampoPedido.js'

describe('migracaoChavesCampoPedido — quantidade_pronta_item', () => {
  it('normaliza os três nomes legados para quantidade_pronta_item', () => {
    expect(normalizarChaveCampoPedido('quantidade_pronta_total_item_pedido')).toBe('quantidade_pronta_item')
    expect(normalizarChaveCampoPedido('quantidade_pronta_total_item')).toBe('quantidade_pronta_item')
    expect(normalizarChaveCampoPedido('quantidade_pronta_pedido')).toBe('quantidade_pronta_item')
    expect(normalizarChaveCampoPedido('quantidade_pronta_item')).toBe('quantidade_pronta_item')
  })

  it('deduplica colunas_visiveis após migração', () => {
    const migrado = migrarListaChavesCampoPedido([
      'numero_pedido',
      'quantidade_pronta_total_item_pedido',
      'quantidade_pronta_item',
    ])
    expect(migrado).toEqual(['numero_pedido', 'quantidade_pronta_item'])
  })

  it('migra colunas_largura preservando valor canônico', () => {
    const migrado = migrarRecordChavesCampoPedido({
      quantidade_pronta_total_item_pedido: 120,
      quantidade_pronta_item: 180,
      numero_pedido: 90,
    })
    expect(migrado).toEqual({
      quantidade_pronta_item: 120,
      numero_pedido: 90,
    })
  })

  it('migra config_json de painel da lista', () => {
    const raw = JSON.stringify({
      versao: 1,
      colunas_visiveis: ['quantidade_pronta_total_item_pedido', 'numero_pedido'],
      aba_status_ativa: 'todos',
      filtros_coluna: {},
      ordenacao: { campo: 'quantidade_pronta_total_item_pedido', direcao: 'desc' },
    })
    const config = parsearConfigListaPainel(raw)
    expect(config.colunas_visiveis).toEqual(['quantidade_pronta_item', 'numero_pedido'])
    expect(config.ordenacao.campo).toBe('quantidade_pronta_item')
    expect(migrarChavesConfigListaPainel(config).colunas_visiveis).toEqual(['quantidade_pronta_item', 'numero_pedido'])
  })
})
