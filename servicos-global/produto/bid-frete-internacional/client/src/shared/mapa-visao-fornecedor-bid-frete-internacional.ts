/**
 * Mapa da visão fornecedor — contrato API + conversão para VisaoGeralMapaBidFrete.
 */

import { z } from 'zod'
import type { DadosMapaBidFrete } from './componentes/visao-geral-mapa-bid-frete'

const modalMapaSchema = z.enum(['MARITIMO', 'AEREO', 'RODOVIARIO'])
const tipoOperacaoMapaSchema = z.enum(['IMPORTACAO', 'EXPORTACAO']).nullable()

export const visaoFornecedorBidFreteInternacionalMapaCotacoesResponseSchema = z.object({
  visao_fornecedor_bid_frete_internacional: z.object({
    mapa_cotacoes_visao_fornecedor_bid_frete_internacional: z.object({
      pinos_mapa_visao_fornecedor_bid_frete_internacional: z.array(
        z.object({
          codigo_local_mapa_visao_fornecedor_bid_frete_internacional: z.string(),
          nome_local_mapa_visao_fornecedor_bid_frete_internacional: z.string(),
          nome_cotacao_local_mapa_visao_fornecedor_bid_frete_internacional: z.string().optional(),
          pais_codigo_mapa_visao_fornecedor_bid_frete_internacional: z.string(),
          alerta_divergencia_cadastros_mapa_visao_fornecedor_bid_frete_internacional: z
            .string()
            .nullable()
            .optional(),
          latitude_mapa_visao_fornecedor_bid_frete_internacional: z.number(),
          longitude_mapa_visao_fornecedor_bid_frete_internacional: z.number(),
          quantidade_cotacoes_mapa_visao_fornecedor_bid_frete_internacional: z.number(),
          quantidade_cotacoes_avulsas_mapa_visao_fornecedor_bid_frete_internacional: z.number().optional(),
          quantidade_bids_mapa_visao_fornecedor_bid_frete_internacional: z.number().optional(),
          melhor_valor_proposta_mapa_visao_fornecedor_bid_frete_internacional: z.number().nullable().optional(),
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
      quantidade_cotacoes_avulsas_mapa_visao_fornecedor_bid_frete_internacional: z.number().optional(),
      quantidade_bids_mapa_visao_fornecedor_bid_frete_internacional: z.number().optional(),
      melhor_valor_proposta_mapa_visao_fornecedor_bid_frete_internacional: z.number().nullable(),
          id_cotacao_melhor_proposta_mapa_visao_fornecedor_bid_frete_internacional: z.string().nullable().optional(),
          numero_cotacao_melhor_proposta_mapa_visao_fornecedor_bid_frete_internacional: z.string().nullable().optional(),
          numero_bid_melhor_proposta_mapa_visao_fornecedor_bid_frete_internacional: z.string().nullable().optional(),
      dias_transito_medio_mapa_visao_fornecedor_bid_frete_internacional: z.number().nullable(),
      dias_transito_medio_mercado_mapa_visao_fornecedor_bid_frete_internacional: z.number().nullable().optional(),
    }),
      ),
      resumo_cobertura_mapa_visao_fornecedor_bid_frete_internacional: z
        .object({
          total_cotacoes_consultadas_mapa_visao_fornecedor_bid_frete_internacional: z.number(),
          total_cotacoes_exibidas_mapa_visao_fornecedor_bid_frete_internacional: z.number(),
          total_cotacoes_sem_origem_destino_mapa_visao_fornecedor_bid_frete_internacional: z.number(),
          total_cotacoes_sem_coordenadas_mapa_visao_fornecedor_bid_frete_internacional: z.number(),
        })
        .optional(),
    }),
  }),
})

function emojiBandeiraPais(iso2: string): string {
  const bruto = iso2.trim().toUpperCase()
  const codigo = /^[A-Z]{2}$/.test(bruto) ? bruto : bruto.slice(0, 2)
  if (!/^[A-Z]{2}$/.test(codigo)) return ''
  return String.fromCodePoint(
    ...[...codigo].map((letra) => 0x1f1e6 + letra.charCodeAt(0) - 65),
  )
}

function geoParaLegacyPercent(lat: number, lng: number): { lat: number; lng: number } {
  return {
    lat: ((90 - lat) / 180) * 100,
    lng: ((lng + 180) / 360) * 100,
  }
}

function corRotaModal(modal: 'MARITIMO' | 'AEREO' | 'RODOVIARIO'): string {
  if (modal === 'AEREO') return 'rgba(167, 139, 250, 0.8)'
  if (modal === 'RODOVIARIO') return 'rgba(251, 191, 36, 0.8)'
  return 'rgba(52, 211, 153, 0.8)'
}

export function mapMapaCotacoesVisaoFornecedorFromServer(
  raw: z.infer<typeof visaoFornecedorBidFreteInternacionalMapaCotacoesResponseSchema>,
  nomeFornecedor: string,
): DadosMapaBidFrete {
  const mapa = raw.visao_fornecedor_bid_frete_internacional.mapa_cotacoes_visao_fornecedor_bid_frete_internacional
  const idPorCodigo = new Map<string, number>()

  const pins = mapa.pinos_mapa_visao_fornecedor_bid_frete_internacional.map((pino, index) => {
    const id = index + 1
    idPorCodigo.set(pino.codigo_local_mapa_visao_fornecedor_bid_frete_internacional, id)
    const geoLat = pino.latitude_mapa_visao_fornecedor_bid_frete_internacional
    const geoLng = pino.longitude_mapa_visao_fornecedor_bid_frete_internacional
    const legacy = geoParaLegacyPercent(geoLat, geoLng)
    const pais = pino.pais_codigo_mapa_visao_fornecedor_bid_frete_internacional

    const quantidadeCotacoesAvulsas =
      pino.quantidade_cotacoes_avulsas_mapa_visao_fornecedor_bid_frete_internacional ??
      pino.quantidade_cotacoes_mapa_visao_fornecedor_bid_frete_internacional
    const quantidadeBids =
      pino.quantidade_bids_mapa_visao_fornecedor_bid_frete_internacional ?? 0
    const melhorValorPin =
      pino.melhor_valor_proposta_mapa_visao_fornecedor_bid_frete_internacional ?? 0

    return {
      id,
      label: pino.nome_local_mapa_visao_fornecedor_bid_frete_internacional,
      labelCotacao:
        pino.nome_cotacao_local_mapa_visao_fornecedor_bid_frete_internacional ??
        pino.nome_local_mapa_visao_fornecedor_bid_frete_internacional,
      portCode: pino.codigo_local_mapa_visao_fornecedor_bid_frete_internacional,
      country: pais,
      alertaDivergenciaCadastros:
        pino.alerta_divergencia_cadastros_mapa_visao_fornecedor_bid_frete_internacional ?? null,
      lat: legacy.lat,
      lng: legacy.lng,
      geoLat,
      geoLng,
      activeBids: pino.quantidade_cotacoes_mapa_visao_fornecedor_bid_frete_internacional,
      quantidadeCotacoesAvulsas,
      quantidadeBids,
      bestPrice: melhorValorPin,
      savingPct: 0,
      mode: pino.modal_predominante_mapa_visao_fornecedor_bid_frete_internacional,
      supplier: nomeFornecedor,
      flag: emojiBandeiraPais(pais),
    }
  })

  const routes = mapa.rotas_mapa_visao_fornecedor_bid_frete_internacional
    .map((rota, index) => {
      const fromId = idPorCodigo.get(rota.codigo_origem_mapa_visao_fornecedor_bid_frete_internacional)
      const toId = idPorCodigo.get(rota.codigo_destino_mapa_visao_fornecedor_bid_frete_internacional)
      if (fromId == null || toId == null) return null

      const modal = rota.modal_mapa_visao_fornecedor_bid_frete_internacional
      const routeMode = modal === 'RODOVIARIO' ? 'MARITIMO' : modal

      return {
        fromId,
        toId,
        color: corRotaModal(modal),
        heightFactor: 0.12 + (index % 5) * 0.03,
        mode: routeMode as 'MARITIMO' | 'AEREO',
        modal_cotacao_bid_frete_internacional: modal,
        tipo_operacao_cotacao_bid_frete_internacional:
          rota.tipo_operacao_cotacao_bid_frete_internacional ?? undefined,
        transitTime: rota.dias_transito_medio_mapa_visao_fornecedor_bid_frete_internacional ?? undefined,
        marketTransitTime:
          rota.dias_transito_medio_mercado_mapa_visao_fornecedor_bid_frete_internacional ?? undefined,
        quantidade_disparos_mapa_visao_fornecedor_bid_frete_internacional:
          rota.quantidade_disparos_mapa_visao_fornecedor_bid_frete_internacional,
        quantidade_cotacoes_avulsas_mapa_visao_fornecedor_bid_frete_internacional:
          rota.quantidade_cotacoes_avulsas_mapa_visao_fornecedor_bid_frete_internacional,
        quantidade_bids_mapa_visao_fornecedor_bid_frete_internacional:
          rota.quantidade_bids_mapa_visao_fornecedor_bid_frete_internacional,
        melhor_valor_proposta_mapa_visao_fornecedor_bid_frete_internacional:
          rota.melhor_valor_proposta_mapa_visao_fornecedor_bid_frete_internacional,
        id_cotacao_melhor_proposta_mapa_visao_fornecedor_bid_frete_internacional:
          rota.id_cotacao_melhor_proposta_mapa_visao_fornecedor_bid_frete_internacional ?? null,
        numero_cotacao_melhor_proposta_mapa_visao_fornecedor_bid_frete_internacional:
          rota.numero_cotacao_melhor_proposta_mapa_visao_fornecedor_bid_frete_internacional ?? null,
        numero_bid_melhor_proposta_mapa_visao_fornecedor_bid_frete_internacional:
          rota.numero_bid_melhor_proposta_mapa_visao_fornecedor_bid_frete_internacional ?? null,
      }
    })
    .filter((r): r is NonNullable<typeof r> => r != null)

  const resumoBruto = mapa.resumo_cobertura_mapa_visao_fornecedor_bid_frete_internacional
  const resumoCobertura = resumoBruto
    ? {
        totalConsultadas: resumoBruto.total_cotacoes_consultadas_mapa_visao_fornecedor_bid_frete_internacional,
        totalExibidas: resumoBruto.total_cotacoes_exibidas_mapa_visao_fornecedor_bid_frete_internacional,
        totalSemOrigemDestino:
          resumoBruto.total_cotacoes_sem_origem_destino_mapa_visao_fornecedor_bid_frete_internacional,
        totalSemCoordenadas:
          resumoBruto.total_cotacoes_sem_coordenadas_mapa_visao_fornecedor_bid_frete_internacional,
      }
    : undefined

  return { pins, routes, resumoCobertura }
}
