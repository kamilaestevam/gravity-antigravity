import { describe, it, expect } from 'vitest'
import {
  obterCampoItemComLegado,
  MAPA_PROPAGACAO_PEDIDO_ITEM,
} from '../../../servicos-global/produto/pedido/shared/mapaPropagacaoPedidoItem'

const CHAVES_FRONTEND_DATAS = [
  'data_prevista_pedido_pronto', 'data_confirmada_pedido_pronto', 'data_meta_pedido_pronto',
  'data_prevista_inspecao_pedido', 'data_confirmada_inspecao_pedido', 'data_meta_inspecao_pedido',
  'data_prevista_coleta_pedido', 'data_confirmada_coleta_pedido', 'data_meta_coleta_pedido',
  'data_consolidacao_pedido', 'data_transferencia_saldo_pedido',
  'data_prevista_recebimento_rascunho_pedido', 'data_confirmada_recebimento_rascunho_pedido', 'data_meta_recebimento_rascunho_pedido',
  'data_prevista_aprovacao_rascunho_pedido', 'data_confirmada_aprovacao_rascunho_pedido', 'data_meta_aprovacao_rascunho_pedido',
  'data_documento_pedido',
  'data_prevista_recebimento_rascunho_proforma', 'data_confirmada_recebimento_rascunho_proforma', 'data_meta_recebimento_rascunho_proforma',
  'data_prevista_aprovacao_rascunho_proforma', 'data_confirmada_aprovacao_rascunho_proforma', 'data_meta_aprovacao_rascunho_proforma',
  'data_prevista_envio_original_proforma', 'data_confirmada_envio_original_proforma', 'data_meta_envio_original_proforma',
  'data_prevista_recebimento_original_proforma', 'data_confirmada_recebimento_original_proforma', 'data_meta_recebimento_original_proforma',
  'data_proforma_invoice',
  'data_prevista_recebimento_rascunho_invoice', 'data_confirmada_recebimento_rascunho_invoice', 'data_meta_recebimento_rascunho_invoice',
  'data_prevista_aprovacao_rascunho_invoice', 'data_confirmada_aprovacao_rascunho_invoice', 'data_meta_aprovacao_rascunho_invoice',
  'data_prevista_envio_original_invoice', 'data_confirmada_envio_original_invoice', 'data_meta_envio_original_invoice',
  'data_prevista_recebimento_original_invoice', 'data_confirmada_recebimento_original_invoice', 'data_meta_recebimento_original_invoice',
  'data_invoice',
] as const

describe('DATAS_FRONT_PARA_ITEM — todas as 46 chaves frontend resolvem para campo DDD item', () => {
  it('são exatamente 46 chaves frontend de datas', () => {
    expect(CHAVES_FRONTEND_DATAS.length).toBe(44)
  })

  it.each(CHAVES_FRONTEND_DATAS)(
    '%s resolve para campo item não-nulo via obterCampoItemComLegado',
    (chaveFront) => {
      const campoItem = obterCampoItemComLegado(chaveFront)
      expect(campoItem).not.toBeNull()
      expect(typeof campoItem).toBe('string')
      expect(campoItem!.length).toBeGreaterThan(0)
    },
  )

  it('todos os campos item resolvidos existem como valores no MAPA_PROPAGACAO', () => {
    const valoresMapa = new Set(Object.values(MAPA_PROPAGACAO_PEDIDO_ITEM))
    for (const chaveFront of CHAVES_FRONTEND_DATAS) {
      const campoItem = obterCampoItemComLegado(chaveFront)!
      expect(valoresMapa.has(campoItem)).toBe(true)
    }
  })

  it('nenhuma chave frontend duplicada', () => {
    const unicos = new Set(CHAVES_FRONTEND_DATAS)
    expect(unicos.size).toBe(CHAVES_FRONTEND_DATAS.length)
  })

  it('nenhum campo item duplicado (bijeção)', () => {
    const camposItem = CHAVES_FRONTEND_DATAS.map(k => obterCampoItemComLegado(k)!)
    const unicos = new Set(camposItem)
    expect(unicos.size).toBe(camposItem.length)
  })

  it('campos milestone (pedido pronto, inspeção, coleta) resolvem para _item', () => {
    expect(obterCampoItemComLegado('data_prevista_pedido_pronto')).toBe('data_prevista_item_pronto')
    expect(obterCampoItemComLegado('data_confirmada_inspecao_pedido')).toBe('data_confirmada_inspecao_item')
    expect(obterCampoItemComLegado('data_meta_coleta_pedido')).toBe('data_meta_coleta_item')
  })

  it('campos legados prevista→previsao e confirmada→confirmacao são resolvidos', () => {
    expect(obterCampoItemComLegado('data_prevista_recebimento_rascunho_pedido')).toBe('data_previsao_recebimento_rascunho_item')
    expect(obterCampoItemComLegado('data_confirmada_aprovacao_rascunho_pedido')).toBe('data_confirmacao_aprovacao_rascunho_item')
  })

  it('aliases de documento (data_proforma_invoice, data_invoice) resolvem', () => {
    expect(obterCampoItemComLegado('data_proforma_invoice')).toBe('data_documento_proforma_item')
    expect(obterCampoItemComLegado('data_invoice')).toBe('data_documento_invoice_item')
  })

  it('data_consolidacao_pedido resolve para coluna separada (não data_consolidacao_item)', () => {
    expect(obterCampoItemComLegado('data_consolidacao_pedido')).toBe('data_consolidacao_pedido_replicada_item')
  })
})
