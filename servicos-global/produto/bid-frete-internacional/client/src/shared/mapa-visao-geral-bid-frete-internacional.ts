/**
 * Mapa Insights cliente — contrato API + conversão para VisaoGeralMapaBidFrete.
 */

import { z } from 'zod'
import { mapMapaCotacoesVisaoFornecedorFromServer } from './mapa-visao-fornecedor-bid-frete-internacional'
import type { DadosMapaBidFrete } from './componentes/visao-geral-mapa-bid-frete'

const modalMapaSchema = z.enum(['MARITIMO', 'AEREO', 'RODOVIARIO'])
const tipoOperacaoMapaSchema = z.enum(['IMPORTACAO', 'EXPORTACAO']).nullable()

const mapaCotacoesPayloadSchema = z.object({
  pinos_mapa_visao_fornecedor_bid_frete_internacional: z.array(
    z.object({
      codigo_local_mapa_visao_fornecedor_bid_frete_internacional: z.string(),
      nome_local_mapa_visao_fornecedor_bid_frete_internacional: z.string(),
      pais_codigo_mapa_visao_fornecedor_bid_frete_internacional: z.string(),
      latitude_mapa_visao_fornecedor_bid_frete_internacional: z.number(),
      longitude_mapa_visao_fornecedor_bid_frete_internacional: z.number(),
      quantidade_cotacoes_mapa_visao_fornecedor_bid_frete_internacional: z.number(),
      modal_predominante_mapa_visao_fornecedor_bid_frete_internacional: modalMapaSchema,
    }),
  ),
  rotas_mapa_visao_fornecedor_bid_frete_internacional: z.array(
    z.object({
      codigo_origem_mapa_visao_fornecedor_bid_frete_internacional: z.string(),
      codigo_destino_mapa_visao_fornecedor_bid_frete_internacional: z.string(),
      modal_mapa_visao_fornecedor_bid_frete_internacional: modalMapaSchema,
      tipo_operacao_cotacao_bid_frete_internacional: tipoOperacaoMapaSchema.optional(),
      quantidade_disparos_mapa_visao_fornecedor_bid_frete_internacional: z.number(),
      melhor_valor_proposta_mapa_visao_fornecedor_bid_frete_internacional: z.number().nullable(),
      dias_transito_medio_mapa_visao_fornecedor_bid_frete_internacional: z.number().nullable(),
      dias_transito_medio_mercado_mapa_visao_fornecedor_bid_frete_internacional: z.number().nullable().optional(),
    }),
  ),
})

export const visaoGeralBidFreteInternacionalMapaCotacoesResponseSchema = z.object({
  visao_geral_bid_frete_internacional: z.object({
    mapa_cotacoes_visao_geral_bid_frete_internacional: mapaCotacoesPayloadSchema,
  }),
})

export function mapMapaCotacoesVisaoGeralFromServer(
  raw: z.infer<typeof visaoGeralBidFreteInternacionalMapaCotacoesResponseSchema>,
): DadosMapaBidFrete {
  const adaptado = {
    visao_fornecedor_bid_frete_internacional: {
      mapa_cotacoes_visao_fornecedor_bid_frete_internacional:
        raw.visao_geral_bid_frete_internacional.mapa_cotacoes_visao_geral_bid_frete_internacional,
    },
  }
  return mapMapaCotacoesVisaoFornecedorFromServer(adaptado, '')
}
